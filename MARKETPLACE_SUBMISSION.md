# EquilateralAgents - Claude Code Marketplace Submission Guide

**Plugin Name:** equilateral-agents-open-core
**Version:** 2.0.2
**Status:** ✅ READY FOR MARKETPLACE

---

## Marketplace System Overview

Claude Code uses a **distributed marketplace system** where anyone can create and share plugins through Git repositories. There are three types of marketplaces:

1. **Official Anthropic Skills** - `anthropics/skills` (reference/examples only)
2. **Community Marketplaces** - Public repositories with curated plugins
3. **Your Own Marketplace** - Host your own plugin marketplace

---

## ✅ Our Marketplace Configuration

We've created a marketplace configuration at `.claude-plugin/marketplace.json`:

```json
{
  "name": "equilateral-agents",
  "version": "2.0.2",
  "description": "EquilateralAgents - 22 production-ready AI agents...",
  "owner": {
    "name": "HappyHippo.ai",
    "email": "info@happyhippo.ai",
    "url": "https://happyhippo.ai"
  },
  "plugins": [
    {
      "name": "equilateral-agents-open-core",
      "version": "2.0.2",
      "source": ".",
      "commands": [9 commands],
      "skills": ["equilateral-agents"]
    }
  ]
}
```

---

## Installation Methods

### Method 1: Direct GitHub Installation (Recommended)

Users can install directly from our GitHub repository:

```bash
# In Claude Code, run:
/plugin marketplace add happyhippo-ai/equilateral-agents-open-core

# Then browse and install:
/plugin install equilateral-agents-open-core
```

### Method 2: Clone and Use Locally

```bash
git clone https://github.com/happyhippo-ai/equilateral-agents-open-core.git
cd equilateral-agents-open-core
npm install

# Plugin files in .claude/ are automatically detected
```

### Method 3: npm Package Installation

```bash
npm install equilateral-agents-open-core

# Then add to Claude Code settings.json:
{
  "extraKnownMarketplaces": {
    "equilateral-agents": {
      "source": "./node_modules/equilateral-agents-open-core"
    }
  }
}
```

---

## Submitting to Community Marketplaces

### 1. Claude Code Commands Directory

**URL:** https://claudecodecommands.directory/submit

**Submission Process:**
1. Visit the submission page
2. Fill out the form with:
   - Plugin name: `equilateral-agents-open-core`
   - Repository: `https://github.com/happyhippo-ai/equilateral-agents-open-core`
   - Description: Our marketplace.json description
   - Category: Development Tools, AI/ML, DevOps
3. Submit for review

**Repository:** https://github.com/ananddtyagi/claude-code-marketplace

---

### 2. Curated Awesome Plugins

**URL:** https://github.com/ccplugins/marketplace

**Submission Process:**
1. Fork the repository
2. Add our plugin to their marketplace.json:
```json
{
  "name": "equilateral-agents-open-core",
  "description": "22 production-ready AI agents for security, quality, deployment",
  "source": {
    "source": "github",
    "repo": "happyhippo-ai/equilateral-agents-open-core"
  },
  "category": "development",
  "tags": ["agents", "security", "quality", "compliance"]
}
```
3. Create pull request
4. Await review

---

### 3. Every-Env Marketplace

**URL:** https://github.com/EveryInc/every-marketplace

**Submission Process:**
1. Fork the repository
2. Add entry to their plugin catalog
3. Follow their contribution guidelines
4. Submit pull request

---

## Official Anthropic Skills Repository

**URL:** https://github.com/anthropics/skills

**Note:** This is a **reference repository**, not a submission portal. It contains example skills created by Anthropic to demonstrate capabilities. Third-party submissions are typically not accepted here.

**However:** We can create a complementary example in the Community Standards showing how to use EquilateralAgents with Claude Skills.

---

## Marketplace File Validation

Our `.claude-plugin/marketplace.json` meets all requirements:

| Requirement | Status | Details |
|------------|--------|---------|
| File location | ✅ | `.claude-plugin/marketplace.json` |
| Required: `name` | ✅ | "equilateral-agents" (kebab-case) |
| Required: `owner` | ✅ | HappyHippo.ai contact info |
| Required: `plugins` array | ✅ | 1 plugin entry |
| Plugin: `name` | ✅ | "equilateral-agents-open-core" |
| Plugin: `source` | ✅ | "." (root of repository) |
| Plugin: `version` | ✅ | "2.0.2" |
| Plugin: `description` | ✅ | Complete description |
| Plugin: `commands` | ✅ | 9 commands listed |
| Plugin: `skills` | ✅ | 1 skill listed |
| Plugin: `license` | ✅ | MIT |
| Plugin: `keywords` | ✅ | Relevant keywords |
| JSON syntax | ✅ | Valid JSON |

