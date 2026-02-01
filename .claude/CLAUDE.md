# CLAUDE.md - EquilateralAgents Open Core

This file provides guidance to AI assistants (Claude, Cursor, Continue, Windsurf, etc.) when working with code in projects using EquilateralAgents.

## Core Philosophy

**Standards First:** Before making ANY code change, check the standards hierarchy:
1. `.standards/` - Official universal principles (required)
2. `.standards-community/` - Battle-tested community patterns (optional)
3. `.standards-local/` - Your team's conventions (recommended)

**Why this matters:** Every mistake you avoid by checking standards saves hours of debugging and rework. The standards exist because someone else already paid the cost of learning.

---

## Available Agents (22)

### Infrastructure Core (3)
- **AgentClassifier** - Task routing and complexity analysis
- **AgentMemoryManager** - Context and state management
- **AgentFactoryAgent** - Self-bootstrapping agent generation

### Development (6)
- **CodeAnalyzerAgent** - Static analysis and metrics
- **CodeGeneratorAgent** - Pattern-based code generation
- **TestOrchestrationAgent** - Multi-framework test execution
- **DeploymentValidationAgent** - Pre-deployment validation
- **TestAgent** - UI testing with intelligent element remapping
- **UIUXSpecialistAgent** - Design consistency and accessibility

### Quality Assurance (5)
- **AuditorAgent** - Standards compliance validation
- **CodeReviewAgent** - Best practice enforcement
- **BackendAuditorAgent** - Backend-specific standards (17+ supported patterns)
- **FrontendAuditorAgent** - Frontend-specific standards
- **TemplateValidationAgent** - IaC template validation

### Security (4)
- **SecurityScannerAgent** - Vulnerability scanning
- **SecurityReviewerAgent** - Security posture assessment
- **SecurityVulnerabilityAgent** - Common security issue detection
- **ComplianceCheckAgent** - Basic compliance validation

### Infrastructure (4)
- **DeploymentAgent** - Deployment automation
- **ResourceOptimizationAgent** - Cloud resource analysis
- **ConfigurationManagementAgent** - IaC configuration patterns
- **MonitoringOrchestrationAgent** - Observability best practices

---

## Mandatory Workflow

### Before Every Code Change:

```markdown
1. CHECK STANDARDS FIRST
   - Read `.standards/` for universal principles
   - Check `.standards-community/` for proven patterns
   - Review `.standards-local/` for team conventions

2. DESIGN ERRORS FIRST
   - What can go wrong?
   - How will it fail?
   - What's the error message?
   - How will we recover?

3. IMPLEMENT WITH CONTEXT
   - Reference relevant standards
   - Document why this approach
   - Note alternatives considered
   - Add error handling first

4. VALIDATE BEFORE COMMIT
   - Run relevant agents (security, quality, tests)
   - Check agent memory for similar past failures
   - Review workflow history
```

---

## Critical Alerts System

When agents detect serious issues, they use this format:

### Template
```markdown
## [SEVERITY] Issue Title

**What Happened:**
[Clear description of the problem/mistake/pattern]

**The Cost:**
[Quantified impact: time wasted, bugs introduced, money spent, security risk]

**The Rule:**
[Specific standard to prevent this in future]

**Examples:**
[Code examples showing wrong vs right approach]
```

### Severity Levels
- **CRITICAL** - Security vulnerability, data loss risk, production outage potential
- **HIGH** - Significant cost impact, major technical debt, compliance violation
- **MEDIUM** - Performance issues, maintainability problems, anti-patterns
- **LOW** - Style inconsistencies, minor optimizations, documentation gaps
- **INFO** - Suggestions, best practices, learning opportunities

---

## Example Critical Alert

### [CRITICAL] Hardcoded API Key in Environment Default

**What Happened:**
Developer used `process.env.API_KEY || "default-dev-key"` pattern. The default key was committed to the repository and exposed in production when environment variable wasn't set.

**The Cost:**
- API key rotation: 4 hours emergency work
- Unauthorized API usage: $237 in charges
- Security incident report: 8 hours overhead
- Team trust impact: Priceless

**The Rule:**
Never provide default values for secrets in code. If environment variable is missing, fail loudly:

