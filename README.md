# EquilateralAgents™ Open Core v1.0.2

[![npm version](https://badge.fury.io/js/equilateral-agents-open-core.svg)](https://www.npmjs.com/package/equilateral-agents-open-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![GitHub release](https://img.shields.io/github/release/happyhippo-ai/equilateral-agents-open-core.svg)](https://github.com/happyhippo-ai/equilateral-agents-open-core/releases)
[![Build Status](https://github.com/happyhippo-ai/equilateral-agents-open-core/workflows/EquilateralAgents%20Code%20Review/badge.svg)](https://github.com/happyhippo-ai/equilateral-agents-open-core/actions)
[![Downloads](https://img.shields.io/npm/dm/equilateral-agents-open-core.svg)](https://www.npmjs.com/package/equilateral-agents-open-core)

**The Force Multiplier for Your AI Development Tools**

Transform your AI coding assistants into a coordinated development team. EquilateralAgents provides the orchestration layer that makes Claude Code, Cursor, Copilot, and other AI tools work together intelligently.

**Developer-friendly automation framework. MIT licensed.**

---

## ✨ What is EquilateralAgents?

EquilateralAgents is a practical framework for coordinating intelligent agents in your development workflow. **It amplifies your existing AI tools** rather than replacing them.

### 🚀 The Force Multiplier Pattern

```
Your AI Assistant + EquilateralAgents = Automated Development Team
```

- **With Claude Code/Cursor**: Agents provide structured analysis → AI generates fixes → Agents validate
- **With Your LLM API**: Bring your OpenAI/Anthropic key → Agents become AI-enhanced
- **Without AI**: Still works for basic automation and CI/CD pipelines

**This Open Source Version:**
- ✅ **Fully Functional** - Not a demo, actually works for real projects
- ✅ **AI-Ready** - Works with any LLM (OpenAI, Claude, local models)
- ✅ **MIT Licensed** - Use commercially, modify freely, no strings attached
- ✅ **Self-Contained** - No cloud dependencies, runs entirely locally
- ✅ **Extensible** - Build your own agents, integrate your tools

**What Makes It Different:**
- 🧠 **Amplifies Intelligence** - Makes your AI tools smarter through orchestration
- 🔧 **Solves Real Problems** - Test failures, code analysis, deployments
- 📚 **Learn From Us** - See how we build agents, use our patterns
- 🤝 **BYOL Friendly** - Use your existing AI subscriptions
- 🚫 **No Vendor Lock-in** - Standard Node.js, works with any AI

---

## 🎯 AI Integration Options

### Option 1: Run in Your AI Assistant (Recommended)
```bash
# In Claude Code, Cursor, Continue, Windsurf, etc:
npm install
npm run wow  # Watch the magic happen
```

### Option 2: Bring Your Own LLM
```bash
# .env file
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Run with AI enhancement
npm run ai-demo
```

### Option 3: Basic Automation (No AI)
```bash
npm install
npm start  # Works without any AI configuration
```

## 🚀 Quick Start

### Install
```bash
git clone https://github.com/happyhippo-ai/equilateral-agents-open-core.git
cd equilateral-agents-open-core
npm install
```

### Basic Usage
```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');

// Create orchestrator
const orchestrator = new AgentOrchestrator();

// Register agents
const analyzer = new CodeAnalyzerAgent();
orchestrator.registerAgent(analyzer);

// Start orchestrator
await orchestrator.start();

// Execute a workflow
const result = await orchestrator.executeWorkflow('code-review', {
    projectPath: './my-project'
});

console.log('Workflow completed:', result);
```

---

## 🤖 Available Agents

### Development Agents
- **CodeAnalyzerAgent** - Static code analysis and metrics
- **TestOrchestrationAgent** - Test execution and reporting
- **DeploymentValidationAgent** - Pre-deployment checks

### Security Agents
- **SecurityScannerAgent** - Vulnerability scanning
- **ComplianceCheckAgent** - Standards compliance validation

### Infrastructure Agents
- **ResourceOptimizationAgent** - Cloud resource analysis
- **DeploymentAgent** - Deployment automation

---

## 🔄 Workflow Examples

### Code Review Workflow
```javascript
// Analyzes code, scans for security issues, runs tests
await orchestrator.executeWorkflow('code-review');
```

### Deployment Check Workflow
```javascript
// Validates deployment readiness
await orchestrator.executeWorkflow('deployment-check');
```

### Custom Workflow
```javascript
// Define your own workflow
orchestrator.getWorkflowDefinition = (type) => {
    if (type === 'my-workflow') {
        return {
            tasks: [
                { agentId: 'code-analyzer', taskType: 'analyze' },
                { agentId: 'test-runner', taskType: 'test' }
            ]
        };
    }
};

await orchestrator.executeWorkflow('my-workflow');
```

---

## 🛠️ Creating Custom Agents

```javascript
const BaseAgent = require('./equilateral-core/BaseAgent');

class MyCustomAgent extends BaseAgent {
    constructor() {
        super({
            agentId: 'my-agent',
            capabilities: ['task1', 'task2']
        });
    }

    async executeTask(task) {
        switch (task.taskType) {
            case 'task1':
                // Your task logic here
                return { success: true, data: 'result' };
            default:
                throw new Error(`Unknown task: ${task.taskType}`);
        }
    }
}
```

---

## 📁 Project Structure

```
equilateral-agents/
├── equilateral-core/       # Core orchestration framework
│   ├── AgentOrchestrator.js
│   └── BaseAgent.js
├── agent-packs/            # Specialized agents
│   ├── development/
│   ├── security/
│   └── infrastructure/
└── examples/               # Usage examples
```

---

## 🤖 AI Enhancement

EquilateralAgents becomes more powerful when combined with AI:

```javascript
// Enable AI for any agent
const agent = new CodeAnalyzerAgent({
  enableAI: true,  // Uses your configured LLM
  ai: {
    capabilities: ['explain_complexity', 'suggest_refactors'],
    temperature: 0.3
  }
});
```

See [AI-INTEGRATION.md](./AI-INTEGRATION.md) for detailed configuration.

---

## 🔑 Configuration

### Environment Variables
```bash
# Optional: Configure project path
export PROJECT_PATH=/path/to/your/project

# Optional: AWS credentials for cloud agents
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1

# Optional: API keys for enhanced features
export GITHUB_TOKEN=your_token
```

### Workflow History
Workflow history is automatically saved to `.equilateral/workflow-history.json` in your project directory.

---

## 🎯 Use Cases

### With AI Enhancement
- **Automatic Test Repair** - AI fixes failing tests based on agent analysis
- **Intelligent Code Review** - AI explains issues and generates fixes
- **Smart Deployments** - AI makes go/no-go decisions based on validations
- **Refactoring Assistant** - AI suggests and implements improvements

### Without AI (Basic Automation)
- **CI/CD Integration** - Add structured checks to your pipeline
- **Code Quality Gates** - Automated standards enforcement
- **Security Scanning** - Continuous vulnerability detection
- **Deployment Validation** - Pre-flight checks before production

---

## 🚀 Commercial Features

**Need enterprise features?** The commercial edition includes:

### Built-in Intelligence (No API Keys Required)
- ✨ Embedded AI models - no external dependencies
- ✨ Optimized routing to appropriate models per task
- ✨ Cost-effective model selection
- ✨ Fine-tuned models for specific workflows

### Enterprise Scale
- ⚡ Multi-repository orchestration
- ⚡ Advanced coordination strategies
- ⚡ Production-ready persistence
- ⚡ Team collaboration features

### Professional Support
- 📞 Priority support and SLAs
- 🎓 Training and best practices
- 🔧 Custom agent development
- 🏢 Enterprise integrations

Learn more at [equilateral.ai/commercial](https://equilateral.ai/commercial)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

**Trademarks:** EquilateralAgents™ and Equilateral AI™ are trademarks of HappyHippo.ai.

**Built with ❤️ by HappyHippo.ai**