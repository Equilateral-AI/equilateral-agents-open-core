# Project Structure Assumptions - Audit Report

**Date:** 2025-11-07
**Scope:** All agents and workflows in open-core
**Issue:** Hardcoded project structure paths that may not work for all users

---

## Summary

Several agents contain hardcoded path assumptions based on what appears to be the HappyHippo.ai internal project structure. This prevents the agents from working generically with any project structure.

**Impact:** 🔴 HIGH - Affects usability for open-core users

**Files Affected:** 10+ agent files

---

## Issues Found

### 1. Backend Auditor Agent (`agent-packs/quality/BackendAuditorAgent.js`)

**Hardcoded Paths:**
```javascript
// Line 173: Single hardcoded path
const handlersDir = path.join(targetDir, 'src/backend/src/handlers');

// Line 199: Single hardcoded path
const apiDir = path.join(targetDir, 'src/frontend/src/api');

// Lines 227-230: Better - multiple fallback paths
const dbPaths = [
    path.join(targetDir, 'src/backend/src/helpers/dbOperations.js'),
    path.join(targetDir, 'src/backend/helpers/dbOperations.js'),
    path.join(targetDir, 'src/helpers/dbOperations.js')
];
```

**Problem:** Only works if project has `src/backend/src/handlers` structure

**Recommendation:**
- Use multiple fallback paths (like dbPaths pattern)
- Or scan project dynamically
- Or make paths configurable via constructor

---

### 2. Frontend Auditor Agent (`agent-packs/quality/FrontendAuditorAgent.js`)

**Hardcoded Paths:**
```javascript
// Lines 199-202: Good - multiple fallbacks
const componentsPaths = [
    path.join(targetDir, 'src/frontend/src/components'),
    path.join(targetDir, 'src/components'),
    path.join(targetDir, 'components')
];

// Lines 227-230: Good - multiple fallbacks
const contextPaths = [
    path.join(targetDir, 'src/frontend/src/contexts'),
    path.join(targetDir, 'src/contexts'),
    path.join(targetDir, 'contexts')
];
```

**Status:** ✅ GOOD - Has fallback paths

---

### 3. Auditor Agent (`agent-packs/quality/AuditorAgent.js`)

**Hardcoded Paths:**
```javascript
// Line 164: Configurable with fallback
const handlersDir = path.join(targetDirStr, this.config.get('handlersPath') || 'src/backend/src/handlers');

// Line 293: Configurable with fallback
const apiDir = path.join(targetDir, this.config.get('frontendApiPath') || 'src/frontend/src/api');
```

**Status:** ✅ GOOD - Configurable via config

---

### 4. Security Reviewer Agent (`agent-packs/security/SecurityReviewerAgent.js`)

**Hardcoded Paths:**
```javascript
// Line 410: Single path
const handlersDir = path.join(projectPath, 'src/backend/src/handlers');

// Lines 563-566: Specific files
const criticalFiles = [
    'src/backend/src/helpers/responseUtil.js',
    'src/backend/src/helpers/dbClient.js',
    'src/backend/src/helpers/errorHandler.js',
    'src/backend/src/helpers/lambdaWrapper.js'
];

// Lines 1598-1604: Very specific
const components = [
    'src/backend/src/helpers/secureLogger.js',
    'src/backend/src/helpers/environmentValidator.js',
    'src/backend/src/helpers/corsConfig.js',
    'src/backend/src/helpers/sslValidator.js',
    'SECURITY_HARDENING_DOCUMENTATION.md',
    'scripts/security-rollback.sh'
];
```

**Problem:** 🔴 These are VERY specific to internal HappyHippo project
- Expects specific helper files
- Expects specific security documentation
- Won't work on generic projects

