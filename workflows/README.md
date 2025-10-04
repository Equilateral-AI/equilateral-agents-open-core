# EquilateralAgents Workflows

Production-ready workflows that coordinate multiple agents to solve complex development tasks.

## Available Workflows

### 1. Security Review Workflow
**File:** `security-review-workflow.js`
**Purpose:** Comprehensive security assessment with multiple security layers

**Agents Used:**
- SecurityScannerAgent (vulnerability scanning)
- SecurityReviewerAgent (security posture)
- SecurityVulnerabilityAgent (known vulnerabilities)
- ComplianceCheckAgent (standards compliance)

**Use Cases:**
- Pre-deployment security validation
- Security audit automation
- Continuous security monitoring
- Compliance verification

**Example:**
```javascript
const SecurityReviewWorkflow = require('./workflows/security-review-workflow');
const workflow = new SecurityReviewWorkflow(orchestrator);

const results = await workflow.execute({
    projectPath: './my-project',
    severity: 'high',
    includeCompliance: true,
    parallelExecution: true
});
```

---

### 2. Code Quality Workflow
**File:** `code-quality-workflow.js`
**Purpose:** Multi-layer code quality assessment and standards enforcement

**Agents Used:**
- CodeAnalyzerAgent (static analysis)
- CodeReviewAgent (best practices)
- BackendAuditorAgent (backend standards)
- FrontendAuditorAgent (frontend standards)
- AuditorAgent (overall compliance)

**Use Cases:**
- Pre-commit quality gates
- Code review automation
- Technical debt assessment
- Standards enforcement

**Example:**
```javascript
const CodeQualityWorkflow = require('./workflows/code-quality-workflow');
const workflow = new CodeQualityWorkflow(orchestrator);

const results = await workflow.execute({
    projectPath: './my-project',
    failOnQualityScore: 70,
    checkBackend: true,
    checkFrontend: true,
    generateReport: true
});

console.log(`Quality Score: ${results.qualityScore}/100`);
console.log(`Status: ${results.passed ? 'PASSED' : 'FAILED'}`);
```

---

### 3. Deployment Pipeline Workflow
**File:** `deployment-pipeline-workflow.js`
**Purpose:** Complete pre-deployment validation and automated deployment

**Agents Used:**
- TemplateValidationAgent (IaC validation)
- SecurityReviewerAgent (security checks)
- DeploymentValidationAgent (pre-flight checks)
- DeploymentAgent (deployment execution)
- MonitoringOrchestrationAgent (post-deployment monitoring)

**Use Cases:**
- CI/CD pipeline automation
- Blue-green deployments
- Canary releases
- Production deployments with gates

**Example:**
```javascript
const DeploymentPipelineWorkflow = require('./workflows/deployment-pipeline-workflow');
const workflow = new DeploymentPipelineWorkflow(orchestrator);

const results = await workflow.execute({
    projectPath: './my-project',
    environment: 'production',
    templatePath: './template.yaml',
    autoRollback: true,
    setupMonitoring: true
});

if (results.success) {
    console.log(`Deployed: ${results.deployment.deploymentId}`);
}
```

---

### 4. Full-Stack Development Workflow
**File:** `full-stack-development-workflow.js`
**Purpose:** End-to-end development from code generation to quality validation

**Agents Used:**
- CodeGeneratorAgent (code generation)
- TestAgent (UI testing)
- TestOrchestrationAgent (test execution)
- CodeReviewAgent (quality review)
- BackendAuditorAgent (backend validation)
- FrontendAuditorAgent (frontend validation)
- UIUXSpecialistAgent (design consistency)

**Use Cases:**
- Feature development automation
- Test-driven development
- Full-stack code generation
- Design system enforcement

**Example:**
```javascript
const FullStackWorkflow = require('./workflows/full-stack-development-workflow');
const workflow = new FullStackWorkflow(orchestrator);

const results = await workflow.execute({
    projectPath: './my-project',
    featureSpec: {
        feature: 'user-authentication',
        type: 'REST API + React UI',
        requirements: ['JWT auth', 'password reset', 'OAuth']
    },
    generateCode: true,
    runTests: true,
    validateQuality: true,
    checkDesign: true
});

console.log(`Quality Score: ${results.qualityScore}/100`);
console.log(`Generated: ${results.generatedFiles.length} files`);
console.log(`Tests: ${results.phases.testing.passedTests}/${results.phases.testing.totalTests} passed`);
```

---

### 5. Infrastructure Validation Workflow
**File:** `infrastructure-validation-workflow.js`
**Purpose:** Comprehensive infrastructure-as-code validation and optimization

**Agents Used:**
- TemplateValidationAgent (IaC validation)
- ConfigurationManagementAgent (config validation)
- ResourceOptimizationAgent (cost optimization)
- SecurityReviewerAgent (infrastructure security)
- MonitoringOrchestrationAgent (observability setup)

**Use Cases:**
- Infrastructure cost optimization
- Security configuration validation
- IaC template validation
- Observability automation

