# Background Execution Capability

**Added:** 2025-10-02
**Status:** ✅ Integrated into AgentOrchestrator

---

## Overview

The AgentOrchestrator now supports **non-blocking background workflow execution**, allowing you to:
- Start long-running workflows that don't block your application
- Continue working while workflows run in the background
- Monitor progress of running workflows
- Cancel workflows if needed
- Run multiple workflows concurrently

---

## Quick Start

### Basic Background Execution

```javascript
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');

// Enable background execution (enabled by default)
const orchestrator = new AgentOrchestrator({
    enableBackground: true
});

await orchestrator.start();

// Start workflow in background
const handle = await orchestrator.executeWorkflowBackground('security-review', {
    projectPath: './my-project'
});

console.log(`Started: ${handle.workflowId}`);

// Continue with other work...
doOtherWork();

// Check status later
const status = handle.getStatus();
console.log(`Status: ${status.status}`);

// Get result when ready (waits if still running)
const result = await handle.getResult();
console.log(`Result: ${result.status}`);
```

---

## API Reference

### executeWorkflowBackground(workflowType, context)

Start a workflow in the background.

**Parameters:**
- `workflowType` (string): Type of workflow to execute
- `context` (object): Workflow context data

**Returns:** Handle object with:
- `workflowId` (string): Unique workflow identifier
- `workflowType` (string): Type of workflow
- `status` (string): Current status ('running', 'completed', 'failed', 'cancelled')
- `startTime` (Date): When workflow started
- `getStatus()`: Get current status
- `getResult()`: Get result (waits if still running)
- `cancel()`: Cancel the workflow

**Example:**
```javascript
const handle = await orchestrator.executeWorkflowBackground('code-review');

// Use handle to monitor/control workflow
```

---

### handle.getStatus()

Get current status without waiting for completion.

**Returns:** Status object
```javascript
{
    found: true,
    workflowId: 'bg-1234567890',
    workflowType: 'code-review',
    status: 'running',
    startTime: Date,
    endTime: Date (if completed),
    duration: 5432 (milliseconds)
}
```

**Example:**
```javascript
const status = handle.getStatus();
if (status.status === 'running') {
    console.log(`Still running... ${status.duration}ms elapsed`);
}
```

---

### handle.getResult()

Get workflow result (waits for completion if still running).

**Returns:** Promise<Result object>
```javascript
{
    workflowId: 'bg-1234567890',
    status: 'completed',
    result: { /* workflow results */ },
    error: null,
    startTime: Date,
    endTime: Date
}
```

**Example:**
```javascript
// Wait for completion
const result = await handle.getResult();

if (result.status === 'completed') {
    console.log('Success!', result.result);
} else {
    console.error('Failed:', result.error);
}
```

---

### handle.cancel()

Cancel a running workflow.

**Returns:** Status object
```javascript
{
    workflowId: 'bg-1234567890',
    status: 'cancelled'
}
```

**Example:**
```javascript
// Cancel if taking too long
setTimeout(() => {
    if (handle.getStatus().status === 'running') {
        handle.cancel();
        console.log('Workflow cancelled');
    }
}, 30000); // Cancel after 30 seconds
```

---

### listBackgroundWorkflows()

List all background workflows.

**Returns:** Array of workflow info
```javascript
[
    {
        workflowId: 'bg-1234567890',
        workflowType: 'security-review',
        status: 'running',
        startTime: Date,
        endTime: Date (if completed)
    },
    // ...
]
```

**Example:**
```javascript
const workflows = orchestrator.listBackgroundWorkflows();
console.log(`${workflows.length} workflows running`);

workflows.forEach(wf => {
    console.log(`- ${wf.workflowType}: ${wf.status}`);
});
```

---

## Common Patterns

### Run Multiple Workflows in Parallel

```javascript
// Start multiple workflows
const handles = await Promise.all([
    orchestrator.executeWorkflowBackground('security-review'),
    orchestrator.executeWorkflowBackground('code-quality'),
    orchestrator.executeWorkflowBackground('deployment-check')
]);

console.log(`Started ${handles.length} workflows`);

// Wait for all to complete
const results = await Promise.all(
    handles.map(h => h.getResult())
);

console.log('All complete!');
results.forEach((r, i) => {
    console.log(`${i+1}. ${r.status}`);
});
```

---

### Monitor Progress with Polling

```javascript
const handle = await orchestrator.executeWorkflowBackground('deployment-pipeline');

// Poll for status every 5 seconds
const interval = setInterval(() => {
    const status = handle.getStatus();
    console.log(`[${new Date().toISOString()}] ${status.status} - ${status.duration}ms`);

    if (status.status !== 'running') {
        clearInterval(interval);
    }
}, 5000);

// Wait for result
const result = await handle.getResult();
console.log('Final result:', result);
```

---

### Timeout Pattern

