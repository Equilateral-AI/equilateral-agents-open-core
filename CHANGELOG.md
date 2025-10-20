# Changelog

All notable changes to EquilateralAgents Open Core will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-10-20

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

[2.0.1]: https://github.com/JamesFord-HappyHippo/equilateral-agents-open-core/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/JamesFord-HappyHippo/equilateral-agents-open-core/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/JamesFord-HappyHippo/equilateral-agents-open-core/releases/tag/v1.0.2
