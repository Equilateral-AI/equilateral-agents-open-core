# Authentication and Access Control

## Problem

Broken authentication and authorization are consistently in OWASP Top 10. Common mistakes:
- Confusing authentication (who you are) with authorization (what you can do)
- Implementing custom crypto instead of using proven libraries
- Storing passwords incorrectly
- Missing authorization checks ("if they're logged in, they can do anything")
- Trusting client-side checks

## Cost of Violation

**Real incident example:**
- API checked authentication (valid JWT) but not authorization
- Any logged-in user could access any other user's data
- Discovered when user accidentally saw someone else's payment info
- **Result:**
  - Privacy breach affecting 15,000 users
  - Regulatory notification requirements (GDPR Article 33)
  - $50,000 in legal/compliance costs
  - 3 months of security audits
  - Massive trust damage

**Industry stats:** 94% of applications tested in 2024 had at least one broken access control vulnerability.

## Rule

**Authenticate who they are. Authorize what they can do. Do both, every time.**

1. Use proven libraries (never roll your own crypto)
2. Check authorization on every endpoint (not just authentication)
3. Default deny (explicitly allow, don't explicitly deny)
4. Validate on server (never trust client-side checks)
5. Use principle of least privilege

## Examples

### ❌ Wrong - Authentication Without Authorization

```javascript
// Bad: Checks if user is logged in, not if they can access this resource
app.get('/api/orders/:orderId', requireAuth, async (req, res) => {
    // requireAuth checked JWT is valid
    // But doesn't check if THIS user can access THIS order
    const order = await db.query(
        'SELECT * FROM orders WHERE id = ?',
        [req.params.orderId]
    );

    res.json(order); // ❌ Anyone logged in can see any order!
});

// Bad: Custom crypto
const crypto = require('crypto');

function hashPassword(password) {
    // ❌ MD5 is broken, no salt, predictable
    return crypto.createHash('md5').update(password).digest('hex');
}

// Bad: Client-side role check
app.get('/api/admin/users', requireAuth, async (req, res) => {
    // ❌ Trusting role from JWT without server-side verification
    if (req.user.role === 'admin') {
        const users = await db.query('SELECT * FROM users');
        return res.json(users);
    }

    res.status(403).json({ error: 'Forbidden' });
});
```

### ✅ Correct - Proper Auth & Authz

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Good: Proper password hashing
async function hashPassword(password) {
    // bcrypt includes salt automatically, proper work factor
    const saltRounds = 12; // Adjust based on hardware
    return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Good: Authentication middleware
async function requireAuth(req, res, next) {
    try {
        // Verify JWT
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Load current user from database (don't trust JWT claims alone)
        const user = await db.query(
            'SELECT id, email, role, active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user || user.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!user[0].active) {
            return res.status(401).json({ error: 'Account disabled' });
        }

        req.user = user[0];
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }

        return res.status(401).json({ error: 'Invalid authentication token' });
    }
}

// Good: Resource-level authorization
app.get('/api/orders/:orderId', requireAuth, async (req, res) => {
    const { orderId } = req.params;

    // Query includes authorization check
    const order = await db.query(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, req.user.id]
    );

    if (!order || order.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order[0]);
});

// Good: Role-based access control (server-side)
function requireRole(allowedRoles) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Re-verify role from database (not from JWT)
        const user = await db.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user || !allowedRoles.includes(user[0].role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

app.get('/api/admin/users',
    requireAuth,
    requireRole(['admin', 'superadmin']),
    async (req, res) => {
        const users = await db.query(
            'SELECT id, email, role, created_at FROM users'
        );

        res.json(users);
    }
);

// Good: Attribute-based access control (ABAC)
async function canAccessProject(userId, projectId) {
    // Check if user owns project or is a member
    const access = await db.query(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE p.id = ?
        AND (p.owner_id = ? OR pm.user_id = ?)
        LIMIT 1
    `, [projectId, userId, userId]);

    return access.length > 0;
}

app.get('/api/projects/:projectId', requireAuth, async (req, res) => {
    const { projectId } = req.params;

    // Check access before querying data
    if (!await canAccessProject(req.user.id, projectId)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const project = await db.query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
    );

    res.json(project[0]);
});
```

## Session Management

```javascript
// Good: Secure session configuration
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET, // Strong random secret
    name: 'sessionId', // Don't use default name
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // HTTPS only
        httpOnly: true, // Not accessible via JavaScript
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: 'strict' // CSRF protection
    }
}));

// Regenerate session on login (prevent session fixation)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await db.query(
        'SELECT id, email, password_hash, role FROM users WHERE email = ?',
        [email]
    );

    if (!user || user.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!await verifyPassword(password, user[0].password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Regenerate session ID to prevent fixation attacks
    req.session.regenerate((err) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed' });
        }

        req.session.userId = user[0].id;
        req.session.role = user[0].role;

        res.json({
            user: {
                id: user[0].id,
                email: user[0].email,
                role: user[0].role
            }
        });
    });
});

// Destroy session on logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }

        res.clearCookie('sessionId');
        res.json({ success: true });
    });
});
```

## JWT Best Practices

```javascript
// Good: Secure JWT implementation
const jwt = require('jsonwebtoken');

function generateAccessToken(userId, expiresIn = '15m') {
    return jwt.sign(
        {
            userId,
            type: 'access',
            // Don't put sensitive data in JWT (it's not encrypted)
        },
        process.env.JWT_SECRET,
        {
            expiresIn,
            issuer: 'your-app-name',
            audience: 'your-app-name'
        }
    );
}

function generateRefreshToken(userId) {
    const token = jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET, // Different secret!
        {
            expiresIn: '7d',
            issuer: 'your-app-name'
        }
    );

    // Store refresh token in database for revocation
    db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    return token;
}

// Token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // Verify token exists in database (not revoked)
        const stored = await db.query(
            'SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
            [refreshToken]
        );

        if (!stored || stored.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Generate new access token
        const accessToken = generateAccessToken(decoded.userId);

        res.json({ accessToken });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});
```

## Rate Limiting for Auth Endpoints

```javascript
const rateLimit = require('express-rate-limit');

// Strict limit on authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many authentication attempts. Please try again in 15 minutes.'
        });
    }
});

app.post('/api/auth/login', authLimiter, loginHandler);
app.post('/api/auth/forgot-password', authLimiter, forgotPasswordHandler);
```

## Detection

**SecurityReviewerAgent checks for:**
- Endpoints missing authentication checks
- Authorization checks missing or inadequate
- Custom crypto implementations (use proven libraries!)
- Session configuration issues (missing httpOnly, secure flags)
- JWT secrets in code or weak secrets

**ComplianceCheckAgent enforces:**
- Password policies (min length, complexity, hashing algorithm)
- Session timeout configurations
- Rate limiting on authentication endpoints
- Audit logging for authentication events

## Testing

```javascript
describe('Authorization', () => {
    it('should prevent accessing another user\'s orders', async () => {
        const user1Token = await generateToken(user1.id);

        const response = await request(app)
            .get(`/api/orders/${user2Order.id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(404); // Returns 404, not 403 (don't leak info)
    });

    it('should prevent role escalation', async () => {
        const userToken = await generateToken(userId, { role: 'user' });

        // Try to access admin endpoint
        const response = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
    });

    it('should enforce rate limiting on login', async () => {
        // Attempt 6 logins in quick succession
        for (let i = 0; i < 6; i++) {
            await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrong' });
        }

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'correct' })
            .expect(429); // Too Many Requests
    });
});
```

## Security Checklist

- [ ] Using bcrypt (or Argon2) for password hashing, not MD5/SHA1
- [ ] JWT secrets are strong random values (256+ bits)
- [ ] Different secrets for access/refresh tokens
- [ ] Refresh tokens stored in database for revocation
- [ ] Session cookies have httpOnly, secure, sameSite flags
- [ ] Rate limiting on authentication endpoints (5-10 attempts per 15min)
- [ ] Authorization checks on EVERY endpoint (not just authentication)
- [ ] Resource-level access control (user can only access their data)
- [ ] Role checks query database (don't trust JWT/session alone)
- [ ] Sessions regenerated on login (prevent fixation)
- [ ] Audit logging for auth events (login, logout, failed attempts)

## Related Standards

- `.standards-local/security/input-validation-security.md` - Input validation
- `.standards-local/security/credential-scanning.md` - Secret detection
- `.standards-local/architecture/error-first-design.md` - Error handling

## History

- **Created:** 2024-11-15 after security assessment
- **Last Updated:** 2025-01-15
- **Authorization Bugs Found:** 8 endpoints missing authz checks
- **Security Improvement:** Broken access control eliminated from security scans

---

**Remember:** Authentication = "Who are you?" Authorization = "What can you do?" Always answer both questions.
