# Building Your Standards Library

A practical guide to creating your own `.standards-local/` library through real experience.

---

## The Core Insight

**You can't write standards before you feel the pain.**

Standards aren't created by:
- Reading best practices online
- Copying from other projects
- Following generic advice
- Guessing what might go wrong

Standards ARE created by:
- Experiencing real production incidents
- Repeating the same mistake 3+ times
- Discovering patterns that consistently work (85%+ success rate)
- Documenting what actually hurt

**This is why open-core includes methodology but not 138+ commercial standards.** Those standards represent years of real pain across multiple enterprises. You need to earn your own standards through experience.

---

## Getting Started (Week 1)

### 1. Set Up the Structure

```bash
# Create directory structure
mkdir -p .standards-local/{security,architecture,performance,testing,deployment}

# Copy templates as starting point
cp -r .standards-local-template/* .standards-local/

# Initialize git (optional - for tracking your standards evolution)
cd .standards-local && git init
```

### 2. Add to .gitignore (or Don't)

**Option A: Keep Private (Recommended Initially)**
```bash
# Add to .gitignore
echo ".standards-local/" >> .gitignore
```

**Option B: Commit to Repo (Team Standards)**
- Commit `.standards-local/` to your project repo
- Share standards across team
- Version control your learnings

**Option C: Separate Repo (Company-Wide)**
```bash
# Create separate private repo for standards
git remote add origin git@github.com:yourcompany/engineering-standards.git
```

### 3. Run Your First Workflows

```bash
# Install EquilateralAgents
npm install equilateral-agents-open-core

# Run workflows on your actual codebase
npm run workflow:security
npm run workflow:quality

# Check what agents found
cat .equilateral/workflow-history.json
```

The agents will find issues. **Write them down.**

---

## Week 2-4: First Standards

### Start With Security

Security mistakes hurt the most, so start there:

1. **Run SecurityScannerAgent on your codebase**
   ```bash
   npm run workflow:security
   ```

2. **Document what it found**
   - Hardcoded credentials?
   - Missing input validation?
   - Weak authentication?

3. **Create your first standard**

Example: If SecurityScannerAgent found hardcoded API keys in 3+ places:

```bash
# Create standard
touch .standards-local/security/no-hardcoded-credentials.md
```

Use the "What Happened, The Cost, The Rule" format:

```markdown
# No Hardcoded Credentials

## What Happened
Found API keys hardcoded in 5 different files during security scan.
Three were "development" keys that worked in production.

## The Cost
- 2 hours hunting down all hardcoded keys
- 1 hour rotating exposed keys
- Risk of key exposure in git history

## The Rule
Never hardcode credentials. Use environment variables.
If env var is missing, fail fast with clear error.

## Examples
[Include actual code from your project that violated this]

## Detection
SecurityScannerAgent checks for this pattern.
Pre-commit hook runs security scan.
```

### Move to Architecture

Next common pain point: error handling

1. **Review recent production incidents**
   - Which errors weren't caught?
   - Which failures cascaded?
   - Where did you assume "happy path"?

2. **Document the pattern**

```bash
touch .standards-local/architecture/error-first-design.md
```

Use real examples from YOUR codebase.

### Then Performance

1. **Profile your slowest endpoints**
   ```bash
   # Add performance logging
   npm install --save-dev clinic
   clinic doctor -- node server.js
   ```

2. **Find N+1 queries** (there are always N+1 queries)

3. **Document the fix**

```bash
touch .standards-local/performance/no-n-plus-one-queries.md
```

Include:
- Before: Slow query pattern
- After: Optimized version
- Benchmark: 2.5s → 200ms

---

## Month 2: Knowledge Harvest

By now you have:
- Run workflows 20+ times
- Fixed 10+ real issues
- Created 3-5 standards

### Weekly Harvest Process

Every Friday (or Monday):

1. **Review Agent Memory**
   ```bash
   npm run memory:stats
   ```

2. **Look for Patterns**
   - What failed 3+ times this week?
   - What solutions worked consistently?
   - What mistakes were repeated?

3. **Check Workflow History**
   ```bash
   cat .equilateral/workflow-history.json | grep -A 5 "error"
   ```

4. **Document Learnings**

Ask yourself:
- Did I make the same mistake twice?
- Did an agent catch the same issue in multiple files?
- Did a fix work every time we applied it?

If yes → create/update a standard.

### The "3 Times Rule"

Don't create a standard until:
- Error occurred 3+ times, OR
- Solution used successfully 3+ times (85%+ success), OR
- Cost was significant enough (production outage, security issue)

One-off issues don't need standards. Patterns do.

---

## Month 3: Enforcement

Now you have 10+ standards. Time to enforce them.

### Update CLAUDE.md

