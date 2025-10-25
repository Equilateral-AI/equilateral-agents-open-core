# EquilateralAgents Claude Code Plugin - Usage Guide

**v2.1.0** - Now with self-learning agents!

The EquilateralAgents Claude Code plugin provides native integration with Claude Code through skills and slash commands, making it easy to execute production-ready workflows with simple commands.

## Overview

The plugin consists of:

1. **Self-Learning Agents** - Agents automatically learn from execution history (NEW in v2.1.0!)
2. **Auto-Activation Skill** - Claude automatically suggests workflows based on context
3. **Slash Commands** - Direct workflow execution with `/ea:workflow-name`
4. **Agent Memory** - Track learning patterns and optimization suggestions (NEW in v2.1.0!)
5. **Upgrade Prompts** - Clear information about commercial features

## Quick Start

```bash
# Clone repository (plugin files included in .claude/)
git clone https://github.com/happyhippo-ai/equilateral-agents-open-core.git
cd equilateral-agents-open-core
npm install

# Claude Code automatically detects .claude/ directory
# Commands are immediately available!

# See what's available
/ea:list

# Run a workflow (agents learn automatically)
/ea:security-review

# Check what agents have learned
/ea:memory

# Natural language also works:
# "Let's do a security review" → Claude suggests /ea:security-review
# "Show me agent learning stats" → Claude suggests /ea:memory
```

## Architecture

### Directory Structure

```
.claude/
├── skills/
│   └── equilateral-agents/
│       ├── SKILL.md         # Main skill definition (auto-activation)
│       └── reference.md     # Quick reference guide
└── commands/
    ├── ea-security-review.md        # Open core - learns vulnerability patterns
    ├── ea-code-quality.md           # Open core - learns code patterns
    ├── ea-deploy-feature.md         # Open core - learns deployment patterns
    ├── ea-infrastructure-check.md   # Open core - learns config patterns
    ├── ea-test-workflow.md          # Open core - learns test patterns
    ├── ea-memory.md                 # NEW v2.1.0 - Agent learning statistics
    ├── ea-list.md                   # Discovery
    ├── ea-gdpr-check.md             # Commercial
    ├── ea-hipaa-compliance.md       # Commercial
    └── ea-full-stack-dev.md         # Commercial
```

## Open Core Commands (Free)

### 1. Security Review (`/ea:security-review`)

**What it does:**
- Multi-layer security assessment
- Vulnerability scanning (dependencies, OWASP Top 10)
- Security posture analysis
- Basic compliance checking

**🧠 What it learns (v2.1.0):**
- Vulnerability patterns and common security issues
- Successful mitigation strategies
- Performance metrics for security scans

**Example output:**
```
✅ Security Review Complete

🔍 Vulnerability Scan:
- Critical: 0
- High: 1 (outdated dependency: express@4.16.0)
- Medium: 2
- Low: 3

🛡️ Security Posture: 85/100
📋 Compliance: 18/20 checks passed
💾 Audit Trail: .equilateral/workflow-history.json
```

**When to use:**
- Before deployments
- After dependency updates
- During security-focused code reviews
- When user mentions "security", "vulnerability", "CVE"

---

### 2. Code Quality (`/ea:code-quality`)

**What it does:**
- Automated code review with best practices
- Backend-specific auditing (Lambda, API patterns)
- Frontend-specific auditing (components, performance)
- Standards enforcement and quality scoring

**Example output:**
```
✅ Code Quality Analysis Complete

📊 Overall Quality Score: 87/100

🔍 Code Review: 45/50 checks passed
🏗️ Backend Quality: PASS
🎨 Frontend Quality: PASS (Bundle: 245KB)
📏 Standards Compliance: 92/100

🔧 Recommended Actions:
1. Refactor user authentication module (high complexity)
2. Optimize database query in getUserProfile()
```

**When to use:**
- During PR reviews
- Before merging to main
- As part of CI/CD quality gates
- When user mentions "code quality", "review", "standards"

---

### 3. Deploy Feature (`/ea:deploy-feature`)

**What it does:**
- Pre-deployment validation (health checks, config)
- Security scanning
- Test orchestration
- Deployment execution with rollback readiness

**Example output:**
```
✅ Deployment Validation Complete

🔍 Pre-Flight Checks: PASS
🛡️ Security Scan: PASS
🧪 Test Results: 277/277 passed (87% coverage)
🚀 Deployment Status: SUCCESS (staging)
✅ Ready for production deployment
```

