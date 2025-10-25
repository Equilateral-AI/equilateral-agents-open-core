# EquilateralAgents Open Core

**22 self-learning AI agents. Zero config. MIT licensed.**

Transform your AI coding assistant into a coordinated development team. Works with Claude Code, Cursor, Continue, Windsurf, or standalone.

[![npm version](https://badge.fury.io/js/equilateral-agents-open-core.svg)](https://www.npmjs.com/package/equilateral-agents-open-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 🆕 What's New in v2.1.0

**Self-Learning Agents** - Agents now automatically learn from execution history and optimize workflows:

```bash
# Run any workflow - agents learn automatically
/ea:security-review        # Learns vulnerability patterns
/ea:code-quality          # Learns code patterns

# View what agents have learned
/ea:memory                # See success rates, optimization suggestions

# Or via npm
npm run demo:memory       # See agent learning in action
npm run memory:stats      # View statistics for all agents
```

**Key Features:**
- 🧠 **Pattern Recognition** - Agents track last 100 executions and identify success/failure patterns
- 📊 **Optimization Suggestions** - Get recommended workflows based on historical performance
- 🤝 **Community Standards** - Contribute learned patterns back to the community (unique!)
- 🔍 **Guaranteed src/ Scanning** - All agents now reliably scan source directories

See [RELEASE_NOTES_v2.1.0.md](RELEASE_NOTES_v2.1.0.md) for complete details.

---

## Quick Start
```bash
git clone https://github.com/happyhippo-ai/equilateral-agents-open-core.git
cd equilateral-agents-open-core
npm install && npm run wow
```

No database setup. No API keys. No configuration files. Works immediately.

## What's Included

**22 Production-Ready Agents**
- Code review, security scanning, testing, deployment, infrastructure management
- See [AGENT_INVENTORY.md](AGENT_INVENTORY.md) for complete list

**5 Battle-Tested Workflows**
- Security review, code quality, deployment pipeline, full-stack development, infrastructure validation
- See [workflows/README.md](workflows/README.md) for details

**Zero-Config Database**
- SQLite auto-creates on first run
- Falls back to JSON if SQLite unavailable
- No manual setup required

**Background Execution**
- Non-blocking workflows
- Progress monitoring
- Multiple concurrent executions

**Communication Protocols**
- MCP (Model Context Protocol) - Claude Desktop integration
- A2A (Agent-to-Agent) - JSON-RPC 2.0 peer communication
- Internal event bus - Priority queuing and pub/sub messaging

**Universal Standards**
- [EquilateralAgents Open Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards)
- Technology-agnostic principles
- No mocks, fail fast, error-first design

## Run Production Workflows

```bash
# Security review
npm run workflow:security

# Code quality analysis (0-100 score)
npm run workflow:quality

# Deployment pipeline validation
npm run workflow:deploy

# Full-stack development
npm run workflow:fullstack

# Infrastructure validation
npm run workflow:infrastructure
```

## Background Execution API

```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');

const orchestrator = new AgentOrchestrator({ enableBackground: true });
await orchestrator.start();

// Start workflow, continue working immediately
const handle = await orchestrator.executeWorkflowBackground('security-review', {
    projectPath: './my-project'
});

console.log(`Started: ${handle.workflowId}`);

// Do other work
doOtherWork();

// Check status anytime
console.log(`Status: ${handle.getStatus().status}`);

// Get result when ready
const result = await handle.getResult();
```

See [BACKGROUND_EXECUTION.md](BACKGROUND_EXECUTION.md) for complete API.

## MCP Server Integration

**Use with Claude Desktop and MCP-compatible tools:**

```javascript
const MinimalMCPServer = require('./equilateral-core/protocols/MinimalMCPServer');

// Create MCP server with EquilateralAgents tools
const server = new MinimalMCPServer({
    name: 'equilateral-agents',
    version: '2.0.1',
    transports: ['stdio', 'http'],
    port: 3000
});

// Register agent capabilities as MCP tools
server.registerTool('security-scan', {
    description: 'Run comprehensive security scan on project',
    inputSchema: {
        type: 'object',
        properties: {
            projectPath: { type: 'string', description: 'Path to project' }
        },
        required: ['projectPath']
    },
    handler: async (args) => {
        const orchestrator = new AgentOrchestrator();
        await orchestrator.start();
        return await orchestrator.executeWorkflow('security-review', args);
    }
});

await server.initialize();
```

**Claude Desktop Configuration:**

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "equilateral-agents": {
      "command": "node",
      "args": ["path/to/equilateral-core/protocols/MinimalMCPServer.js"]
    }
  }
}
```

See [equilateral-core/protocols/README.md](equilateral-core/protocols/README.md) for full protocol documentation.

## Claude Code Plugin (Skills & Commands)

**Native integration with Claude Code using skills and slash commands:**

EquilateralAgents includes a Claude Code plugin that provides:
- **Self-learning agents** - Agents learn from execution history and optimize workflows (NEW in v2.1.0!)
- **Auto-activation skill** - Claude automatically suggests workflows based on context
- **Slash commands** - Execute workflows with simple commands like `/ea:security-review`
- **Agent memory** - Track learning patterns and performance metrics
- **Upgrade prompts** - Clear information about commercial features when relevant

### Available Commands

**Open Core (Free):**
- `/ea:security-review` - Multi-layer security assessment (🧠 learns vulnerability patterns)
- `/ea:code-quality` - Code analysis with quality scoring (🧠 learns code patterns)
- `/ea:deploy-feature` - Deployment validation and rollback checks (🧠 learns deployment patterns)
- `/ea:infrastructure-check` - IaC validation with cost estimation (🧠 learns config best practices)
- `/ea:test-workflow` - Background test execution (🧠 learns test patterns)
- `/ea:memory` - View agent learning statistics and optimization suggestions (NEW in v2.1.0!)
- `/ea:list` - List all available workflows

**Commercial (Upgrade Required):**
- `/ea:gdpr-check` - GDPR compliance validation
- `/ea:hipaa-compliance` - HIPAA compliance validation
- `/ea:full-stack-dev` - End-to-end feature development

### How It Works

1. **Skill Auto-Activation:**
   - When you mention "security" → Claude suggests `/ea:security-review`
   - When you mention "deploy" → Claude suggests `/ea:deploy-feature`
   - When you mention "GDPR" → Claude suggests `/ea:gdpr-check` (with upgrade info)

2. **Evidence-Based Results:**
   - "✅ Verified: 15/15 security checks passed"
   - "📊 Quality Score: 87/100"
   - "💾 Audit Trail: .equilateral/workflow-history.json"

3. **Clear Upgrade Paths:**
   - Commercial features show what's included
   - Pricing and contact information
   - Clear distinction from open-core features

### Plugin Structure

```
.claude/
├── skills/
│   └── equilateral-agents/
│       ├── SKILL.md         # Auto-activation skill
│       └── reference.md     # Quick reference guide
└── commands/
    ├── ea-security-review.md
    ├── ea-code-quality.md
    ├── ea-deploy-feature.md
    ├── ea-infrastructure-check.md
    ├── ea-test-workflow.md
    ├── ea-memory.md         # NEW in v2.1.0 - Agent learning statistics
    ├── ea-list.md
    ├── ea-gdpr-check.md     # Commercial
    ├── ea-hipaa-compliance.md # Commercial
    └── ea-full-stack-dev.md # Commercial
