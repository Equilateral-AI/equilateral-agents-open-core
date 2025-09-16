# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Architecture

EquilateralAgents is an event-driven multi-agent orchestration framework built on Node.js. The architecture consists of:

1. **AgentOrchestrator** (`equilateral-core/AgentOrchestrator.js`): Central coordinator that manages agent registration, workflow execution, and event routing. Executes agents sequentially and maintains workflow history in `.equilateral/workflow-history.json`.

2. **BaseAgent** (`equilateral-core/BaseAgent.js`): Abstract base class all agents inherit from. Provides common functionality like task validation, event emission, and orchestrator communication. Agents must implement `executeTask(task)` method.

3. **Agent Packs** (`agent-packs/`): Specialized agents organized by domain (development, security, infrastructure). Each agent extends BaseAgent and implements specific task types.

## Common Commands

```bash
# Install dependencies
npm install

# Run demos
npm start                    # Enhanced demo with all agents
npm run demo                 # Same as npm start
npm run demo:basic          # Basic demo
npm run wow                 # Test and analysis demo
npm run wow:form            # Smart form filler example
npm run playground          # Interactive playground

# Development
npm run dev                 # Run with nodemon for auto-reload
npm test                    # Run tests with Jest

# Agent CLI
npm run agents              # Launch orchestrator CLI
```

## Key Patterns

### Creating a New Agent

Agents extend BaseAgent and must implement `executeTask()`:

```javascript
const BaseAgent = require('../../equilateral-core/BaseAgent');

class MyAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            agentId: 'my-agent',
            agentType: 'development',
            capabilities: ['task1', 'task2'],
            ...config
        });
    }

    async executeTask(task) {
        this.validateTask(task);
        task.startTime = Date.now();

        try {
            let result;
            switch (task.taskType) {
                case 'task1':
                    result = await this.doTask1(task.taskData);
                    break;
                default:
                    throw new Error(`Unknown task type: ${task.taskType}`);
            }

            this.reportTaskComplete(task, result);
            return result;
        } catch (error) {
            this.reportTaskError(task, error);
            throw error;
        }
    }
}
```

### Using the Orchestrator

```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const orchestrator = new AgentOrchestrator();

// Register agents
orchestrator.registerAgent(new CodeAnalyzerAgent());

// Start orchestrator
await orchestrator.start();

// Execute workflow
const result = await orchestrator.executeWorkflow('code-review', {
    projectPath: './my-project'
});

// Or execute single task
const taskResult = await orchestrator.executeAgentTask(
    'code-analyzer',
    'analyze',
    { filePath: './src/app.js' }
);
```

## Workflow System

Workflows are defined in `AgentOrchestrator.getWorkflowDefinition()` and execute agents sequentially:

- `code-review`: Runs code-analyzer → security-scanner → test-runner
- `deployment-check`: Runs security scan → tests → deployment validation
- `quality-gate`: Runs formatter → tests → documentation

## Event System

The framework uses EventEmitter for communication. Key events:

- Orchestrator: `workflowStarted`, `workflowCompleted`, `workflowFailed`, `taskCompleted`
- Agents: `agentStarted`, `agentStopped`, `taskComplete`, `taskError`

## Environment Variables

Optional configuration via environment variables:

- `PROJECT_PATH`: Default project path for workflows
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`: For AWS-integrated agents
- `GITHUB_TOKEN`: For GitHub integration features