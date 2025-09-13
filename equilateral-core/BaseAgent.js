/**
 * EquilateralAgents™ Base Agent Class - Open Core Edition
 * 
 * Simple base class for creating specialized agents.
 * Agents execute tasks and report results through events.
 * 
 * Open Core Version - Basic agent execution patterns
 */

const EventEmitter = require('events');

class BaseAgent extends EventEmitter {
    constructor(config = {}) {
        super();
        this.agentId = config.agentId || this.constructor.name;
        this.agentType = config.agentType || 'generic';
        this.capabilities = config.capabilities || [];
        this.isRunning = false;
        this.orchestrator = null;
        this.config = config;
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
     */
    async executeTask(task) {
        throw new Error(`Agent ${this.agentId} must implement executeTask method`);
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
}

module.exports = BaseAgent;