# Integration Tests - No Mocks in Production Code

## Problem

Mocking external dependencies (databases, APIs, message queues) hides real integration failures until production. Mocks create false confidence - tests pass, but production breaks.

## Cost of Violation

**Real incident example:**
- Backend tests used mocked database responses
- All tests passed with 100% coverage
- Deployed to production
- Real database returned different field names than mocked version
- **Result:**
  - 2 hours of complete service outage
  - Data corruption affecting 50+ user accounts
  - 12 hours fixing data inconsistencies
  - Customer escalations and complaints

**Pattern:** "Works on my machine" syndrome - mocks guarantee tests and production behave differently.

## Rule

**No mocks in production code. Test against real dependencies.**

- Use real database with test data
- Call real APIs in test environment
- Use actual message queues
- Test services in Docker containers if needed
- Mocks allowed ONLY in test files (never in production code)

## Examples

### ❌ Wrong - Mocks Hide Real Failures

```javascript
// Bad: Mocking database in production code
class UserService {
    constructor(db = null) {
        // ❌ Allows injecting mock in production
        this.db = db || require('./database');
    }

    async getUser(userId) {
        const result = await this.db.query('SELECT * FROM users WHERE id = ?', [userId]);
        // Assumes mock returns same structure as real DB
        return result[0];
    }
}

// Test with mock
test('getUser returns user', async () => {
    const mockDb = {
        query: jest.fn().mockResolvedValue([{ id: '123', name: 'Test' }])
    };

    const service = new UserService(mockDb);
    const user = await service.getUser('123');

    expect(user.name).toBe('Test');
    // ✅ Test passes, but doesn't test real database behavior
});
```

Problems with this approach:
- Mock might return different structure than real DB
- Doesn't test SQL query syntax
- Doesn't test connection handling
- Doesn't test transactions, locks, constraints
- **Tests pass, production breaks**

### ✅ Correct - Test Real Dependencies

```javascript
// Good: No dependency injection for mocking
class UserService {
    constructor() {
        this.db = require('./database');
    }

    async getUser(userId) {
        // Input validation
        if (!userId) {
            throw new Error('userId is required');
        }

        const result = await this.db.query(
            'SELECT id, name, email FROM users WHERE id = ?',
            [userId]
        );

        if (result.length === 0) {
            throw new Error('User not found');
        }

        return result[0];
    }
}

// Test setup - use real database
beforeAll(async () => {
    // Start test database (SQLite in-memory, Docker PostgreSQL, etc.)
    await db.connect(process.env.TEST_DATABASE_URL);
    await db.migrate();
});

beforeEach(async () => {
    // Clean database between tests
    await db.query('DELETE FROM users');
});

afterAll(async () => {
    await db.close();
});

// Test with real database
test('getUser returns user from database', async () => {
    // Insert test data into REAL database
    await db.query(
        'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
        ['123', 'Test User', 'test@example.com']
    );

    const service = new UserService();
    const user = await service.getUser('123');

    expect(user.id).toBe('123');
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
});

test('getUser throws when user not found', async () => {
    const service = new UserService();

    await expect(service.getUser('nonexistent'))
        .rejects.toThrow('User not found');
});
```

## Real Database for Tests

### SQLite In-Memory (Fast, Simple)

```javascript
// config/database.test.js
const sqlite3 = require('sqlite3');
const { promisify } = require('util');

class TestDatabase {
    async connect() {
        // In-memory SQLite - fast, isolated
        this.db = new sqlite3.Database(':memory:');
        this.run = promisify(this.db.run.bind(this.db));
        this.query = promisify(this.db.all.bind(this.db));
    }

    async migrate() {
        // Run same migrations as production
        await this.run(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async close() {
        this.db.close();
    }
}

module.exports = new TestDatabase();
```

### Docker PostgreSQL (Production-Like)

```javascript
// test/setup.js
const { GenericContainer } = require('testcontainers');
const { Client } = require('pg');

let pgContainer;
let pgClient;

beforeAll(async () => {
    // Start PostgreSQL in Docker
    pgContainer = await new GenericContainer('postgres:15')
        .withEnvironment({
            POSTGRES_DB: 'testdb',
            POSTGRES_USER: 'testuser',
            POSTGRES_PASSWORD: 'testpass'
        })
        .withExposedPorts(5432)
        .start();

    const connectionString = `postgresql://testuser:testpass@localhost:${pgContainer.getMappedPort(5432)}/testdb`;

    pgClient = new Client({ connectionString });
    await pgClient.connect();

    // Run migrations
    await runMigrations(pgClient);
}, 60000); // Timeout: 60 seconds for container startup

beforeEach(async () => {
    // Clean tables between tests
    await pgClient.query('TRUNCATE TABLE users CASCADE');
});

