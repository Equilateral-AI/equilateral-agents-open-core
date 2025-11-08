# Credential Scanning Standards

## Problem

Hardcoded credentials (API keys, tokens, passwords) in code lead to security breaches. Even "development" or "default" keys committed to repositories can be exposed when environment variables aren't set properly in production.

## Cost of Violation

**Real incident example:**
- Developer used `process.env.API_KEY || "sk-dev-key"` pattern
- Environment variable wasn't set in production
- Default key was exposed and used
- **Result:**
  - 4 hours emergency API key rotation
  - $237 in unauthorized API usage
  - 8 hours security incident overhead
  - Trust impact with security team

**Industry average:** Exposed credentials cost $thousands in emergency response, potential data breaches, and compliance violations.

## Rule

**Never provide default values for secrets or credentials in code.**

If an environment variable for a secret is missing, the application must fail immediately with a clear error message. Fail fast, fail loud.

## Examples

### ❌ Wrong - Silent Fallback

```javascript
// Bad: Falls back to hardcoded default
const apiKey = process.env.API_KEY || "sk-default-dev-key";
const dbPassword = process.env.DB_PASSWORD || "password123";

// Bad: Empty string still allows code to run
const secret = process.env.SECRET_TOKEN || "";

// Bad: Template string with embedded default
const authHeader = `Bearer ${process.env.TOKEN || "dev-token"}`;
```

### ✅ Correct - Fail Fast

```javascript
// Good: Fails immediately if missing
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
}

// Good: Validation function
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} environment variable is required`);
    }
    return value;
}

const dbPassword = requireEnv('DB_PASSWORD');
const apiKey = requireEnv('API_KEY');

// Good: Fails during initialization, not at runtime
class ConfigService {
    constructor() {
        this.apiKey = requireEnv('API_KEY');
        this.dbUrl = requireEnv('DATABASE_URL');
        this.jwtSecret = requireEnv('JWT_SECRET');
    }
}
```

## Detection

**SecurityScannerAgent checks 5 locations:**

1. **String Literals**
   ```javascript
   const key = "sk-abc123def456";  // ❌ Detected
   ```

2. **Environment Defaults**
   ```javascript
   process.env.KEY || "default"    // ❌ Detected
   ```

3. **Template Strings**
   ```javascript
   `Bearer ${process.env.TOKEN || "dev"}`  // ❌ Detected
   ```

4. **Comments**
   ```javascript
   // API key: sk-abc123def456      // ❌ Detected
   ```

5. **Configuration Files**
   ```json
   { "apiKey": "sk-abc123def456" }  // ❌ Detected
   ```

**Patterns matched:**
- `sk-` (Stripe/OpenAI style keys)
- `AWS_ACCESS_KEY`, `AWS_SECRET`
- Long alphanumeric strings (32+ chars)
- Common secret keywords: password, token, secret, key, auth

## Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Run security scanner before commit
npm run workflow:security

# Or check specific files being committed
git diff --cached --name-only | xargs node scripts/scan-credentials.js
```

## CI/CD Integration

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run SecurityScannerAgent
        run: npm run workflow:security
      - name: Fail on critical findings
        run: |
          if grep -q "CRITICAL" .equilateral/workflow-history.json; then
            exit 1
          fi
```

## Environment Variable Management

**Best Practices:**

1. **Use .env for local development** (git-ignored)
   ```bash
   # .env (never commit this!)
   API_KEY=sk-local-development-key
   DB_PASSWORD=local-dev-password
   ```

2. **Use .env.example for documentation** (committed)
   ```bash
   # .env.example (safe to commit)
   API_KEY=your-api-key-here
   DB_PASSWORD=your-database-password
   ```

3. **Use secret management in production**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Environment variables in deployment platform

4. **Rotate immediately if exposed**
   - Even "dev" keys should be rotated if committed
   - Assume any committed credential is compromised
   - Update all environments using that credential

## Related Standards

- `.standards/error-first-design.md` - Fail fast principle
- `.standards-local/security/api-security.md` - API authentication patterns
- `.standards-local/deployment/environment-config.md` - Environment management

## History

- **Created:** 2024-10-15 after production incident
- **Last Updated:** 2025-01-15
- **Incidents Prevented:** 12+ (based on SecurityScannerAgent alerts)
- **Cost Savings:** Estimated $3,000+ in prevented breaches

---

**Remember:** No credential is "just for development." Anything in code can end up in production.
