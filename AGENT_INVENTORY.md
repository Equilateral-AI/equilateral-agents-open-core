# EquilateralAgents Open Core - Agent Inventory

**Version:** 2.0.0 (Expanded Teaching Toolkit)
**Total Agents:** 22
**Last Updated:** 2025-10-01

---

## Philosophy: The Teaching Toolkit

This open-core distribution includes **22 production-ready agents** that teach developers how to build quality software systems. These agents demonstrate:

- ✅ **How to structure code reviews** - Enforce standards programmatically
- ✅ **How to validate templates** - Reusable validation patterns
- ✅ **How to catch security issues** - Common vulnerability detection
- ✅ **How to monitor systems** - Observability best practices
- ✅ **How to orchestrate agents** - Multi-agent coordination patterns

**What stays proprietary (40+ agents):**
- ADGPO compliance suite (specialized domain expertise)
- Pattern harvesting & knowledge synthesis (learning engines)
- Cost intelligence with ML (hard-won optimization)
- Patent/IP agents (specialized knowledge)
- Integration specialists (client-specific)
- Advanced security (threat modeling, penetration testing)

---

## Infrastructure Core (3 agents)

### 1. AgentClassifier
**Location:** `equilateral-core/infrastructure/AgentClassifier.js`
**Purpose:** Task classification and intelligent routing
**Key Capabilities:**
- Analyze task complexity
- Route to optimal specialist agent
- Learn from task outcomes
- Optimize routing patterns

**Teaching Value:** Shows how to build intelligent routing systems that learn which agent handles which task type best.

---

### 2. AgentMemoryManager
**Location:** `equilateral-core/infrastructure/AgentMemoryManager.js`
**Purpose:** Context and state management across agents
**Key Capabilities:**
- Store/retrieve agent context
- Manage workflow state
- Share context between agents
- Memory optimization

**Teaching Value:** Demonstrates how to manage state in multi-agent systems without memory contamination.

---

### 3. AgentFactoryAgent
**Location:** `equilateral-core/infrastructure/AgentFactoryAgent.js`
**Purpose:** Self-bootstrapping agent generation
**Key Capabilities:**
- Generate new agents dynamically
- Validate agent capabilities
- Test and deploy agents
- Registry management

**Teaching Value:** Shows how agents can create other agents - meta-orchestration patterns.

---

## Development Agents (6 agents)

### 4. CodeAnalyzerAgent
**Location:** `agent-packs/development/CodeAnalyzerAgent.js`
**Purpose:** Static code analysis and metrics
**Key Capabilities:**
- Complexity analysis
- Code smell detection
- Metrics calculation
- Dependency analysis

**Teaching Value:** Pattern-based code analysis techniques.

---

### 5. CodeGeneratorAgent
**Location:** `agent-packs/development/CodeGeneratorAgent.js`
**Purpose:** Pattern-based code generation
**Key Capabilities:**
- Template-based generation
- Pattern recognition
- Boilerplate automation
- Framework-specific generation

**Teaching Value:** Shows how to build code generators that learn from patterns rather than fixed templates.

---

### 6. TestOrchestrationAgent
**Location:** `agent-packs/development/TestOrchestrationAgent.js`
**Purpose:** Test execution and reporting
**Key Capabilities:**
- Multi-framework test execution
- Parallel test running
- Coverage analysis
- Failure reporting

**Teaching Value:** Demonstrates test orchestration across different testing frameworks.

---

### 7. DeploymentValidationAgent
**Location:** `agent-packs/development/DeploymentValidationAgent.js`
**Purpose:** Pre-deployment validation checks
**Key Capabilities:**
- Health check validation
- Configuration verification
- Dependency checking
- Rollback readiness

**Teaching Value:** Pre-flight check patterns before deployments.

---

### 8. TestAgent
**Location:** `agent-packs/development/TestAgent.js`
**Purpose:** UI testing with intelligent element remapping
**Key Capabilities:**
- Automated UI testing
- Element remapping when UI changes
- Visual regression detection
- Accessibility testing

**Teaching Value:** Shows how to build resilient UI tests that adapt to changes.

---

### 9. UIUXSpecialistAgent
**Location:** `agent-packs/development/UIUXSpecialistAgent.js`
**Purpose:** Design consistency and accessibility automation
**Key Capabilities:**
- Design system compliance
- WCAG accessibility validation
- Component usage analysis
- Responsive design checking

**Teaching Value:** Automated design quality enforcement patterns.

---

## Quality Assurance Agents (5 agents)

### 10. AuditorAgent
**Location:** `agent-packs/quality/AuditorAgent.js`
**Purpose:** Standards compliance validation
**Key Capabilities:**
- Code standards enforcement
- Architecture compliance
- Pattern validation
- Quality scoring

**Teaching Value:** Shows how to programmatically enforce coding standards and architectural patterns.

---