```javascript
const handle = await orchestrator.executeWorkflowBackground('long-workflow');

// Race between workflow and timeout
const result = await Promise.race([
    handle.getResult(),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 60000)
    )
]);

console.log('Completed within timeout:', result);
```

---

### Fire and Forget

```javascript
// Start workflow and don't wait for result
const handle = await orchestrator.executeWorkflowBackground('cleanup-task');

console.log(`Cleanup started: ${handle.workflowId}`);
// Continue with other work, check result later if needed
```

---

## Events

Background workflows emit events you can listen to:

```javascript
// Listen for background workflow events
orchestrator.on('backgroundWorkflowStarted', ({ workflowId, workflowType }) => {
    console.log(`Started: ${workflowType} (${workflowId})`);
});

orchestrator.on('backgroundWorkflowCompleted', ({ workflowId, result }) => {
    console.log(`Completed: ${workflowId}`);
});

orchestrator.on('backgroundWorkflowFailed', ({ workflowId, error }) => {
    console.error(`Failed: ${workflowId} - ${error}`);
});

orchestrator.on('backgroundWorkflowCancelled', ({ workflowId }) => {
    console.log(`Cancelled: ${workflowId}`);
});
```

---

## Use Cases

### 1. Long-Running Security Scans

```javascript
// Start comprehensive security scan in background
const scanHandle = await orchestrator.executeWorkflowBackground('security-review', {
    projectPath: './large-project',
    severity: 'all'
});

// Show user progress while they continue working
updateUI({ scanning: true, workflowId: scanHandle.workflowId });

// Check result when user requests it
async function showScanResults() {
    const result = await scanHandle.getResult();
    displayResults(result);
}
```

---

### 2. Deployment Pipelines

```javascript
// Deploy to staging in background
const deployHandle = await orchestrator.executeWorkflowBackground('deployment-pipeline', {
    environment: 'staging'
});

// Let developers continue working
console.log('Deployment started, you can continue working...');

// Notify when complete
deployHandle.getResult().then(result => {
    if (result.status === 'completed') {
        notify('Deployment to staging successful! 🚀');
    } else {
        notify('Deployment failed ❌', result.error);
    }
});
```

---

### 3. Batch Processing

```javascript
// Process multiple projects in parallel
const projects = ['project-a', 'project-b', 'project-c'];

const handles = await Promise.all(
    projects.map(project =>
        orchestrator.executeWorkflowBackground('code-quality', {
            projectPath: `./${project}`
        })
    )
);

// Check results as they complete
for (const handle of handles) {
    const result = await handle.getResult();
    console.log(`${result.result.projectPath}: ${result.status}`);
}
```

---

## Performance Considerations

### Memory Usage
- Each background workflow stores its result in memory
- Results are kept until orchestrator stops
- For long-running applications, periodically clean up old workflows

### Concurrency
- No hard limit on concurrent workflows
- System resources (CPU, memory) are the practical limit
- Monitor system resources when running many concurrent workflows

### Best Practices
1. **Set timeouts** for workflows that might hang
2. **Cancel unused workflows** to free resources
3. **Use events** for real-time notifications
4. **Implement retry logic** for failed workflows
5. **Log workflow IDs** for debugging

---

## Demo

Run the included demo to see background execution in action:

```bash
npm run demo:background
```

The demo shows:
- Starting a workflow in background
- Checking status while it runs
- Waiting for completion
- Running multiple workflows in parallel
- Listing all background workflows

---

## Configuration

Background execution is enabled by default. To disable:

```javascript
const orchestrator = new AgentOrchestrator({
    enableBackground: false  // Disable background execution
});

// executeWorkflowBackground will fall back to regular execution
```

---

## Comparison: Background vs Regular Execution

### Regular Execution
```javascript
// Blocks until workflow completes
const result = await orchestrator.executeWorkflow('code-review');
console.log('Done!', result);
// Can only continue after workflow completes
```

### Background Execution
```javascript
// Returns immediately with handle
const handle = await orchestrator.executeWorkflowBackground('code-review');
console.log('Started!', handle.workflowId);
// Can continue immediately

// Check result later
const result = await handle.getResult();
console.log('Done!', result);
```

---

## Troubleshooting

### Workflow not found
```javascript
const handle = await orchestrator.executeWorkflowBackground('my-workflow');

// Later...
try {
    const status = handle.getStatus();
} catch (error) {
    // Handle might be invalid if orchestrator restarted
    console.error('Workflow not found');
}
```

**Solution:** Store workflow IDs persistently if needed across restarts

### Memory leaks from long-running app
```javascript
// Periodically clean up completed workflows
setInterval(() => {
    const workflows = orchestrator.listBackgroundWorkflows();
    const completed = workflows.filter(w =>
        w.status === 'completed' || w.status === 'failed'
    );

    console.log(`Cleaning up ${completed.length} completed workflows`);
    // Implement cleanup logic as needed
}, 3600000); // Every hour
```

---

**Built with ❤️ by HappyHippo.ai**
**Questions?** Contact info@happyhippo.ai