```javascript
// ❌ WRONG - Silent fallback exposes secrets
const apiKey = process.env.API_KEY || "sk-default-key";

// ✅ CORRECT - Fail fast and loud
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
}
```

**Prevention:**
SecurityScannerAgent now checks 5 locations:
1. String literals (`const key = "abc123"`)
2. Environment defaults (`process.env.KEY || "default"`)
3. Template strings with embedded secrets
4. Comments containing credentials
5. Configuration files with key-like values

**See:** `.standards-local/security/credential-scanning.yaml` (create this!)

---

## Banned Patterns

These patterns are prohibited because they've caused production issues:

### Example Entry
```markdown
### ❌ Mocks in Production Code

**Why Banned:**
Mocks hide real integration failures until production. Cost: 3 production outages.

**Instead:**
Use real dependencies with proper error handling. Test against actual services.

**Exception:**
External APIs in tests only (never production code).

**See:** `.standards/yaml/no-mocks.yaml`
```

### Your Banned Patterns
Add entries to `.standards-local/banned-patterns.yaml` as you discover them through agent executions and workflow history.

---

## Trigger Words (Extra Caution)

When you see these terms, pause and check standards thoroughly:

### Security Triggers
- "auth", "password", "token", "secret", "key"
- "encrypt", "decrypt", "hash", "sign"
- "admin", "sudo", "root", "privilege"

**Action:** Run SecurityScannerAgent before committing

### Performance Triggers
- "cache", "optimize", "performance", "slow"
- "query", "database", "index"
- "loop", "recursive", "iterate"

**Action:** Check `.standards/performance/` for proven patterns

### Infrastructure Triggers
- "deploy", "production", "release"
- "migration", "rollback", "downtime"
- "cost", "budget", "billing"

**Action:** Run DeploymentValidationAgent and check cost impact

### Compliance Triggers
- "PII", "personal data", "user data"
- "GDPR", "CCPA", "privacy"
- "log", "audit", "track"

**Action:** Run ComplianceCheckAgent

---

## Agent Orchestration Commands

### Recommended Workflow
```bash
# 1. Check standards first (always)
# Read .standards/, .standards-community/, .standards-local/

# 2. Run relevant agents based on change type
npm run workflow:security       # For any security-related changes
npm run workflow:quality        # For code changes
npm run workflow:deploy         # Before deployments
npm run workflow:infrastructure # For IaC changes

# 3. Review agent memory for lessons learned
npm run memory:stats            # See what agents have learned

# 4. Check workflow history for patterns
# Review .equilateral/workflow-history.json

# 5. Document new learnings
# Add to .standards-local/ if pattern is significant
```

### Background Execution Pattern
```javascript
// Start multiple workflows in parallel, continue working
const orchestrator = new AgentOrchestrator({ enableBackground: true });
await orchestrator.start();

// Dispatch teams in background
const securityTask = orchestrator.executeWorkflowBackground('security-review', {
    projectPath: process.cwd()
});

const qualityTask = orchestrator.executeWorkflowBackground('code-quality', {
    projectPath: process.cwd()
});

// Do other work while agents run
await doNextTasksOnTodoList();

// Check results when ready
const securityResults = await securityTask.getResult();
const qualityResults = await qualityTask.getResult();
```

---

## Knowledge Harvest Process

Agents learn from execution history. You should too.

### Daily/Weekly Review (Recommended)

1. **Check Agent Memory**
   ```bash
   npm run memory:stats
   # Review .equilateral/agent-memory/*.json
   ```

2. **Identify Patterns**
   - What errors occurred 3+ times?
   - What solutions worked consistently (85%+ success)?
   - What patterns led to success or failure?

3. **Document Learnings**
   Use "What Happened, The Cost, The Rule" format:
   ```markdown
   ## [Issue/Pattern Name]

   **What Happened:** [Description]
   **The Cost:** [Time/money/trust impact]
   **The Rule:** [Standard to prevent/replicate]
   **Examples:** [Code samples]
   ```

4. **Create Standards**
   Add to `.standards-local/[category]/[name].md`:
   ```
   .standards-local/
   ├── security/
   │   └── credential-scanning.yaml
   ├── architecture/
   │   └── error-handling-patterns.md
   ├── performance/
   │   └── database-query-optimization.yaml
   └── testing/
       └── integration-test-patterns.md
   ```

