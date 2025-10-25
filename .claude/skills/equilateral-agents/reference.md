# EquilateralAgents - Quick Reference

## 22 Open Core Agents

### Infrastructure Core (3 agents)

| Agent | Location | Capabilities |
|-------|----------|--------------|
| **AgentClassifier** | `equilateral-core/infrastructure/AgentClassifier.js` | Task classification, intelligent routing, pattern learning |
| **AgentMemoryManager** | `equilateral-core/infrastructure/AgentMemoryManager.js` | Context storage, state management, cross-agent communication |
| **AgentFactoryAgent** | `equilateral-core/infrastructure/AgentFactoryAgent.js` | Dynamic agent generation, capability validation, registry management |

### Development Agents (6 agents)

| Agent | Location | Capabilities |
|-------|----------|--------------|
| **CodeAnalyzerAgent** | `agent-packs/development/CodeAnalyzerAgent.js` | Complexity analysis, code smell detection, metrics calculation |
| **CodeGeneratorAgent** | `agent-packs/development/CodeGeneratorAgent.js` | Template-based generation, pattern recognition, boilerplate automation |
| **TestOrchestrationAgent** | `agent-packs/development/TestOrchestrationAgent.js` | Multi-framework testing, parallel execution, coverage analysis |
| **DeploymentValidationAgent** | `agent-packs/development/DeploymentValidationAgent.js` | Health checks, configuration verification, rollback readiness |
| **TestAgent** | `agent-packs/development/TestAgent.js` | UI testing, element remapping, visual regression, accessibility |
| **UIUXSpecialistAgent** | `agent-packs/development/UIUXSpecialistAgent.js` | Design system compliance, WCAG validation, responsive checking |

### Quality Assurance Agents (5 agents)

| Agent | Location | Capabilities |
|-------|----------|--------------|
| **AuditorAgent** | `agent-packs/quality/AuditorAgent.js` | Standards enforcement, architecture compliance, quality scoring |
| **CodeReviewAgent** | `agent-packs/quality/CodeReviewAgent.js` | Best practice enforcement, technical debt identification, refactoring suggestions |
| **BackendAuditorAgent** | `agent-packs/quality/BackendAuditorAgent.js` | API design validation, Lambda optimization, serverless best practices |
| **FrontendAuditorAgent** | `agent-packs/quality/FrontendAuditorAgent.js` | Component validation, performance budgets, bundle size analysis |
| **TemplateValidationAgent** | `agent-packs/quality/TemplateValidationAgent.js` | IaC validation (SAM/CloudFormation/Terraform), cost estimation |

### Security Agents (4 agents)

| Agent | Location | Capabilities |
|-------|----------|--------------|
| **SecurityScannerAgent** | `agent-packs/security/SecurityScannerAgent.js` | Dependency scanning, OWASP Top 10, secret detection, license compliance |
| **SecurityReviewerAgent** | `agent-packs/security/SecurityReviewerAgent.js` | Security posture assessment, cost-aware recommendations, compliance checking |
| **SecurityVulnerabilityAgent** | `agent-packs/security/SecurityVulnerabilityAgent.js` | Vulnerability pattern detection, CVE matching, severity assessment |
| **ComplianceCheckAgent** | `agent-packs/security/ComplianceCheckAgent.js` | Standards compliance, regulatory validation, audit trail generation |

### Infrastructure Agents (4 agents)

| Agent | Location | Capabilities |
|-------|----------|--------------|
| **DeploymentAgent** | `agent-packs/infrastructure/DeploymentAgent.js` | Multi-environment deployment, health validation, rollback support |
| **ResourceOptimizationAgent** | `agent-packs/infrastructure/ResourceOptimizationAgent.js` | Resource utilization analysis, right-sizing, cost optimization |
| **ConfigurationManagementAgent** | `agent-packs/infrastructure/ConfigurationManagementAgent.js` | Configuration validation, secret management, drift detection |
| **MonitoringOrchestrationAgent** | `agent-packs/infrastructure/MonitoringOrchestrationAgent.js` | Monitoring automation, alert configuration, dashboard generation |

## Workflow Definitions

