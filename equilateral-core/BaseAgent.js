/**
 * EquilateralAgents™ Base Agent Class
 * 
 * Demonstrates the core innovation: agents communicate via database state
 * within tenant boundaries, ensuring perfect isolation and audit trails.
 * 
 * Open Core Version - Basic agent coordination patterns
 */

const EventEmitter = require('events');

class BaseAgent extends EventEmitter {
    constructor(agentId, agentConfig = {}) {
        super();
        this.agentId = agentId;
        this.agentType = agentConfig.agentType || 'generic';
        this.capabilities = agentConfig.capabilities || [];
        this.isRunning = false;
        this.orchestrator = null;
        this.tenantId = null;
        this.pollingInterval = agentConfig.pollingInterval || 2000; // 2 seconds
    }

    /**
     * Set orchestrator reference - agents coordinate through the orchestrator's database
     */
    setOrchestrator(orchestrator) {
        this.orchestrator = orchestrator;
        this.tenantId = orchestrator.tenantId;
    }

    /**
     * Start agent - begins listening for tasks via database coordination
     */
    async start() {
        if (this.isRunning || !this.orchestrator) return;
        
        this.isRunning = true;
        console.log(`Agent ${this.agentId} started for tenant: ${this.tenantId}`);
        
        await this.logActivity('agent_started', { 
            agent_id: this.agentId,
            capabilities: this.capabilities 
        });

        this.emit('agentStarted', { agentId: this.agentId, tenantId: this.tenantId });
    }

    /**
     * Execute a task - demonstrates database-mediated task execution
     * Core innovation: task state is managed in database, not memory
     */
    async executeTask(task) {
        try {
            console.log(`Agent ${this.agentId} executing task: ${task.coordination_id}`);

            // Update task status to running
            await this.orchestrator.updateTaskStatus(task.coordination_id, 'running');
            
            await this.logActivity('task_started', {
                coordination_id: task.coordination_id,
                task_type: task.task_type,
                workflow_id: task.workflow_id
            });

            // Execute the actual task logic
            const result = await this.performTask(task.task_type, task.task_data, task);
            
            // Update database with completion
            await this.orchestrator.updateTaskStatus(task.coordination_id, 'completed', result);
            
            await this.logActivity('task_completed', {
                coordination_id: task.coordination_id,
                task_type: task.task_type,
                result: result
            });

            this.emit('taskCompleted', {
                agentId: this.agentId,
                coordinationId: task.coordination_id,
                result: result
            });

            return result;

        } catch (error) {
            console.error(`Agent ${this.agentId} task failed:`, error);
            
            // Update database with failure
            await this.orchestrator.updateTaskStatus(
                task.coordination_id, 
                'failed', 
                null, 
                { error: error.message, stack: error.stack }
            );
            
            await this.logActivity('task_failed', {
                coordination_id: task.coordination_id,
                error: error.message
            });

            this.emit('taskFailed', {
                agentId: this.agentId,
                coordinationId: task.coordination_id,
                error: error
            });

            throw error;
        }
    }

    /**
     * Perform the actual task work - override in subclasses
     * This is where agent-specific logic goes
     */
    async performTask(taskType, taskData, taskContext) {
        throw new Error(`Agent ${this.agentId} must implement performTask method`);
    }

    /**
     * Communicate with other agents via database queries
     * Demonstrates inter-agent communication through persistent state
     */
    async queryAgentResults(workflowId, agentId = null, taskType = null) {
        if (!this.orchestrator) {
            throw new Error('No orchestrator available for database queries');
        }

        let query = `
            SELECT 
                coordination_id,
                agent_id,
                task_type,
                result_data,
                status,
                completed_at
            FROM agent_coordination 
            WHERE workflow_id = $1 AND tenant_id = $2
        `;
        
        const params = [workflowId, this.tenantId];
        let paramCount = 2;

        if (agentId) {
            query += ` AND agent_id = $${++paramCount}`;
            params.push(agentId);
        }

        if (taskType) {
            query += ` AND task_type = $${++paramCount}`;
            params.push(taskType);
        }

        query += ' ORDER BY completed_at ASC';

        const result = await this.orchestrator.db.query(query, params);
        return result.rows;
    }

    /**
     * Store intermediate results for other agents to use
     * Demonstrates persistent inter-agent data sharing
     */
    async storeWorkflowData(workflowId, dataKey, data) {
        await this.orchestrator.db.query(`
            INSERT INTO agent_coordination (
                tenant_id, workflow_id, agent_id, task_type, 
                task_data, status, result_data
            ) VALUES ($1, $2, $3, 'data_storage', $4, 'completed', $5)
        `, [
            this.tenantId,
            workflowId,
            this.agentId,
            JSON.stringify({ data_key: dataKey }),
            JSON.stringify(data)
        ]);
    }

    /**
     * Retrieve shared workflow data from other agents
     */
    async getWorkflowData(workflowId, dataKey, fromAgent = null) {
        let query = `
            SELECT result_data
            FROM agent_coordination 
            WHERE workflow_id = $1 
              AND tenant_id = $2
              AND task_type = 'data_storage'
              AND task_data->>'data_key' = $3
              AND status = 'completed'
        `;
        
        const params = [workflowId, this.tenantId, dataKey];

        if (fromAgent) {
            query += ` AND agent_id = $4`;
            params.push(fromAgent);
        }

        query += ' ORDER BY completed_at DESC LIMIT 1';

        const result = await this.orchestrator.db.query(query, params);
        return result.rows.length > 0 ? result.rows[0].result_data : null;
    }

    /**
     * Check if dependencies are satisfied by querying database
     */
    async checkDependencies(dependencies, workflowId) {
        if (!dependencies || dependencies.length === 0) return true;

        const result = await this.orchestrator.db.query(`
            SELECT COUNT(*) as completed_count
            FROM agent_coordination 
            WHERE workflow_id = $1 
              AND tenant_id = $2
              AND agent_id = ANY($3)
              AND status = 'completed'
        `, [workflowId, this.tenantId, dependencies]);

        return result.rows[0].completed_count === dependencies.length;
    }

    /**
     * Log agent activity for audit trail
     */
    async logActivity(actionType, actionData) {
        if (!this.orchestrator) return;
        
        await this.orchestrator.logAuditEvent(actionType, actionData, this.agentId);
    }

    /**
     * Get agent performance metrics from database
     */
    async getPerformanceMetrics(timeWindow = '24 hours') {
        if (!this.orchestrator) return null;

        const result = await this.orchestrator.db.query(`
            SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_tasks,
                AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_execution_time
            FROM agent_coordination 
            WHERE agent_id = $1 
              AND tenant_id = $2
              AND created_at > NOW() - INTERVAL '${timeWindow}'
        `, [this.agentId, this.tenantId]);

        return result.rows[0];
    }

    /**
     * Stop agent
     */
    async stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        await this.logActivity('agent_stopped', { agent_id: this.agentId });
        
        console.log(`Agent ${this.agentId} stopped`);
        this.emit('agentStopped', { agentId: this.agentId });
    }

    /**
     * Health check - verify agent can connect to database
     */
    async healthCheck() {
        if (!this.orchestrator) {
            return { healthy: false, error: 'No orchestrator connection' };
        }

        try {
            await this.orchestrator.db.query('SELECT 1');
            return { 
                healthy: true, 
                agentId: this.agentId,
                tenantId: this.tenantId,
                capabilities: this.capabilities
            };
        } catch (error) {
            return { 
                healthy: false, 
                error: error.message,
                agentId: this.agentId 
            };
        }
    }
}

module.exports = BaseAgent;