---

## Team Distribution

For organizations wanting to distribute to their team:

### Option 1: Project-level Settings

Add to `.claude/settings.json` (committed to git):

```json
{
  "extraKnownMarketplaces": {
    "equilateral-agents": {
      "source": {
        "source": "github",
        "repo": "happyhippo-ai/equilateral-agents-open-core"
      }
    }
  }
}
```

Team members get the marketplace automatically when they clone the repository.

### Option 2: User-level Installation

Each team member runs:

```bash
/plugin marketplace add happyhippo-ai/equilateral-agents-open-core
/plugin install equilateral-agents-open-core
```

---

## Verification Checklist

Before submitting to marketplaces:

- ✅ `.claude-plugin/marketplace.json` exists and is valid
- ✅ `.claude/skills/equilateral-agents/SKILL.md` has valid YAML
- ✅ All 9 `.claude/commands/*.md` files are present
- ✅ `README.md` documents plugin usage
- ✅ `PLUGIN_USAGE.md` provides detailed guide
- ✅ `PLUGIN_VALIDATION.md` confirms compliance
- ✅ Repository is public (or accessible to marketplace users)
- ✅ License is specified (MIT)
- ✅ Version is up to date (2.0.2)

---

## Post-Submission

After submitting to community marketplaces:

1. **Monitor Pull Requests** - Watch for feedback from marketplace maintainers
2. **Update Version** - Keep marketplace.json version in sync with package.json
3. **Respond to Issues** - Address any installation problems users report
4. **Update Documentation** - Keep README.md and PLUGIN_USAGE.md current
5. **Track Installations** - Monitor GitHub stars/clones as proxy metrics

---

## Marketing Your Plugin

### In Your README Badge

Add marketplace badges:

```markdown
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blue)](https://github.com/happyhippo-ai/equilateral-agents-open-core)
```

### Social Media

Announce on:
- Twitter/X with #ClaudeCode #AI
- LinkedIn with plugin demo
- Dev.to or Medium with tutorial
- Hacker News (Show HN)

### Demo Video

Create a short video showing:
1. Installation: `/plugin marketplace add`
2. Activation: Mention "security review"
3. Execution: `/ea:security-review` running
4. Results: Evidence-based output

---

## Support Channels

Users can get help through:
- **GitHub Issues:** https://github.com/happyhippo-ai/equilateral-agents-open-core/issues
- **Documentation:** README.md, PLUGIN_USAGE.md
- **Email:** info@happyhippo.ai (for enterprise features)

---

## Keeping Up to Date

When you update the plugin:

1. **Update version** in:
   - `package.json`
   - `.claude-plugin/marketplace.json`
   - Individual plugin files if needed

2. **Tag the release:**
   ```bash
   git tag -a v2.0.3 -m "Update plugin with new features"
   git push origin v2.0.3
   ```

3. **Notify marketplaces:**
   - Community marketplaces auto-update from git
   - Manual submission may require update PR

4. **Changelog:**
   - Document changes in CHANGELOG.md
   - Update PLUGIN_USAGE.md if needed

---

## Next Steps

**Immediate Actions:**

1. ✅ Marketplace config created (`.claude-plugin/marketplace.json`)
2. ⏳ Commit and push to GitHub
3. ⏳ Create GitHub release (v2.0.2)
4. ⏳ Submit to community marketplaces:
   - https://claudecodecommands.directory/submit
   - https://github.com/ccplugins/marketplace
   - https://github.com/EveryInc/every-marketplace

**Optional:**

5. ⏳ Create demo video
6. ⏳ Write blog post/tutorial
7. ⏳ Share on social media
8. ⏳ Monitor feedback and iterate

---

## Conclusion

✅ **Our plugin is marketplace-ready!**

Users can install via:
- `/plugin marketplace add happyhippo-ai/equilateral-agents-open-core`
- Direct GitHub clone
- npm package

All marketplace requirements are met. Ready to submit to community marketplaces!

---

**Questions?** Contact info@happyhippo.ai