5. **Update This File**
   Add critical patterns to relevant sections above:
   - Banned patterns
   - Trigger words
   - Critical alerts

### Knowledge Synthesis Flywheel

```
Execute Workflows
       ↓
   Agent Memory
   (tracks patterns)
       ↓
   Review & Identify
   (what worked/failed)
       ↓
   Document Learnings
   (.standards-local/)
       ↓
   Reference in CLAUDE.md
   (update this file)
       ↓
   Faster Execution
   (AI checks standards first)
       ↓
   Better Results
       ↓
   [Loop back to Execute]
```

**The Value:** Your 100th standard prevents the mistake you made 99 times before. Every documented pattern saves hours of future debugging.

---

## Community Contribution

Found a pattern that works? Share it!

### Graduation Path

1. **Local → Community**
   - Battle-test in `.standards-local/` first
   - Sanitize to remove company-specific details
   - Submit PR to [EquilateralAgents Community Standards](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards)

2. **Community → Universal**
   - Most valuable community patterns graduate
   - Become part of core `.standards/`
   - Maintained by framework team
   - Help developers worldwide

### What Makes a Good Community Standard?

- **Specific problem solved:** Not vague advice
- **Quantified cost:** Real impact from real incident
- **Clear rule:** Actionable, testable, enforceable
- **Code examples:** Wrong vs right approach
- **Framework agnostic:** Works across technologies

---

## Example Standards Structure

Create `.standards-local/` with this structure:

```
.standards-local/
├── README.md                    # Your team's standards overview
├── security/
│   ├── credential-scanning.yaml
│   ├── auth-patterns.yaml
│   └── api-security.yaml
├── architecture/
│   ├── error-handling.yaml
│   ├── service-boundaries.yaml
│   └── database-patterns.yaml
├── performance/
│   ├── query-optimization.yaml
│   ├── caching-strategy.yaml
│   └── bundle-size.yaml
├── testing/
│   ├── integration-tests.yaml
│   ├── test-coverage.yaml
│   └── test-data-management.yaml
└── deployment/
    ├── rollback-procedures.yaml
    ├── health-checks.yaml
    └── deployment-checklist.yaml
```

### Standard Template

Use this template for new standards (YAML format):

```yaml
id: standard-name
category: security  # or architecture, performance, testing, deployment
priority: 10  # 10=critical, 20=high, 30=medium
updated: 2026-02-01
rules:
  - action: ALWAYS
    rule: "Clear, actionable rule"
  - action: NEVER
    rule: "Anti-pattern to prevent"
anti_patterns:
  - "Description of what not to do"
examples:
  wrong_example: |
    // Bad example
  correct_example: |
    // Good example
context: |
  Why this standard exists. What incident drove its creation.
  Include cost: time, money, trust impact.
tags:
  - relevant-tag
```

For reference, the markdown equivalent structure:

```markdown
# [Standard Name]

## Problem

[What problem does this solve? What mistake does it prevent?]

## Cost of Violation

[What happens when this standard is ignored? Quantify if possible.]

## Rule

[Clear, actionable, testable rule]

## Examples

### ❌ Wrong
\`\`\`javascript
// Bad example with explanation
\`\`\`

### ✅ Correct
\`\`\`javascript
// Good example with explanation
\`\`\`

## Detection

[How agents detect violations, what to look for in code review]

## Related Standards

- [Other relevant standards]

## History

[Optional: When was this learned? What incident drove creation?]
```

---

## Getting Started

### Week 1: Foundation
```bash
# 1. Install EquilateralAgents
npm install equilateral-agents-open-core

# 2. Run first workflows
npm run workflow:security
npm run workflow:quality

# 3. Review agent memory
npm run memory:stats

# 4. Create .standards-local/
mkdir -p .standards-local/{security,architecture,performance,testing,deployment}
cp .claude/standards-template.md .standards-local/README.md
```

### Week 2: First Standards
```bash
# 1. Review .equilateral/agent-memory/
# Look for patterns in failures and successes

# 2. Document first 3 learnings
# Use "What Happened, The Cost, The Rule" format
# Add to .standards-local/

# 3. Update this CLAUDE.md file
# Add trigger words, banned patterns as discovered
```

