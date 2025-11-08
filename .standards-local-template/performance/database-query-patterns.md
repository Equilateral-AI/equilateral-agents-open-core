# Database Query Performance Patterns

## Problem

Poorly optimized database queries cause slow API responses, timeouts, and scaling issues. Common mistakes:
- N+1 query problems
- Missing indexes
- SELECT * wastage
- Unbounded queries (no LIMIT)
- Inefficient JOIN patterns

## Cost of Violation

**Real incident example:**
- API endpoint loaded user + their posts + comments
- Used 3 separate queries (user, then posts in loop, then comments in nested loop)
- 1 user with 50 posts and 200 comments = 251 database queries
- Each query ~10ms = 2.5 seconds per request
- **Result:**
  - API timeouts affecting all users
  - Database connection pool exhausted
  - 3 hours emergency hotfix
  - Customer complaints about "slow app"

**Pattern:** N+1 queries are the #1 performance killer in web applications.

## Rule

**Optimize database access before it hits production.**

1. Use eager loading (JOIN/includes) instead of N+1 queries
2. Add indexes for all WHERE/ORDER BY columns
3. SELECT only needed columns (not *)
4. Always use LIMIT for lists
5. Measure query times in tests (< 100ms for simple, < 500ms for complex)

## Examples

### ❌ Wrong - N+1 Query Problem

```javascript
// Bad: N+1 queries (1 for users + N for each user's posts)
async function getUsersWithPosts() {
    // Query 1: Get all users
    const users = await db.query('SELECT * FROM users LIMIT 100');

    // Query 2-101: Get posts for each user (N queries!)
    for (const user of users) {
        user.posts = await db.query(
            'SELECT * FROM posts WHERE user_id = ?',
            [user.id]
        );

        // Even worse: nested N+1 for comments!
        for (const post of user.posts) {
            post.comments = await db.query(
                'SELECT * FROM comments WHERE post_id = ?',
                [post.id]
            );
        }
    }

    return users;
}

// Result: 100 users × 10 posts × 5 comments = 5,101 queries! 💥
```

### ✅ Correct - Single Query with JOINs

```javascript
// Good: Single query with JOINs
async function getUsersWithPosts() {
    const query = `
        SELECT
            u.id as user_id,
            u.name as user_name,
            u.email as user_email,
            p.id as post_id,
            p.title as post_title,
            p.content as post_content,
            c.id as comment_id,
            c.content as comment_content,
            c.author as comment_author
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN comments c ON p.id = c.post_id
        WHERE u.active = true
        ORDER BY u.created_at DESC, p.created_at DESC, c.created_at DESC
        LIMIT 100
    `;

    const rows = await db.query(query);

    // Transform flat results into nested structure
    const usersMap = new Map();

    for (const row of rows) {
        // Get or create user
        if (!usersMap.has(row.user_id)) {
            usersMap.set(row.user_id, {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                posts: []
            });
        }

        const user = usersMap.get(row.user_id);

        // Get or create post
        if (row.post_id) {
            let post = user.posts.find(p => p.id === row.post_id);

            if (!post) {
                post = {
                    id: row.post_id,
                    title: row.post_title,
                    content: row.post_content,
                    comments: []
                };
                user.posts.push(post);
            }

            // Add comment if exists
            if (row.comment_id) {
                post.comments.push({
                    id: row.comment_id,
                    content: row.comment_content,
                    author: row.comment_author
                });
            }
        }
    }

    return Array.from(usersMap.values());
}

// Result: 1 query instead of 5,101! 🚀
```

## Using ORM Eager Loading

```javascript
// Good: ORM with eager loading (Sequelize example)
async function getUsersWithPosts() {
    const users = await User.findAll({
        attributes: ['id', 'name', 'email'], // Only needed columns
        where: { active: true },
        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'content'],
                include: [
                    {
                        model: Comment,
                        attributes: ['id', 'content', 'author']
                    }
                ]
            }
        ],
        limit: 100,
        order: [['created_at', 'DESC']]
    });

    return users;
}

// ORM generates efficient JOIN query automatically
```

## Indexing Strategy

```javascript
// Bad: No indexes
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP
);

// Query is slow:
SELECT * FROM users WHERE email = 'user@example.com'; -- Full table scan!

// Good: Add indexes for common query patterns
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE creates index
    name VARCHAR(255),
    created_at TIMESTAMP,
    active BOOLEAN DEFAULT true
);

-- Index for common WHERE clauses
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Composite index for common query combinations
CREATE INDEX idx_users_active_created ON users(active, created_at);

-- Now query is fast (index scan):
SELECT * FROM users WHERE email = 'user@example.com'; -- Uses UNIQUE index
SELECT * FROM users WHERE active = true ORDER BY created_at DESC; -- Uses composite index
```

## Query Optimization Patterns

### 1. SELECT Only Needed Columns

```javascript
// Bad: SELECT * wastage
const users = await db.query('SELECT * FROM users');
// Returns 50 columns, only need 3

// Good: Specific columns
const users = await db.query(`
    SELECT id, name, email
    FROM users
    WHERE active = true
`);
```

### 2. Always Use LIMIT

