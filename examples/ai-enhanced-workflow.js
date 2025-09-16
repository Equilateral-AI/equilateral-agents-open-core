#!/usr/bin/env node

/**
 * AI-Enhanced Workflow Example
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
 * Demonstrates the "Force Multiplier" pattern where agents provide
 * structured data that AI assistants can act upon.
 */

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('../agent-packs/development/CodeAnalyzerAgent');
const TestOrchestrationAgent = require('../agent-packs/development/TestOrchestrationAgent');
const { LLMProvider } = require('../equilateral-core/LLMProvider');

/**
 * Enhanced Code Analyzer with AI insights
 */
class AICodeAnalyzerAgent extends CodeAnalyzerAgent {
    constructor(config = {}) {
        super({
            ...config,
            enableAI: true,  // Enable AI enhancement
            ai: {
                enabled: true,
                capabilities: [
                    'explain_complexity',
                    'suggest_refactors',
                    'identify_patterns'
                ]
            }
        });
    }

    async analyzeCode(taskData) {
        // Get base analysis from parent
        const analysis = await super.analyzeCode(taskData);

        // Enhance with AI if available
        if (this.hasAI()) {
            console.log('🤖 Enhancing analysis with AI insights...');
            const enhanced = await this.enhanceWithAI(analysis, 'analyze', {
                temperature: 0.3,
                maxTokens: 1500
            });

            // Add AI recommendations to the analysis
            if (enhanced.aiAnalysis) {
                analysis.aiRecommendations = enhanced.aiAnalysis;
                analysis.aiEnhanced = true;
            }
        }

        return analysis;
    }
}

/**
 * Test Runner that can generate fixes with AI
 */
class AITestOrchestrationAgent extends TestOrchestrationAgent {
    constructor(config = {}) {
        super({
            ...config,
            enableAI: true,
            ai: {
                enabled: true,
                capabilities: [
                    'analyze_failures',
                    'generate_fixes',
                    'explain_errors'
                ]
            }
        });
    }

    async executeTask(task) {
        const result = await super.executeTask(task);

        // If tests failed and AI is available, generate fix suggestions
        if (result.failed > 0 && this.hasAI()) {
            console.log('🔧 AI generating fix suggestions...');

            const fixSuggestions = await this.generateFixSuggestions(result);
            result.fixSuggestions = fixSuggestions;

            // In CLI tools like Claude Code, these suggestions become actionable
            result.aiReadyForCLI = true;
        }

        return result;
    }

    async generateFixSuggestions(testResults) {
        const prompt = `
        Test failures detected:
        ${JSON.stringify(testResults.failures, null, 2)}

        Generate specific code fixes for each failure.
        Format as actionable steps.
        `;

        const enhanced = await this.enhanceWithAI(
            { failures: testResults.failures },
            'fix',
            { temperature: 0.2, maxTokens: 2000 }
        );

        return enhanced.aiAnalysis || 'Manual investigation required';
    }
}

/**
 * Main demonstration
 */
async function runAIEnhancedWorkflow() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║        EquilateralAgents™ AI-Enhanced Workflow Demo          ║
║                   The Force Multiplier Pattern                ║
╚═══════════════════════════════════════════════════════════════╝
`);

    // Check AI configuration
    const llmProvider = new LLMProvider();
    console.log('\n📋 AI Configuration:');
    const llmInfo = llmProvider.getInfo();

    if (llmInfo.configured) {
        console.log(`✅ Provider: ${llmInfo.provider}`);
        console.log(`✅ Model: ${llmInfo.model}`);
        console.log('✅ AI enhancements enabled\n');
    } else {
        console.log('ℹ️  No LLM configured - running in basic mode');
        console.log('💡 To enable AI, set LLM_PROVIDER and API key in .env\n');
        console.log('Example:');
        console.log('  LLM_PROVIDER=openai');
        console.log('  OPENAI_API_KEY=sk-...\n');
    }

    // Create orchestrator
    const orchestrator = new AgentOrchestrator({
        projectPath: process.cwd()
    });

    // Register AI-enhanced agents
    const codeAnalyzer = new AICodeAnalyzerAgent();
    const testRunner = new AITestOrchestrationAgent();

    orchestrator.registerAgent(codeAnalyzer);
    orchestrator.registerAgent(testRunner);

    // Start orchestrator
    await orchestrator.start();

    // Define AI-enhanced workflow
    orchestrator.getWorkflowDefinition = (type) => {
        if (type === 'ai-enhanced-review') {
            return {
                tasks: [
                    {
                        agentId: 'code-analyzer',
                        taskType: 'analyze',
                        taskData: { projectPath: './examples' }
                    },
                    {
                        agentId: 'test-runner',
                        taskType: 'test',
                        taskData: { testPath: './examples' }
                    }
                ]
            };
        }
        return { tasks: [] };
    };

    console.log('🚀 Running AI-Enhanced Code Review Workflow\n');
    console.log('This workflow demonstrates how agents provide structured data');
    console.log('that AI assistants (or your BYOL setup) can interpret and act upon.\n');

    try {
        const result = await orchestrator.executeWorkflow('ai-enhanced-review');

        console.log('\n📊 Workflow Results:\n');

        // Show results in a format that AI assistants can parse
        result.results.forEach((taskResult, index) => {
            console.log(`Task ${index + 1}: ${taskResult.agentId}`);
            console.log('─'.repeat(50));

            if (taskResult.result.aiEnhanced) {
                console.log('✨ AI-Enhanced Results Available');
                console.log('\nStructured Data for AI Processing:');
                console.log(JSON.stringify({
                    agent: taskResult.agentId,
                    hasAIRecommendations: !!taskResult.result.aiRecommendations,
                    hasFixSuggestions: !!taskResult.result.fixSuggestions,
                    readyForCLI: taskResult.result.aiReadyForCLI
                }, null, 2));
            } else {
                console.log('📋 Basic Analysis (AI not configured)');
                console.log('Structured data ready for AI assistant interpretation');
            }
            console.log();
        });

        // Demonstrate the Force Multiplier effect
        console.log('\n🎯 Force Multiplier Pattern:');
        console.log('─'.repeat(50));
        console.log('When run in AI coding assistants (Claude Code, Cursor, etc.):');
        console.log('1. Agents provide structured analysis');
        console.log('2. AI assistant interprets the results');
        console.log('3. AI can generate and apply fixes automatically');
        console.log('4. Agents validate the changes\n');

        if (!llmInfo.configured) {
            console.log('💡 TIP: Configure an LLM to see AI-generated insights!');
            console.log('   Or run this in Claude Code/Cursor for automatic enhancement.\n');
        }

    } catch (error) {
        console.error('Workflow failed:', error);
    }

    await orchestrator.stop();

    // Show next steps
    console.log('\n📚 Next Steps:');
    console.log('─'.repeat(50));
    console.log('1. Try with your LLM: export LLM_PROVIDER=openai');
    console.log('2. Run in Claude Code for automatic fix generation');
    console.log('3. Check examples/test-fix-cycle.js for auto-repair demo');
    console.log('4. See AI-INTEGRATION.md for configuration options\n');

    console.log('🏢 Commercial Edition includes:');
    console.log('   • Embedded AI (no API keys needed)');
    console.log('   • Optimized model routing');
    console.log('   • Fine-tuned workflow models');
    console.log('   • Learn more: https://equilateral.ai/commercial\n');
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('Error:', error.message);
    process.exit(1);
});

// Run if executed directly
if (require.main === module) {
    runAIEnhancedWorkflow();
}