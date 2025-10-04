/**
 * Database Adapter Interface
 *
 * Abstract interface that all database adapters must implement.
 * Provides a consistent API for agent orchestration regardless of database backend.
 *
 * Teaching Value:
 * - Shows how to design database abstraction layers
 * - Demonstrates adapter pattern for swappable backends
 * - Teaches transaction management patterns
 */

class DatabaseAdapter {
    constructor(config = {}) {
        if (new.target === DatabaseAdapter) {
            throw new Error('DatabaseAdapter is abstract and cannot be instantiated directly');
        }

        this.config = config;
        this.connected = false;
    }

    /**
     * Connect to the database
     * @returns {Promise<void>}
     */
    async connect() {
        throw new Error('connect() must be implemented by database adapter');
    }

    /**
     * Disconnect from the database
     * @returns {Promise<void>}
     */
    async disconnect() {
        throw new Error('disconnect() must be implemented by database adapter');
    }

    /**
     * Initialize database schema
     * @returns {Promise<void>}
     */
    async initializeSchema() {
        throw new Error('initializeSchema() must be implemented by database adapter');
    }

    // ========================================
    // Workflow Operations
    // ========================================

    /**
     * Create a new workflow execution record
     * @param {string} workflowId - Unique workflow identifier
     * @param {string} workflowType - Type of workflow
     * @param {Object} context - Workflow context data
     * @returns {Promise<Object>} Created workflow record
     */
    async createWorkflow(workflowId, workflowType, context = {}) {
        throw new Error('createWorkflow() must be implemented by database adapter');
    }

    /**
     * Update workflow status
     * @param {string} workflowId - Workflow identifier
     * @param {string} status - New status (pending|running|completed|failed)
     * @param {Object} updates - Additional fields to update
     * @returns {Promise<Object>} Updated workflow record
     */
    async updateWorkflowStatus(workflowId, status, updates = {}) {
        throw new Error('updateWorkflowStatus() must be implemented by database adapter');
    }

    /**
     * Get workflow by ID
     * @param {string} workflowId - Workflow identifier
     * @returns {Promise<Object|null>} Workflow record or null
     */
    async getWorkflow(workflowId) {
        throw new Error('getWorkflow() must be implemented by database adapter');
    }

    /**
     * Get all workflows (with optional filtering)
     * @param {Object} filters - Query filters
     * @param {number} limit - Maximum records to return
     * @returns {Promise<Array>} Array of workflow records
     */
    async getWorkflows(filters = {}, limit = 100) {
        throw new Error('getWorkflows() must be implemented by database adapter');
    }

    // ========================================
    // Task Operations
    // ========================================

    /**
     * Create a new task record
     * @param {string} taskId - Unique task identifier
     * @param {string} workflowId - Parent workflow ID
     * @param {string} agentId - Agent assigned to task
     * @param {Object} taskData - Task configuration
     * @returns {Promise<Object>} Created task record
     */
    async createTask(taskId, workflowId, agentId, taskData) {
        throw new Error('createTask() must be implemented by database adapter');
    }

    /**
     * Update task status
     * @param {string} taskId - Task identifier
     * @param {string} status - New status (pending|running|completed|failed)
     * @param {Object} updates - Additional fields to update
     * @returns {Promise<Object>} Updated task record
     */
    async updateTaskStatus(taskId, status, updates = {}) {
        throw new Error('updateTaskStatus() must be implemented by database adapter');
    }

    /**
     * Get task by ID
     * @param {string} taskId - Task identifier
     * @returns {Promise<Object|null>} Task record or null
     */
    async getTask(taskId) {
        throw new Error('getTask() must be implemented by database adapter');
    }

    /**
     * Get all tasks for a workflow
     * @param {string} workflowId - Workflow identifier
     * @returns {Promise<Array>} Array of task records
     */
    async getTasksForWorkflow(workflowId) {
        throw new Error('getTasksForWorkflow() must be implemented by database adapter');
    }

    // ========================================
    // Agent State Operations
    // ========================================

    /**
     * Store agent state/context
     * @param {string} agentId - Agent identifier
     * @param {Object} state - State data to store
     * @returns {Promise<void>}
     */
    async saveAgentState(agentId, state) {
        throw new Error('saveAgentState() must be implemented by database adapter');
    }

    /**
     * Retrieve agent state/context
     * @param {string} agentId - Agent identifier
     * @returns {Promise<Object|null>} Agent state or null
     */
    async getAgentState(agentId) {
        throw new Error('getAgentState() must be implemented by database adapter');
    }

    /**
     * Clear agent state
     * @param {string} agentId - Agent identifier
     * @returns {Promise<void>}
     */
    async clearAgentState(agentId) {
        throw new Error('clearAgentState() must be implemented by database adapter');
    }

    // ========================================
    // Event Operations
    // ========================================

    /**
     * Log an event
     * @param {string} eventType - Type of event
     * @param {Object} eventData - Event payload
     * @returns {Promise<Object>} Created event record
     */
    async logEvent(eventType, eventData) {
        throw new Error('logEvent() must be implemented by database adapter');
    }

    /**
     * Get events (with optional filtering)
     * @param {Object} filters - Query filters
     * @param {number} limit - Maximum records to return
     * @returns {Promise<Array>} Array of event records
     */
    async getEvents(filters = {}, limit = 100) {
        throw new Error('getEvents() must be implemented by database adapter');
    }

    // ========================================
    // Transaction Support (Optional)
    // ========================================

    /**
     * Begin a database transaction
     * @returns {Promise<Object>} Transaction context
     */
    async beginTransaction() {
        // Optional - return null if transactions not supported
        return null;
    }

    /**
     * Commit a transaction
     * @param {Object} transaction - Transaction context
     * @returns {Promise<void>}
     */
    async commitTransaction(transaction) {
        // Optional - no-op if transactions not supported
    }

    /**
     * Rollback a transaction
     * @param {Object} transaction - Transaction context
     * @returns {Promise<void>}
     */
    async rollbackTransaction(transaction) {
        // Optional - no-op if transactions not supported
    }

    // ========================================
    // Utility Operations
    // ========================================

    /**
     * Check if database is connected and healthy
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        return this.connected;
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStats() {
        return {
            connected: this.connected,
            adapterType: this.constructor.name
        };
    }

    /**
     * Clean up old records
     * @param {number} olderThanDays - Delete records older than N days
     * @returns {Promise<Object>} Cleanup results
     */
    async cleanupOldRecords(olderThanDays = 30) {
        throw new Error('cleanupOldRecords() must be implemented by database adapter');
    }
}

module.exports = DatabaseAdapter;