Add your standards to `.claude/CLAUDE.md`:

```markdown
## Team Standards

Before making changes:

1. Check `.standards-local/security/` for security patterns
2. Check `.standards-local/architecture/` for design patterns
3. Check `.standards-local/performance/` for optimization rules

## Critical Alerts

### [CRITICAL] No Hardcoded Credentials
See: `.standards-local/security/no-hardcoded-credentials.md`

### [HIGH] Error-First Design
See: `.standards-local/architecture/error-first-design.md`
```

### Pre-Commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Create pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run workflow:security"
```

Now agents check every commit.

### CI/CD Integration

```yaml
# .github/workflows/standards.yml
name: Standards Check
on: [pull_request]

jobs:
  standards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm install

      - name: Run security workflow
        run: npm run workflow:security

      - name: Run quality workflow
        run: npm run workflow:quality

      - name: Check for critical violations
        run: |
          if grep -q "CRITICAL" .equilateral/workflow-history.json; then
            echo "Critical standards violations found!"
            exit 1
          fi
```

---

## Month 4-6: Maturity

### Metrics to Track

Create `.standards-local/METRICS.md`:

```markdown
# Standards Effectiveness

## Standards Created
- Security: 5
- Architecture: 4
- Performance: 3
- Testing: 2
- Deployment: 1

Total: 15 standards

## Impact (Last 30 Days)

### Errors Prevented
- Hardcoded credentials: 12 times (SecurityScannerAgent alerts)
- N+1 queries: 8 times (BackendAuditorAgent caught in code review)
- Missing error handling: 15 times (CodeReviewAgent flagged)

### Time Saved
- Average debug time for prevented errors: ~4 hours each
- Total estimated time saved: 140 hours
- Cost avoidance: ~$14,000 (at $100/hour)

### Production Incidents
- Before standards: 8 incidents in 3 months
- After standards: 1 incident in 3 months
- Reduction: 87.5%

## Most Valuable Standards

1. **Error-First Design** - Prevented 15 issues
2. **No Hardcoded Credentials** - Prevented 12 exposures
3. **N+1 Query Detection** - Saved 32 hours of performance debugging
```

### Graduation to Community

After 3+ months of successful use:

1. **Sanitize** (remove company-specific details)
2. **Generalize** (make framework-agnostic)
3. **Contribute** to [Community Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards)

Help others avoid the mistakes you made.

---

## Common Mistakes

### ❌ Don't: Copy Standards Blindly

```markdown
# Bad: Generic advice copied from internet
## Always Use TypeScript
TypeScript prevents bugs.
```

Why this fails:
- Not based on YOUR experience
- No "What Happened, The Cost, The Rule"
- No real examples from YOUR code
- Won't resonate with team

### ✅ Do: Document Real Pain

```markdown
# Good: Based on actual incident
## Strongly Type API Responses

## What Happened
Backend changed user.email from string to object { address, verified }.
Frontend assumed string and crashed with "Cannot read property of undefined".
Took 3 hours to find because error was vague.

## The Cost
- 3 hours debugging
- Affected 100+ users before we caught it
- Could have been prevented with TypeScript interfaces

## The Rule
Define TypeScript interfaces for all API request/response types.
Share types between frontend and backend.

[Include actual code from incident]
```

### ❌ Don't: Create Standards Too Early

Don't document after first occurrence. Wait for:
- 3+ occurrences, OR
- Significant cost (outage, security breach), OR
- 85%+ success rate with solution

### ✅ Do: Let Patterns Emerge

Track issues in `.standards-local/LEARNINGS.md` first:

```markdown
# Learnings (Not Standards Yet)

## 2025-01-15: Missing Auth Check on Admin Endpoint
Fixed in PR #234. Watch for recurrence.

## 2025-01-20: Same Issue on Different Endpoint
Fixed in PR #235. Pattern emerging?

## 2025-01-25: Third Occurrence
Fixed in PR #240. TIME FOR A STANDARD.

[Created `.standards-local/security/auth-on-all-endpoints.md`]
```

---

## Measuring Success

Your standards library is working when:

### ✅ AI Assistants Reference Them

When using Claude Code / Cursor / Continue:
- AI reads `.standards-local/` before making changes
- AI cites specific standards in explanations
- AI prevents violations automatically

### ✅ Code Reviews Get Shorter

"This violates our error-first design standard. See `.standards-local/architecture/error-first-design.md`"

One line → entire architectural pattern referenced.

### ✅ Mistakes Stop Repeating

Track errors over time:
- Month 1: N+1 query bug
- Month 2: N+1 query bug (created standard)
- Month 3: N+1 caught by agent before merge
- Month 4+: No more N+1 queries

### ✅ Onboarding Gets Faster

New developers:
- Read `.standards-local/` on day 1
- See "What Happened, The Cost, The Rule" with real examples
- Understand WHY standards exist
- Avoid repeating team's past mistakes

### ✅ Agent Success Rates Improve

```bash
npm run memory:stats
```

Shows:
- Code quality score: 65 → 85
- Security scan pass rate: 70% → 95%
- Test coverage: 60% → 85%

Standards → better code → agents find fewer issues.

---

## Advanced: Automated Knowledge Harvest

Once you have 20+ standards, consider automating:

### Librarian Agent (DIY)

```javascript
// scripts/harvest-knowledge.js
const fs = require('fs');
const path = require('path');

