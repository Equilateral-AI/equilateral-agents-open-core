#!/usr/bin/env node

/**
 * AWS Bedrock Integration Demo
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
 * Demonstrates AWS Bedrock integration with multiple foundation models
 */

const { AgentOrchestrator } = require('../equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('../agent-packs/development/CodeAnalyzerAgent');
const BedrockProvider = require('../equilateral-core/providers/BedrockProvider');

/**
 * Bedrock-enhanced agent with model selection
 */
class BedrockAnalyzerAgent extends CodeAnalyzerAgent {
    constructor(config = {}) {
        super({
            ...config,
            agentId: 'bedrock-analyzer'
        });

        // Initialize Bedrock provider
        this.bedrockProvider = new BedrockProvider({
            modelId: config.modelId || 'anthropic.claude-3-haiku-20240307-v1:0',
            region: config.region || 'us-east-1'
        });
    }

    async executeTask(task) {
        const result = await super.executeTask(task);

        // Enhance with Bedrock if available
        if (await this.bedrockProvider.isAvailable()) {
            console.log(`🧠 Enhancing with Bedrock (${this.bedrockProvider.modelId})...`);

            try {
                const prompt = this.bedrockProvider.formatAgentContext(result, task.taskType);
                const aiResponse = await this.bedrockProvider.complete(prompt, {
                    temperature: 0.3,
                    maxTokens: 1500
                });

                if (aiResponse) {
                    result.bedrockAnalysis = aiResponse.content;
                    result.bedrockModel = aiResponse.model;
                    result.tokenUsage = aiResponse.usage;

                    // Calculate cost
                    if (aiResponse.usage) {
                        result.estimatedCost = this.bedrockProvider.estimateCost(aiResponse.usage);
                    }
                }
            } catch (error) {
                console.warn(`Bedrock enhancement failed: ${error.message}`);
            }
        }

        return result;
    }
}

/**
 * Compare different Bedrock models
 */
async function compareBedrockModels() {
    const models = [
        { id: 'anthropic.claude-3-haiku-20240307-v1:0', name: 'Claude 3 Haiku' },
        { id: 'amazon.titan-text-lite-v1', name: 'Titan Text Lite' },
        { id: 'meta.llama3-8b-instruct-v1:0', name: 'Llama 3 8B' }
    ];

    console.log('\n🔬 Comparing Bedrock Models:\n');
    console.log('═'.repeat(60));

    for (const model of models) {
        console.log(`\n📊 Testing ${model.name}:`);
        console.log('─'.repeat(40));

        const provider = new BedrockProvider({ modelId: model.id });

        if (await provider.isAvailable()) {
            const testPrompt = 'Analyze this code: function add(a, b) { return a + b; }';

            try {
                const startTime = Date.now();
                const response = await provider.complete(testPrompt, {
                    temperature: 0.1,
                    maxTokens: 100
                });
                const duration = Date.now() - startTime;

                console.log(`✅ Response time: ${duration}ms`);

                if (response.usage) {
                    const cost = provider.estimateCost(response.usage);
                    console.log(`💰 Estimated cost: $${cost.totalCost.toFixed(6)}`);
                    console.log(`📝 Tokens: ${response.usage.inputTokens} in, ${response.usage.outputTokens} out`);
                }
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        } else {
            console.log('⚠️ Model not available (check AWS credentials)');
        }
    }
}

/**
 * Demonstrate Lambda deployment simulation
 */
function simulateLambdaEnvironment() {
    console.log('\n🔧 Lambda Environment Simulation:');
    console.log('─'.repeat(60));

    // Simulate Lambda environment variables
    const lambdaEnv = {
        AWS_LAMBDA_FUNCTION_NAME: 'equilateral-orchestrator',
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
        BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
        ENABLE_AI: 'true'
    };

    console.log('Environment Variables:');
    Object.entries(lambdaEnv).forEach(([key, value]) => {
        console.log(`  ${key}=${value}`);
    });

    console.log('\nIAM Policy Required:');
    console.log('```json');
    console.log(JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
            Effect: 'Allow',
            Action: ['bedrock:InvokeModel'],
            Resource: 'arn:aws:bedrock:*::foundation-model/*'
        }]
    }, null, 2));
    console.log('```\n');

    return lambdaEnv;
}

/**
 * Main AWS Bedrock demo
 */
