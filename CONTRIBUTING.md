# Contributing to EquilateralAgents Open Core

First off, thank you for considering contributing to EquilateralAgents! It's people like you that make EquilateralAgents such a great tool. 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Important: CLA Required](#important-cla-required)
- [What Can I Contribute?](#what-can-i-contribute)
- [What NOT to Contribute](#what-not-to-contribute)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Important: CLA Required

**⚠️ All contributors MUST sign our Contributor License Agreement (CLA)**

Before we can accept your contribution, you need to sign our CLA. This allows us to:
- Include your contribution in both open source and commercial versions
- Protect the project's dual licensing model
- Ensure clear intellectual property rights

👉 **[Read and sign the CLA](CLA.md)**

First-time contributors should include "I have read and agree to the CLA" in their PR description.

---

## What Can I Contribute?

We love contributions in these areas:

### ✅ Encouraged Contributions

1. **New Open Source Agents**
   - Development tools agents
   - Testing utilities
   - Documentation generators
   - Linting/formatting agents

2. **Bug Fixes**
   - Core orchestrator issues
   - Agent communication bugs
   - Error handling improvements

3. **Documentation**
   - Tutorials and guides
   - API documentation
   - Example workflows
   - Translation to other languages

4. **Tests**
   - Unit tests
   - Integration tests
   - Example test scenarios

5. **Developer Experience**
   - CLI improvements
   - Better error messages
   - Debugging tools
   - Development utilities

### 🎯 High-Priority Areas

Check our [GitHub Issues](https://github.com/equilateral/open-core/issues) for:
- Issues labeled `good first issue`
- Issues labeled `help wanted`
- Issues labeled `community`

---

## What NOT to Contribute

Please **DO NOT** submit PRs for:

### ❌ Commercial Features
These are reserved for our commercial license:
- Advanced execution patterns
- Enterprise persistence solutions
- Premium AI model integrations
- Enterprise authentication (SSO, SAML)
- Team collaboration features
- Monitoring dashboards
- Performance optimizations for scale

### ❌ Breaking Changes
- Changes that break existing APIs
- Major architectural changes without discussion
- Removal of existing features

### ❌ Licensed Dependencies
- Dependencies with incompatible licenses
- Commercial or proprietary code
- Code copied from other projects without permission

**If unsure, ask first!** Open an issue to discuss before implementing.

---

## How to Contribute

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/equilateral-open-core.git
cd equilateral-open-core
git remote add upstream https://github.com/equilateral/open-core.git
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 4. Test Your Changes

```bash
npm test                    # Run tests
npm run demo               # Test with demo
npm run playground         # Test interactively
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new awesome feature

- Detailed description of what changed
- Why this change was needed
- Any breaking changes or notes

I have read and agree to the CLA"  # First time only
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `test:` Adding tests
- `chore:` Maintenance

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Pull Request Process

### PR Requirements

Your PR must:
1. ✅ Pass all tests
2. ✅ Include tests for new features
3. ✅ Update documentation if needed
4. ✅ Follow code style guidelines
5. ✅ Have a clear description
6. ✅ Reference any related issues
7. ✅ Include CLA agreement (first time)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] I have read the CLA
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** run immediately
2. **Community review** within 48 hours
3. **Core team review** within 1 week
4. **Merge** after approval

---

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run demo
npm run demo

# Run specific agent
npm run agents -- --agent code-analyzer

# Run in watch mode
npm run dev
```

### Project Structure

```
equilateral-open-core/
├── equilateral-core/      # Core orchestrator
│   ├── AgentOrchestrator.js
│   └── BaseAgent.js
├── agent-packs/            # Bundled agents
│   ├── development/
│   ├── security/
│   └── infrastructure/
├── examples/               # Example usage
├── docs/                   # Documentation
└── tests/                  # Test suite
```

### Code Style

- Use 4 spaces for indentation
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused
- Write tests for new features

---

## Community

### Get Help

- 💬 **Discord**: [discord.gg/hugPmRn49Z](https://discord.gg/hugPmRn49Z)
- 🐛 **Issues**: [GitHub Issues](https://github.com/equilateral/open-core/issues)
- 📧 **Email**: info@happyhippo.ai

### Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md) - All contributors
- Release notes - Per-release contributors
- Website - Major contributors
- Swag - Active contributors get EquilateralAgents swag!

### Becoming a Core Contributor

Active contributors may be invited to become Core Contributors with:
- Write access to the repository
- Voice in project direction
- Early access to commercial features
- Recognition on website

---

## Questions?

Not sure about something? That's fine! Feel free to:
1. Open an issue for discussion
2. Ask in Discord #general channel
3. Email info@happyhippo.ai

We're here to help and excited to see what you build!

---

**Thank you for contributing to EquilateralAgents! Together we're building the future of intelligent automation.** 🚀
