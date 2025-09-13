# EquilateralAgents™ Open Core

**Simple event-driven agent orchestration for development teams**

Build intelligent automation workflows using specialized agents that handle code analysis, testing, deployment validation, and more.

---

## ✨ What is EquilateralAgents?

EquilateralAgents provides a lightweight framework for coordinating AI-powered agents in your development workflow. Each agent specializes in a specific task, and the orchestrator combines them into powerful automation workflows.

**Key Features:**
- 🤖 **Specialized Agents** - Code analysis, security scanning, test orchestration
- 🔄 **Simple Workflows** - Sequential task execution with event notifications
- 📝 **File-Based History** - JSON-based workflow tracking, no database required
- 🔌 **Extensible** - Easy to add custom agents for your specific needs
- 🚀 **Zero Configuration** - Works immediately with sensible defaults

---

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

- **CI/CD Integration** - Add intelligent checks to your pipeline
- **Code Quality Gates** - Automated code review and standards enforcement
- **Security Scanning** - Continuous vulnerability detection
- **Deployment Validation** - Pre-flight checks before production
- **Development Automation** - Automate repetitive development tasks

---

## 🚀 Commercial Features

**Need enterprise features?** The commercial edition includes:
- Advanced multi-agent coordination with dependency management
- Database-backed persistence and multi-tenancy
- 60+ specialized agents with ML-powered intelligence
- Enterprise integrations (LDAP, SAML, compliance frameworks)
- Professional support and SLAs

Learn more at [equilateral.ai/commercial](https://equilateral.ai/commercial)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

**Trademarks:** EquilateralAgents™ and Equilateral AI™ are trademarks of HappyHippo.ai.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

---

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Agent Development Guide](./docs/AGENT-DEVELOPMENT.md)
- [API Reference](./docs/API.md)

---

**Built with ❤️ by HappyHippo.ai**