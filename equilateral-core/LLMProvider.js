/**
 * LLM Provider Abstraction - Open Core Edition
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
 * Bring Your Own LLM (BYOL) provider abstraction
 * Allows agents to leverage existing AI subscriptions
 */

class LLMProvider {
    constructor(config = {}) {
        this.provider = config.provider || process.env.LLM_PROVIDER || 'none';
        this.apiKey = config.apiKey || this.getApiKeyFromEnv();
        this.model = config.model || this.getDefaultModel();
        this.config = config;
        this.initialized = false;
    }

    /**
     * Initialize the provider (lazy loading to avoid requiring unused SDKs)
     */
    async initialize() {
        if (this.initialized || this.provider === 'none') return;

        try {
            switch (this.provider) {
                case 'openai':
                    await this.initOpenAI();
                    break;
                case 'anthropic':
                    await this.initAnthropic();
                    break;
                case 'copilot':
                    await this.initCopilot();
                    break;
                case 'ollama':
                    await this.initOllama();
                    break;
                case 'azure':
                    await this.initAzure();
                    break;
                default:
                    console.log(`LLM provider '${this.provider}' not configured. Running without AI enhancement.`);
            }
            this.initialized = true;
        } catch (error) {
            console.warn(`Failed to initialize LLM provider: ${error.message}`);
            console.log('Continuing without AI enhancement.');
            this.provider = 'none';
        }
    }

    /**
     * Generate a completion from the LLM
     */
    async complete(prompt, options = {}) {
        if (this.provider === 'none') {
            return null;
        }

        await this.initialize();

        const enhancedOptions = {
            temperature: 0.3,  // Default to focused responses
            maxTokens: 1000,
            ...options
        };

        try {
            switch (this.provider) {
                case 'openai':
                    return await this.completeOpenAI(prompt, enhancedOptions);
                case 'anthropic':
                    return await this.completeAnthropic(prompt, enhancedOptions);
                case 'ollama':
                    return await this.completeOllama(prompt, enhancedOptions);
                default:
                    return null;
            }
        } catch (error) {
            console.warn(`LLM completion failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Transform agent output into LLM-ready context
     */
    formatAgentContext(agentOutput, taskType) {
        const context = {
            system: this.getSystemPrompt(taskType),
            user: this.formatAgentData(agentOutput),
            examples: this.getExamples(taskType)
        };

        return context;
    }

    /**
     * Get system prompt based on task type
     */
    getSystemPrompt(taskType) {
        const prompts = {
            'analyze': 'You are a code analysis expert. Interpret the analysis results and provide actionable insights.',
            'test': 'You are a test automation expert. Analyze test failures and suggest fixes.',
            'security': 'You are a security expert. Explain vulnerabilities and provide remediation guidance.',
            'deploy': 'You are a deployment expert. Evaluate deployment readiness based on validation results.',
            'fix': 'You are a debugging expert. Generate code fixes based on the identified issues.',
            'refactor': 'You are a refactoring expert. Suggest improvements based on code complexity analysis.'
        };

        return prompts[taskType] || 'You are an AI assistant helping with development tasks.';
    }

    /**
     * Format agent data for LLM consumption
     */
    formatAgentData(data) {
        if (typeof data === 'string') return data;

        // Convert structured data to readable format
        return JSON.stringify(data, null, 2);
    }

    /**
     * Get examples for few-shot learning
     */
    getExamples(taskType) {
        // In commercial version, this would pull from a curated example database
        return [];
    }

    /**
     * Get API key from environment
     */
    getApiKeyFromEnv() {
        const keyMappings = {
            'openai': 'OPENAI_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'copilot': 'GITHUB_TOKEN',
            'azure': 'AZURE_OPENAI_KEY'
        };

        const envVar = keyMappings[this.provider];
        return envVar ? process.env[envVar] : null;
    }

    /**
     * Get default model for provider
     */
    getDefaultModel() {
        const defaults = {
            'openai': process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            'anthropic': process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
            'ollama': process.env.OLLAMA_MODEL || 'codellama',
            'azure': process.env.AZURE_MODEL || 'gpt-35-turbo'
        };

        return defaults[this.provider] || null;
    }

    /**
     * Provider-specific initialization (stubs for BYOL)
     */
    async initOpenAI() {
        // Users would need to: npm install openai
        console.log('OpenAI provider ready (ensure openai package is installed)');
    }

    async initAnthropic() {
        // Users would need to: npm install @anthropic-ai/sdk
        console.log('Anthropic provider ready (ensure @anthropic-ai/sdk is installed)');
    }

    async initCopilot() {
        console.log('GitHub Copilot integration ready');
    }

    async initOllama() {
        console.log('Ollama local model ready (ensure Ollama is running)');
    }

    async initAzure() {
        console.log('Azure OpenAI ready');
    }

    /**
     * Provider-specific completion (stubs that show the pattern)
     */
    async completeOpenAI(prompt, options) {
        // This is a stub - actual implementation would use the OpenAI SDK
        console.log('OpenAI completion requested (install openai package for actual functionality)');
        return {
            content: `[OpenAI would process: ${prompt.substring(0, 50)}...]`,
            model: this.model,
            usage: { prompt_tokens: 0, completion_tokens: 0 }
        };
    }

    async completeAnthropic(prompt, options) {
        // This is a stub - actual implementation would use the Anthropic SDK
        console.log('Anthropic completion requested (install @anthropic-ai/sdk for actual functionality)');
        return {
            content: `[Claude would process: ${prompt.substring(0, 50)}...]`,
            model: this.model,
            usage: { input_tokens: 0, output_tokens: 0 }
        };
    }

    async completeOllama(prompt, options) {
        // This would make HTTP requests to local Ollama
        console.log('Ollama completion requested (ensure Ollama is running locally)');
        return {
            content: `[Ollama would process: ${prompt.substring(0, 50)}...]`,
            model: this.model
        };
    }

    /**
     * Check if AI is available
     */
    isAvailable() {
        return this.provider !== 'none' && this.apiKey !== null;
    }

    /**
     * Get provider info for logging
     */
    getInfo() {
        return {
            provider: this.provider,
            model: this.model,
            configured: this.isAvailable(),
            initialized: this.initialized
        };
    }
}

// Singleton instance for shared use
let sharedProvider = null;

/**
 * Get or create shared LLM provider
 */
function getSharedProvider(config = {}) {
    if (!sharedProvider) {
        sharedProvider = new LLMProvider(config);
    }
    return sharedProvider;
}

module.exports = {
    LLMProvider,
    getSharedProvider
};