async function harvestKnowledge() {
    // 1. Read agent memory files
    const memoryDir = '.equilateral/agent-memory';
    const memories = fs.readdirSync(memoryDir);

    // 2. Identify patterns
    const patterns = {
        repeatedErrors: new Map(),
        consistentSuccesses: new Map()
    };

    for (const file of memories) {
        const data = JSON.parse(fs.readFileSync(path.join(memoryDir, file)));

        for (const execution of data.history) {
            if (execution.status === 'error') {
                const key = execution.error.type;
                patterns.repeatedErrors.set(
                    key,
                    (patterns.repeatedErrors.get(key) || 0) + 1
                );
            }

            if (execution.status === 'success' && execution.optimizationApplied) {
                const key = execution.optimizationApplied;
                patterns.consistentSuccesses.set(
                    key,
                    (patterns.consistentSuccesses.get(key) || 0) + 1
                );
            }
        }
    }

    // 3. Generate report
    console.log('\\n=== Knowledge Harvest Report ===\\n');

    console.log('Errors occurring 3+ times (consider creating standard):');
    for (const [error, count] of patterns.repeatedErrors) {
        if (count >= 3) {
            console.log(`  - ${error}: ${count} occurrences`);
        }
    }

    console.log('\\nSuccessful patterns (85%+ success rate):');
    // ... analyze success rates
}

harvestKnowledge();
```

### Run Weekly

```json
// package.json
{
  "scripts": {
    "harvest": "node scripts/harvest-knowledge.js"
  }
}
```

```bash
# Every Friday
npm run harvest
```

Review output → create/update standards.

---

## The Compounding Effect

### Year 1
- Month 1-3: 5-10 standards, catching basics
- Month 4-6: 10-20 standards, patterns clear
- Month 7-9: 20-30 standards, fewer new standards (repeats caught)
- Month 10-12: 30-40 standards, mature library

### Year 2
- New standards slower (most patterns documented)
- Standards get refined (better examples, clearer rules)
- Contribution to community begins
- ROI visible: incidents down 80%, velocity up 40%

### Year 3+
- 50-100 standards covering most common mistakes
- Rarely create new standards (patterns stabilized)
- Focus on enforcement and tooling
- Consider commercial upgrade for specialized needs (GDPR, multi-cloud, etc.)

---

## When to Upgrade to Commercial

Open-core is sufficient for most teams. Consider commercial when:

### You Need 138+ Pre-Built Standards

Skip 2 years of learning:
- **Security standards** from actual breaches
- **Performance patterns** from scaling incidents
- **Compliance rules** from audit failures
- **Architecture patterns** from refactoring pain

### You Need Specialized Compliance

Commercial includes:
- GDPR compliance suite (8 agents)
- HIPAA validation
- SOC2 requirements
- Industry-specific standards

### You Need Advanced Automation

Commercial features:
- **Librarian agent** (automated knowledge harvest)
- **Pattern recognition ML** (cross-project learning)
- **Predictive analytics** (what will break before it does)

### You Want 40+ More Agents

Commercial has 62 total agents vs 22 open-core:
- Advanced security (STRIDE threat modeling)
- Multi-account AWS deployment
- Cost intelligence with ML predictions
- Custom agent training

---

## Resources

- **Templates**: `.standards-local-template/` (copy to start)
- **Examples**: See template standards for format
- **Community**: [Submit standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards)
- **Commercial**: info@happyhippo.ai

---

## TL;DR

1. **Week 1**: Set up structure, run workflows
2. **Week 2-4**: Create first 3-5 standards from real pain
3. **Month 2**: Weekly knowledge harvest, "3 times rule"
4. **Month 3**: Enforce standards (CLAUDE.md, pre-commit hooks, CI/CD)
5. **Month 4-6**: Track metrics, measure impact
6. **Year 1+**: Build to 30-50 standards, contribute to community

**Remember:** You can't write standards before you feel the pain. Start with your real codebase, document what actually hurts, let patterns emerge naturally.

Your 100th standard prevents the mistake you made 99 times before.
