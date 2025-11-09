# Agent Update Template - PathScanningHelper Integration

**Status:** 3/22 agents updated (CodeAnalyzer, SecurityScanner, CodeReview)
**Remaining:** 19 agents

---

## Agents Updated (✅)

1. **CodeAnalyzerAgent** - `agent-packs/development/CodeAnalyzerAgent.js`
2. **SecurityScannerAgent** - `agent-packs/security/SecurityScannerAgent.js`
3. **CodeReviewAgent** - `agent-packs/quality/CodeReviewAgent.js`

---

## Agents Pending Update (⏳)

### Development (3 remaining)
- `CodeGeneratorAgent.js`
- `TestOrchestrationAgent.js`
- `DeploymentValidationAgent.js`
- `TestAgent.js`
- `UIUXSpecialistAgent.js`

### Quality (4 remaining)
- `AuditorAgent.js`
- `BackendAuditorAgent.js`
- `FrontendAuditorAgent.js`
- `TemplateValidationAgent.js`

### Security (3 remaining)
- `SecurityReviewerAgent.js`
- `SecurityVulnerabilityAgent.js`
- `ComplianceCheckAgent.js`

### Infrastructure (4 remaining)
- `DeploymentAgent.js`
- `ResourceOptimizationAgent.js`
- `ConfigurationManagementAgent.js`
- `MonitoringOrchestrationAgent.js`

### Infrastructure Core (3 remaining)
- `AgentClassifier.js`
- `AgentMemoryManager.js`
- `AgentFactoryAgent.js`

---

## Standard Update Pattern

### Step 1: Add Import

**Before:**
```javascript
const BaseAgent = require('../../equilateral-core/BaseAgent');
const fs = require('fs').promises;
const path = require('path');
```

**After:**
```javascript
const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const fs = require('fs').promises;
const path = require('path');
```

### Step 2: Initialize in Constructor

**Add after super() call:**
```javascript
// Initialize path scanner
this.pathScanner = new PathScanningHelper({
    verbose: config.verbose !== false,
    extensions: {
        javascript: ['.js', '.jsx', '.mjs', '.cjs'],  // Or appropriate language
        // typescript: ['.ts', '.tsx'],
        // python: ['.py'],
        // all: ['.js', '.ts', '.py', ...etc]
    },
    maxDepth: config.maxDepth || 10
});
```

### Step 3: Replace Custom Scanning Methods

**Before:**
```javascript
async getFiles(dir) {
    const files = [];
    async function scan(directory) {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                await scan(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
    }
    await scan(dir);
    return files;
}
```

**After:**
```javascript
async getFiles(dir) {
    console.warn('getFiles is deprecated - using PathScanningHelper instead');
    return await this.pathScanner.scanProject(dir, { language: 'javascript' });
}
```

### Step 4: Update Main Scanning Logic

**Before:**
```javascript
async analyzeProject(projectPath) {
    const files = await this.getFiles(projectPath);

    for (const file of files) {
        await this.analyzeFile(file);
    }
}
```

**After:**
```javascript
async analyzeProject(projectPath) {
    this.log('info', '🔍 Scanning project...');
    const files = await this.pathScanner.scanProject(projectPath, {
        language: 'javascript'  // or 'all', 'typescript', etc.
    });

    const scanStats = this.pathScanner.getStats(files, projectPath);

    if (!scanStats.hasSrcDirectory) {
        this.log('warn', '⚠️  No src/ directory found - may not have scanned user code');
        this.log('info', `Directories scanned: ${Array.from(scanStats.directories).join(', ')}`);
    }

    this.log('info', `Found ${files.length} files to analyze`);

    for (const file of files) {
        await this.analyzeFile(file);
    }
}
```

---

## Language-Specific Extensions

### JavaScript Projects
```javascript
extensions: {
    javascript: ['.js', '.jsx', '.mjs', '.cjs']
}
// language: 'javascript'
```

### TypeScript Projects
```javascript
extensions: {
    typescript: ['.ts', '.tsx']
}
// language: 'typescript'
```

### Python Projects
```javascript
extensions: {
    python: ['.py']
}
// language: 'python'
```

### Multi-Language Projects
```javascript
extensions: {
    all: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs']
}
// language: 'all'
```

---

## Testing Updates

After updating each agent:

1. **Test with standard project structure:**
   ```
   my-project/
   ├── src/
   │   └── index.js
   ├── lib/
   │   └── helper.js
   └── package.json
   ```

