/**
 * AWS Bedrock Provider - Open Core Edition
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
 * AWS Bedrock integration for BYOL AI enhancement
 * Supports multiple foundation models through unified interface
 */

const AWS = require('aws-sdk');

class BedrockProvider {
    constructor(config = {}) {
        this.region = config.region || process.env.AWS_REGION || 'us-east-1';
        this.modelId = config.modelId || process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
        this.bedrock = null;
        this.initialized = false;

        // Model-specific configurations
        this.modelConfigs = {
            'anthropic.claude': {
                maxTokens: 4096,
                temperature: 0.3,
                topP: 0.9,
                formatRequest: this.formatClaudeRequest.bind(this),
                parseResponse: this.parseClaudeResponse.bind(this)
            },
            'amazon.titan': {
                maxTokens: 4096,
                temperature: 0.3,
                topP: 0.9,
                formatRequest: this.formatTitanRequest.bind(this),
                parseResponse: this.parseTitanResponse.bind(this)
            },
            'meta.llama': {
                maxTokens: 2048,
                temperature: 0.3,
                topP: 0.9,
                formatRequest: this.formatLlamaRequest.bind(this),
                parseResponse: this.parseLlamaResponse.bind(this)
            },
            'cohere.command': {
                maxTokens: 4096,
                temperature: 0.3,
                formatRequest: this.formatCohereRequest.bind(this),
                parseResponse: this.parseCohereResponse.bind(this)
            }
        };
    }

    /**
     * Initialize Bedrock client
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Check if running in Lambda or EC2 with IAM role
            const isAWSEnvironment = process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME;

            if (isAWSEnvironment) {
                // Use IAM role credentials
                this.bedrock = new AWS.BedrockRuntime({
                    region: this.region
                });
            } else {
                // Use local credentials
                this.bedrock = new AWS.BedrockRuntime({
                    region: this.region,
                    credentials: new AWS.SharedIniFileCredentials({
                        profile: process.env.AWS_PROFILE || 'default'
                    })
                });
            }

            this.initialized = true;
            console.log(`Bedrock provider initialized with model: ${this.modelId}`);
        } catch (error) {
            console.error('Failed to initialize Bedrock:', error.message);
            throw error;
        }
    }

    /**
     * Generate completion using Bedrock
     */
    async complete(prompt, options = {}) {
        await this.initialize();

        const modelFamily = this.getModelFamily(this.modelId);
        const config = this.modelConfigs[modelFamily];

        if (!config) {
            throw new Error(`Unsupported model: ${this.modelId}`);
        }

        const requestBody = config.formatRequest(prompt, {
            ...config,
            ...options
        });

        try {
            const response = await this.bedrock.invokeModel({
                modelId: this.modelId,
                body: JSON.stringify(requestBody),
                contentType: 'application/json',
                accept: 'application/json'
            }).promise();

            const responseBody = JSON.parse(response.body.toString());
            return config.parseResponse(responseBody);
        } catch (error) {
            console.error('Bedrock invocation failed:', error);
            throw error;
        }
    }

    /**
     * Stream completion (for real-time responses)
     */
    async *streamComplete(prompt, options = {}) {
        await this.initialize();

        const modelFamily = this.getModelFamily(this.modelId);
        const config = this.modelConfigs[modelFamily];

        if (!config) {
            throw new Error(`Unsupported model: ${this.modelId}`);
        }

        const requestBody = config.formatRequest(prompt, {
            ...config,
            ...options
        });

        try {
            const response = await this.bedrock.invokeModelWithResponseStream({
                modelId: this.modelId,
                body: JSON.stringify(requestBody),
                contentType: 'application/json',
                accept: 'application/json'
            }).promise();

            for await (const chunk of response.body) {
                if (chunk.chunk) {
                    const data = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
                    yield config.parseStreamChunk(data);
                }
            }
        } catch (error) {
            console.error('Bedrock streaming failed:', error);
            throw error;
        }
    }

    /**
     * Get model family from model ID
     */
    getModelFamily(modelId) {
        if (modelId.startsWith('anthropic.claude')) return 'anthropic.claude';
        if (modelId.startsWith('amazon.titan')) return 'amazon.titan';
        if (modelId.startsWith('meta.llama')) return 'meta.llama';
        if (modelId.startsWith('cohere.command')) return 'cohere.command';
        return null;
    }

    /**
     * Format request for Claude models
     */
    formatClaudeRequest(prompt, options) {
        return {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.3,
            top_p: options.topP || 0.9,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            system: options.systemPrompt || "You are an expert software development assistant."
        };
    }

