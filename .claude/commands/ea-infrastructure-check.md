# Infrastructure Validation Workflow

Execute Infrastructure-as-Code (IaC) validation with cost estimation and configuration checks.

## What This Workflow Does

Validates infrastructure configuration:
- IaC template validation (TemplateValidationAgent)
- Configuration management (ConfigurationManagementAgent)
- Resource optimization (ResourceOptimizationAgent)
- Monitoring setup (MonitoringOrchestrationAgent)

## Implementation Steps

1. **Import Required Modules:**
   ```javascript
   const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
   const TemplateValidationAgent = require('./agent-packs/quality/TemplateValidationAgent');
   const ConfigurationManagementAgent = require('./agent-packs/infrastructure/ConfigurationManagementAgent');
   const ResourceOptimizationAgent = require('./agent-packs/infrastructure/ResourceOptimizationAgent');
   const MonitoringOrchestrationAgent = require('./agent-packs/infrastructure/MonitoringOrchestrationAgent');
   ```

2. **Create and Configure Orchestrator:**
   ```javascript
   const orchestrator = new AgentOrchestrator({
       projectPath: process.cwd()
   });
   ```

3. **Register Infrastructure Agents:**
   ```javascript
   orchestrator.registerAgent(new TemplateValidationAgent());
   orchestrator.registerAgent(new ConfigurationManagementAgent());
   orchestrator.registerAgent(new ResourceOptimizationAgent());
   orchestrator.registerAgent(new MonitoringOrchestrationAgent());
   ```

4. **Start Orchestrator:**
   ```javascript
   await orchestrator.start();
   ```

5. **Execute Infrastructure Check:**
   ```javascript
   const result = await orchestrator.executeWorkflow('infrastructure-check', {
       projectPath: process.cwd(),
       templatePaths: ['template.yaml', 'terraform/*.tf'],
       includeCostEstimate: true
   });
   ```

6. **Report Infrastructure Status:**
   Show validation results, cost estimates, and optimization opportunities

## Expected Output Format

```
🔍 Scanning project: /path/to/project
📝 Language filter: all
📦 Extensions: .json, .yaml, .yml, .tf, .template
✅ Found priority source directories: infrastructure, terraform
  📂 Scanning infrastructure/...
    ✓ Found 8 files in infrastructure/
  📂 Scanning terraform/...
    ✓ Found 5 files in terraform/
📂 Scanning remaining project directories...
✅ Scan complete: 18 files found

📊 Files by directory:
  infrastructure/: 8 files
  terraform/: 5 files
  config/: 3 files
  cloudformation/: 2 files

✅ Infrastructure Validation Complete

📋 Template Validation:
- SAM/CloudFormation: PASS (3 templates)
- Terraform: PASS (5 modules)
- Security configuration: PASS

⚙️ Configuration Management:
- Secret management: PASS
- Environment parity: PASS
- Configuration drift: NONE DETECTED

💰 Cost Estimation:
- Monthly estimate: $245/month
- Optimization opportunities: 2 found
  → Lambda: Right-size memory (save ~$15/mo)
  → RDS: Consider reserved instances (save ~$50/mo)

📊 Resource Analysis:
- Total resources: 23
- Over-provisioned: 2
- Under-provisioned: 0
- Right-sized: 21

📈 Monitoring Setup:
- CloudWatch alarms: CONFIGURED
- Log aggregation: CONFIGURED
- Dashboard: READY

💾 Audit Trail: .equilateral/workflow-history.json
⏱️ Duration: 5.7 seconds

🔧 Recommended Actions:
1. Reduce Lambda memory allocation for low-traffic functions
2. Implement RDS reserved instance for db-production
```

## Context Information

Use this command when:
- User mentions "infrastructure", "IaC", "CloudFormation", "Terraform", "SAM"
- Before deploying infrastructure changes
- During infrastructure reviews
- For cost optimization analysis

## Notes

- Supports SAM, CloudFormation, and Terraform templates
- Cost estimates are basic projections (not ML-based)
- For advanced cost intelligence with ML predictions, see commercial tier
- All findings are actionable with specific recommendations

## Commercial Upgrade

For advanced infrastructure features:
- **ML-Based Cost Predictions** - Predictive cost modeling with trend analysis
- **Multi-Account Governance** - ControlTower agent for enterprise AWS management
- **Advanced Threat Modeling** - STRIDE-based security analysis
- **SOC2/ISO27001 Compliance** - Automated compliance validation

Contact: info@happyhippo.ai
