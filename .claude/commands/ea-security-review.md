# Security Review Workflow

Execute a comprehensive multi-layer security assessment using EquilateralAgents open-core security agents.

## What This Workflow Does

Runs a complete security analysis including:
- Dependency vulnerability scanning (SecurityScannerAgent)
- Security posture assessment (SecurityReviewerAgent)
- Common vulnerability detection (SecurityVulnerabilityAgent)
- Compliance checking (ComplianceCheckAgent)

## Implementation Steps

1. **Import Required Modules:**
   ```javascript
   const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
   const SecurityScannerAgent = require('./agent-packs/security/SecurityScannerAgent');
   const SecurityReviewerAgent = require('./agent-packs/security/SecurityReviewerAgent');
   const SecurityVulnerabilityAgent = require('./agent-packs/security/SecurityVulnerabilityAgent');
   const ComplianceCheckAgent = require('./agent-packs/security/ComplianceCheckAgent');
   ```

2. **Create and Configure Orchestrator:**
   ```javascript
   const orchestrator = new AgentOrchestrator({
       projectPath: process.cwd(),
       enableBackground: true
   });
   ```

3. **Register Security Agents:**
   ```javascript
   orchestrator.registerAgent(new SecurityScannerAgent());
   orchestrator.registerAgent(new SecurityReviewerAgent());
   orchestrator.registerAgent(new SecurityVulnerabilityAgent());
   orchestrator.registerAgent(new ComplianceCheckAgent());
   ```

4. **Start Orchestrator:**
   ```javascript
   await orchestrator.start();
   ```

5. **Execute Security Review Workflow:**
   ```javascript
   const result = await orchestrator.executeWorkflow('security-review', {
       projectPath: process.cwd(),
       depth: 'comprehensive',
       includeCompliance: true
   });
   ```

6. **Report Results with Evidence:**
   Show concrete metrics:
   - Number of vulnerabilities found (by severity)
   - Security checks passed/failed
   - Compliance issues identified
   - Audit trail location (`.equilateral/workflow-history.json`)

## Expected Output Format

```
🔍 Scanning project: /path/to/project
📝 Language filter: all
📦 Extensions: .js, .jsx, .ts, .tsx, .py, .java, ...
✅ Found priority source directories: src, lib
  📂 Scanning src/...
    ✓ Found 45 files in src/
  📂 Scanning lib/...
    ✓ Found 12 files in lib/
📂 Scanning remaining project directories...
✅ Scan complete: 67 files found

📊 Files by directory:
  src/: 45 files
  lib/: 12 files
  test/: 8 files
  config/: 2 files

✅ Security Review Complete

🔍 Vulnerability Scan:
- Critical: 0
- High: 1 (outdated dependency: express@4.16.0)
- Medium: 2
- Low: 3

🛡️ Security Posture: 85/100
- Infrastructure security: PASS
- Code security patterns: PASS
- Secret detection: PASS (no secrets found)

📋 Compliance:
- Basic standards: PASS
- Security best practices: 18/20 checks passed

💾 Audit Trail: .equilateral/workflow-history.json
⏱️ Duration: 2.3 seconds
```

**If src/ directory not found:**

```
⚠️  WARNING: No files found in src/ directory!
   If your project has a src/ directory, it may not have been scanned correctly.
   Project path: /path/to/project
   Directories scanned: app, lib, test
```

## Context Information

Use this command when:
- User mentions "security", "vulnerability", "CVE", "security review"
- Before deployments or releases
- After dependency updates
- During code reviews focused on security

## Notes

- All workflow execution is logged to `.equilateral/workflow-history.json`
- For background execution, use `orchestrator.executeWorkflowBackground()`
- Advanced security features (penetration testing, threat modeling) require commercial tier