### Built-in Workflows

**code-review:**
- CodeAnalyzer → SecurityScanner → TestRunner
- Use for: Code quality gates, PR reviews

**deployment-check:**
- SecurityScanner → TestRunner → DeploymentValidator
- Use for: Pre-deployment validation

**quality-gate:**
- CodeFormatter → TestRunner → DocumentationGenerator
- Use for: CI/CD quality gates

### Custom Workflows (via commands)

**security-review:**
- Multi-layer security assessment
- Command: `/ea:security-review`
- Agents: SecurityScanner, SecurityReviewer, SecurityVulnerability, ComplianceCheck

**code-quality:**
- Comprehensive quality analysis with scoring
- Command: `/ea:code-quality`
- Agents: CodeReview, BackendAuditor, FrontendAuditor, Auditor

**deploy-feature:**
- Deployment validation with standards enforcement
- Command: `/ea:deploy-feature`
- Agents: DeploymentValidation, SecurityScanner, TestOrchestration, Deployment

**infrastructure-check:**
- IaC validation with cost estimation
- Command: `/ea:infrastructure-check`
- Agents: TemplateValidation, ConfigurationManagement, ResourceOptimization

**test-workflow:**
- Background test execution
- Command: `/ea:test-workflow`
- Agents: TestOrchestration, Test, UIUXSpecialist

## Common Task Patterns

### Execute a Workflow

```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const orchestrator = new AgentOrchestrator();

// Register required agents
orchestrator.registerAgent(new SecurityScannerAgent());

// Start and execute
await orchestrator.start();
const result = await orchestrator.executeWorkflow('security-review', {
    projectPath: './my-project'
});
```

### Execute Single Agent Task

```javascript
const result = await orchestrator.executeAgentTask(
    'security-scanner',
    'scan',
    { filePath: './src/app.js' }
);
```

### Background Execution

```javascript
const handle = await orchestrator.executeWorkflowBackground('test-workflow', {
    testSuite: 'integration'
});

// Check status later
const status = handle.getStatus();

// Get result (waits if still running)
const result = await handle.getResult();
```

## Enterprise Features Quick Reference

### Privacy & Compliance Suite (8 agents)
**Contact:** info@happyhippo.ai
- PrivacyImpactAgent (20 capabilities)
- DataSubjectRightsAgent (18 capabilities)
- ConsentManagementAgent (16 capabilities)
- DataMinimizationAgent (14 capabilities)
- EquilateralAITransferAgent (15 capabilities)
- BreachResponseAgent (17 capabilities)
- VendorPrivacyAgent (13 capabilities)
- PrivacyAuditAgent (19 capabilities)

**Use cases:** GDPR/CCPA compliance, DSR handling, PIA automation, consent management

### Enterprise Infrastructure Suite
**Contact:** info@happyhippo.ai
- ThreatModelingSecurityAgent
- ControlTowerAgent (multi-account governance)
- ControlTowerMasterAccountAgent
- EnhancedDeploymentAgent
- ComplianceOrchestrationAgent
- IncidentResponseOrchestrationAgent

**Use cases:** Multi-account AWS, SOC2/ISO27001, STRIDE threat modeling, enterprise deployments

### Advanced Intelligence Suite
**Contact:** info@happyhippo.ai
- CostIntelligenceAgent (ML-based predictions)
- PatternHarvestingAgent (cross-project synthesis)
- KnowledgeSynthesisAgent (temporal learning)
- AgentLearningOrchestrator

**Use cases:** ML cost predictions, pattern synthesis, predictive analytics, cross-repo learning

## File Locations

- **Core:** `equilateral-core/AgentOrchestrator.js`, `equilateral-core/BaseAgent.js`
- **Agent Packs:** `agent-packs/{category}/{AgentName}.js`
- **Workflow History:** `.equilateral/workflow-history.json`
- **Configuration:** `.equilateral/` (auto-created)

## Quick Links

- Full Agent Inventory: `AGENT_INVENTORY.md`
- Architecture Guide: `CLAUDE.md`
- License: `LICENSE` (MIT)
- Enterprise: info@happyhippo.ai