afterAll(async () => {
    await pgClient.end();
    await pgContainer.stop();
});
```

## Testing External APIs

```javascript
// Good: Test against real API (sandbox environment)
describe('Payment API integration', () => {
    let stripeTestKey;

    beforeAll(() => {
        // Use Stripe's test API keys
        stripeTestKey = process.env.STRIPE_TEST_KEY;

        if (!stripeTestKey) {
            throw new Error('STRIPE_TEST_KEY required for integration tests');
        }
    });

    test('should process payment successfully', async () => {
        const paymentService = new PaymentService(stripeTestKey);

        // Use Stripe's test card numbers
        const result = await paymentService.charge({
            amount: 1000,
            currency: 'usd',
            card: {
                number: '4242424242424242', // Stripe test card
                exp_month: 12,
                exp_year: 2025,
                cvc: '123'
            }
        });

        expect(result.status).toBe('succeeded');
        expect(result.amount).toBe(1000);
    });

    test('should handle declined cards', async () => {
        const paymentService = new PaymentService(stripeTestKey);

        // Use Stripe's test card that declines
        await expect(paymentService.charge({
            amount: 1000,
            currency: 'usd',
            card: {
                number: '4000000000000002', // Declined card
                exp_month: 12,
                exp_year: 2025,
                cvc: '123'
            }
        })).rejects.toThrow('card_declined');
    });
});
```

## When Mocks ARE Acceptable

**Only in test files, never in production code:**

```javascript
// tests/email-notification.test.js

// Acceptable: Mock external email service in tests
// (Don't actually send emails during tests)
jest.mock('../services/emailProvider', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
}));

const emailService = require('../services/emailService');
const emailProvider = require('../services/emailProvider');

test('sendWelcomeEmail calls provider with correct template', async () => {
    await emailService.sendWelcomeEmail('user@example.com', 'John');

    expect(emailProvider.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        template: 'welcome',
        variables: { name: 'John' }
    });
});
```

**Why this is acceptable:**
- Mock is in test file, not production code
- Tests business logic (template selection, variable passing)
- Avoids actually sending emails during tests
- Still tests integration with real database, real queue, etc.

## Test Data Management

```javascript
// test/fixtures.js
class TestFixtures {
    static async createUser(overrides = {}) {
        const userData = {
            id: uuid.v4(),
            name: 'Test User',
            email: `test-${Date.now()}@example.com`,
            role: 'user',
            ...overrides
        };

        await db.query(
            'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)',
            [userData.id, userData.name, userData.email, userData.role]
        );

        return userData;
    }

    static async createOrder(userId, overrides = {}) {
        const orderData = {
            id: uuid.v4(),
            userId,
            total: 100,
            status: 'pending',
            ...overrides
        };

        await db.query(
            'INSERT INTO orders (id, user_id, total, status) VALUES (?, ?, ?, ?)',
            [orderData.id, orderData.userId, orderData.total, orderData.status]
        );

        return orderData;
    }
}

// Use in tests
test('user can view their orders', async () => {
    const user = await TestFixtures.createUser();
    const order = await TestFixtures.createOrder(user.id);

    const orders = await orderService.getUserOrders(user.id);

    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(order.id);
});
```

## Performance Testing Real Dependencies

```javascript
// test/performance.test.js
describe('Database query performance', () => {
    beforeAll(async () => {
        // Insert realistic data volume
        const users = Array.from({ length: 10000 }, (_, i) => ({
            id: uuid.v4(),
            name: `User ${i}`,
            email: `user${i}@example.com`
        }));

        // Batch insert
        await db.batchInsert('users', users);
    });

    test('getUserById should complete within 100ms', async () => {
        const start = Date.now();
        await userService.getUserById('some-id');
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
    });

    test('searchUsers should handle large result sets', async () => {
        // Query that returns many results
        const results = await userService.searchUsers('User');

        expect(results.length).toBeLessThanOrEqual(100); // Pagination limit
        // Should complete in reasonable time even with 10k users
    });
});
```

## Detection

**AuditorAgent checks for:**
- Dependency injection patterns that allow mocking
- Test files using mocks for database/core dependencies
- Missing integration test coverage
- Tests not using real database connections

**TestOrchestrationAgent enforces:**
- Integration tests run against real dependencies
- Test database setup/teardown scripts exist
- Docker compose for test dependencies (if needed)
- Clear separation: unit tests (fast, no I/O) vs integration tests (real dependencies)

## Related Standards

- `.standards/no-mocks.md` - Official no-mocks principle
- `.standards-local/testing/test-coverage.md` - Coverage requirements
- `.standards-local/architecture/error-first-design.md` - Testing error cases

## History

- **Created:** 2024-08-01
- **Last Updated:** 2025-01-15
- **Production Bugs Caught:** 15+ integration issues found in tests, not production
- **Incidents Prevented:** 3+ outages avoided by catching DB migration issues in tests

---

**Remember:** Mocks don't find integration bugs. Real dependencies do. Test what you deploy.
