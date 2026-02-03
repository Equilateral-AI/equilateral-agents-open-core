# EquilateralAgents Open Core

**22 self-learning AI agents. Build institutional knowledge that compounds over time. MIT licensed.**

Transform your AI coding assistant into a learning system that gets smarter with every mistake you make (and prevents you from making it again).

[![npm version](https://badge.fury.io/js/equilateral-agents-open-core.svg)](https://www.npmjs.com/package/equilateral-agents-open-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-5A67D8?logo=anthropic&logoColor=white)](https://github.com/Equilateral-AI/equilateral-agents-open-core)

---

## What's New in v3.1.0

### YAML Standards Format (v3.0.0 - Breaking Change)

All standards now use YAML format instead of markdown. This enables machine-readable standards that agents consume directly:

```yaml
id: lambda-database-standards
category: serverless
priority: 10
rules:
  - action: ALWAYS
    rule: "Cache single database client at module scope for warm start reuse"
  - action: NEVER
    rule: "Use connection pools in Lambda - Lambda handles one request at a time"
anti_patterns:
  - "Creating new Pool() per invocation"
tags: [lambda, database, cost-optimization]
```

### StandardsLoader (v3.0.0)

New core utility that loads YAML standards from a three-layer directory hierarchy:

```javascript
const { StandardsLoader } = require('equilateral-agents-open-core');
const loader = new StandardsLoader({ projectRoot: process.cwd() });

const all = await loader.loadAll();           // All standards from all layers
const security = await loader.loadByTags(['security']); // Filter by tag
const rules = await loader.getRulesForAgent('SecurityReviewerAgent'); // Agent-specific
```

**Three layers (later overrides earlier):**
1. `.standards/yaml/` - Official open standards (submodule)
2. `.standards-community/` - Community-contributed patterns (submodule)
3. `.standards-local/` - Your team's conventions (git-ignored)

### Bundled Project/Object Skill (v3.1.0)

Session memory and standards injection included by default. Closes the loop between YAML standards on disk and enforcement in every AI session:

1. **On session start**: Reads `~/.project-object/{project}/context.md` and injects prior session context
2. **Standards loading**: Scans `.standards/yaml/*.yaml`, extracts rules, injects as `[REQUIRE]`/`[AVOID]`/`[PREFER]` directives
3. **On session end**: Harvests new decisions, patterns, and corrections from the transcript
4. **Cross-platform sync**: Context syncs to Claude Code, Cursor, Codex, Windsurf via `project-object sync`

### Migration from v2.x

- Rename `.standards-local/*.md` files to `.yaml` and convert to YAML schema
- `StandardsContributor` now generates `.yaml` output
- Knowledge harvest reports output `.yaml` instead of `.md`
- See [CHANGELOG.md](CHANGELOG.md) for complete migration details

---

## Why EquilateralAgents?

### The Problem: Codebases Don't Learn

Traditional development:
- ❌ Same security bugs discovered 3+ times
- ❌ N+1 query performance issues in every new feature
- ❌ Production incidents from patterns you've seen before
- ❌ New developers repeat mistakes the team already solved
- ❌ No institutional memory - knowledge lives in people's heads

### The Solution: A Learning System

EquilateralAgents creates a feedback loop:

```
1. Execute Workflows (agents scan your code)
        ↓
2. Agent Memory (tracks what worked, what failed)
        ↓
3. Knowledge Harvest (extract patterns weekly)
        ↓
4. Create Standards (document "What Happened, The Cost, The Rule")
        ↓
5. Enforce Standards (AI checks before changes, agents validate)
        ↓
6. Fewer Incidents (prevent repeating mistakes)
        ↓
[Loop back to step 1]
```

**Result:** Your codebase gets smarter over time. Mistakes happen once, not repeatedly.

---

## Perfect For

### 🌱 Greenfield Projects

**Start right from day 1:**
- Security scanning before first commit
- Quality gates before bad patterns take root
- Document decisions as you make them
- Build standards library alongside code

**Example journey:**
- **Week 1**: Run security/quality workflows, create first standards
- **Month 1**: 10+ standards covering your specific domain
- **Month 3**: New feature? Check standards first. AI references them automatically.

### 🏗️ Brownfield Codebases

**Fix systematically, not randomly:**
- Agents identify patterns across entire codebase
- Document each fix as a standard (prevent recurrence)
- Gradually eliminate entire classes of bugs
- Track progress: incidents per month going down

**Example journey:**
- **Week 1**: Security scan finds 50 issues. Fix 10, document pattern.
- **Month 2**: Similar issue caught by agent during PR. Standard working.
- **Month 6**: That entire class of bugs eliminated from codebase.

**Real results:**
- Production incidents: 8/quarter → 1/quarter (87% reduction)
- Debug time: 4 hours/incident → 0 (caught in PR review)
- ROI: One prevented outage pays for entire year of standards work

---

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/Equilateral-AI/equilateral-agents-open-core.git
cd equilateral-agents-open-core

# Install dependencies (zero config - works immediately)
npm install

# Run first workflow
npm run workflow:security
```

No database setup. No API keys. No configuration files. Works immediately.

### First Week Checklist

- [ ] **Day 1**: Run security and quality workflows on your codebase
- [ ] **Day 2**: Review `.equilateral/workflow-history.json` - what did agents find?
- [ ] **Day 3**: Copy `.standards-local-template/` to `.standards-local/`
- [ ] **Day 4**: Create your first standard from most painful issue agents found
- [ ] **Day 5**: Update `.claude/CLAUDE.md` to reference your new standard

See [BUILDING_YOUR_STANDARDS.md](docs/guides/BUILDING_YOUR_STANDARDS.md) for complete Week 1 → Year 3 roadmap.

---

## What's Included

### 22 Production-Ready Agents

**Infrastructure Core (3)**
- AgentClassifier - Task routing and complexity analysis
- AgentMemoryManager - Context and state management
- AgentFactoryAgent - Self-bootstrapping agent generation

**Development (6)**
- CodeAnalyzerAgent - Static analysis and metrics
- CodeGeneratorAgent - Pattern-based code generation
- TestOrchestrationAgent - Multi-framework test execution
- DeploymentValidationAgent - Pre-deployment validation
- TestAgent - UI testing with intelligent element remapping
- UIUXSpecialistAgent - Design consistency and accessibility

**Quality Assurance (5)**
- AuditorAgent - Standards compliance validation
- CodeReviewAgent - Best practice enforcement
- BackendAuditorAgent - Backend-specific standards
- FrontendAuditorAgent - Frontend-specific standards
- TemplateValidationAgent - IaC template validation

**Security (4)**
- SecurityScannerAgent - Vulnerability scanning
- SecurityReviewerAgent - Security posture assessment
- SecurityVulnerabilityAgent - Common security issue detection
- ComplianceCheckAgent - Basic compliance validation

**Infrastructure (4)**
- DeploymentAgent - Deployment automation
- ResourceOptimizationAgent - Cloud resource analysis
- ConfigurationManagementAgent - IaC configuration patterns
- MonitoringOrchestrationAgent - Observability best practices

See [AGENT_INVENTORY.md](docs/AGENT_INVENTORY.md) for complete capabilities.

### StandardsLoader (Core Utility)

The engine that makes YAML standards actionable. Loads standards from a three-layer hierarchy, filters by category/tags/action, and integrates directly with `BaseAgent`:

```javascript
// Every agent automatically loads relevant standards
const agent = new SecurityScannerAgent({
  enableStandards: true,  // Standards loaded automatically via tags
  projectRoot: process.cwd()
});
// SecurityScannerAgent gets standards tagged: security, credential-scanning, vulnerability
```

**Methods:** `loadAll()`, `loadStandard(id)`, `loadByCategory()`, `loadByTags()`, `loadByAction()`, `getRulesForAgent(agentType)`

### Complete Standards Methodology

**Documentation:**
- [BUILDING_YOUR_STANDARDS.md](docs/guides/BUILDING_YOUR_STANDARDS.md) - Week 1 → Year 3 roadmap
- [PAIN_TO_PATTERN.md](docs/guides/PAIN_TO_PATTERN.md) - "What Happened, The Cost, The Rule" methodology
- [KNOWLEDGE_HARVEST.md](docs/guides/KNOWLEDGE_HARVEST.md) - Daily/weekly pattern extraction process
- [.claude/CLAUDE.md](.claude/CLAUDE.md) - Template for AI assistant integration

**Example Standards (.standards-local-template/):**
- Security: Credential scanning, input validation, auth & access control
- Architecture: Error-first design patterns
- Performance: Database query optimization, N+1 prevention
- Testing: Integration tests without mocks

**YAML Schema** (all standards follow this format):
```yaml
id: unique-identifier
category: string
priority: 10 | 20 | 30    # 10=critical, 20=important, 30=advisory
rules:
  - action: ALWAYS | NEVER | USE | PREFER | AVOID
    rule: "descriptive text"
anti_patterns:
  - "pattern description"
tags: [tag1, tag2]
context: "explanation of why this matters"
examples:
  example_name: |
    code example here
```

**The Difference:**
- **Open-core**: Methodology + templates + 22 agents + StandardsLoader (teach you to fish)
- **Commercial**: 131+ curated standards + 62 agents + intelligent injection (give you 131 fish already caught, served exactly when needed)

### Session Memory & Standards Injection (Bundled Skill)

The **project-object** skill is included by default, closing the loop between standards and enforcement. Without it, YAML standards sit in a directory. With it, they're actively injected into every AI session.

**What agents get:**

- **Session memory**: Decisions, patterns, corrections, and notes persist between sessions
- **Standards injection**: YAML standards from `.standards/yaml/` loaded and enforced as `[REQUIRE]`/`[AVOID]`/`[PREFER]` directives
- **Cross-platform sync**: Context syncs to Cursor, Codex, Windsurf, and other AI tools via `project-object sync`

**Example injected standards** (from your `.standards/yaml/` files):
```
[REQUIRE] Fail fast and loud -- make failures obvious and immediate
[REQUIRE] Use environment variables with {{resolve:ssm:param}} in SAM templates
[AVOID] Return mock data or fallback values from production code on failure
[AVOID] Use connection pools in Lambda -- Lambda handles one request at a time
[PREFER] ARM64 architecture for Lambda functions (20% cost savings)
```

**Files:**
- `.agents/skills/project-object/` - Full skill (SKILL.md, scripts, references)
- `.claude/skills/project-object` - Symlink for Claude Code auto-discovery
- Also available standalone: `npx skills add Equilateral-AI/project-object-skill`

For adaptive learning (automatic correction detection, invariant promotion), see [MindMeld](https://mindmeld.dev).

### 5 Battle-Tested Workflows

```bash
npm run workflow:security         # Multi-layer security assessment
npm run workflow:quality          # Code quality analysis (0-100 score)
npm run workflow:deploy           # Deployment validation
npm run workflow:fullstack        # Full-stack development workflow
npm run workflow:infrastructure   # Infrastructure validation
```

See [workflows/README.md](workflows/README.md) for details.

### Self-Learning System

**Agents automatically:**
- Track last 100 executions
- Identify success/failure patterns
- Suggest optimizations
- Improve recommendations over time

**You manually:**
- Review agent memory weekly (`npm run memory:stats`)
- Extract patterns ("this error happened 3+ times")
- Create standards (document "What Happened, The Cost, The Rule")
- Update `.claude/CLAUDE.md` (AI checks standards before changes)

**Commercial upgrade:**
- Librarian agent automates knowledge harvest
- Pattern recognition ML across projects
- Cross-enterprise learning (anonymized)

---

## Three-Tier Standards System

EquilateralAgents uses a hierarchical standards approach:

### 1. Official Standards (`.standards/`)
[EquilateralAgents Open Standards](https://github.com/Equilateral-AI/EquilateralAgents-Open-Standards) - Universal principles

Core principles:
- **No mocks** in production code (test real dependencies)
- **Error-first design** (design errors before happy paths)
- **Cost-conscious infrastructure** (estimate before deploying)
- **Explicit over implicit** (obvious code beats clever code)

### 2. Community Standards (`.standards-community/`)
[Community Patterns](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards) - Battle-tested patterns (optional)

Contributed by users:
- Agent coordination patterns
- Real-world examples
- Custom workflows
- Integration patterns

**Your standards can graduate here** after 3+ months of successful use.

### 3. Local Standards (`.standards-local/`)
**Your Team's Standards** - Project-specific conventions (git-ignored or private repo)

Built from your experience:
- Document incidents as they happen
- "What Happened, The Cost, The Rule" format
- Prevent repeating your specific mistakes
- Your institutional knowledge

### Quick Setup

```bash
# Clone with official standards
git clone --recurse-submodules https://github.com/Equilateral-AI/equilateral-agents-open-core.git

# Add community standards (optional)
git submodule add https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards.git .standards-community

# Create your local standards
cp -r .standards-local-template .standards-local
```

---

## Integration with AI Assistants

### Claude Code (Recommended)

```bash
/plugin marketplace add Equilateral-AI/equilateral-agents-open-core
/plugin install equilateral-agents-open-core

# Available slash commands
/ea:security-review    # Multi-layer security assessment
/ea:code-quality      # Code analysis with quality scoring
/ea:memory            # View agent learning statistics
/ea:list              # See all available workflows
```

### Cursor / Continue / Windsurf

EquilateralAgents includes `.claude/CLAUDE.md` that tells your AI assistant:

```markdown
## Before Every Code Change:

1. CHECK STANDARDS FIRST
   - Read `.standards/` for universal principles
   - Check `.standards-community/` for proven patterns
   - Review `.standards-local/` for team conventions

2. DESIGN ERRORS FIRST
   - What can go wrong? How will it fail?

3. VALIDATE BEFORE COMMIT
   - Run relevant agents (security, quality, tests)
   - Check agent memory for similar past failures
```

**Result:** AI automatically references your standards, preventing mistakes before code is written.

---

## Background Execution

**The Pattern:** "Dispatch teams in background, execute next todo list tasks"

```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');

const orchestrator = new AgentOrchestrator({ enableBackground: true });
await orchestrator.start();

// Dispatch teams in background
const securityTask = orchestrator.executeWorkflowBackground('security-review', {
    projectPath: process.cwd()
});

const qualityTask = orchestrator.executeWorkflowBackground('code-quality', {
    projectPath: process.cwd()
});

// Continue working on next todo while agents run
await workOnNextTodoListItems();

// Check results when ready
const securityResults = await securityTask.getResult();
const qualityResults = await qualityTask.getResult();
```

See [BACKGROUND_EXECUTION.md](docs/BACKGROUND_EXECUTION.md) for complete API.

---

## Knowledge Synthesis Flywheel

The system that makes your codebase smarter over time:

### Week 1-4: Foundation

1. **Run workflows** on your actual codebase
2. **Review findings** - agents will find issues
3. **Document first pain** - create 3-5 standards from most painful issues
4. **Update CLAUDE.md** - tell AI to check your new standards

### Month 2: Knowledge Harvest

1. **Weekly review**: Check `npm run memory:stats`
2. **Identify patterns**: What failed 3+ times?
3. **Create standards**: Use "What Happened, The Cost, The Rule" format
4. **Measure impact**: Track prevented incidents

### Month 3: Enforcement

1. **Pre-commit hooks**: Run agents before every commit
2. **CI/CD integration**: Block PRs with critical violations
3. **Team training**: Share standards library, explain why each exists
4. **Celebrate wins**: Count prevented incidents, estimate cost savings

### Year 1: Maturity

- **30-50 standards** covering most common mistakes
- **87% reduction** in production incidents (real data from commercial users)
- **40% faster velocity** (less debugging, more building)
- **Faster onboarding** (new devs learn from documented pain)

### Year 2+: Compounding Knowledge

- Standards library stabilizes (most patterns documented)
- Focus shifts to enforcement and refinement
- Consider contributing valuable patterns to community
- Explore commercial upgrade for specialized needs

**The Goal:** Every mistake happens once, gets documented, never repeats.

---

## Real Results

### Greenfield Project Example

**Background:** New SaaS application, 3 developers, 6 months

**Week 1:**
- Ran security/quality workflows
- Found 0 issues (greenfield), created 5 standards for domain patterns
- Set up pre-commit hooks

**Month 3:**
- 15 standards documented (authentication, data validation, API patterns)
- 0 production incidents (agents caught issues in PR review)

**Month 6:**
- 25 standards, mature workflow
- New developer onboarded in 2 days (read standards, understood decisions)
- Security audit: 95/100 score

### Brownfield Project Example

**Background:** Legacy Node.js app, 50k LOC, 5 years old, 8 developers

**Week 1:**
- SecurityScannerAgent found 47 issues
- BackendAuditorAgent found 30 N+1 queries
- Created first 3 standards from most painful patterns

**Month 2:**
- Fixed 15 issues, documented patterns as standards
- Agents started catching similar issues in new code
- Prevented 8 incidents (same patterns caught in PR review)

**Month 6:**
- 35 standards, entire classes of bugs eliminated
- Production incidents: 8/quarter → 1/quarter (87% reduction)
- Debug time per incident: 4 hours → 0 (caught before merge)

**Month 12:**
- 50+ standards, knowledge library mature
- Team velocity up 40% (less firefighting, more building)
- ROI: One prevented outage paid for entire year of work

---

## Open-Core vs Commercial

### What's Open-Core (Free)

✅ **22 production-ready agents** - Everything needed to start
✅ **Complete methodology** - Build your own standards library
✅ **Self-learning system** - Agent memory, pattern recognition
✅ **Background execution** - Parallel workflow execution
✅ **Example standards** - 6 templates showing proper format
✅ **Community contribution** - Contribute & benefit from shared knowledge
✅ **This entire methodology** - Teach you to fish

**Perfect for:**
- Startups and small teams
- Learning the methodology
- Building your first 50 standards
- Contributing to community

### What's Commercial

**[MindMeld](https://mindmeld.dev)** adds three intelligence layers on top of the open-core foundation:

**Layer 1: Intelligent Injection**
- Context-aware Standard Selector (injects 5-10 relevant rules per task, ~400 tokens)
- vs StandardsLoader which dumps everything (~550K tokens) or nothing
- Token budget management, priority weighting, conflict resolution

**Layer 2: Automated Curation Pipeline**
- Correction detection surfaces candidate patterns from every session
- Auto-categorization, auto-enrichment, quality scoring
- Continuous standards improvement without manual effort

**Layer 3: Adaptive Learning Loop**
- Correction detection, pattern aggregation, invariant promotion
- Relationship geometry (per-user behavioral adaptation)
- Two-layer invariant system (agent-level + relationship-level)

**Also includes:**
- 131+ curated YAML standards across 11 categories
- 62 specialized agents (40+ beyond open-core)
- GDPR/HIPAA/SOC2 compliance standards
- Enterprise team memory and knowledge transfer

**Perfect for:**
- Teams that need 131+ standards immediately (skip 2 years of learning)
- Enterprises with compliance requirements
- Teams wanting standards that get smarter over time
- Cross-project pattern recognition

### The Difference

**Open-core teaches you to fish** (methodology + tools + StandardsLoader)

**MindMeld gives you 131 fish, serves the right one at the right time, and learns which fish you need next** (intelligent injection + automated curation + adaptive learning)

### Upgrade Path

Start with open-core. Build your `.standards-local/`. Upgrade when you need:
- Intelligent standards injection (right rules, right time, minimal tokens)
- Automated curation (stop writing standards manually)
- Adaptive learning (agent remembers your corrections)
- 131+ pre-built standards (skip years of learning)
- Enterprise team memory and knowledge transfer

**Learn more:** [mindmeld.dev](https://mindmeld.dev)

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Found a universal pattern?** Submit to [EquilateralAgents Open Standards](https://github.com/Equilateral-AI/EquilateralAgents-Open-Standards)

**Built something useful?** Share with [Community Standards](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards)

**Your battle-tested pattern could help thousands of developers avoid the same mistakes.**

---

## Security Notice

**Important:** EquilateralAgents runs with your user account privileges.

Agents can:
- Read/write files in your project
- Execute shell commands
- Access environment variables (API keys, tokens)
- Make network requests

**Best Practices:**
- Review agent code before running
- Use separate API keys for development
- Run in isolated environments for untrusted workflows
- Monitor agent activity logs in `.equilateral/`

See [SECURITY.md](SECURITY.md) for complete guidelines.

---

## Documentation

**Case Studies:**
- [HoneyDoList.vip: Production SaaS in 38-40 Hours](case-studies/HONEYDOLIST_CASE_STUDY.md) - Real-world validation
- [Agent Orchestration Framework](case-studies/AGENT_ORCHESTRATION_GUARDRAILS.md) - FI/FDI decision framework

**Methodology Guides:**
- [BUILDING_YOUR_STANDARDS.md](docs/guides/BUILDING_YOUR_STANDARDS.md) - Week 1 → Year 3 roadmap
- [PAIN_TO_PATTERN.md](docs/guides/PAIN_TO_PATTERN.md) - "What Happened, The Cost, The Rule" methodology
- [KNOWLEDGE_HARVEST.md](docs/guides/KNOWLEDGE_HARVEST.md) - Daily/weekly pattern extraction

**Reference:**
- [Agent Inventory](docs/AGENT_INVENTORY.md) - All 22 agents with capabilities
- [Workflows](workflows/README.md) - Complete workflow guide
- [Background Execution](docs/BACKGROUND_EXECUTION.md) - Async API reference
- [Plugin Usage](docs/PLUGIN_USAGE.md) - Skills and slash commands
- [Protocols](equilateral-core/protocols/README.md) - MCP, A2A, WebSockets

**Release Notes:**
- [CHANGELOG.md](CHANGELOG.md) - Complete version history (v1.0.2 → v3.1.0)
- [All Releases](docs/releases/) - Detailed release notes

---

## License

MIT License - see [LICENSE](LICENSE)

**Trademarks:** EquilateralAgents™ and Equilateral AI™ are trademarks of Pareidolia LLC (dba Equilateral AI)

---

## The Bottom Line

**Traditional development:** Make mistakes repeatedly. Knowledge lives in people's heads. New developers repeat old mistakes.

**With EquilateralAgents:** Make mistakes once. Document them. Build institutional memory. Your codebase learns.

- **Week 1:** Run workflows, see what breaks
- **Month 2:** 10+ standards from your real pain
- **Year 1:** 30-50 standards preventing entire classes of bugs
- **Year 2+:** Knowledge compounds, velocity increases, incidents decrease

**Your 100th standard represents 100 mistakes you'll never make again.**

---

## GlideCoding Methodology

EquilateralAgents is the open-core engine behind the [GlideCoding](https://glidecoding.com) methodology — AI-assisted development with architectural governance.

- **[glidecoding.com](https://glidecoding.com)** — The methodology
- **[glidecoding.org](https://glidecoding.org)** — Open standards library (131 YAML standards, 11 categories)
- **[glidecoding.ai](https://glidecoding.ai)** — The platform

---

**Built by [Equilateral AI](https://equilateral.ai)**

**Ready to start?**

```bash
git clone https://github.com/Equilateral-AI/equilateral-agents-open-core.git
cd equilateral-agents-open-core
npm install && npm run workflow:security
```