### 11. CodeReviewAgent
**Location:** `agent-packs/quality/CodeReviewAgent.js`
**Purpose:** Automated code review with best practices
**Key Capabilities:**
- Best practice enforcement
- Code review comments
- Technical debt identification
- Refactoring suggestions

**Teaching Value:** Demonstrates how to structure automated code reviews that teach best practices.

---

### 12. BackendAuditorAgent
**Location:** `agent-packs/quality/BackendAuditorAgent.js`
**Purpose:** Backend-specific standards enforcement
**Key Capabilities:**
- API design validation
- Database pattern checking
- Lambda optimization
- Serverless best practices

**Teaching Value:** Backend-specific quality patterns (Lambda, API Gateway, database patterns).

---

### 13. FrontendAuditorAgent
**Location:** `agent-packs/quality/FrontendAuditorAgent.js`
**Purpose:** Frontend-specific standards enforcement
**Key Capabilities:**
- Component structure validation
- Performance budget enforcement
- Bundle size analysis
- Framework best practices

**Teaching Value:** Frontend-specific quality patterns (React, component design, performance).

---

### 14. TemplateValidationAgent
**Location:** `agent-packs/quality/TemplateValidationAgent.js`
**Purpose:** Infrastructure-as-Code template validation
**Key Capabilities:**
- SAM/CloudFormation validation
- Terraform checking
- Cost estimation
- Security configuration review

**Teaching Value:** Reusable validation patterns for IaC templates.

---

## Security Agents (4 agents)

### 15. SecurityScannerAgent
**Location:** `agent-packs/security/SecurityScannerAgent.js`
**Purpose:** Vulnerability scanning
**Key Capabilities:**
- Dependency vulnerability scanning
- OWASP Top 10 detection
- Secret detection
- License compliance

**Teaching Value:** Common security scanning patterns.

---

### 16. SecurityReviewerAgent
**Location:** `agent-packs/security/SecurityReviewerAgent.js`
**Purpose:** Security analysis with cost controls
**Key Capabilities:**
- Security posture assessment
- Infrastructure security validation
- Cost-aware security recommendations
- Compliance checking

**Teaching Value:** Shows how to balance security with cost considerations.

---

### 17. SecurityVulnerabilityAgent
**Location:** `agent-packs/security/SecurityVulnerabilityAgent.js`
**Purpose:** Common security issue detection
**Key Capabilities:**
- Known vulnerability patterns
- Security anti-patterns
- CVE matching
- Severity assessment

**Teaching Value:** Teaches common security vulnerabilities and how to detect them programmatically.

---

### 18. ComplianceCheckAgent
**Location:** `agent-packs/security/ComplianceCheckAgent.js`
**Purpose:** Basic compliance validation
**Key Capabilities:**
- Standards compliance checking
- Regulatory requirement validation
- Audit trail generation
- Policy enforcement