    /**
     * Parse Claude response
     */
    parseClaudeResponse(response) {
        return {
            content: response.content[0].text,
            usage: {
                inputTokens: response.usage?.input_tokens || 0,
                outputTokens: response.usage?.output_tokens || 0
            },
            model: this.modelId
        };
    }

    /**
     * Format request for Titan models
     */
    formatTitanRequest(prompt, options) {
        return {
            inputText: prompt,
            textGenerationConfig: {
                maxTokenCount: options.maxTokens || 4096,
                temperature: options.temperature || 0.3,
                topP: options.topP || 0.9,
                stopSequences: options.stopSequences || []
            }
        };
    }

    /**
     * Parse Titan response
     */
    parseTitanResponse(response) {
        return {
            content: response.results[0].outputText,
            usage: {
                inputTokens: response.inputTextTokenCount || 0,
                outputTokens: response.results[0].tokenCount || 0
            },
            model: this.modelId
        };
    }

    /**
     * Format request for Llama models
     */
    formatLlamaRequest(prompt, options) {
        return {
            prompt: prompt,
            max_gen_len: options.maxTokens || 2048,
            temperature: options.temperature || 0.3,
            top_p: options.topP || 0.9
        };
    }

    /**
     * Parse Llama response
     */
    parseLlamaResponse(response) {
        return {
            content: response.generation,
            usage: {
                inputTokens: response.prompt_token_count || 0,
                outputTokens: response.generation_token_count || 0
            },
            model: this.modelId
        };
    }

    /**
     * Format request for Cohere models
     */
    formatCohereRequest(prompt, options) {
        return {
            prompt: prompt,
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.3,
            p: options.topP || 0.9,
            return_likelihoods: 'NONE'
        };
    }

    /**
     * Parse Cohere response
     */
    parseCohereResponse(response) {
        return {
            content: response.generations[0].text,
            usage: {
                inputTokens: 0,  // Cohere doesn't provide token counts in basic response
                outputTokens: 0
            },
            model: this.modelId
        };
    }

    /**
     * Enhanced agent context for Bedrock
     */
    formatAgentContext(agentOutput, taskType) {
        const prompts = {
            'analyze': `Analyze this code quality report and provide actionable recommendations:\n${JSON.stringify(agentOutput, null, 2)}`,
            'test': `Review these test results and suggest fixes for failures:\n${JSON.stringify(agentOutput, null, 2)}`,
            'security': `Evaluate these security findings and prioritize remediation:\n${JSON.stringify(agentOutput, null, 2)}`,
            'deploy': `Assess deployment readiness based on these validation results:\n${JSON.stringify(agentOutput, null, 2)}`
        };

        return prompts[taskType] || `Process this agent output:\n${JSON.stringify(agentOutput, null, 2)}`;
    }

    /**
     * Cost estimation for Bedrock usage
     */
    estimateCost(usage) {
        // Rough estimates per 1000 tokens (varies by model)
        const pricing = {
            'anthropic.claude-3-haiku': { input: 0.00025, output: 0.00125 },
            'anthropic.claude-3-sonnet': { input: 0.003, output: 0.015 },
            'amazon.titan-text-lite': { input: 0.0003, output: 0.0004 },
            'amazon.titan-text-express': { input: 0.0008, output: 0.0016 },
            'meta.llama3-8b': { input: 0.0003, output: 0.0006 },
            'meta.llama3-70b': { input: 0.00265, output: 0.0035 },
            'cohere.command': { input: 0.0015, output: 0.002 }
        };

        const modelPricing = Object.entries(pricing).find(([key]) =>
            this.modelId.startsWith(key)
        )?.[1] || { input: 0.001, output: 0.002 };

        const inputCost = (usage.inputTokens / 1000) * modelPricing.input;
        const outputCost = (usage.outputTokens / 1000) * modelPricing.output;

        return {
            inputCost,
            outputCost,
            totalCost: inputCost + outputCost,
            model: this.modelId
        };
    }

    /**
     * Check if Bedrock is available
     */
    isAvailable() {
        return !!this.bedrock || !!process.env.AWS_REGION;
    }

    /**
     * Get provider info
     */
    getInfo() {
        return {
            provider: 'bedrock',
            model: this.modelId,
            region: this.region,
            configured: this.isAvailable(),
            initialized: this.initialized,
            supportedModels: Object.keys(this.modelConfigs)
        };
    }
}

module.exports = BedrockProvider;