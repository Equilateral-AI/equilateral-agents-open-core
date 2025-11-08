# From Pain to Pattern: The Standards Creation Process

How to transform production incidents, bugs, and mistakes into reusable standards that prevent future pain.

---

## The Formula

```
Real Incident + Cost Analysis + Root Cause → Standard

Standard = "What Happened, The Cost, The Rule"
```

Every valuable standard follows this pattern:
1. Something bad happened (or could have)
2. It cost time, money, or trust
3. There's a clear rule to prevent it

**If you can't fill in all three, it's not ready to be a standard yet.**

---

## Step 1: Capture the Incident

### When to Document

Document when:
- **Production incident** (outage, security breach, data loss)
- **Repeated mistake** (3rd occurrence of same error type)
- **Near miss** (agent caught critical issue before production)
- **Significant debugging** (took 4+ hours to find root cause)
- **Customer impact** (complaints, lost revenue, trust damage)

### What to Record

Create `.standards-local/incidents/YYYY-MM-DD-brief-description.md`:

```markdown
# Incident: Hardcoded API Key in Production

**Date**: 2025-01-15
**Severity**: CRITICAL
**Discovered By**: SecurityScannerAgent (weekly scan)
**Status**: Resolved

## What Happened

During weekly security scan, SecurityScannerAgent found hardcoded Stripe API key
in `backend/src/services/payment.js`:

\`\`\`javascript
// Line 15
const stripeKey = process.env.STRIPE_KEY || "sk_live_abc123...";
\`\`\`

The fallback value was a live production API key. If `STRIPE_KEY` environment
variable wasn't set (which happened in one staging environment), the hardcoded
key would be used.

## Timeline

- **Jan 15, 09:00**: Weekly security scan runs
- **Jan 15, 09:05**: SecurityScannerAgent alerts on hardcoded credential
- **Jan 15, 09:30**: Verified key is live production key
- **Jan 15, 10:00**: Rotated Stripe API key
- **Jan 15, 11:00**: Updated all environments with new key
- **Jan 15, 12:00**: Added pre-commit hook to prevent recurrence

## Impact

- No confirmed unauthorized usage (lucky!)
- 3 hours emergency response time
- Key rotation required across 5 environments
- Could have resulted in fraudulent charges if exploited

## Root Cause

Developer used fallback pattern for local development:
\`\`\`javascript
const key = process.env.KEY || "dev-key-here";
\`\`\`

Accidentally used production key instead of development key in fallback.
Code review didn't catch it because it "looked like normal env var usage."

## Fix Applied

1. Removed fallback value
2. Made env var required (fail fast if missing)
3. Added SecurityScannerAgent to pre-commit hook
4. Created standard: "No Default Values for Secrets"

## Lessons Learned

- Fallback values for secrets are NEVER safe
- Even "dev" keys shouldn't be in code
- Agent caught this - need agents in CI/CD
- Code review isn't enough for security issues
```

---

## Step 2: Calculate the Cost

### Quantify Impact

Be specific about costs:

#### Time Cost
```markdown
## Time Cost

- **Immediate response**: 3 hours (emergency key rotation)
- **Environment updates**: 2 hours (updating 5 environments)
- **Documentation**: 1 hour (incident report, standard creation)
- **Total**: 6 hours engineering time

**Cost**: 6 hours × $100/hour = $600
```

#### Financial Cost
```markdown
## Financial Cost

- Engineering time: $600
- Potential unauthorized API usage: $0 (caught before exploitation)
- Risk avoided: $1,000+ (potential fraud if exploited)
```

#### Trust Cost
```markdown
## Trust Cost

- Customer impact: None (caught internally)
- Team confidence: Shaken (how many more are there?)
- Security audit requirement: Added to next review
```

### Compare to Prevention Cost

```markdown
## Prevention vs Response

**Response cost**: 6 hours engineering time = $600

**Prevention cost**:
- Add SecurityScannerAgent to CI/CD: 30 minutes setup
- Create standard: 30 minutes
- Train team: 15 minutes
- Total: ~1 hour = $100

**ROI**: $600 saved / $100 invested = 6x return on first incident
Plus: Prevents all future occurrences
```

