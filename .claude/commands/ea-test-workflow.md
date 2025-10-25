# Test Workflow Execution

Execute comprehensive testing workflow with background execution support and parallel orchestration.

## What This Workflow Does

Runs multi-framework testing:
- Test orchestration (TestOrchestrationAgent)
- UI testing with element remapping (TestAgent)
- UI/UX validation (UIUXSpecialistAgent)
- Code analysis for test coverage (CodeAnalyzerAgent)

## Implementation Steps

1. **Import Required Modules:**
   ```javascript
   const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
   const TestOrchestrationAgent = require('./agent-packs/development/TestOrchestrationAgent');
   const TestAgent = require('./agent-packs/development/TestAgent');
   const UIUXSpecialistAgent = require('./agent-packs/development/UIUXSpecialistAgent');
   const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');
   ```

2. **Create and Configure Orchestrator:**
   ```javascript
   const orchestrator = new AgentOrchestrator({
       projectPath: process.cwd(),
       enableBackground: true // Important for long-running tests
   });
   ```

3. **Register Test Agents:**
   ```javascript
   orchestrator.registerAgent(new TestOrchestrationAgent());
   orchestrator.registerAgent(new TestAgent());
   orchestrator.registerAgent(new UIUXSpecialistAgent());
   orchestrator.registerAgent(new CodeAnalyzerAgent());
   ```

4. **Start Orchestrator:**
   ```javascript
   await orchestrator.start();
   ```

5. **Execute Test Workflow (Background Recommended):**
   ```javascript
   // For background execution (non-blocking)
   const handle = await orchestrator.executeWorkflowBackground('test-workflow', {
       projectPath: process.cwd(),
       testTypes: ['unit', 'integration', 'ui'],
       parallel: true,
       coverage: true
   });

   console.log(`🚀 Tests running in background: ${handle.workflowId}`);

   // Check status
   const status = handle.getStatus();

   // Wait for completion (when needed)
   const result = await handle.getResult();
   ```

6. **Report Test Results:**
   Show comprehensive test metrics with evidence

## Expected Output Format

```
🔍 Scanning project: /path/to/project
📝 Language filter: javascript
📦 Extensions: .js, .jsx, .ts, .tsx
✅ Found priority source directories: src, test
  📂 Scanning src/...
    ✓ Found 45 files in src/
  📂 Scanning test/...
    ✓ Found 32 files in test/
📂 Scanning remaining project directories...
✅ Scan complete: 82 files found

📊 Files by directory:
  src/: 45 files
  test/: 32 files
  lib/: 5 files

✅ Test Workflow Complete

🧪 Test Execution:
- Unit tests: 245/245 passed (100%)
- Integration tests: 32/32 passed (100%)
- UI tests: 18/18 passed (100%)
- Total duration: 12.3 seconds

📊 Coverage Analysis:
- Statement coverage: 87%
- Branch coverage: 82%
- Function coverage: 91%
- Line coverage: 86%

🎨 UI/UX Validation:
- WCAG compliance: PASS (AA level)
- Design system: PASS
- Responsive design: PASS (tested: mobile, tablet, desktop)
- Accessibility: 0 violations

🔄 Element Remapping:
- UI changes detected: 0
- Auto-remapped elements: 0
- Brittle selectors: 0

💾 Audit Trail: .equilateral/workflow-history.json
⏱️ Background execution: 12.3 seconds

✅ All quality gates passed
```

## Background Execution Example

For long-running test suites:

```javascript
// Start tests in background
const handle = await orchestrator.executeWorkflowBackground('test-workflow', {
    testSuite: 'full'
});

console.log(`🚀 Tests started (${handle.workflowId})`);

// Continue working while tests run...

// Check later
const status = handle.getStatus();
console.log(`Status: ${status.status}`);

// Get results when ready
const result = await handle.getResult(); // Waits if still running
```

## Context Information

Use this command when:
- User mentions "test", "testing", "run tests", "test suite"
- Before deployments
- During CI/CD pipeline
- After code changes to verify behavior

## Notes

- Background execution prevents blocking on long-running tests
- UI tests automatically remap elements when UI changes
- Accessibility validation follows WCAG 2.1 guidelines
- All test results include coverage metrics
- Failed tests include detailed error messages and stack traces

## Commercial Upgrade

For advanced testing features:
- **Visual Regression Testing** - Screenshot comparison and diff detection
- **Performance Testing** - Load testing and performance profiling
- **Cross-Browser Testing** - Multi-browser test orchestration
- **TestingOrchestrationAgent (Advanced)** - ML-based test prioritization

Contact: info@happyhippo.ai