```javascript
// Bad: Unbounded query (could return millions of rows)
const posts = await db.query('SELECT * FROM posts');

// Good: Pagination with LIMIT/OFFSET
const posts = await db.query(`
    SELECT id, title, excerpt, created_at
    FROM posts
    WHERE published = true
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
`, [pageSize, pageSize * (page - 1)]);

// Better: Cursor-based pagination (more efficient for large offsets)
const posts = await db.query(`
    SELECT id, title, excerpt, created_at
    FROM posts
    WHERE published = true
    AND created_at < ?
    ORDER BY created_at DESC
    LIMIT ?
`, [cursorDate, pageSize]);
```

### 3. Batch Operations

```javascript
// Bad: Multiple individual inserts
for (const user of users) {
    await db.query(
        'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
        [user.id, user.name, user.email]
    );
}
// Result: 1000 users = 1000 round trips to DB

// Good: Batch insert
const values = users.map(u => `('${u.id}', '${u.name}', '${u.email}')`).join(',');
await db.query(`
    INSERT INTO users (id, name, email)
    VALUES ${values}
`);

// Even better: Use transaction for safety
await db.transaction(async (trx) => {
    const batchSize = 100;

    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const placeholders = batch.map(() => '(?, ?, ?)').join(',');
        const values = batch.flatMap(u => [u.id, u.name, u.email]);

        await trx.query(
            `INSERT INTO users (id, name, email) VALUES ${placeholders}`,
            values
        );
    }
});
```

### 4. Use Appropriate JOIN Types

```javascript
// Understand JOIN performance implications

// INNER JOIN: Only rows with matches in both tables
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

// LEFT JOIN: All users, even without posts (can be slower)
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id;

// EXISTS: Check for existence (often faster than JOIN + COUNT)
SELECT u.name
FROM users u
WHERE EXISTS (
    SELECT 1 FROM posts p WHERE p.user_id = u.id
);

// NOT EXISTS: Users without posts (faster than LEFT JOIN + NULL check)
SELECT u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM posts p WHERE p.user_id = u.id
);
```

## Connection Pooling

```javascript
// Bad: Create new connection per request
async function handler(req, res) {
    const db = await createConnection();
    const data = await db.query('SELECT * FROM users');
    await db.close();
    res.json(data);
}

// Good: Use connection pool
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // Max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

async function handler(req, res) {
    const client = await pool.connect();

    try {
        const data = await client.query('SELECT * FROM users LIMIT 100');
        res.json(data.rows);
    } finally {
        client.release(); // Return to pool
    }
}
```

## Query Performance Testing

```javascript
// test/performance/database.test.js
describe('Database query performance', () => {
    beforeAll(async () => {
        // Insert realistic data volume
        await seedDatabase(10000); // 10k users, 50k posts
    });

    test('getUsersWithPosts should complete within 500ms', async () => {
        const start = Date.now();
        const users = await getUsersWithPosts();
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(500);
        expect(users.length).toBeLessThanOrEqual(100);
    });

    test('search should use index', async () => {
        // Use EXPLAIN to verify index usage
        const explain = await db.query(`
            EXPLAIN SELECT * FROM users WHERE email = ?
        `, ['test@example.com']);

        // Should show index scan, not sequential scan
        expect(explain[0].Extra).toContain('Using index');
    });
});
```

## Monitoring Query Performance

```javascript
// Log slow queries in production
const originalQuery = db.query.bind(db);

db.query = async function(sql, params) {
    const start = Date.now();

    try {
        const result = await originalQuery(sql, params);
        const duration = Date.now() - start;

        // Log slow queries
        if (duration > 100) {
            logger.warn('Slow query detected', {
                sql: sql.substring(0, 200),
                duration,
                params: params?.length
            });
        }

        return result;
    } catch (err) {
        logger.error('Query failed', {
            sql: sql.substring(0, 200),
            error: err.message
        });
        throw err;
    }
};
```

## Detection

**ResourceOptimizationAgent checks for:**
- Queries in loops (N+1 pattern)
- Missing LIMIT clauses on list queries
- SELECT * usage
- Missing indexes on frequently queried columns

**BackendAuditorAgent enforces:**
- Connection pooling configured
- Query timeouts set
- Slow query logging enabled
- Indexes exist for foreign keys

## Performance Checklist

- [ ] No N+1 queries (use JOINs or eager loading)
- [ ] Indexes on all WHERE/ORDER BY columns
- [ ] Composite indexes for common query combinations
- [ ] SELECT only needed columns (not *)
- [ ] LIMIT on all list queries
- [ ] Cursor-based pagination for large offsets
- [ ] Connection pooling enabled (max 20-50 connections)
- [ ] Query timeouts configured (2-5 seconds)
- [ ] Slow query logging enabled (> 100ms)
- [ ] Batch operations for bulk inserts/updates

## Related Standards

- `.standards-local/architecture/error-first-design.md` - Query error handling
- `.standards-local/testing/integration-tests-no-mocks.md` - Test with real database
- `.standards-local/deployment/health-checks.md` - Database health monitoring

## History

- **Created:** 2024-09-15 after performance audit
- **Last Updated:** 2025-01-15
- **Performance Improvements:** 15+ endpoints optimized, avg response time 2.5s → 200ms
- **N+1 Queries Eliminated:** 25+ across codebase

---

**Remember:** Every loop with a query inside is probably a performance bug. Optimize early, measure always.
