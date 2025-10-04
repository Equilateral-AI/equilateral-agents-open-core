/**
 * EquilateralAgents™ Core Orchestrator - Open Core Edition
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
 * Simple event-driven agent coordination for development teams.
 * Focuses on agent execution and basic workflow management.
 *
 * Open Core Version - Basic agent execution patterns
 * Commercial tiers include advanced coordination and multi-tenancy
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class AgentOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.projectPath = config.projectPath || process.cwd();
        this.configPath = path.join(this.projectPath, '.equilateral');
        this.agents = new Map();
        this.isRunning = false;
        this.workflowHistory = [];

        // Background execution support
        this.backgroundWorkflows = new Map();
        this.enableBackground = config.enableBackground !== false;
    }

    /**
     * Register an agent with the orchestrator
     */
    registerAgent(agent) {
        this.agents.set(agent.agentId, agent);
        agent.setOrchestrator(this);
        
        console.log(`Registered agent: ${agent.agentId}`);
        this.emit('agentRegistered', { agentId: agent.agentId });
    }

    /**
     * Execute a simple workflow - sequential agent execution
     */
    async executeWorkflow(workflowType, context = {}) {
        const workflowId = Date.now().toString();
        const workflow = {
            id: workflowId,
            type: workflowType,
            context,
            status: 'running',
            startTime: new Date(),
            results: []
        };

        try {
            this.emit('workflowStarted', workflow);
            
            // Get workflow definition
            const workflowDef = this.getWorkflowDefinition(workflowType);
            
            // Execute agents sequentially (no complex dependency management)
            for (const taskDef of workflowDef.tasks) {
                const agent = this.agents.get(taskDef.agentId);
                if (!agent) {
                    throw new Error(`Agent not found: ${taskDef.agentId}`);
                }

                console.log(`Executing ${taskDef.agentId}: ${taskDef.taskType}`);
                
                const taskResult = await agent.executeTask({
                    taskType: taskDef.taskType,
                    taskData: taskDef.taskData || {},
                    context: { ...context, workflowId }
                });

                workflow.results.push({
                    agentId: taskDef.agentId,
                    taskType: taskDef.taskType,
                    result: taskResult,
                    timestamp: new Date()
                });

                this.emit('taskCompleted', {
                    workflowId,
                    agentId: taskDef.agentId,
                    taskType: taskDef.taskType,
                    result: taskResult
                });
            }

            workflow.status = 'completed';
            workflow.endTime = new Date();
            
            // Save to history
            this.workflowHistory.push(workflow);
            await this.saveWorkflowHistory();

            this.emit('workflowCompleted', workflow);
            return workflow;

        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date();
            
            this.workflowHistory.push(workflow);
            await this.saveWorkflowHistory();

            this.emit('workflowFailed', { ...workflow, error });
            throw error;
        }
    }

    /**
     * Start the orchestrator
     */
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        await this.ensureConfigDirectory();
        await this.loadWorkflowHistory();
        
        console.log(`EquilateralAgents orchestrator started`);
        this.emit('orchestratorStarted');
    }

    /**
     * Stop the orchestrator
     */
    async stop() {
        this.isRunning = false;
        await this.saveWorkflowHistory();
        
        this.emit('orchestratorStopped');
    }

    /**
     * Get available agents
     */
    getAvailableAgents() {
        return Array.from(this.agents.values()).map(agent => ({
            agentId: agent.agentId,
            capabilities: agent.getCapabilities ? agent.getCapabilities() : [],
            status: agent.isRunning ? 'running' : 'stopped'
        }));
    }

    /**
     * Get workflow history
     */
    getWorkflowHistory(limit = 10) {
        return this.workflowHistory
            .slice(-limit)
            .reverse();
    }

    /**
     * Basic workflow definitions
     */
    getWorkflowDefinition(workflowType) {
        const definitions = {
            'code-review': {
                tasks: [
                    { agentId: 'code-analyzer', taskType: 'analyze' },
                    { agentId: 'security-scanner', taskType: 'scan' },
                    { agentId: 'test-runner', taskType: 'test' }
                ]
            },
            'deployment-check': {
                tasks: [
                    { agentId: 'security-scanner', taskType: 'security_scan' },
                    { agentId: 'test-runner', taskType: 'run_tests' },
                    { agentId: 'deployment-validator', taskType: 'validate' }
                ]
            },
            'quality-gate': {
                tasks: [
                    { agentId: 'code-formatter', taskType: 'format' },
                    { agentId: 'test-runner', taskType: 'test' },
                    { agentId: 'documentation-generator', taskType: 'document' }
                ]
            }
        };

        return definitions[workflowType] || { tasks: [] };
    }

    /**
     * Ensure config directory exists
     */
    async ensureConfigDirectory() {
        try {
            await fs.access(this.configPath);
        } catch {
            await fs.mkdir(this.configPath, { recursive: true });
        }
    }

    /**
     * Load workflow history from file
     */
    async loadWorkflowHistory() {
        try {
            const historyPath = path.join(this.configPath, 'workflow-history.json');
            const data = await fs.readFile(historyPath, 'utf8');
            this.workflowHistory = JSON.parse(data);
        } catch {
            // File doesn't exist or is invalid, start with empty history
            this.workflowHistory = [];
        }
    }

    /**
     * Save workflow history to file
     */
    async saveWorkflowHistory() {
        try {
            const historyPath = path.join(this.configPath, 'workflow-history.json');
            // Keep only last 50 workflows
            const recentHistory = this.workflowHistory.slice(-50);
            await fs.writeFile(historyPath, JSON.stringify(recentHistory, null, 2));
        } catch (error) {
            console.warn('Failed to save workflow history:', error.message);
        }
    }

    /**
     * Execute a single agent task directly
     */
    async executeAgentTask(agentId, taskType, taskData = {}) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        const taskId = Date.now().toString();
        const context = { taskId, timestamp: new Date() };

        console.log(`Executing ${agentId}: ${taskType}`);

        const result = await agent.executeTask({
            taskType,
            taskData,
            context
        });

        this.emit('taskExecuted', {
            taskId,
            agentId,
            taskType,
            result,
            timestamp: new Date()
        });

        return result;
    }

    /**
     * Execute workflow in background (non-blocking)
     * Returns immediately with a workflow handle
     */
    async executeWorkflowBackground(workflowType, context = {}) {
        if (!this.enableBackground) {
            console.warn('Background execution not enabled. Use config.enableBackground = true');
            return this.executeWorkflow(workflowType, context);
        }

        const workflowId = `bg-${Date.now()}`;

        console.log(`🚀 Starting workflow in background: ${workflowType} (${workflowId})`);

        // Create workflow handle
        const handle = {
            workflowId,
            workflowType,
            status: 'running',
            startTime: new Date(),
            getStatus: () => this.getBackgroundWorkflowStatus(workflowId),
            getResult: () => this.getBackgroundWorkflowResult(workflowId),
            cancel: () => this.cancelBackgroundWorkflow(workflowId)
        };

        // Store handle
        this.backgroundWorkflows.set(workflowId, {
            ...handle,
            promise: null,
            result: null,
            error: null
        });

        // Execute workflow asynchronously
        const workflowPromise = this.executeWorkflow(workflowType, { ...context, workflowId })
            .then(result => {
                const bgWorkflow = this.backgroundWorkflows.get(workflowId);
                if (bgWorkflow) {
                    bgWorkflow.status = 'completed';
                    bgWorkflow.result = result;
                    bgWorkflow.endTime = new Date();
                }
                this.emit('backgroundWorkflowCompleted', { workflowId, result });
                console.log(`✅ Background workflow completed: ${workflowId}`);
                return result;
            })
            .catch(error => {
                const bgWorkflow = this.backgroundWorkflows.get(workflowId);
                if (bgWorkflow) {
                    bgWorkflow.status = 'failed';
                    bgWorkflow.error = error.message;
                    bgWorkflow.endTime = new Date();
                }
                this.emit('backgroundWorkflowFailed', { workflowId, error: error.message });
                console.error(`❌ Background workflow failed: ${workflowId}`, error.message);
                throw error;
            });

        // Store promise
        this.backgroundWorkflows.get(workflowId).promise = workflowPromise;

        this.emit('backgroundWorkflowStarted', { workflowId, workflowType });

        return handle;
    }

    /**
     * Get status of background workflow
     */
    getBackgroundWorkflowStatus(workflowId) {
        const workflow = this.backgroundWorkflows.get(workflowId);
        if (!workflow) {
            return { found: false };
        }

        return {
            found: true,
            workflowId,
            workflowType: workflow.workflowType,
            status: workflow.status,
            startTime: workflow.startTime,
            endTime: workflow.endTime,
            duration: workflow.endTime ? workflow.endTime - workflow.startTime : Date.now() - workflow.startTime
        };
    }

    /**
     * Get result of background workflow (waits if still running)
     */
    async getBackgroundWorkflowResult(workflowId) {
        const workflow = this.backgroundWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Background workflow not found: ${workflowId}`);
        }

        // If still running, wait for completion
        if (workflow.status === 'running' && workflow.promise) {
            try {
                await workflow.promise;
            } catch (error) {
                // Error already captured in workflow object
            }
        }

        return {
            workflowId,
            status: workflow.status,
            result: workflow.result,
            error: workflow.error,
            startTime: workflow.startTime,
            endTime: workflow.endTime
        };
    }

    /**
     * Cancel background workflow
     */
    cancelBackgroundWorkflow(workflowId) {
        const workflow = this.backgroundWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Background workflow not found: ${workflowId}`);
        }

        if (workflow.status === 'running') {
            workflow.status = 'cancelled';
            workflow.endTime = new Date();
            this.emit('backgroundWorkflowCancelled', { workflowId });
            console.log(`🚫 Background workflow cancelled: ${workflowId}`);
        }

        return { workflowId, status: workflow.status };
    }

    /**
     * List all background workflows
     */
    listBackgroundWorkflows() {
        return Array.from(this.backgroundWorkflows.values()).map(wf => ({
            workflowId: wf.workflowId,
            workflowType: wf.workflowType,
            status: wf.status,
            startTime: wf.startTime,
            endTime: wf.endTime
        }));
    }
}

module.exports = AgentOrchestrator;