**Recommendation:**
- Make these checks optional (warn if not found, don't fail)
- Or make paths configurable
- Or scan for similar patterns instead of exact paths

---

### 5. Security Vulnerability Agent (`agent-packs/security/SecurityVulnerabilityAgent.js`)

**Hardcoded Paths:**
```javascript
// Lines 477-481: VERY specific internal structure
const scanDirs = [
    'backend/src/handlers',
    'backend/src/shared',
    'frontend-stable/src/components',  // "frontend-stable" is project-specific
    'frontend-stable/src/services'
];
```

**Problem:** 🔴 "frontend-stable" is clearly project-specific naming

**Recommendation:**
- Use dynamic directory discovery
- Or provide configuration option
- Or use common patterns (src/, lib/, components/)

---

### 6. UI/UX Specialist Agent (`agent-packs/development/UIUXSpecialistAgent.js`)

**Hardcoded Paths:**
```javascript
// Lines 428-431: Very specific
const searchPaths = [
    path.join(targetDir, 'src/frontend/src/components'),
    path.join(targetDir, 'src/frontend/src/features'),
    path.join(targetDir, 'src/frontend/src/pages')
];
```

**Problem:** Assumes nested `src/frontend/src` structure

**Recommendation:** Add fallbacks like `src/components`, `components/`

---

### 7. Code Generator Agent (`agent-packs/development/CodeGeneratorAgent.js`)

**Status:** Need to check (found in grep results)

---

### 8. Configuration Management Agent (`agent-packs/infrastructure/ConfigurationManagementAgent.js`)

**Status:** Need to check (found in grep results)

---

## Recommended Fixes

### Strategy 1: Multiple Fallback Paths (Recommended for most cases)

```javascript
// Instead of:
const handlersDir = path.join(projectPath, 'src/backend/src/handlers');

// Use:
const possiblePaths = [
    path.join(projectPath, 'src/backend/src/handlers'),
    path.join(projectPath, 'src/handlers'),
    path.join(projectPath, 'backend/handlers'),
    path.join(projectPath, 'handlers'),
    path.join(projectPath, 'lambda'),  // common alternative
    path.join(projectPath, 'functions')  // common alternative
];

// Find first existing path
let handlersDir = null;
for (const possiblePath of possiblePaths) {
    try {
        await fs.access(possiblePath);
        handlersDir = possiblePath;
        break;
    } catch {
        continue;
    }
}

if (!handlersDir) {
    this.log('warn', 'No handlers directory found in common locations');
    return; // or use project root as fallback
}
```

### Strategy 2: Configuration via Constructor

```javascript
class MyAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            ...config,
            // Default paths
            handlersPaths: config.handlersPaths || [
                'src/handlers',
                'handlers',
                'lambda',
                'functions'
            ],
            componentsPaths: config.componentsPaths || [
                'src/components',
                'components'
            ]
        });
    }
}
```

### Strategy 3: Dynamic Discovery (Best for flexibility)

```javascript
async findHandlers(projectPath) {
    // Use PathScanningHelper or recursive search
    const files = await this.findFilesRecursive(projectPath, /handler|lambda|function/i);
    return files;
}
```

---

## Priority Fixes

### 🔴 Critical (Breaks for most users):
1. **SecurityVulnerabilityAgent** - `frontend-stable` naming
2. **SecurityReviewerAgent** - Very specific helper file checks
3. **BackendAuditorAgent** - Single hardcoded paths (lines 173, 199)

### 🟡 Medium (May work for some):
4. **UIUXSpecialistAgent** - Could add more fallbacks
5. **CodeGeneratorAgent** - Need to audit

### 🟢 Low (Already has fallbacks):
6. **FrontendAuditorAgent** - Already has multiple fallbacks
7. **AuditorAgent** - Already configurable

---

## Testing Needed

Create test cases with different project structures:

1. **Flat structure** - `handlers/`, `components/`
2. **Src structure** - `src/handlers/`, `src/components/`
3. **Monorepo** - `packages/backend/`, `packages/frontend/`
4. **Framework-specific** - `app/`, `pages/` (Next.js), `src/` (CRA)
5. **Minimal** - Just root files, no folders

Each agent should either:
- Work correctly
- Or gracefully warn and skip

---

## Implementation Plan

1. **Create PathScanningHelper enhancement** - Add common path patterns
2. **Update agents systematically** - Start with Critical priority
3. **Add configuration documentation** - How to configure custom paths
4. **Add test suite** - Test with various structures
5. **Update CLAUDE.md** - Document that agents work with any structure

---

## Notes for Open-Core Users

**Current Workaround:**
If you encounter issues, you can:
1. Create symbolic links to match expected structure
2. Or configure agents via constructor options (where supported)
3. Or modify agent code to match your structure

**Long-term Solution:**
These issues should be fixed in the open-core to work generically.

---

**Generated by:** Claude Code testing session
**Next Steps:** Review this report and prioritize fixes
