# Error-First Design

## Problem

Developers often write "happy path" code first, adding error handling as an afterthought (if at all). This leads to:
- Silent failures in production
- Cascading errors that are hard to debug
- User-facing generic error messages
- No recovery mechanisms

## Cost of Violation

**Real incident example:**
- API endpoint didn't validate database connection before querying
- Database went down during deployment
- Application hung for 30 seconds per request (default timeout)
- Users saw "Internal Server Error" with no context
- **Result:**
  - 45 minutes of degraded service
  - 1,200+ failed requests
  - 6 hours debugging to find root cause
  - Lost customer confidence

**Pattern:** Most production issues stem from unhandled error cases, not bugs in happy-path logic.

## Rule

**Design error handling before implementing happy path.**

For every function/endpoint/workflow:
1. List what can go wrong
2. Define error handling for each case
3. Write error handling code first
4. Then implement happy path
5. Test error cases first

## Examples

### ❌ Wrong - Happy Path First

```javascript
// Bad: Only considers success case
async function getUserData(userId) {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

// What if:
// - Database is down?
// - User doesn't exist?
// - userId is null/invalid?
// - Query returns multiple rows?
// - Database connection times out?
```

### ✅ Correct - Error-First Design

```javascript
// Good: Errors designed first
async function getUserData(userId) {
    // Error case 1: Invalid input
    if (!userId || typeof userId !== 'string') {
        throw new InvalidInputError('userId must be a non-empty string', {
            received: userId
        });
    }

    // Error case 2: Database connection
    let connection;
    try {
        connection = await db.getConnection();
    } catch (err) {
        throw new DatabaseConnectionError('Failed to connect to database', {
            cause: err,
            retryable: true
        });
    }

    // Error case 3: Query execution
    let result;
    try {
        result = await connection.query(
            'SELECT * FROM users WHERE id = ? LIMIT 1',
            [userId]
        );
    } catch (err) {
        throw new DatabaseQueryError('User query failed', {
            cause: err,
            query: 'getUserData',
            userId // Safe to log, not sensitive
        });
    } finally {
        if (connection) connection.release();
    }

    // Error case 4: User not found
    if (!result || result.length === 0) {
        throw new UserNotFoundError('User does not exist', {
            userId,
            notFound: true
        });
    }

    // Error case 5: Data integrity
    const user = result[0];
    if (!user.id || !user.name || !user.email) {
        throw new DataIntegrityError('User record is incomplete', {
            userId,
            missingFields: {
                id: !user.id,
                name: !user.name,
                email: !user.email
            }
        });
    }

    // Happy path (only after all error cases handled)
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}
```

### Custom Error Classes

```javascript
class AppError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.details = details;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

class InvalidInputError extends AppError {
    constructor(message, details) {
        super(message, details);
        this.statusCode = 400;
        this.userMessage = 'Invalid request parameters';
    }
}

class DatabaseConnectionError extends AppError {
    constructor(message, details) {
        super(message, details);
        this.statusCode = 503;
        this.userMessage = 'Service temporarily unavailable';
        this.retryable = true;
    }
}

class UserNotFoundError extends AppError {
    constructor(message, details) {
        super(message, details);
        this.statusCode = 404;
        this.userMessage = 'User not found';
    }
}
```

## Error-First Checklist

Before implementing any function:

- [ ] **List error cases**
  - What can fail?
  - Invalid inputs?
  - External dependencies down?
  - Resource limits exceeded?
  - Concurrent access conflicts?

- [ ] **Define error responses**
  - What error type for each case?
  - What information to include?
  - What's safe to log vs expose to user?
  - Is it retryable?

- [ ] **Write error handling**
  - Custom error classes
  - Input validation
  - Try-catch blocks
  - Resource cleanup (finally blocks)

- [ ] **Write error tests first**
  - Test each error case
  - Verify error messages
  - Check error propagation
  - Validate logging

- [ ] **Then implement happy path**

## Error Response Format

**Standardized error response:**

```javascript
// Error handler middleware (Express example)
app.use((err, req, res, next) => {
    // Log full error internally
    logger.error({
        error: err.name,
        message: err.message,
        details: err.details,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id
    });

    // Send safe error to client
    res.status(err.statusCode || 500).json({
        error: {
            type: err.name,
            message: err.userMessage || 'An error occurred',
            requestId: req.id,
            timestamp: err.timestamp,
            retryable: err.retryable || false,
            // Only in development:
            ...(process.env.NODE_ENV === 'development' && {
                details: err.details,
                stack: err.stack
            })
        }
    });
});
```

## Detection

**CodeReviewAgent checks for:**
- Functions without try-catch
- Database queries without error handling
- API calls without timeout/retry logic
- Async functions without error propagation
- Promise chains without .catch()

**AuditorAgent enforces:**
- Custom error classes defined
- Errors include context (not just generic messages)
- Sensitive data not exposed in errors
- Errors logged with appropriate severity

## Testing Error Cases

```javascript
describe('getUserData', () => {
    // Test error cases FIRST
    it('should throw InvalidInputError for null userId', async () => {
        await expect(getUserData(null))
            .rejects.toThrow(InvalidInputError);
    });

    it('should throw DatabaseConnectionError when DB is down', async () => {
        mockDb.getConnection.mockRejectedValue(new Error('Connection refused'));

        await expect(getUserData('user123'))
            .rejects.toThrow(DatabaseConnectionError);
    });

    it('should throw UserNotFoundError for non-existent user', async () => {
        mockDb.query.mockResolvedValue([]);

        await expect(getUserData('user123'))
            .rejects.toThrow(UserNotFoundError);
    });

    // Test happy path LAST
    it('should return user data for valid userId', async () => {
        mockDb.query.mockResolvedValue([{
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com'
        }]);

        const result = await getUserData('user123');
        expect(result.id).toBe('user123');
    });
});
```

## Monitoring & Alerts

```javascript
// Track error patterns
logger.error({
    error: err.name,
    retryable: err.retryable,
    statusCode: err.statusCode,
    context: err.details
});

// Alert on error spikes
if (errorRate > threshold) {
    alerting.send({
        severity: 'high',
        message: `Error rate exceeds ${threshold}%`,
        errors: recentErrors
    });
}
```

## Related Standards

- `.standards/no-mocks.md` - Use real dependencies with proper error handling
- `.standards-local/testing/integration-tests.md` - Testing error scenarios
- `.standards-local/architecture/service-boundaries.md` - Error propagation across services

## History

- **Created:** 2024-09-01
- **Last Updated:** 2025-01-15
- **Incidents Prevented:** 25+ production issues caught in testing
- **Average Debug Time Saved:** 4 hours per incident (clear error messages vs debugging)

---

**Remember:** The happy path is easy. The error cases are where production breaks. Design for failure first.
