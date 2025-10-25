# Changelog

All notable changes to EquilateralAgents Open Core will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-10-25

### Added
- **SimpleAgentMemory** - Self-learning agent memory system (MAJOR NEW FEATURE)
  - Tracks last 100 executions per agent automatically
  - Pattern recognition and success rate analysis
  - Workflow optimization suggestions based on execution history
  - Performance metrics and trend analysis
  - File-based persistence in `.agent-memory/` directory
  - New BaseAgent methods: `executeTaskWithMemory()`, `getSuccessPatterns()`, `suggestOptimalWorkflow()`
  - Memory enabled by default (can opt-out via config)
  - See `equilateral-core/SimpleAgentMemory.js`

- **StandardsContributor** - Community standards contribution system (UNIQUE DIFFERENTIATOR)
  - Post-execution prompts to create standards from learned patterns
  - Automatic markdown generation with code examples from real executions
  - Git integration for committing to local standards or creating PRs to community standards
  - Privacy/anonymization checks before contribution
  - Evolves `.equilateral-standards` from real-world usage patterns
  - See `equilateral-core/StandardsContributor.js`

- **PathScanningHelper** - Centralized path scanning utility ensuring src/ directories are always scanned
  - Explicitly prioritizes src/, lib/, app/, source/, and other common source directories
  - Two-phase scanning: priority directories first, then remaining project directories
  - Detailed logging showing exactly which directories and files are being scanned
  - Clear warnings when src/ directory is missing or has no files
  - Comprehensive statistics API (file counts by directory and extension)
  - Support for all major languages (JavaScript, TypeScript, Python, Java, Go, Rust, etc.)
  - Configurable scan depth, extensions, and skip patterns
  - See `equilateral-core/PathScanningHelper.js`

### Changed
- **BaseAgent** enhanced with memory integration
  - All agents inherit memory capabilities automatically
  - Backward compatible - existing code continues to work
  - Optional memory tracking via `executeTaskWithMemory()`

- **All 19 production agents** now use PathScanningHelper for consistent directory scanning
  - CodeAnalyzerAgent, CodeGeneratorAgent, TestOrchestrationAgent, DeploymentValidationAgent
  - TestAgent, UIUXSpecialistAgent, CodeReviewAgent, AuditorAgent
  - BackendAuditorAgent, FrontendAuditorAgent, TemplateValidationAgent
  - SecurityScannerAgent, ComplianceCheckAgent, SecurityReviewerAgent, SecurityVulnerabilityAgent
  - DeploymentAgent, ResourceOptimizationAgent, ConfigurationManagementAgent, MonitoringOrchestrationAgent

- **All 9 Claude Code plugin commands** updated with enhanced output showing scan progress
  - Users now see real-time scanning progress and statistics
  - Clear visibility into which directories are being analyzed

- **package.json** updated
  - Description now highlights "Self-Learning AI Agents with Community Standards Contribution"
  - New scripts: `npm run demo:memory`, `npm run memory:stats`

### Fixed
- **Critical**: Agents now guarantee scanning of src/ directories where user code is typically located
- **Critical**: Users receive clear warnings if src/ directory is not found or empty
- Inconsistent directory scanning behavior across different agents
- Missing visibility into which files and directories were scanned during analysis

### Documentation
- Added comprehensive agent memory documentation:
  - `AGENT_MEMORY_GUIDE.md` - User-facing guide to agent memory features
  - `AGENT_MEMORY_IMPLEMENTATION.md` - Technical implementation details
  - `AGENT_MEMORY_RELEASE.md` - Release notes for memory feature
  - `.standards/agent_memory_standards.md` - Implementation standards
  - `examples/agent-memory-example.js` - Working demonstration

- Added comprehensive path scanning documentation:
  - `PATH_SCANNING_FIX.md` - Technical analysis and solution design
  - `PATH_SCANNING_ROLLOUT_COMPLETE.md` - Complete rollout summary
  - `AGENT_ROLLOUT_BREAKDOWN.md` - Detailed update timeline
  - `INTEGRATION_TEST_RESULTS.md` - Full test results and verification

- Enhanced `.claude/commands/*.md` files with scanning output examples
- Added verification script: `scripts/verify-pathscanner-rollout.js`

### Testing
- Added comprehensive test suite: `tests/PathScanningHelper.test.js`
  - 15+ test cases covering standard structures, missing src/, edge cases
  - 100% test coverage on PathScanningHelper
  - Tested on real repository (58 JS files, 93 total files)
  - Verified warnings work correctly when src/ is missing

## [2.0.2] - 2025-10-20

### Added
- **MinimalMCPServer** included in npm package distribution
- CHANGELOG.md now included in npm package for version tracking

### Fixed
- Package version alignment with repository state

## [2.0.1] - 2025-10-20 (GitHub only)

### Added
- **MinimalMCPServer** - Lightweight Model Context Protocol server implementation
  - STDIO transport for Claude Desktop integration
  - HTTP transport for remote MCP clients
  - Tool registration API for exposing agent capabilities
  - JSON-RPC 2.0 compliance
  - See `equilateral-core/protocols/MinimalMCPServer.js`
- Configuration management example with sanitized templates
  - See `examples/configuration-management-example.js`
- Clean module exports for downstream packages
  - Export MinimalMCPServer, AgentCommunicationBus, ProtocolCompatibilityLayer

### Changed
- Moved `better-sqlite3` to `optionalDependencies` for true zero-config
- Updated ConfigurationManagementAgent to use environment variables instead of hardcoded values
- Enhanced package.json with clean exports for protocol modules

### Security
- Removed hardcoded AWS account information from ConfigurationManagementAgent
- Added Discord integration files to .gitignore to protect bot tokens
- Added configuration examples showing proper use of environment variables

### Documentation
- Updated README with MCP Server integration guide
- Enhanced protocol documentation
- Added Claude Desktop configuration examples
- Updated three-tier standards documentation

## [2.0.0] - 2025-10-01

### Added
- Expanded from 8 to 22 production-ready agents
- Three-tier standards system (Official, Community, Local)
- Background execution support with progress monitoring
- Five battle-tested workflows
- Protocol Compatibility Layer (MCP, A2A, AP2)
- Agent Communication Bus with priority queuing
- Infrastructure Core meta-agents (Classifier, Memory Manager, Factory)

### Changed
- Repository restructured with agent-packs organization
- Enhanced documentation with comprehensive guides
- Improved zero-config experience

## [1.0.2] - 2024-08-23

### Added
- Initial public release
- 8 core agents (CodeAnalyzer, CodeReview, Security, Deployment)
- AgentOrchestrator with sequential execution
- Basic workflow support
- SQLite persistence layer
- MIT License

[2.1.0]: https://github.com/Equilateral-AI/equilateral-agents-open-core/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/Equilateral-AI/equilateral-agents-open-core/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/Equilateral-AI/equilateral-agents-open-core/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Equilateral-AI/equilateral-agents-open-core/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/Equilateral-AI/equilateral-agents-open-core/releases/tag/v1.0.2