### Month 1: Rhythm Established
```bash
# 1. Weekly knowledge harvest
# Review agent memory, workflow history
# Document patterns

# 2. 10+ standards documented
# .standards-local/ growing
# Measurable reduction in repeat errors

# 3. Start using background execution
# Dispatch teams while you work
# "dispatch teams + execute todos" pattern
```

### Month 3: Maturity
```bash
# 1. Daily/weekly harvest rhythm
# Automatic pattern recognition
# Standards becoming second nature

# 2. Contributing to community
# Share sanitized patterns
# Help others avoid your mistakes

# 3. Measurable impact
# Track time saved from prevented errors
# Celebrate wins from standards
```

---

## Questions & Support

### Common Questions

**Q: Do I need to create standards for everything?**
A: No. Only document patterns that:
- Occurred 3+ times
- Had significant cost (time/money/trust)
- Are likely to recur
- Can be expressed as clear rules

**Q: How do I know what to put in `.standards-local/` vs contributing to community?**
A: Start local. After 3+ months of successful use, sanitize and contribute to community.

**Q: Can I automate the knowledge harvest?**
A: Yes! Create a librarian agent that scans agent memory, classifies patterns, and suggests standards. See `docs/guides/KNOWLEDGE_HARVEST.md` for methodology.

**Q: What if standards conflict?**
A: Hierarchy: `.standards-local/` (most specific) > `.standards-community/` > `.standards/` (most general). Local always wins.

**Q: How do I enforce standards?**
A:
1. This CLAUDE.md tells AI assistants to check standards first
2. Agents validate during execution
3. Pre-commit hooks can run specific agents
4. CI/CD can run full workflow validation

### Getting Help

- **Framework Issues**: [GitHub Issues](https://github.com/Equilateral-AI/equilateral-agents-open-core/issues)
- **Community Standards**: [Submit PR](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards)
- **Enterprise Features**: info@happyhippo.ai
- **Slack Community**: [Join here](https://happyhippo.ai/community)

---

## Commercial Features

The open-core version includes 22 agents and the complete methodology. Enterprise features are available for specialized needs:

### What's Commercial
- **62 specialized agents** (40+ beyond open-core)
- **250+ battle-tested standards** (pre-built from real enterprises)
- **ADGPO compliance suite** (GDPR, CCPA, HIPAA, SOC2)
- **Librarian agent** (automated knowledge harvest)
- **Pattern recognition ML** (cross-enterprise learning)
- **Multi-account AWS** (Control Tower integration)
- **Advanced security** (STRIDE threat modeling, penetration testing)
- **Cost intelligence** (ML-based predictions)

### What's Open-Core
- **22 production-ready agents** (everything you need to start)
- **Complete methodology** (three-tier standards, knowledge harvest)
- **Self-learning system** (agent memory, pattern recognition)
- **Background execution** (parallel workflow execution)
- **Community standards** (contribute and benefit from shared knowledge)
- **This template** (shows you the pattern without giving away 250+ standards)

**The Difference:** Open-core teaches you to fish (methodology + agents). Commercial gives you 250+ fish we already caught (battle-tested standards + 40+ specialized agents).

### Upgrade Path

Start with open-core. Build your `.standards-local/`. When you need:
- Specialized compliance (GDPR/HIPAA)
- Multi-account AWS deployments
- 250+ pre-built standards
- ML-based cost predictions
- Automated knowledge harvest

Contact: info@happyhippo.ai

---

## Final Checklist

Before every code change:

- [ ] Read relevant standards from `.standards/`
- [ ] Check `.standards-community/` for proven patterns
- [ ] Review `.standards-local/` for team conventions
- [ ] Design error handling first (fail fast, fail loud)
- [ ] Check trigger words - do any apply?
- [ ] Run relevant agents (security, quality, deploy)
- [ ] Review agent memory for similar past issues
- [ ] Document new patterns if significant (3+ occurrences)
- [ ] Update `.standards-local/` if pattern warrants it
- [ ] Consider contributing to community standards

**Remember:** Every standard in `.standards-local/` represents a mistake you'll never make again. Every contribution to `.standards-community/` is a mistake someone else won't make either.

---

**Built with EquilateralAgents Open Core**
Learn more: [https://github.com/Equilateral-AI/equilateral-agents-open-core](https://github.com/Equilateral-AI/equilateral-agents-open-core)