```

### Installation Options

**Option 1: Claude Code Marketplace (Recommended)**

```bash
# In Claude Code, run:
/plugin marketplace add happyhippo-ai/equilateral-agents-open-core
/plugin install equilateral-agents-open-core
```

**Option 2: Direct Clone**

```bash
git clone https://github.com/happyhippo-ai/equilateral-agents-open-core.git
cd equilateral-agents-open-core
npm install

# Claude Code automatically detects .claude/ directory
```

**Option 3: npm Package**

```bash
npm install equilateral-agents-open-core
# See MARKETPLACE_SUBMISSION.md for configuration
```

### Usage with Claude Code

Once installed, commands are available immediately:

```bash
# List all available workflows (see v2.1.0 features)
/ea:list

# Run workflows (agents learn automatically)
/ea:security-review       # Security assessment - agents learn vulnerability patterns
/ea:code-quality          # Code quality analysis - agents learn code patterns
/ea:deploy-feature        # Deployment validation - agents learn deployment patterns

# View agent learning (NEW in v2.1.0!)
/ea:memory                # See what agents have learned, success rates, optimization suggestions

# Natural language also works:
# "Let's do a security review" → Claude suggests /ea:security-review
# "Check agent learning" → Claude suggests /ea:memory
/ea:deploy-feature        # Validate deployment
```

See [PLUGIN_USAGE.md](PLUGIN_USAGE.md) for complete documentation and [MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md) for marketplace details.

## Custom Agents

```javascript
const BaseAgent = require('./equilateral-core/BaseAgent');

class MyCustomAgent extends BaseAgent {
    constructor() {
        super({
            agentId: 'my-agent',
            capabilities: ['analyze', 'report']
        });
    }

    async executeTask(task) {
        switch (task.taskType) {
            case 'analyze':
                return { success: true, findings: [...] };
            default:
                throw new Error(`Unknown task: ${task.taskType}`);
        }
    }
}