---

## Step 3: Extract the Pattern

### Identify the Anti-Pattern

What was the problematic code pattern?

```markdown
## Anti-Pattern Identified

**Pattern**: Fallback values for sensitive configuration

\`\`\`javascript
// Anti-pattern
const apiKey = process.env.API_KEY || "default-key";
const dbPassword = process.env.DB_PASSWORD || "password123";
const jwtSecret = process.env.JWT_SECRET || "secret";
\`\`\`

**Why it's wrong**:
- Hides missing configuration (should fail fast)
- Hardcodes sensitive values in codebase
- Easy to accidentally use production values
- Code review doesn't flag it (looks normal)
```

### Define the Correct Pattern

What should have been done?

```markdown
## Correct Pattern

**Pattern**: Required configuration with fail-fast behavior

\`\`\`javascript
// Correct pattern
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(\`\${name} environment variable is required\`);
    }
    return value;
}

const apiKey = requireEnv('API_KEY');
const dbPassword = requireEnv('DB_PASSWORD');
const jwtSecret = requireEnv('JWT_SECRET');
\`\`\`

**Why it's right**:
- Fails immediately if configuration missing (fail fast)
- No hardcoded values in code
- Clear error message (debugging friendly)
- Forces explicit configuration
```

### Generalize the Rule

Turn specific incident into general principle:

```markdown
## General Rule

**Never provide default values for sensitive configuration.**

Applies to:
- API keys and tokens
- Database credentials
- Encryption keys
- Authentication secrets
- Service URLs (could point to wrong environment)

**Exception**: Non-sensitive configuration with safe defaults
\`\`\`javascript
// OK: Non-sensitive with safe default
const port = parseInt(process.env.PORT || '3000');
const logLevel = process.env.LOG_LEVEL || 'info';
\`\`\`
```

---

## Step 4: Create the Standard

### Use the Template

Copy `.standards-local-template/standard-template.md`:

```markdown
# No Default Values for Secrets

## Problem

Providing fallback values for sensitive environment variables (API keys,
passwords, tokens) hides missing configuration and creates security risks.
Developers may accidentally hardcode production credentials as "dev defaults."

## Cost of Violation

**Real incident (2025-01-15)**:
- Hardcoded production Stripe API key as fallback value
- Discovered by SecurityScannerAgent during weekly scan
- 6 hours emergency response (key rotation, environment updates)
- $600 engineering cost
- Risk of fraud if exploited before discovery

**Pattern**: Every fallback-with-secret is a potential security breach.

## Rule

**Never provide default values for sensitive environment variables.**

If environment variable is missing:
- Application MUST fail to start
- Error message MUST clearly state which variable is missing
- No hardcoded values as fallbacks

## Examples

### ❌ Wrong

\`\`\`javascript
// Bad: Silent fallback with hardcoded secret
const apiKey = process.env.API_KEY || "sk-live-abc123";

// Bad: Empty string still allows code to run
const dbPassword = process.env.DB_PASSWORD || "";

// Bad: Even "dev" keys shouldn't be hardcoded
const jwtSecret = process.env.JWT_SECRET || "dev-secret-123";
\`\`\`

### ✅ Correct

\`\`\`javascript
// Good: Fail fast with clear error
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(\`\${name} environment variable is required\`);
    }
    return value;
}

const apiKey = requireEnv('API_KEY');
const dbPassword = requireEnv('DB_PASSWORD');
const jwtSecret = requireEnv('JWT_SECRET');

// Good: Fail during app initialization
class Config {
    constructor() {
        this.apiKey = requireEnv('API_KEY');
        this.dbUrl = requireEnv('DATABASE_URL');
        this.jwtSecret = requireEnv('JWT_SECRET');
    }
}

// App won't start if any secret is missing
const config = new Config();
\`\`\`

### Acceptable Exception

\`\`\`javascript
// OK: Non-sensitive configuration with safe defaults
const port = parseInt(process.env.PORT || '3000');
const logLevel = process.env.LOG_LEVEL || 'info';
const maxConnections = parseInt(process.env.MAX_CONNECTIONS || '100');
\`\`\`

## Detection

**SecurityScannerAgent automatically checks for:**
1. Environment variable access with `||` operator
2. Variables named: key, secret, password, token, auth
3. Default values that look like credentials (long alphanumeric strings)

**Pre-commit hook**:
\`\`\`bash
npm run workflow:security
\`\`\`

**CI/CD check**:
Fails build if critical security violations found.

## Related Standards

- `.standards-local/security/credential-scanning.md` - Comprehensive credential detection
- `.standards-local/architecture/error-first-design.md` - Fail fast principle

## History

- **Created**: 2025-01-15 (after production API key incident)
- **Last Updated**: 2025-01-15
- **Incidents Prevented**: 8 (SecurityScannerAgent caught before merge)
```

