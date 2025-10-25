/**
 * EquilateralAgents™ Base Agent Class - Open Core Edition
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
 * Simple base class for creating specialized agents.
 * Agents execute tasks and report results through events.
 *
 * Open Core Version - Basic agent execution patterns
 */

const EventEmitter = require('events');
const { getSharedProvider } = require('./LLMProvider');
const SimpleAgentMemory = require('./SimpleAgentMemory');

class BaseAgent extends EventEmitter {
    constructor(config = {}) {
        super();
        this.agentId = config.agentId || this.constructor.name;
        this.agentType = config.agentType || 'generic';
        this.capabilities = config.capabilities || [];
        this.isRunning = false;
        this.orchestrator = null;
        this.config = config;

        // AI enhancement configuration
        this.aiEnabled = config.enableAI || config.ai?.enabled || false;
        this.llmProvider = this.aiEnabled ? getSharedProvider(config.ai) : null;

        // Memory system configuration (opt-in)
        this.memoryEnabled = config.enableMemory !== false; // Default: true
        this.memory = this.memoryEnabled ? new SimpleAgentMemory(this.agentId, config.memory || {}) : null;
    }

    /**
     * Set orchestrator reference for event communication
     */
    setOrchestrator(orchestrator) {
        this.orchestrator = orchestrator;
    }

    /**
     * Start the agent
     */
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log(`Agent ${this.agentId} started`);
        
        this.emit('agentStarted', { agentId: this.agentId });
    }

    /**
     * Stop the agent
     */
    async stop() {
        this.isRunning = false;
        console.log(`Agent ${this.agentId} stopped`);
        
        this.emit('agentStopped', { agentId: this.agentId });
    }

    /**
     * Execute a task - must be overridden by subclasses
     *
     * Note: Subclasses should call this.recordExecution() after task completion
     * to enable learning and pattern recognition
     */
    async executeTask(task) {
        throw new Error(`Agent ${this.agentId} must implement executeTask method`);
    }

    /**
     * Execute task with automatic memory recording
     */
    async executeTaskWithMemory(task) {
        const startTime = Date.now();

        try {
            const result = await this.executeTask(task);

            // Record successful execution
            if (this.memoryEnabled && this.memory) {
                this.memory.recordExecution(task, {
                    success: true,
                    duration: Date.now() - startTime,
                    result
                });
            }

            return result;
        } catch (error) {
            // Record failed execution
            if (this.memoryEnabled && this.memory) {
                this.memory.recordExecution(task, {
                    success: false,
                    duration: Date.now() - startTime,
                    error: error.message
                });
            }

            throw error;
        }
    }

    /**
     * Get agent capabilities
     */
    getCapabilities() {
        return this.capabilities;
    }

    /**
     * Log activity through orchestrator events
     */
    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date(),
            agentId: this.agentId,
            level,
            message,
            data
        };

        this.emit('log', logEntry);
        
        if (this.orchestrator) {
            this.orchestrator.emit('agentLog', logEntry);
        }

        // Also log to console for debugging
        console.log(`[${this.agentId}] ${level.toUpperCase()}: ${message}`);
    }

    /**
     * Helper method for async delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate task structure
     */
    validateTask(task) {
        if (!task || typeof task !== 'object') {
            throw new Error('Invalid task: must be an object');
        }
        
        if (!task.taskType) {
            throw new Error('Invalid task: missing taskType');
        }

        return true;
    }

    /**
     * Report task completion
     */
    reportTaskComplete(task, result) {
        const report = {
            agentId: this.agentId,
            taskType: task.taskType,
            result,
            timestamp: new Date(),
            duration: Date.now() - (task.startTime || Date.now())
        };

        this.emit('taskComplete', report);
        
        if (this.orchestrator) {
            this.orchestrator.emit('agentTaskComplete', report);
        }

        return report;
    }

    /**
     * Report task failure
     */
    reportTaskError(task, error) {
        const report = {
            agentId: this.agentId,
            taskType: task.taskType,
            error: error.message || error,
            timestamp: new Date()
        };

        this.emit('taskError', report);

        if (this.orchestrator) {
            this.orchestrator.emit('agentTaskError', report);
        }

        return report;
    }

    /**
     * Enhance agent output with AI analysis
     */
    async enhanceWithAI(data, taskType, options = {}) {
        if (!this.aiEnabled || !this.llmProvider) {
            return data;  // Return unenhanced if AI not enabled
        }

        try {
            const context = this.llmProvider.formatAgentContext(data, taskType);
            const prompt = this.buildPrompt(context, data, taskType);

            const aiResponse = await this.llmProvider.complete(prompt, {
                temperature: options.temperature || 0.3,
                maxTokens: options.maxTokens || 1000
            });

            if (aiResponse && aiResponse.content) {
                return {
                    ...data,
                    aiEnhanced: true,
                    aiAnalysis: aiResponse.content,
                    aiModel: this.llmProvider.model
                };
            }
        } catch (error) {
            this.log('warn', `AI enhancement failed: ${error.message}`);
        }

        return data;
    }

    /**
     * Build prompt for LLM based on agent context
     */
    buildPrompt(context, data, taskType) {
        return `${context.system}\n\nAnalyze this ${taskType} data:\n${JSON.stringify(data, null, 2)}\n\nProvide actionable insights and recommendations.`;
    }

    /**
     * Check if AI is available for this agent
     */
    hasAI() {
        return this.aiEnabled && this.llmProvider && this.llmProvider.isAvailable();
    }

    /**
     * Record task execution in memory (manual mode)
     * Use this when you override executeTask and want to control memory recording
     */
    recordExecution(task, outcome) {
        if (!this.memoryEnabled || !this.memory) {
            return null;
        }
        return this.memory.recordExecution(task, outcome);
    }

    /**
     * Get success patterns for a task type
     */
    getSuccessPatterns(taskType) {
        if (!this.memoryEnabled || !this.memory) {
            return null;
        }
        return this.memory.getSuccessPatterns(taskType);
    }

    /**
     * Suggest optimal workflow based on past experience
     */
    suggestOptimalWorkflow(context) {
        if (!this.memoryEnabled || !this.memory) {
            return { hasExperience: false, message: 'Memory not enabled' };
        }
        return this.memory.suggestOptimalWorkflow(context);
    }

    /**
     * Get memory performance metrics
     */
    getMemoryMetrics() {
        if (!this.memoryEnabled || !this.memory) {
            return null;
        }
        return this.memory.getPerformanceMetrics();
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        if (!this.memoryEnabled || !this.memory) {
            return null;
        }
        return this.memory.getStats();
    }

    /**
     * Reset agent memory
     */
    resetMemory() {
        if (this.memoryEnabled && this.memory) {
            this.memory.reset();
        }
    }

    /**
     * Check if memory is enabled
     */
    hasMemory() {
        return this.memoryEnabled && this.memory !== null;
    }
}

module.exports = BaseAgent;