# Deploy Feature Workflow

Execute deployment validation with standards enforcement and rollback readiness checks.

## What This Workflow Does

Validates deployment readiness through:
- Pre-deployment validation (DeploymentValidationAgent)
- Security scanning (SecurityScannerAgent)
- Test orchestration (TestOrchestrationAgent)
- Deployment execution (DeploymentAgent)

## Implementation Steps

1. **Import Required Modules:**
   ```javascript
   const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
   const DeploymentValidationAgent = require('./agent-packs/development/DeploymentValidationAgent');
   const SecurityScannerAgent = require('./agent-packs/security/SecurityScannerAgent');
   const TestOrchestrationAgent = require('./agent-packs/development/TestOrchestrationAgent');
   const DeploymentAgent = require('./agent-packs/infrastructure/DeploymentAgent');
   ```

2. **Create and Configure Orchestrator:**
   ```javascript
   const orchestrator = new AgentOrchestrator({
       projectPath: process.cwd(),
       enableBackground: true
   });
   ```

3. **Register Deployment Agents:**
   ```javascript
   orchestrator.registerAgent(new DeploymentValidationAgent());
   orchestrator.registerAgent(new SecurityScannerAgent());
   orchestrator.registerAgent(new TestOrchestrationAgent());
   orchestrator.registerAgent(new DeploymentAgent());
   ```

4. **Start Orchestrator:**
   ```javascript
   await orchestrator.start();
   ```

5. **Execute Deployment Workflow:**
   ```javascript
   const result = await orchestrator.executeWorkflow('deploy-feature', {
       projectPath: process.cwd(),
       environment: 'staging', // or 'production'
       validateRollback: true
   });
   ```

6. **Report Deployment Status:**
   Show pre-flight check results, deployment success, and rollback readiness

## Expected Output Format

```
🔍 Scanning project: /path/to/project
📝 Language filter: all
📦 Extensions: .js, .ts, .json, .yaml, .yml
✅ Found priority source directories: src
  📂 Scanning src/...
    ✓ Found 52 files in src/
📂 Scanning remaining project directories...
✅ Scan complete: 68 files found

📊 Files by directory:
  src/: 52 files
  config/: 8 files
  test/: 8 files

✅ Deployment Validation Complete

🔍 Pre-Flight Checks:
- Health checks: PASS
- Configuration: PASS
- Dependencies: PASS
- Rollback readiness: READY

🛡️ Security Scan:
- Vulnerabilities: 0 critical, 0 high
- Security posture: PASS

🧪 Test Results:
- Unit tests: 245/245 passed
- Integration tests: 32/32 passed
- Coverage: 87% (meets 80% threshold)

🚀 Deployment Status:
- Environment: staging
- Status: SUCCESS
- Health check: HEALTHY
- Rollback available: YES

💾 Audit Trail: .equilateral/workflow-history.json
⏱️ Duration: 45.2 seconds

✅ Ready for production deployment
```

**If src/ directory not found:**
```
⚠️  WARNING: No files found in src/ directory!
   If your project has a src/ directory, it may not have been scanned correctly.
```

## Context Information

Use this command when:
- User mentions "deploy", "deployment", "release", "ship"
- Before deploying to staging or production
- After completing feature development
- As part of CI/CD pipelines

## Notes

- Always validates rollback capability before deployment
- Can execute in background for long-running deployments
- For multi-account AWS deployments, see commercial tier features
- For blue-green/canary deployments, requires EnhancedDeploymentAgent (commercial)

## Commercial Upgrade

For advanced deployment features:
- **Multi-Account Deployments** - Deploy across multiple AWS accounts with governance
- **Blue-Green/Canary** - Zero-downtime deployment strategies
- **ControlTower Integration** - Enterprise AWS governance

Contact: info@happyhippo.ai
