/**
 * EquilateralAgents™ Open Core
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * EquilateralAgents™ is a trademark of HappyHippo.ai
 *
 * Simple event-driven agent orchestration for development teams
 */

// Core exports
const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const BaseAgent = require('./equilateral-core/BaseAgent');
const SimpleAgentMemory = require('./equilateral-core/SimpleAgentMemory');

// Example agents
const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');

module.exports = {
    // Core framework
    AgentOrchestrator,
    BaseAgent,
    SimpleAgentMemory,

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