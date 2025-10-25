# Code Quality Analysis Workflow

Execute comprehensive code quality analysis with scoring using EquilateralAgents quality assurance agents.

## What This Workflow Does

Performs multi-dimensional code quality analysis:
- Automated code review (CodeReviewAgent)
- Backend-specific auditing (BackendAuditorAgent)
- Frontend-specific auditing (FrontendAuditorAgent)
- Standards enforcement (AuditorAgent)

## Implementation Steps

1. **Import Required Modules:**
   ```javascript
   const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
   const CodeReviewAgent = require('./agent-packs/quality/CodeReviewAgent');
   const BackendAuditorAgent = require('./agent-packs/quality/BackendAuditorAgent');
   const FrontendAuditorAgent = require('./agent-packs/quality/FrontendAuditorAgent');
   const AuditorAgent = require('./agent-packs/quality/AuditorAgent');
   ```

2. **Create and Configure Orchestrator:**
   ```javascript
   const orchestrator = new AgentOrchestrator({
       projectPath: process.cwd()
   });
   ```

3. **Register Quality Agents:**
   ```javascript
   orchestrator.registerAgent(new CodeReviewAgent());
   orchestrator.registerAgent(new BackendAuditorAgent());
   orchestrator.registerAgent(new FrontendAuditorAgent());
   orchestrator.registerAgent(new AuditorAgent());
   ```

4. **Start Orchestrator:**
   ```javascript
   await orchestrator.start();
   ```

5. **Execute Code Quality Workflow:**
   ```javascript
   const result = await orchestrator.executeWorkflow('code-quality', {
       projectPath: process.cwd(),
       includeMetrics: true,
       enforcementLevel: 'standard'
   });
   ```

6. **Report Results with Quality Score:**
   Provide concrete quality metrics and actionable feedback

## Expected Output Format

```
🔍 Scanning project: /path/to/project
📝 Language filter: all
📦 Extensions: .js, .jsx, .ts, .tsx, .py, .java
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

✅ Code Quality Analysis Complete

📊 Overall Quality Score: 87/100

🔍 Code Review:
- Best practices: 45/50 checks passed
- Technical debt: 3 items identified
- Refactoring opportunities: 2

🏗️ Backend Quality:
- API design: PASS
- Lambda patterns: PASS
- Database patterns: NEEDS_IMPROVEMENT (1 issue)

🎨 Frontend Quality:
- Component structure: PASS
- Performance budget: PASS
- Bundle size: 245KB (under 500KB limit)

📏 Standards Compliance:
- Architecture patterns: PASS
- Code standards: 92/100

💾 Audit Trail: .equilateral/workflow-history.json
⏱️ Duration: 3.1 seconds
```

**If src/ directory not found:**
```
⚠️  WARNING: No files found in src/ directory!
   If your project has a src/ directory, it may not have been scanned correctly.
   Project path: /path/to/project
   Directories scanned: app, lib, test
```

```
🔧 Recommended Actions:
1. Refactor user authentication module (high complexity)
2. Optimize database query in getUserProfile()
3. Add error handling to payment processing
```

## Context Information

Use this command when:
- User mentions "code quality", "code review", "standards", "refactoring"
- During PR reviews
- Before merging to main branch
- As part of CI/CD quality gates

## Notes

- Quality scores range from 0-100
- Scores above 80 are considered "production-ready"
- All results are evidence-based with specific file/line references
- For team-wide standards enforcement, consider commercial StandardsEnforcementAgent
