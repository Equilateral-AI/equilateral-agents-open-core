/**
 * EquilateralAgents™ Open Core
 * 
 * Simple event-driven agent orchestration for development teams
 */

// Core exports
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const BaseAgent = require('./equilateral-core/BaseAgent');

// Example agents
const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');

module.exports = {
    // Core framework
    AgentOrchestrator,
    BaseAgent,
    
    // Example agents
    agents: {
        CodeAnalyzerAgent
    },

    // Version info
    version: require('./package.json').version,
    
    // Quick start helper
    createOrchestrator: (config = {}) => {
        return new AgentOrchestrator(config);
    }
};

// CLI interface
if (require.main === module) {
    console.log(`
╔═══════════════════════════════════════════╗
║   EquilateralAgents™ Open Core v1.0.0    ║
║   Simple Agent Orchestration Framework   ║
╚═══════════════════════════════════════════╝

Quick Start:
  npm install
  node examples/simple-workflow.js

Documentation:
  https://github.com/happyhippo-ai/equilateral-agents-open-core

Commercial Features:
  https://equilateral.ai/commercial
`);
}