**When to use:**
- Before deploying to staging/production
- After completing feature development
- As part of CI/CD pipelines
- When user mentions "deploy", "deployment", "release"

---

### 4. Infrastructure Check (`/ea:infrastructure-check`)

**What it does:**
- IaC template validation (SAM, CloudFormation, Terraform)
- Configuration management (secrets, drift detection)
- Resource optimization (right-sizing)
- Cost estimation (basic projections)

**Example output:**
```
✅ Infrastructure Validation Complete

📋 Template Validation: PASS (8 templates)
⚙️ Configuration Management: PASS
💰 Cost Estimation: $245/month
📊 Resource Analysis: 21/23 right-sized

🔧 Recommended Actions:
1. Reduce Lambda memory for low-traffic functions (save ~$15/mo)
2. Implement RDS reserved instance (save ~$50/mo)
```

**When to use:**
- Before deploying infrastructure changes
- During infrastructure reviews
- For cost optimization analysis
- When user mentions "infrastructure", "IaC", "CloudFormation", "Terraform"

---

### 5. Test Workflow (`/ea:test-workflow`)

**What it does:**
- Multi-framework test orchestration
- UI testing with element remapping
- UI/UX validation (accessibility, design system)
- Coverage analysis

**Example output:**
```
✅ Test Workflow Complete

🧪 Test Execution:
- Unit: 245/245 passed (100%)
- Integration: 32/32 passed (100%)
- UI: 18/18 passed (100%)

📊 Coverage: 87% statement, 82% branch
🎨 UI/UX Validation: PASS (WCAG AA level)
```

**When to use:**
- Before deployments
- During CI/CD pipeline
- After code changes
- When user mentions "test", "testing", "run tests"

---

### 6. List Workflows (`/ea:list`)

**What it does:**
- Lists all available workflows (open-core and commercial)
- Shows descriptions and usage commands
- Provides contact info for commercial upgrades

**When to use:**
- User asks "what workflows are available?"
- User is exploring capabilities
- User needs help choosing a workflow

---

## Commercial Commands (Upgrade Required)

These commands show detailed information about commercial features and how to upgrade.

### 1. GDPR Compliance (`/ea:gdpr-check`)

**Requires:** Privacy & Compliance Suite

**Includes:**
- 8 specialized privacy agents (122 capabilities total)
- Automated GDPR/CCPA compliance checking
- DSR (Data Subject Rights) automation
- Privacy impact assessments
- Consent management validation
- Cross-border transfer compliance
- Breach response automation (72-hour tracking)
- Vendor privacy assessment

**Example features:**
```
✅ GDPR Compliance Assessment

📋 Overall Score: 87/100
👤 DSR Handling: 18-day avg (within 30-day requirement)
✅ Consent Management: COMPLIANT
🌍 Cross-Border Transfers: COMPLIANT
🤝 Vendor Management: 12/12 DPAs in place
```

**Contact:** info@happyhippo.ai (Subject: "Privacy & Compliance Suite")

---

### 2. HIPAA Compliance (`/ea:hipaa-compliance`)

**Requires:** Specialized Domain Agents (Healthcare)

**Includes:**
- HIPAA Security Rule validation (all safeguards)
- HIPAA Privacy Rule validation
- PHI protection and detection
- BAA (Business Associate Agreement) management
- HITECH Act compliance
- Breach notification (60-day rule)

**Use cases:**
- Hospitals & health systems
- Telemedicine platforms
- Health insurance
- Clinical research

**Contact:** info@happyhippo.ai (Subject: "Healthcare Compliance Module")

---

### 3. Full-Stack Development (`/ea:full-stack-dev`)

**Requires:** Product Creation Pack

**Includes:**
- 6 specialized development agents
- End-to-end feature implementation (backend + frontend + tests + docs)
- 70% faster development time
- Multi-framework support (React, Vue, Angular, Next.js)
- Multi-database support (PostgreSQL, MySQL, MongoDB, DynamoDB)

