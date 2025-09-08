/**
 * EquilateralAgents™ Core Orchestrator
 * 
 * Demonstrates database-mediated agent coordination - the revolutionary architecture
 * where agents communicate through persistent database state within tenant boundaries.
 * 
 * Open Core Version - Basic orchestration patterns
 * Commercial tiers include advanced intelligence and optimization
 */

const { Pool } = require('pg');
const EventEmitter = require('events');
const AgentRegistry = require('./AgentRegistry');

class AgentOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.tenantId = config.tenantId || 'default-tenant';
        this.db = new Pool({
            connectionString: config.databaseUrl || process.env.DATABASE_URL,
            // Set tenant context for Row Level Security
            options: `-c app.current_tenant=${this.tenantId}`
        });
        
        // Centralized agent registry with global configuration
        this.registry = new AgentRegistry({
            tenantId: this.tenantId,
            ...config
        });
        
        this.agents = new Map();
        this.pollingInterval = config.pollingInterval || 1000; // 1 second
        this.isRunning = false;
    }

    /**
     * Register an agent with the orchestrator
     */
    registerAgent(agent) {
        this.agents.set(agent.agentId, agent);
        agent.setOrchestrator(this);
        
        // Provide centralized services to agent
        agent.setSharedServices({
            llm: this.registry.getLLMConfig(),
            aws: this.registry.getAWSConfig(),
            registry: this.registry
        });
        
        console.log(`Registered agent: ${agent.agentId} for tenant: ${this.tenantId}`);
    }

    /**
     * Get available agents from registry
     */
    getAvailableAgents(tier = 'open_core') {
        return this.registry.getAvailableAgents(tier);
    }

    /**
     * Get configuration status
     */
    getConfigurationStatus() {
        return this.registry.getConfigurationStatus();
    }

    /**
     * Update global configuration (LLM, AWS, etc.)
     */
    updateConfiguration(newConfig) {
        return this.registry.updateGlobalConfig(newConfig);
    }

    /**
     * Start a workflow - creates workflow and agent tasks in database
     * Demonstrates the core innovation: persistent coordination state
     */
    async startWorkflow(workflowType, context = {}) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            // Create workflow record
            const workflowResult = await client.query(`
                INSERT INTO workflows (tenant_id, workflow_type, context, status)
                VALUES ($1, $2, $3, 'running')
                RETURNING workflow_id
            `, [this.tenantId, workflowType, JSON.stringify(context)]);

            const workflowId = workflowResult.rows[0].workflow_id;

            // Get workflow definition (simplified for open core)
            const workflowDef = this.getWorkflowDefinition(workflowType);
            
            // Create agent tasks with dependencies
            for (const taskDef of workflowDef.tasks) {
                await client.query(`
                    INSERT INTO agent_coordination (
                        tenant_id, workflow_id, agent_id, task_type, 
                        task_data, dependencies, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
                `, [
                    this.tenantId,
                    workflowId,
                    taskDef.agent_id,
                    taskDef.task_type,
                    JSON.stringify(taskDef.task_data || {}),
                    JSON.stringify(taskDef.dependencies || [])
                ]);
            }

            await client.query('COMMIT');

            // Log workflow start
            await this.logAuditEvent('workflow_started', {
                workflow_id: workflowId,
                workflow_type: workflowType,
                context: context
            });

            this.emit('workflowStarted', { workflowId, workflowType, tenantId: this.tenantId });
            
            return workflowId;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Start the orchestration loop
     * Agents coordinate by polling database state - core innovation demonstrated
     */
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log(`Starting orchestration for tenant: ${this.tenantId}`);

        // Start coordination loop
        this.coordinationLoop();
        
        // Start each registered agent
        for (const agent of this.agents.values()) {
            await agent.start();
        }

        this.emit('orchestratorStarted', { tenantId: this.tenantId });
    }

    /**
     * Core coordination loop - demonstrates database-mediated agent communication
     */
    async coordinationLoop() {
        while (this.isRunning) {
            try {
                // Find ready tasks (dependencies satisfied)
                const readyTasks = await this.db.query(`
                    SELECT 
                        coordination_id,
                        agent_id,
                        task_type,
                        task_data,
                        workflow_id
                    FROM agent_coordination 
                    WHERE tenant_id = $1 
                      AND status = 'pending'
                      AND check_dependencies_satisfied(dependencies, workflow_id, tenant_id)
                    ORDER BY created_at ASC
                `, [this.tenantId]);

                // Dispatch ready tasks to agents
                for (const task of readyTasks.rows) {
                    const agent = this.agents.get(task.agent_id);
                    if (agent) {
                        // Mark task as assigned
                        await this.updateTaskStatus(task.coordination_id, 'assigned');
                        
                        // Agent will execute and update database state
                        agent.executeTask(task).catch(error => {
                            console.error(`Task execution failed: ${task.coordination_id}`, error);
                            this.updateTaskStatus(task.coordination_id, 'failed', null, { error: error.message });
                        });
                    }
                }

                // Check for completed workflows
                await this.checkCompletedWorkflows();

            } catch (error) {
                console.error('Coordination loop error:', error);
                this.emit('error', error);
            }

            // Wait before next coordination cycle
            await this.sleep(this.pollingInterval);
        }
    }

    /**
     * Update task status - demonstrates persistent state management
     */
    async updateTaskStatus(coordinationId, status, resultData = null, errorData = null) {
        const updateFields = ['status = $2', 'updated_at = NOW()'];
        const values = [coordinationId, status];
        let paramCount = 2;

        if (resultData) {
            updateFields.push(`result_data = $${++paramCount}`);
            values.push(JSON.stringify(resultData));
        }

        if (errorData) {
            updateFields.push(`error_data = $${++paramCount}`);
            values.push(JSON.stringify(errorData));
        }

        if (status === 'completed' || status === 'failed') {
            updateFields.push('completed_at = NOW()');
        }

        await this.db.query(`
            UPDATE agent_coordination 
            SET ${updateFields.join(', ')}
            WHERE coordination_id = $1 AND tenant_id = '${this.tenantId}'
        `, values);

        // Log status change
        await this.logAuditEvent('task_status_changed', {
            coordination_id: coordinationId,
            status: status,
            result_data: resultData,
            error_data: errorData
        });
    }

    /**
     * Check for completed workflows
     */
    async checkCompletedWorkflows() {
        const completedWorkflows = await this.db.query(`
            SELECT DISTINCT w.workflow_id, w.workflow_type
            FROM workflows w
            WHERE w.tenant_id = $1 
              AND w.status = 'running'
              AND NOT EXISTS (
                  SELECT 1 FROM agent_coordination ac 
                  WHERE ac.workflow_id = w.workflow_id 
                    AND ac.tenant_id = w.tenant_id
                    AND ac.status IN ('pending', 'assigned', 'running')
              )
        `, [this.tenantId]);

        for (const workflow of completedWorkflows.rows) {
            // Check if any tasks failed
            const failedTasks = await this.db.query(`
                SELECT COUNT(*) as failed_count
                FROM agent_coordination 
                WHERE workflow_id = $1 AND tenant_id = $2 AND status = 'failed'
            `, [workflow.workflow_id, this.tenantId]);

            const finalStatus = failedTasks.rows[0].failed_count > 0 ? 'failed' : 'completed';

            // Update workflow status
            await this.db.query(`
                UPDATE workflows 
                SET status = $3, completed_at = NOW()
                WHERE workflow_id = $1 AND tenant_id = $2
            `, [workflow.workflow_id, this.tenantId, finalStatus]);

            this.emit('workflowCompleted', {
                workflowId: workflow.workflow_id,
                workflowType: workflow.workflow_type,
                status: finalStatus,
                tenantId: this.tenantId
            });
        }
    }

    /**
     * Log audit events for compliance
     */
    async logAuditEvent(actionType, actionData, agentId = 'orchestrator') {
        await this.db.query(`
            INSERT INTO agent_audit_log (
                tenant_id, agent_id, action_type, action_data
            ) VALUES ($1, $2, $3, $4)
        `, [this.tenantId, agentId, actionType, JSON.stringify(actionData)]);
    }

    /**
     * Get workflow status and progress
     */
    async getWorkflowStatus(workflowId) {
        const workflow = await this.db.query(`
            SELECT * FROM workflows 
            WHERE workflow_id = $1 AND tenant_id = $2
        `, [workflowId, this.tenantId]);

        if (workflow.rows.length === 0) {
            throw new Error('Workflow not found');
        }

        const tasks = await this.db.query(`
            SELECT 
                coordination_id,
                agent_id,
                task_type,
                status,
                created_at,
                completed_at,
                error_data
            FROM agent_coordination 
            WHERE workflow_id = $1 AND tenant_id = $2
            ORDER BY created_at ASC
        `, [workflowId, this.tenantId]);

        return {
            workflow: workflow.rows[0],
            tasks: tasks.rows
        };
    }

    /**
     * Basic workflow definitions for open core
     * Commercial tiers include advanced workflow intelligence
     */
    getWorkflowDefinition(workflowType) {
        const definitions = {
            'secure-deployment': {
                tasks: [
                    { agent_id: 'security-scanner', task_type: 'security_scan', dependencies: [] },
                    { agent_id: 'test-runner', task_type: 'run_tests', dependencies: [] },
                    { agent_id: 'cost-analyzer', task_type: 'cost_analysis', dependencies: [] },
                    { 
                        agent_id: 'deployment-agent', 
                        task_type: 'deploy', 
                        dependencies: ['security-scanner', 'test-runner', 'cost-analyzer'] 
                    }
                ]
            },
            'quality-check': {
                tasks: [
                    { agent_id: 'code-generator', task_type: 'validate_standards', dependencies: [] },
                    { agent_id: 'test-runner', task_type: 'run_quality_tests', dependencies: [] },
                    { agent_id: 'security-scanner', task_type: 'quality_security_scan', dependencies: [] }
                ]
            }
        };

        return definitions[workflowType] || { tasks: [] };
    }

    /**
     * Stop orchestration
     */
    async stop() {
        this.isRunning = false;
        
        // Stop all agents
        for (const agent of this.agents.values()) {
            await agent.stop();
        }

        await this.db.end();
        this.emit('orchestratorStopped', { tenantId: this.tenantId });
    }

    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = AgentOrchestrator;