---

## Step 5: Enforce the Standard

### Add to CLAUDE.md

Update `.claude/CLAUDE.md`:

```markdown
## Critical Alerts

### [CRITICAL] No Default Values for Secrets

**What Happened**: Hardcoded production Stripe API key as fallback value.
Discovered by weekly security scan. 6 hours emergency response.

**The Cost**: $600 engineering time. Risk of fraud if exploited.

**The Rule**: Never use `|| "default"` pattern for sensitive env vars.
Fail fast if missing.

**See**: `.standards-local/security/no-default-values-for-secrets.md`

## Trigger Words

When you see these terms, check standards:

### Security Triggers
- "process.env" + "||" → Check for default values on secrets
- [... other triggers ...]
```

### Update Agent Config (Optional)

```javascript
// equilateral-core/config/standards.js
module.exports = {
    localStandards: [
        {
            id: 'no-default-secrets',
            path: '.standards-local/security/no-default-values-for-secrets.md',
            severity: 'CRITICAL',
            autoCheck: true, // Agents automatically reference this
            pattern: /process\.env\.\w+\s*\|\|\s*["']/g
        }
    ]
};
```

### Add Pre-Commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run workflow:security

# Fail commit if critical violations found
if grep -q "CRITICAL" .equilateral/workflow-history.json; then
    echo "❌ Critical security violations found!"
    echo "Review .equilateral/workflow-history.json"
    exit 1
fi
```

---

## Step 6: Measure Impact

### Track Prevented Incidents

Add to standard:

```markdown
## Impact Tracking

### Incidents Prevented (Since Creation)

**Week 1** (Jan 15-22):
- PR #234: Caught `process.env.DB_PASSWORD || "password"` pattern
- PR #237: Caught hardcoded AWS secret key in fallback
- Total: 2 prevented incidents

**Week 2-4**:
- PR #241, #245, #249, #253: Additional 4 catches
- Total: 6 prevented incidents in first month

**Month 2-3**:
- PR #267, #278: 2 more catches
- Pattern recognition improving - developers self-correcting

**Total**: 8 incidents prevented
**Estimated cost avoided**: 8 × $600 = $4,800
**Time invested in standard**: 1 hour = $100
**ROI**: 48x return
```

### Update Metrics

In `.standards-local/METRICS.md`:

```markdown
## Most Valuable Standards

1. **No Default Values for Secrets**
   - Created: 2025-01-15
   - Incidents prevented: 8
   - Cost avoided: $4,800
   - ROI: 48x
   - Status: Mature (graduating to community contribution)
```

---

## Real Examples to Learn From

### Example 1: Performance Pattern

```markdown
# Incident: N+1 Query Causing Timeouts

**What Happened**:
API endpoint `/api/users-with-posts` loading users in loop.
For each user, separate query to load their posts.
100 users = 101 database queries.
Response time: 2.5 seconds → timeouts.

**The Cost**:
- 200+ customer complaints about "slow app"
- 4 hours debugging (thought it was database issue)
- 2 hours fixing once identified
- Total: 6 hours = $600

**The Pattern**:
N+1 query problem - query in a loop.

**The Rule**:
Never query database inside a loop. Use JOINs or eager loading.