**Example features:**
```
✅ Full-Stack Feature Complete

🏗️ Architecture: 3 tables, 12 API endpoints, 8 components
💾 Backend: 12/12 endpoints implemented, JWT auth
🎨 Frontend: 8/8 components, Redux configured, WCAG AA
🔄 Migrations: 3 created with rollback scripts
🧪 Testing: 24/24 E2E tests passing (94% coverage)
📚 Documentation: OpenAPI spec, Storybook stories, ADR

⏱️ Duration: 2.3 hours (vs 8-12 hours manual)
```

**Contact:** info@happyhippo.ai (Subject: "Product Creation Pack")

---

## Context-Based Auto-Activation

The EquilateralAgents skill automatically suggests workflows based on conversation context:

| User Mentions | Claude Suggests | Type |
|---------------|----------------|------|
| "security", "vulnerability", "CVE" | `/ea:security-review` | Open Core |
| "deploy", "deployment", "release" | `/ea:deploy-feature` | Open Core |
| "code quality", "review", "standards" | `/ea:code-quality` | Open Core |
| "infrastructure", "IaC", "CloudFormation" | `/ea:infrastructure-check` | Open Core |
| "test", "testing" | `/ea:test-workflow` | Open Core |
| "GDPR", "data privacy" | `/ea:gdpr-check` | Commercial |
| "HIPAA", "healthcare" | `/ea:hipaa-compliance` | Commercial |

## Evidence-Based Results

All workflows provide concrete, measurable evidence:

**Good Examples:**
- ✅ "Verified: 15/15 security checks passed"
- 📊 "Quality Score: 87/100 (meets standards)"
- 🔍 "Found 3 vulnerabilities: 2 medium, 1 low severity"
- 💾 "Audit Trail: .equilateral/workflow-history.json (23 workflows logged)"

**Avoid:**
- ❌ "Security check complete" (no evidence)
- ❌ "Looks good" (no metrics)
- ❌ "Done" (no verification)

## Workflow Execution

Each command provides complete implementation instructions for Claude Code, including:

1. Required module imports
2. Orchestrator configuration
3. Agent registration
4. Workflow execution
5. Result reporting with evidence

Example:
```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const SecurityScannerAgent = require('./agent-packs/security/SecurityScannerAgent');

const orchestrator = new AgentOrchestrator({ projectPath: process.cwd() });
orchestrator.registerAgent(new SecurityScannerAgent());

await orchestrator.start();
const result = await orchestrator.executeWorkflow('security-review', {
    projectPath: process.cwd(),
    depth: 'comprehensive'
});

console.log(`✅ Verified: ${result.results.length} checks passed`);
```

## Audit Trails

All workflows maintain audit trails in `.equilateral/workflow-history.json`:

```json
{
  "id": "1730400000000",
  "type": "security-review",
  "status": "completed",
  "startTime": "2024-10-31T12:00:00.000Z",
  "endTime": "2024-10-31T12:02:15.000Z",
  "results": [
    {
      "agentId": "security-scanner",
      "taskType": "scan",
      "result": { "vulnerabilities": [...] },
      "timestamp": "2024-10-31T12:02:15.000Z"
    }
  ]
}
```

## Customization

### Adding Custom Workflows

Create a new command file in `.claude/commands/`:

```markdown
# My Custom Workflow

Execute custom workflow using specific agents.

## Implementation Steps

1. Import required modules
2. Register agents
3. Execute workflow
4. Report results

[... implementation details ...]
```

### Modifying Existing Workflows

Edit command files in `.claude/commands/` to customize:
- Agent selection
- Workflow parameters
- Output format
- Success criteria

## Troubleshooting

### Skill Not Auto-Activating

1. Verify `.claude/skills/equilateral-agents/SKILL.md` exists
2. Check YAML frontmatter is valid
3. Ensure description includes relevant keywords

### Command Not Working

1. Verify file exists in `.claude/commands/`
2. Check file naming: `ea-workflow-name.md`
3. Ensure markdown formatting is correct

### Agents Not Found

1. Run `npm install` in project root
2. Verify `agent-packs/` directory exists
3. Check agent imports in command files

## Contributing

Found a useful workflow pattern? Consider contributing to:
- [EquilateralAgents Open Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards)
- [Community Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards)

## Support

- **Documentation:** [equilateral.ai](https://equilateral.ai)
- **Enterprise Features:** info@happyhippo.ai
- **Bug Reports:** [GitHub Issues](https://github.com/happyhippo-ai/equilateral-agents-open-core/issues)

---

**Built with ❤️ by [HappyHippo.ai](https://happyhippo.ai)**