async function runBedrockDemo() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         EquilateralAgents™ AWS Bedrock Integration           ║
║              AI Enhancement with Foundation Models            ║
╚═══════════════════════════════════════════════════════════════╝
`);

    // Check AWS configuration
    console.log('🔍 AWS Configuration Check:');
    console.log('─'.repeat(60));

    const hasAWSConfig = process.env.AWS_REGION || process.env.AWS_PROFILE;
    if (hasAWSConfig) {
        console.log(`✅ AWS Region: ${process.env.AWS_REGION || 'default'}`);
        console.log(`✅ AWS Profile: ${process.env.AWS_PROFILE || 'default'}`);
    } else {
        console.log('⚠️ No AWS configuration detected');
        console.log('💡 To enable Bedrock:');
        console.log('   1. Configure AWS credentials: aws configure');
        console.log('   2. Set region: export AWS_REGION=us-east-1');
        console.log('   3. Ensure Bedrock access is enabled in your AWS account\n');
    }

    // Simulate Lambda environment
    simulateLambdaEnvironment();

    // Create orchestrator
    const orchestrator = new AgentOrchestrator({
        projectPath: process.cwd(),
        aws: {
            region: process.env.AWS_REGION || 'us-east-1',
            service: 'bedrock'
        }
    });

    // Register Bedrock-enhanced agent
    const bedrockAnalyzer = new BedrockAnalyzerAgent({
        modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0'
    });

    orchestrator.registerAgent(bedrockAnalyzer);

    // Define Bedrock-enhanced workflow
    orchestrator.getWorkflowDefinition = (type) => {
        if (type === 'bedrock-analysis') {
            return {
                tasks: [{
                    agentId: 'bedrock-analyzer',
                    taskType: 'analyze',
                    taskData: {
                        projectPath: './examples',
                        enhanceWithBedrock: true
                    }
                }]
            };
        }
        return { tasks: [] };
    };

    await orchestrator.start();

    console.log('🚀 Running Bedrock-Enhanced Analysis\n');

    try {
        const result = await orchestrator.executeWorkflow('bedrock-analysis');

        // Display results
        console.log('\n📊 Analysis Results:');
        console.log('═'.repeat(60));

        result.results.forEach(taskResult => {
            const agentResult = taskResult.result;

            if (agentResult.bedrockAnalysis) {
                console.log('\n✨ Bedrock AI Analysis:');
                console.log('─'.repeat(40));
                console.log(agentResult.bedrockAnalysis);

                if (agentResult.estimatedCost) {
                    console.log('\n💰 Cost Analysis:');
                    console.log(`   Model: ${agentResult.bedrockModel}`);
                    console.log(`   Input tokens: ${agentResult.tokenUsage.inputTokens}`);
                    console.log(`   Output tokens: ${agentResult.tokenUsage.outputTokens}`);
                    console.log(`   Estimated cost: $${agentResult.estimatedCost.totalCost.toFixed(6)}`);
                }
            } else {
                console.log('\n📋 Basic Analysis (Bedrock not configured)');
                console.log('   Configure AWS credentials to enable AI enhancement');
            }
        });

    } catch (error) {
        console.error('❌ Workflow failed:', error.message);
    }

    await orchestrator.stop();

    // Compare models if AWS is configured
    if (hasAWSConfig) {
        await compareBedrockModels();
    }

    // Show deployment options
    console.log('\n🚀 AWS Deployment Options:');
    console.log('═'.repeat(60));

    console.log('\n1️⃣ CloudFormation:');
    console.log('```bash');
    console.log('aws cloudformation deploy \\');
    console.log('  --template-file aws-marketplace/template.yaml \\');
    console.log('  --stack-name equilateral-agents \\');
    console.log('  --parameter-overrides BedrockModelId=claude-3-haiku');
    console.log('```');

    console.log('\n2️⃣ SAM CLI:');
    console.log('```bash');
    console.log('sam deploy --guided');
    console.log('```');

    console.log('\n3️⃣ CDK:');
    console.log('```typescript');
    console.log('new EquilateralAgentsStack(app, "Stack", {');
    console.log('  bedrockModel: "claude-3-haiku"');
    console.log('});');
    console.log('```');

    console.log('\n📚 Resources:');
    console.log('   • AWS Marketplace: aws.amazon.com/marketplace/pp/equilateral');
    console.log('   • Documentation: docs.equilateral.ai/aws');
    console.log('   • Cost Calculator: calculator.equilateral.ai/bedrock\n');
}

// Export for testing
module.exports = {
    BedrockAnalyzerAgent,
    compareBedrockModels
};

// Run if executed directly
if (require.main === module) {
    runBedrockDemo().catch(console.error);
}