**Prevention**:
BackendAuditorAgent now checks for:
- `for/while` loops containing `await db.query`
- `map/forEach` with database calls
- ORM queries not using `include/eager`
```

### Example 2: Security Pattern

```markdown
# Incident: Missing Authorization Check

**What Happened**:
Admin endpoint checked authentication (valid JWT) but not authorization.
Any logged-in user could access admin functions by guessing the URL.

**The Cost**:
- Privacy breach (user saw other users' data)
- GDPR notification requirement
- 8 hours incident response
- Legal consultation: $5,000
- Total: $5,000+

**The Pattern**:
Authentication without authorization.

**The Rule**:
Every endpoint must check BOTH:
1. Authentication (who are you?)
2. Authorization (what can you do?)

**Prevention**:
SecurityReviewerAgent checks for:
- Endpoints with `requireAuth` but no role check
- Direct resource access without ownership verification
- Missing `WHERE user_id = ?` in queries
```

### Example 3: Architecture Pattern

```markdown
# Incident: Silent Failure in Production

**What Happened**:
Database connection failed, but error was caught and ignored.
Application continued running, returning stale cached data.
Users saw outdated information for 2 hours before anyone noticed.

**The Cost**:
- 2 hours of incorrect data shown to users
- 50+ support tickets
- 6 hours investigating "cache bug" (wasn't cache)
- Customer trust impact

**The Pattern**:
Swallowing errors without logging or failing fast.

**The Rule**:
Never silently catch errors. Either:
1. Log and re-throw
2. Handle gracefully with user notification
3. Fail fast (don't continue with broken state)

**Prevention**:
CodeReviewAgent checks for:
- Empty catch blocks
- `catch (err) { /* do nothing */ }`
- Catch without logging
- Return default values after errors
```

---

## Templates for Quick Capture

### Incident Template

```markdown
# Incident: [Brief Description]

**Date**: YYYY-MM-DD
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Discovered By**: [Person/Agent/Customer]
**Status**: Investigating | Resolved | Monitoring

## What Happened
[Detailed description of incident]

## Timeline
- HH:MM: [Event]
- HH:MM: [Event]

## Impact
[Time cost, financial cost, customer impact]

## Root Cause
[Why did this happen?]

## Fix Applied
[What was done to resolve?]

## Prevention
[What standard was created? What detection added?]
```

### Pattern Template

```markdown
# [Pattern Name]

## Anti-Pattern
\`\`\`
// Bad example
\`\`\`

## Correct Pattern
\`\`\`
// Good example
\`\`\`

## Detection
[How to find violations]

## Cost
[What happens if violated]
```

---

## The Virtuous Cycle

```
Incident Occurs
      ↓
Document Pain ("What Happened, The Cost")
      ↓
Extract Pattern (Root Cause)
      ↓
Define Rule (Prevention)
      ↓
Create Standard (.standards-local/)
      ↓
Enforce (CLAUDE.md, agents, CI/CD)
      ↓
Measure Impact (prevented incidents)
      ↓
Refine Standard (better examples, clearer rules)
      ↓
Share with Community (help others)
      ↓
[Loop back - fewer incidents occur]
```

**The goal**: Make mistakes only once. Every standard is a mistake you'll never make again.

---

## When a Standard is "Done"

A standard is mature when:

1. **No new incidents** of this pattern in 3+ months
2. **Agents catch it** automatically (no manual review needed)
3. **Team internalizes** it (no longer need to reference doc)
4. **Ready to share** (sanitized, generalized, valuable to others)

Then:
- Graduate to `.standards-community/` contribution
- Archive incident docs (keep standard)
- Celebrate the win (one less thing to worry about!)

---

## TL;DR

**Pain → Pattern Process:**

1. **Capture** incident with "What Happened, The Cost, The Rule"
2. **Calculate** real cost (time, money, trust)
3. **Extract** anti-pattern and correct pattern
4. **Create** standard using template
5. **Enforce** via CLAUDE.md, agents, CI/CD
6. **Measure** prevented incidents and ROI

**Formula**: Real Incident + Cost + Rule = Standard

**Goal**: Make every mistake only once.

Your 100th standard represents 100 mistakes you'll never make again.