**Example:**
```javascript
const InfrastructureWorkflow = require('./workflows/infrastructure-validation-workflow');
const workflow = new InfrastructureWorkflow(orchestrator);

const results = await workflow.execute({
    projectPath: './my-project',
    templatePath: './infrastructure/template.yaml',
    validateCosts: true,
    optimizeResources: true,
    setupMonitoring: false
});

console.log(`Estimated Cost: $${results.validation.costs.estimatedMonthlyCost}/month`);
console.log(`Potential Savings: $${results.validation.optimization.potentialSavings}/month`);
console.log(`Recommendations: ${results.recommendations.length}`);
```

---

## Creating Custom Workflows

You can create your own workflows by extending the base pattern:

```javascript
class MyCustomWorkflow {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.workflowName = 'my-custom-workflow';
    }

    async execute(options = {}) {
        const results = {
            workflowName: this.workflowName,
            startTime: new Date(),
            success: false
        };

        try {
            // Step 1: Execute first agent task
            const step1 = await this.orchestrator.executeAgentTask(
                'agent-id',
                'task-type',
                { /* task data */ }
            );

            // Step 2: Execute second agent task
            const step2 = await this.orchestrator.executeAgentTask(
                'another-agent',
                'task-type',
                { /* task data */ }
            );

            // Combine results
            results.success = true;
            results.endTime = new Date();
            return results;

        } catch (error) {
            results.error = error.message;
            return results;
        }
    }
}

module.exports = MyCustomWorkflow;
```

---

## Workflow Patterns

### Sequential Execution
Run agents one after another:
```javascript
const result1 = await orchestrator.executeAgentTask('agent1', 'task', data);
const result2 = await orchestrator.executeAgentTask('agent2', 'task', data);
const result3 = await orchestrator.executeAgentTask('agent3', 'task', data);
```

### Parallel Execution
Run multiple agents simultaneously:
```javascript
const [result1, result2, result3] = await Promise.all([
    orchestrator.executeAgentTask('agent1', 'task', data),
    orchestrator.executeAgentTask('agent2', 'task', data),
    orchestrator.executeAgentTask('agent3', 'task', data)
]);
```

### Gate Pattern
Stop workflow if a condition fails:
```javascript
const validation = await orchestrator.executeAgentTask('validator', 'validate', data);
if (!validation.passed) {
    throw new Error('Validation failed - workflow blocked');
}
// Continue with next steps...
```

### Background Execution
Run workflow in background:
```javascript
const { workerId, monitor, cancel } = await orchestrator.executeWorkflowBackground(
    'my-workflow',
    { /* options */ }
);

// Check progress later
const progress = await monitor();
console.log(`Progress: ${progress.percentComplete}%`);
```

---

## Best Practices

### 1. Error Handling
Always wrap workflow steps in try-catch:
```javascript
try {
    const result = await orchestrator.executeAgentTask(...);
} catch (error) {
    console.error('Step failed:', error.message);
    results.error = error.message;
    results.success = false;
    return results;
}
```

### 2. Progress Reporting
Keep users informed of workflow progress:
```javascript
console.log('🔄 Step 1: Analyzing code...');
const analysis = await orchestrator.executeAgentTask(...);
console.log('✅ Step 1 complete');
```

### 3. Result Aggregation
Collect all agent results for summary:
```javascript
const results = {
    findings: [],
    metrics: {},
    summary: {}
};

results.findings.push(...step1Results.findings);
results.findings.push(...step2Results.findings);
results.summary = this.summarize(results);
```

### 4. Flexible Options
Make workflows configurable:
```javascript
async execute(options = {}) {
    const {
        skipValidation = false,
        parallelExecution = true,
        generateReport = true
    } = options;

    // Use options to control behavior
}
```

---

## Workflow Composition

Combine workflows for complex scenarios:

```javascript
// Run security review before deployment
const securityWorkflow = new SecurityReviewWorkflow(orchestrator);
const securityResults = await securityWorkflow.execute({ severity: 'high' });

if (securityResults.summary.actionRequired) {
    throw new Error('Security issues must be resolved before deployment');
}

// Security passed - proceed with deployment
const deploymentWorkflow = new DeploymentPipelineWorkflow(orchestrator);
const deploymentResults = await deploymentWorkflow.execute({
    environment: 'production'
});
```

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Quality Gate
on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install equilateral-agents-open-core
      - run: |
          node -e "
          const orchestrator = new AgentOrchestrator();
          const workflow = new CodeQualityWorkflow(orchestrator);
          const results = await workflow.execute({ failOnQualityScore: 70 });
          if (!results.passed) process.exit(1);
          "
```

---

## Enterprise Workflow Features

Advanced workflow capabilities are available for enterprise needs:

**Enterprise features include:**
- Multi-repository workflows
- Cross-project coordination
- Temporal learning workflows
- Advanced orchestration patterns
- Custom workflow builder UI
- Workflow analytics and optimization

**Interested in enterprise workflows?** Contact info@happyhippo.ai

---

**Built with ❤️ by HappyHippo.ai**
