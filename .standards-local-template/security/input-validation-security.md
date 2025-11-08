# Input Validation Security

## Problem

Trusting user input without validation leads to injection attacks, data corruption, and unexpected application behavior. Even "internal" APIs or admin endpoints need validation - attackers often exploit trust boundaries.

## Cost of Violation

**Real incident example:**
- Admin API endpoint trusted input from "authenticated admin users"
- Parameter `userId` wasn't validated (assumed it would be a UUID)
- Attacker sent SQL fragment as userId: `1 OR 1=1; DROP TABLE users--`
- Application used string concatenation instead of parameterized queries
- **Result:**
  - Complete database compromise
  - 48 hours restoring from backups
  - Regulatory notification requirements
  - $25,000+ in incident response
  - Customer trust damaged

**OWASP Top 10:** Injection vulnerabilities consistently rank #1 or #2 in most critical web security risks.

## Rule

**Validate and sanitize ALL input before use. No exceptions.**

- Validate type, format, range, length
- Whitelist acceptable values (don't just blacklist bad ones)
- Use parameterized queries (never string concatenation)
- Sanitize for output context (HTML, SQL, OS commands)
- Fail closed (reject invalid input, don't try to "fix" it)

## Examples

### ❌ Wrong - Trusting Input

```javascript
// Bad: Direct use of user input in SQL
app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;

    // SQL Injection vulnerability!
    const query = `SELECT * FROM users WHERE id = '${userId}'`;
    const user = await db.query(query);

    res.json(user);
});

// Bad: Trusting "validated" input from frontend
app.post('/api/admin/users', requireAdmin, async (req, res) => {
    // "requireAdmin checks auth, so we can trust the input" ❌ WRONG
    const { email, role } = req.body;

    await db.query(
        `INSERT INTO users (email, role) VALUES ('${email}', '${role}')`
    );

    res.json({ success: true });
});

// Bad: Partial validation
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    // Blacklist approach - easy to bypass
    if (query.includes('DROP') || query.includes('DELETE')) {
        return res.status(400).json({ error: 'Invalid query' });
    }

    // Still vulnerable to many injection techniques
    const results = await db.query(`SELECT * FROM items WHERE name LIKE '%${query}%'`);
    res.json(results);
});
```

### ✅ Correct - Validate Everything

```javascript
const { z } = require('zod'); // Validation library

// Define schemas for all inputs
const UserIdSchema = z.string().uuid();
const EmailSchema = z.string().email().max(255);
const RoleSchema = z.enum(['user', 'admin', 'moderator']); // Whitelist
const SearchQuerySchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/);

// Good: Validate and use parameterized queries
app.get('/api/users/:userId', async (req, res) => {
    // Validate format
    const validation = UserIdSchema.safeParse(req.params.userId);

    if (!validation.success) {
        return res.status(400).json({
            error: 'Invalid userId format',
            details: validation.error.format()
        });
    }

    const userId = validation.data;

    // Parameterized query - safe from SQL injection
    const result = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [userId]
    );

    if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
});

// Good: Validate even for "trusted" admin endpoints
app.post('/api/admin/users', requireAdmin, async (req, res) => {
    // Validate ALL inputs, even from admins
    const CreateUserSchema = z.object({
        email: EmailSchema,
        role: RoleSchema,
        name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/)
    });

    const validation = CreateUserSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: 'Invalid input',
            details: validation.error.format()
        });
    }

    const { email, role, name } = validation.data;

    // Parameterized query
    await db.query(
        'INSERT INTO users (email, role, name) VALUES (?, ?, ?)',
        [email, role, name]
    );

    res.json({ success: true });
});

// Good: Whitelist approach for search
app.get('/api/search', async (req, res) => {
    const validation = SearchQuerySchema.safeParse(req.query.query);

    if (!validation.success) {
        return res.status(400).json({
            error: 'Invalid search query',
            message: 'Only alphanumeric characters, spaces, hyphens, and underscores allowed'
        });
    }

    const searchQuery = validation.data;

    // Parameterized LIKE query
    const results = await db.query(
        'SELECT id, name, description FROM items WHERE name LIKE ? LIMIT 100',
        [`%${searchQuery}%`]
    );

    res.json(results);
});
```

## Validation Patterns

### Type Validation

```javascript
// Define strict types for all inputs
const schemas = {
    uuid: z.string().uuid(),
    email: z.string().email().max(255),
    url: z.string().url().max(2000),
    integer: z.number().int().min(0),
    dateString: z.string().datetime(),
    enum: (values) => z.enum(values), // Whitelist

    // Custom validators
    slug: z.string().regex(/^[a-z0-9-]+$/),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // E.164 format
    creditCard: z.string().regex(/^\d{13,19}$/), // Basic format check
};
```

### Range Validation

```javascript
// Always set reasonable limits
const PaginationSchema = z.object({
    page: z.number().int().min(1).max(1000),
    limit: z.number().int().min(1).max(100), // Prevent resource exhaustion
});

const FileUploadSchema = z.object({
    filename: z.string().min(1).max(255),
    size: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
    mimeType: z.enum(['image/jpeg', 'image/png', 'application/pdf']), // Whitelist
});
```

### Nested Validation

```javascript
const AddressSchema = z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().length(2).regex(/^[A-Z]{2}$/),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const OrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
    })).min(1).max(50), // At least 1 item, max 50

    shippingAddress: AddressSchema,
    billingAddress: AddressSchema.optional(),
});
```

## Output Sanitization

```javascript
// Sanitize for HTML context
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Sanitize for SQL LIKE patterns (if not using parameterized queries)
const escapeSqlLike = (str) => {
    return str.replace(/[%_\\]/g, '\\$&');
};

// Sanitize for shell commands (better: avoid shell commands entirely)
const escapeShellArg = (arg) => {
    // Better: use libraries that don't invoke shell
    return `'${arg.replace(/'/g, "'\\''")}'`;
};
```

## File Upload Validation

```javascript
// Validate file uploads strictly
const validateUpload = async (file) => {
    // 1. Validate file size
    if (file.size > 10 * 1024 * 1024) {
        throw new ValidationError('File size exceeds 10MB limit');
    }

    // 2. Validate MIME type (from magic bytes, not extension)
    const fileType = await import('file-type');
    const detectedType = await fileType.fromBuffer(file.buffer);

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
        throw new ValidationError('File type not allowed');
    }

    // 3. Validate filename (prevent directory traversal)
    const safeName = path.basename(file.originalname);
    if (safeName !== file.originalname || safeName.includes('..')) {
        throw new ValidationError('Invalid filename');
    }

    // 4. Scan for malware (in production)
    if (process.env.NODE_ENV === 'production') {
        await scanForMalware(file.buffer);
    }

    return {
        safeFilename: `${uuid.v4()}-${safeName}`,
        detectedType: detectedType.mime
    };
};
```

## API Rate Limiting

```javascript
// Prevent abuse through rate limiting
const rateLimit = require('express-rate-limit');

