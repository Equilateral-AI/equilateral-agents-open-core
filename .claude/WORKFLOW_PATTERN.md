# User's Preferred Workflow Pattern

This document captures the preferred workflow pattern for using Claude with EquilateralAgents.

## Primary Command: "Dispatch Teams in Background + Execute Todo List"

When the user says this, they want a specific orchestration pattern:

### Step 1: Dispatch Agent Teams (Non-Blocking)
Start multiple agent workflows in background immediately:

```javascript
const orchestrator = new AgentOrchestrator({ enableBackground: true });
await orchestrator.start();

// Dispatch teams in parallel
const teams = {
    security: await orchestrator.executeWorkflowBackground('security-review', {
        projectPath: process.cwd()
    }),
    quality: await orchestrator.executeWorkflowBackground('code-quality', {
        projectPath: process.cwd()
    }),
    testing: await orchestrator.executeWorkflowBackground('test-workflow', {
        projectPath: process.cwd()
    })
};

console.log('🚀 Teams dispatched:', Object.keys(teams));
```

### Step 2: Create & Display Todo List
Use TodoWrite to create visible task tracking:

```javascript
TodoWrite({
    todos: [
        { content: "Dispatch background teams", status: "completed", activeForm: "..." },
        { content: "Review code changes", status: "in_progress", activeForm: "..." },
        { content: "Update documentation", status: "pending", activeForm: "..." },
        { content: "Check agent results", status: "pending", activeForm: "..." },
        { content: "Synthesize findings", status: "pending", activeForm: "..." }
    ]
});
```

### Step 3: Execute Todo List (While Agents Run)
Work through todos sequentially, marking each complete:

- Read/analyze code
- Make changes
- Update documentation
- Run local tests
- Prepare commits

**IMPORTANT:** Keep updating TodoWrite as you progress!

### Step 4: Check Background Results
Poll agent status and collect results:

```javascript
// Check status
console.log('Security:', teams.security.getStatus());
console.log('Quality:', teams.quality.getStatus());
console.log('Testing:', teams.testing.getStatus());

// Get results (waits if still running)
const results = {
    security: await teams.security.getResult(),
    quality: await teams.quality.getResult(),
    testing: await teams.testing.getResult()
};
```

### Step 5: Synthesize & Act
Combine agent findings with manual work:

- Review agent findings
- Address issues found
- Update code/docs based on results
- Create PR or commit changes
- Update final todo status

## Key Principles

1. **Always use TodoWrite** - Make progress visible
2. **Mark todos complete immediately** - Don't batch updates
3. **One todo in_progress at a time** - Stay focused
4. **Background = parallel work** - Don't block on agents
5. **Synthesize at the end** - Bring human + agent work together

## Example Usage

### User Says:
> "We need to prepare the auth feature for production. Dispatch teams in background and execute the next steps."

### Claude Should:
1. **Dispatch teams:**
   - Security review workflow
   - Quality gate workflow
   - Deployment validation workflow

2. **Create todos:**
   - ✅ Dispatch background teams
   - ⏳ Review auth implementation
   - ⬜ Update API documentation
   - ⬜ Prepare deployment checklist
   - ⬜ Check agent findings
   - ⬜ Address any issues
   - ⬜ Create PR

3. **Execute while agents run:**
   - Read auth code
   - Document API endpoints
   - Create deployment checklist
   - (Agents running in parallel)

4. **Synthesize:**
   - Check agent results
   - "Security found 2 issues - fixing now"
   - "Quality score: 87/100 - acceptable"
   - "Deployment checks passed"
   - Make final fixes
   - Create PR with complete context

## Available Workflows

Common workflows to dispatch:

- `security-review` - Multi-layer security scan
- `code-quality` - Quality analysis with scoring
- `test-workflow` - Test execution and analysis
- `deployment-check` - Deployment validation
- `infrastructure-check` - IaC validation

## Integration with Claude Code

When using slash commands, the pattern still applies:

```
User: /ea:security-review (background)

Claude:
1. Dispatches security workflow in background
2. Creates todo list for what to do while waiting
3. Executes todos
4. Checks results
5. Synthesizes findings
```

## Benefits of This Pattern

✅ **Maximizes parallelism** - Agents + human work simultaneously
✅ **Clear progress** - TodoWrite shows what's happening
✅ **Auditable** - Workflow history + todo history
✅ **Efficient** - No waiting for agents to finish
✅ **Comprehensive** - Combines automated + manual work

## Anti-Patterns to Avoid

❌ Don't wait for agents before starting todos
❌ Don't skip TodoWrite updates
❌ Don't batch todo completions
❌ Don't forget to check agent results
❌ Don't ignore agent findings

---

**Last Updated:** 2025-11-07
**User Preference:** Confirmed via conversation
**Pattern Source:** User's active development workflow