**Teaching Value:** Basic compliance automation patterns (not specialized GDPR/CCPA - that's paid tier).

---

## Infrastructure Agents (4 agents)

### 19. DeploymentAgent
**Location:** `agent-packs/infrastructure/DeploymentAgent.js`
**Purpose:** Deployment automation
**Key Capabilities:**
- Multi-environment deployment
- Health validation
- Basic rollback support
- Deployment history

**Teaching Value:** Basic deployment patterns (not multi-account AWS - that's paid tier).

---

### 20. ResourceOptimizationAgent
**Location:** `agent-packs/infrastructure/ResourceOptimizationAgent.js`
**Purpose:** Cloud resource analysis
**Key Capabilities:**
- Resource utilization analysis
- Right-sizing recommendations
- Cost optimization (basic)
- Waste identification

**Teaching Value:** Basic resource optimization patterns (not ML-based predictions - that's paid tier).

---

### 21. ConfigurationManagementAgent
**Location:** `agent-packs/infrastructure/ConfigurationManagementAgent.js`
**Purpose:** Infrastructure-as-Code configuration patterns
**Key Capabilities:**
- Configuration validation
- Secret management patterns
- Environment parity checking
- Configuration drift detection

**Teaching Value:** Shows how to manage infrastructure configuration programmatically.

---

### 22. MonitoringOrchestrationAgent
**Location:** `agent-packs/infrastructure/MonitoringOrchestrationAgent.js`
**Purpose:** Observability best practices
**Key Capabilities:**
- Monitoring setup automation
- Alert configuration
- Dashboard generation
- Metrics collection patterns

**Teaching Value:** Demonstrates how to set up comprehensive observability from the start.

---

## Enterprise Features Available

### Privacy & Compliance Suite (ADGPO - 8 agents)
**When You Need This:**
- GDPR/CCPA compliance required
- Data subject rights requests (DSR)
- Privacy impact assessments (PIA)
- Consent management across systems
- Cross-border data transfer compliance

**Includes:**
- PrivacyImpactAgent (20 capabilities)
- DataSubjectRightsAgent (18 capabilities)
- ConsentManagementAgent (16 capabilities)
- DataMinimizationAgent (14 capabilities)
- EquilateralAITransferAgent (15 capabilities)
- BreachResponseAgent (17 capabilities)
- VendorPrivacyAgent (13 capabilities)
- PrivacyAuditAgent (19 capabilities)

**Interested?** Contact info@happyhippo.ai

---

### Enterprise Infrastructure Suite
**When You Need This:**
- Multi-account AWS deployments
- SOC2/ISO27001 compliance
- Advanced threat modeling (STRIDE)
- Enterprise-scale deployments
- Blue-green/canary deployments

**Includes:**
- ThreatModelingSecurityAgent
- ControlTowerAgent (multi-account governance)
- ControlTowerMasterAccountAgent
- EnhancedDeploymentAgent
- ComplianceOrchestrationAgent
- IncidentResponseOrchestrationAgent
- TestingOrchestrationAgent

**Interested?** Contact info@happyhippo.ai

---

### Advanced Intelligence Suite
**When You Need This:**
- ML-based cost predictions
- Cross-project learning
- Predictive analytics
- Pattern synthesis across repositories
- Temporal knowledge accumulation

**Includes:**
- CostIntelligenceAgent (ML-based predictions)
- PatternHarvestingAgent (cross-project synthesis)
- KnowledgeSynthesisAgent (temporal learning)
- AgentLearningOrchestrator
- Predictive analytics engine
- Custom agent training

**Interested?** Contact info@happyhippo.ai

---

### Platform Features
**When You Need This:**
- Building 10+ integrations
- Multi-tenant SaaS architecture
- Agent marketplace access
- Custom agent development at scale
- Team collaboration features

**Includes:**
- Unlimited integration agents
- Multi-tenant architecture support
- Agent marketplace access
- Custom agent development tools
- Priority support and SLAs

**Interested?** Contact info@happyhippo.ai

---

### Specialized Domain Agents
**When You Need This:**
- Industry-specific compliance (HIPAA, PCI-DSS, SOX)
- Financial services requirements
- Healthcare regulations
- Government contracts

**Available:**
- FinancialComplianceAgent
- HealthcareComplianceAgent (HIPAA)
- PCI-DSS ComplianceAgent
- Government compliance agents
- Industry-specific code generators

**Interested?** Contact info@happyhippo.ai

---

## When to Consider Enterprise Features

You might benefit from our enterprise features if you're experiencing:

**Privacy & Compliance Needs:**
- Working with GDPR, CCPA, or privacy regulations
- Handling data subject rights requests
- Processing personal data at scale
- Operating in multiple jurisdictions

**Infrastructure at Scale:**
- Managing multiple AWS accounts
- Deploying to production frequently
- Working with large development teams
- Multi-region deployments

**Advanced Optimization:**
- Managing multiple repositories
- Looking for pattern reuse opportunities
- Seeking cost optimization insights
- Need for predictive analytics

**Platform Requirements:**
- Building multiple integrations
- Developing custom agents
- Multi-tenant architecture
- Team collaboration needs

**Questions?** Reach out to info@happyhippo.ai to discuss your specific needs.

---

## What Makes This Distribution Valuable

### 1. Complete Development Toolkit
These 22 agents cover the **entire SDLC:**
- Code analysis & generation
- Testing & quality assurance
- Security scanning
- Deployment automation
- Monitoring & observability

### 2. Educational Value
Every agent teaches **how to build quality:**
- **CodeReviewAgent** shows how to structure reviews
- **BackendAuditorAgent** teaches Lambda patterns
- **SecurityVulnerabilityAgent** explains common CVEs
- **MonitoringOrchestrationAgent** demonstrates observability

### 3. Production-Ready Patterns
Not demos - **real production code:**
- Used in our own systems
- Battle-tested patterns
- Full error handling
- Comprehensive logging

### 4. Clear Path to Enterprise Features
When you need **specialized expertise**, enterprise features are available:
- Privacy compliance needs → Privacy & Compliance Suite
- Enterprise scale → Infrastructure Suite
- Advanced optimization → Intelligence Suite
- Integration platform → Platform Features

**Questions about enterprise features?** Contact info@happyhippo.ai

---

## Getting Started

```bash
# Install
npm install equilateral-agents-open-core

# List all agents
npm run agents list

# Run a demo workflow
npm run wow

# Execute security review
npm run agents execute security-review ./my-project
```

For detailed documentation on each agent, see the individual agent files or visit our [documentation](https://docs.equilateral.ai).

---

**Built with ❤️ by HappyHippo.ai**
**Learn More:** [equilateral.ai](https://equilateral.ai)
**Enterprise:** [equilateral.ai/enterprise](https://equilateral.ai/enterprise)