// Global rate limit
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later'
}));

// Stricter limit for sensitive endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
});

app.post('/api/auth/login', authLimiter, loginHandler);
```

## Detection

**SecurityScannerAgent checks for:**
- String concatenation in SQL queries
- Direct use of req.body/req.params/req.query without validation
- Lack of input validation on API endpoints
- Missing rate limiting on sensitive endpoints
- File uploads without type validation

**CodeReviewAgent enforces:**
- Validation schemas defined for all inputs
- Parameterized queries used consistently
- Output sanitization for user-generated content
- File upload validation includes magic byte checking

## Testing

```javascript
describe('Input validation security', () => {
    it('should reject SQL injection attempts', async () => {
        const malicious = "1' OR '1'='1";

        const response = await request(app)
            .get(`/api/users/${malicious}`)
            .expect(400);

        expect(response.body.error).toMatch(/Invalid userId/);
    });

    it('should reject oversized inputs', async () => {
        const huge = 'a'.repeat(10000);

        const response = await request(app)
            .post('/api/comments')
            .send({ content: huge })
            .expect(400);

        expect(response.body.error).toMatch(/exceeds maximum length/);
    });

    it('should validate nested objects', async () => {
        const invalid = {
            items: [{ productId: 'not-a-uuid', quantity: -1 }]
        };

        const response = await request(app)
            .post('/api/orders')
            .send(invalid)
            .expect(400);
    });
});
```

## Related Standards

- `.standards-local/security/credential-scanning.md` - Secret detection
- `.standards-local/architecture/error-first-design.md` - Error handling
- `.standards-local/security/api-security.md` - API authentication and authorization

## History

- **Created:** 2024-11-01 after security audit findings
- **Last Updated:** 2025-01-15
- **Vulnerabilities Prevented:** 30+ injection attempts caught in testing
- **Security Score Improvement:** 65/100 → 92/100 after implementation

---

**Remember:** Never trust input. Not from users. Not from admins. Not from other services. Validate everything.