module.exports = MyCustomAgent;
```

## AI Integration

**Option 1: In Your AI Assistant (Recommended)**
```bash
# Claude Code, Cursor, Continue, etc.
npm install && npm run wow
```

**Option 2: Your Own LLM**
```bash
# .env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

npm run ai-demo
```

**Option 3: Basic Automation (No AI)**
```bash
npm start  # Works without AI
```

See [AI-INTEGRATION.md](AI-INTEGRATION.md) for configuration details.

## Development Standards

This project uses a **three-tier standards system**:

### 1. Official Standards (`.standards/`)
**[EquilateralAgents Open Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards)** - Universal principles

Core Principles:
- **No mocks** in production code (fail fast, fail loud)
- **Error-first design** (design errors before happy paths)
- **Cost-conscious infrastructure** (estimate before deploying)
- **Explicit over implicit** (obvious code beats clever code)

### 2. Community Standards (`.standards-community/`)
**[Community Patterns](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards)** - Battle-tested patterns (optional)

Proven solutions from the community:
- Agent coordination patterns
- Real-world examples
- Custom workflows
- Integration patterns

### 3. Local Standards (`.standards-local/`)
**Your Team's Standards** - Project-specific conventions (git-ignored)

Your own:
- Team naming conventions
- Company-specific patterns
- Private best practices

### Quick Setup

**Clone with standards:**
```bash
git clone --recurse-submodules https://github.com/happyhippo-ai/equilateral-agents-open-core.git
```

**Add to existing project:**
```bash
# Official standards (required)
git submodule add https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards.git .standards

# Community standards (optional)
git submodule add https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards.git .standards-community

# Your team standards (optional)
mkdir .standards-local && cd .standards-local && git init
```

### Configure Your AI Assistant

Create `.cursorrules` or `CLAUDE.md`:

```markdown
# Three-Tier Standards

## 1. Check Official Standards (.standards/)
- Universal principles apply to ALL code
- No mocks, fail fast, error-first design

## 2. Check Community Patterns (.standards-community/)
- Proven solutions for common problems
- Real-world examples and workflows

## 3. Check Local Standards (.standards-local/)
- Your team's conventions
- Company-specific patterns

## Before Every Change
1. Check .standards/ for universal principles
2. Check .standards-community/ for proven patterns
3. Check .standards-local/ for team conventions
4. Design error handling first
```

**Share your patterns:** Found something that works? Submit to [Community Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards)

## Project Structure

```
equilateral-agents-open-core/
├── equilateral-core/           # Orchestration framework
│   ├── AgentOrchestrator.js
│   ├── infrastructure/         # Core agents (3)
│   ├── database/               # SQLite/JSON adapters
│   └── protocols/              # MCP, A2A, AP2, WebSockets
├── agent-packs/                # Specialized agents (19)
│   ├── development/            # Code, testing, generation
│   ├── security/               # Scanning, review, compliance
│   ├── infrastructure/         # Deploy, config, monitoring
│   └── quality/                # Audit, review, validation
├── workflows/                  # Production workflows (5)
├── AGENT_INVENTORY.md          # Complete agent docs
├── BACKGROUND_EXECUTION.md     # Async API reference
└── AI-INTEGRATION.md           # LLM configuration
```

## Documentation

- [Agent Inventory](AGENT_INVENTORY.md) - All 22 agents with capabilities
- [Claude Code Plugin](PLUGIN_USAGE.md) - Skills and slash commands guide
- [Marketplace Submission](MARKETPLACE_SUBMISSION.md) - Installation and distribution
- [Plugin Validation](PLUGIN_VALIDATION.md) - Compliance verification
- [Workflows](workflows/README.md) - Complete workflow guide
- [Background Execution](BACKGROUND_EXECUTION.md) - Async API reference
- [Protocols](equilateral-core/protocols/README.md) - Communication protocols
- [AI Integration](AI-INTEGRATION.md) - LLM configuration
- [Standards Integration](docs/STANDARDS_INTEGRATION.md) - Setup guide

## Enterprise Features

Need specialized capabilities?

**Available:**
- Privacy & compliance automation (GDPR, CCPA, DSR fulfillment)
- Advanced security (STRIDE threat modeling, penetration testing)
- Business intelligence & ML-based cost optimization
- Multi-repository orchestration with learning
- Team collaboration with role-based access

**Contact:** info@happyhippo.ai

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

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Found a universal pattern? Submit to [EquilateralAgents Open Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards)

## License

MIT License - see [LICENSE](LICENSE)

**Trademarks:** EquilateralAgents™ and Equilateral AI™ are trademarks of HappyHippo.ai

---

**Built by [HappyHippo.ai](https://happyhippo.ai)**