2. **Verify output includes:**
   - ✅ "Found priority source directories: src, lib"
   - ✅ File counts by directory
   - ✅ Total files found

3. **Test with no src/ directory:**
   ```
   my-project/
   ├── app/
   │   └── index.js
   └── package.json
   ```

4. **Verify warning appears:**
   - ⚠️ "No src/ directory found..."

---

## Common Pitfalls

### 1. Forgetting to Update Language Filter

**Wrong:**
```javascript
const files = await this.pathScanner.scanProject(projectPath);  // No language specified!
```

**Right:**
```javascript
const files = await this.pathScanner.scanProject(projectPath, {
    language: 'javascript'  // Explicit language
});
```

### 2. Not Checking scanStats

**Missing:**
```javascript
const files = await this.pathScanner.scanProject(projectPath, { language: 'all' });
// Process files without checking if src/ was scanned
```

**Better:**
```javascript
const files = await this.pathScanner.scanProject(projectPath, { language: 'all' });
const scanStats = this.pathScanner.getStats(files, projectPath);

if (!scanStats.hasSrcDirectory) {
    this.log('warn', '⚠️  No src/ directory found');
}
```

### 3. Inconsistent Verbose Configuration

**Ensure consistency:**
```javascript
this.pathScanner = new PathScanningHelper({
    verbose: config.verbose !== false,  // Match agent's verbose setting
    extensions: {...}
});
```

---

## Bulk Update Script (Optional)

For automated updates, create `scripts/update-agents.js`:

```javascript
const fs = require('fs');
const path = require('path');

const agentDirs = [
    'agent-packs/development',
    'agent-packs/quality',
    'agent-packs/security',
    'agent-packs/infrastructure',
    'equilateral-core/infrastructure'
];

function updateAgent(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if not present
    if (!content.includes('PathScanningHelper')) {
        content = content.replace(
            "const BaseAgent = require('../../equilateral-core/BaseAgent');",
            "const BaseAgent = require('../../equilateral-core/BaseAgent');\nconst PathScanningHelper = require('../../equilateral-core/PathScanningHelper');"
        );
    }

    // Add to constructor (requires manual review)
    console.log(`Updated imports in: ${filePath}`);
    console.log('⚠️  Manual review required for constructor initialization');

    fs.writeFileSync(filePath, content, 'utf8');
}

// Process all agent files
agentDirs.forEach(dir => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('Agent.js'));
    files.forEach(file => {
        const filePath = path.join(dir, file);
        updateAgent(filePath);
    });
});
```

---

## Verification Checklist

For each updated agent:

- [ ] Import added for PathScanningHelper
- [ ] pathScanner initialized in constructor with correct extensions
- [ ] Old scanning methods deprecated or replaced
- [ ] Main scanning logic uses pathScanner.scanProject()
- [ ] Scan statistics checked (hasSrcDirectory warning)
- [ ] Tested with project containing src/
- [ ] Tested with project without src/
- [ ] Logging shows directories scanned
- [ ] File counts are accurate

---

## Quick Reference: Updates Made

### CodeAnalyzerAgent
- ✅ Import added
- ✅ pathScanner initialized (JavaScript extensions)
- ✅ getJavaScriptFiles() deprecated
- ✅ analyzeCode() uses pathScanner
- ✅ Scan stats logged with src/ warning

### SecurityScannerAgent
- ✅ Import added
- ✅ pathScanner initialized (all languages)
- ✅ getCodeFiles() deprecated
- ✅ getAllFiles() deprecated
- ✅ scanVulnerabilities() uses pathScanner
- ✅ scanForSecretsInPath() uses pathScanner
- ✅ Scan stats logged with src/ warning

### CodeReviewAgent
- ✅ Import added
- ✅ pathScanner initialized (all languages)
- ✅ scanDirectory() deprecated
- ✅ Uses pathScanner throughout
- ✅ Scan stats integration

---

## Priority Order for Remaining Agents

**High Priority (Most Used):**
1. TestOrchestrationAgent
2. DeploymentValidationAgent
3. AuditorAgent
4. TemplateValidationAgent

**Medium Priority:**
5. BackendAuditorAgent
6. FrontendAuditorAgent
7. DeploymentAgent
8. ConfigurationManagementAgent

**Low Priority:**
9. All remaining agents

---

## Next Steps

1. ⏳ Update high-priority agents
2. ⏳ Create comprehensive tests
3. ⏳ Update plugin commands
4. ⏳ Update documentation
5. ⏳ Create migration guide for users

---

**Questions?** See PATH_SCANNING_FIX.md for detailed analysis.
