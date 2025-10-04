# EquilateralAgents Open Core

**22 production-ready AI agents. Zero config. MIT licensed.**

Transform your AI coding assistant into a coordinated development team. Works with Claude Code, Cursor, Continue, Windsurf, or standalone.

[![npm version](https://badge.fury.io/js/equilateral-agents-open-core.svg)](https://www.npmjs.com/package/equilateral-agents-open-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

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

This project uses **[EquilateralAgents Open Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards)**:

### Core Principles
- **No mocks** in production code (fail fast, fail loud)
- **Error-first design** (design errors before happy paths)
- **Cost-conscious infrastructure** (estimate before deploying)
- **Explicit over implicit** (obvious code beats clever code)

### Add to Your Project
```bash
git submodule add https://github.com/JamesFord-HappyHippo/EquilateralAgents-Open-Standards.git .standards
```

### Configure Your AI Assistant
Create `.cursorrules` or `CLAUDE.md`:

```markdown
# Project Standards: ./.standards/

## Critical Rules
- No mocks/fallbacks in production code
- Design error states before happy paths
- Check standards before code changes
- Fail fast, fail loud

## Before Every Change
1. Check .standards/ for existing patterns
2. Follow established conventions
3. Design error handling first

See .standards/ for complete documentation.
```

Full integration guide: [docs/STANDARDS_INTEGRATION.md](docs/STANDARDS_INTEGRATION.md)

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
