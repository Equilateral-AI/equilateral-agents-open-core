/**
 * SQLite Database Adapter
 *
 * Default zero-configuration database adapter for EquilateralAgents.
 * Perfect for development, testing, and single-machine deployments.
 *
 * Features:
 * - Zero configuration required
 * - Auto-creates database file
 * - Automatic schema initialization
 * - Transaction support
 * - No external dependencies (uses better-sqlite3)
 *
 * Teaching Value:
 * - Shows how to implement the DatabaseAdapter interface
 * - Demonstrates SQLite best practices
 * - Transaction patterns for consistency
 *
 * When to Upgrade:
 * - Need concurrent access from multiple processes → PostgreSQL
 * - Need distributed deployment → PostgreSQL with replication
 * - Production scale → Managed PostgreSQL (paid tier)
 */

const DatabaseAdapter = require('./DatabaseAdapter');
const fs = require('fs');
const path = require('path');

class SQLiteAdapter extends DatabaseAdapter {
    constructor(config = {}) {
        super(config);

        this.dbPath = config.dbPath || path.join(process.cwd(), '.equilateral', 'orchestration.db');
        this.db = null;

        // Ensure directory exists
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
    }

    async connect() {
        if (this.connected) {
            return;
        }

        try {
            // Use better-sqlite3 if available, otherwise in-memory fallback
            let Database;
            try {
                Database = require('better-sqlite3');
            } catch (error) {
                console.warn('⚠️  better-sqlite3 not installed. Using in-memory fallback.');
                console.warn('   Install with: npm install better-sqlite3');
                console.warn('   Using simple JSON file storage instead.');

                // Fallback to JSON file storage
                this.useJsonFallback = true;
                this.connected = true;
                await this.initializeSchema();
                return;
            }

            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL'); // Better concurrency
            this.connected = true;

            await this.initializeSchema();

            console.log(`✅ SQLite database connected: ${this.dbPath}`);
        } catch (error) {
            console.error('❌ Failed to connect to SQLite:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        this.connected = false;
    }

    async initializeSchema() {
        if (this.useJsonFallback) {
            // Initialize JSON storage files
            this._initializeJsonStorage();
            return;
        }

        const schema = `
            -- Workflows table
            CREATE TABLE IF NOT EXISTS workflows (
                workflow_id TEXT PRIMARY KEY,
                workflow_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                context TEXT,
                result TEXT,
                error TEXT,
                created_at INTEGER NOT NULL,
                started_at INTEGER,
                completed_at INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
            CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
            CREATE INDEX IF NOT EXISTS idx_workflows_created ON workflows(created_at);

            -- Tasks table
            CREATE TABLE IF NOT EXISTS tasks (
                task_id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                task_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                task_data TEXT,
                result TEXT,
                error TEXT,
                created_at INTEGER NOT NULL,
                started_at INTEGER,
                completed_at INTEGER,
                FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id)
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_workflow ON tasks(workflow_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
            CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);

            -- Agent state table
            CREATE TABLE IF NOT EXISTS agent_state (
                agent_id TEXT PRIMARY KEY,
                state TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            );

            -- Events table
            CREATE TABLE IF NOT EXISTS events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                event_data TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
            CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
        `;

        this.db.exec(schema);
    }

    _initializeJsonStorage() {
        const dataDir = path.dirname(this.dbPath);
        this.jsonFiles = {
            workflows: path.join(dataDir, 'workflows.json'),
            tasks: path.join(dataDir, 'tasks.json'),
            agentState: path.join(dataDir, 'agent-state.json'),
            events: path.join(dataDir, 'events.json')
        };

        // Initialize empty files if they don't exist
        Object.values(this.jsonFiles).forEach(file => {
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, JSON.stringify([]), 'utf8');
            }
        });
    }

    _readJson(file) {
        try {
            const data = fs.readFileSync(file, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    _writeJson(file, data) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    }

    // ========================================
    // Workflow Operations
    // ========================================

    async createWorkflow(workflowId, workflowType, context = {}) {
        const now = Date.now();
        const workflow = {
            workflow_id: workflowId,
            workflow_type: workflowType,
            status: 'pending',
            context: JSON.stringify(context),
            result: null,
            error: null,
            created_at: now,
            started_at: null,
            completed_at: null
        };

        if (this.useJsonFallback) {
            const workflows = this._readJson(this.jsonFiles.workflows);
            workflows.push(workflow);
            this._writeJson(this.jsonFiles.workflows, workflows);
        } else {
            const stmt = this.db.prepare(`
                INSERT INTO workflows (workflow_id, workflow_type, status, context, created_at)
                VALUES (?, ?, ?, ?, ?)
            `);
            stmt.run(workflowId, workflowType, 'pending', JSON.stringify(context), now);
        }

        return workflow;
    }

    async updateWorkflowStatus(workflowId, status, updates = {}) {
        const now = Date.now();

        if (this.useJsonFallback) {
            const workflows = this._readJson(this.jsonFiles.workflows);
            const workflow = workflows.find(w => w.workflow_id === workflowId);
            if (workflow) {
                workflow.status = status;
                if (status === 'running' && !workflow.started_at) {
                    workflow.started_at = now;
                }
                if ((status === 'completed' || status === 'failed') && !workflow.completed_at) {
                    workflow.completed_at = now;
                }
                Object.assign(workflow, updates);
                this._writeJson(this.jsonFiles.workflows, workflows);
            }
            return workflow;
        }

        const setFields = ['status = ?'];
        const values = [status];

        if (status === 'running') {
            setFields.push('started_at = ?');
            values.push(now);
        }

        if (status === 'completed' || status === 'failed') {
            setFields.push('completed_at = ?');
            values.push(now);
        }

        if (updates.result) {
            setFields.push('result = ?');
            values.push(JSON.stringify(updates.result));
        }

        if (updates.error) {
            setFields.push('error = ?');
            values.push(JSON.stringify(updates.error));
        }

        values.push(workflowId);

        const stmt = this.db.prepare(`
            UPDATE workflows SET ${setFields.join(', ')}
            WHERE workflow_id = ?
        `);
        stmt.run(...values);

        return this.getWorkflow(workflowId);
    }

    async getWorkflow(workflowId) {
        if (this.useJsonFallback) {
            const workflows = this._readJson(this.jsonFiles.workflows);
            return workflows.find(w => w.workflow_id === workflowId) || null;
        }

        const stmt = this.db.prepare('SELECT * FROM workflows WHERE workflow_id = ?');
        const row = stmt.get(workflowId);

        if (!row) return null;

        return {
            ...row,
            context: row.context ? JSON.parse(row.context) : null,
            result: row.result ? JSON.parse(row.result) : null,
            error: row.error ? JSON.parse(row.error) : null
        };
    }

    async getWorkflows(filters = {}, limit = 100) {
        if (this.useJsonFallback) {
            let workflows = this._readJson(this.jsonFiles.workflows);

            if (filters.status) {
                workflows = workflows.filter(w => w.status === filters.status);
            }
            if (filters.workflow_type) {
                workflows = workflows.filter(w => w.workflow_type === filters.workflow_type);
            }

            return workflows.slice(0, limit);
        }

        let query = 'SELECT * FROM workflows';
        const conditions = [];
        const values = [];

        if (filters.status) {
            conditions.push('status = ?');
            values.push(filters.status);
        }

        if (filters.workflow_type) {
            conditions.push('workflow_type = ?');
            values.push(filters.workflow_type);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        values.push(limit);

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...values);

        return rows.map(row => ({
            ...row,
            context: row.context ? JSON.parse(row.context) : null,
            result: row.result ? JSON.parse(row.result) : null,
            error: row.error ? JSON.parse(row.error) : null
        }));
    }

    // ========================================
    // Task Operations
    // ========================================

    async createTask(taskId, workflowId, agentId, taskData) {
        const now = Date.now();
        const task = {
            task_id: taskId,
            workflow_id: workflowId,
            agent_id: agentId,
            task_type: taskData.taskType || 'unknown',
            status: 'pending',
            task_data: JSON.stringify(taskData),
            result: null,
            error: null,
            created_at: now,
            started_at: null,
            completed_at: null
        };

        if (this.useJsonFallback) {
            const tasks = this._readJson(this.jsonFiles.tasks);
            tasks.push(task);
            this._writeJson(this.jsonFiles.tasks, tasks);
        } else {
            const stmt = this.db.prepare(`
                INSERT INTO tasks (task_id, workflow_id, agent_id, task_type, status, task_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(taskId, workflowId, agentId, task.task_type, 'pending', task.task_data, now);
        }

        return task;
    }

    async updateTaskStatus(taskId, status, updates = {}) {
        const now = Date.now();

        if (this.useJsonFallback) {
            const tasks = this._readJson(this.jsonFiles.tasks);
            const task = tasks.find(t => t.task_id === taskId);
            if (task) {
                task.status = status;
                if (status === 'running' && !task.started_at) {
                    task.started_at = now;
                }
                if ((status === 'completed' || status === 'failed') && !task.completed_at) {
                    task.completed_at = now;
                }
                Object.assign(task, updates);
                this._writeJson(this.jsonFiles.tasks, tasks);
            }
            return task;
        }

        const setFields = ['status = ?'];
        const values = [status];

        if (status === 'running') {
            setFields.push('started_at = ?');
            values.push(now);
        }

        if (status === 'completed' || status === 'failed') {
            setFields.push('completed_at = ?');
            values.push(now);
        }

        if (updates.result) {
            setFields.push('result = ?');
            values.push(JSON.stringify(updates.result));
        }

        if (updates.error) {
            setFields.push('error = ?');
            values.push(JSON.stringify(updates.error));
        }

        values.push(taskId);

        const stmt = this.db.prepare(`
            UPDATE tasks SET ${setFields.join(', ')}
            WHERE task_id = ?
        `);
        stmt.run(...values);

        return this.getTask(taskId);
    }

    async getTask(taskId) {
        if (this.useJsonFallback) {
            const tasks = this._readJson(this.jsonFiles.tasks);
            return tasks.find(t => t.task_id === taskId) || null;
        }

        const stmt = this.db.prepare('SELECT * FROM tasks WHERE task_id = ?');
        const row = stmt.get(taskId);

        if (!row) return null;

        return {
            ...row,
            task_data: row.task_data ? JSON.parse(row.task_data) : null,
            result: row.result ? JSON.parse(row.result) : null,
            error: row.error ? JSON.parse(row.error) : null
        };
    }

    async getTasksForWorkflow(workflowId) {
        if (this.useJsonFallback) {
            const tasks = this._readJson(this.jsonFiles.tasks);
            return tasks.filter(t => t.workflow_id === workflowId);
        }

        const stmt = this.db.prepare('SELECT * FROM tasks WHERE workflow_id = ? ORDER BY created_at ASC');
        const rows = stmt.all(workflowId);

        return rows.map(row => ({
            ...row,
            task_data: row.task_data ? JSON.parse(row.task_data) : null,
            result: row.result ? JSON.parse(row.result) : null,
            error: row.error ? JSON.parse(row.error) : null
        }));
    }

    // ========================================
    // Agent State Operations
    // ========================================

    async saveAgentState(agentId, state) {
        const now = Date.now();

        if (this.useJsonFallback) {
            const states = this._readJson(this.jsonFiles.agentState);
            const existing = states.find(s => s.agent_id === agentId);
            if (existing) {
                existing.state = JSON.stringify(state);
                existing.updated_at = now;
            } else {
                states.push({
                    agent_id: agentId,
                    state: JSON.stringify(state),
                    updated_at: now
                });
            }
            this._writeJson(this.jsonFiles.agentState, states);
            return;
        }

        const stmt = this.db.prepare(`
            INSERT INTO agent_state (agent_id, state, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(agent_id) DO UPDATE SET
                state = excluded.state,
                updated_at = excluded.updated_at
        `);
        stmt.run(agentId, JSON.stringify(state), now);
    }

    async getAgentState(agentId) {
        if (this.useJsonFallback) {
            const states = this._readJson(this.jsonFiles.agentState);
            const state = states.find(s => s.agent_id === agentId);
            return state ? JSON.parse(state.state) : null;
        }

        const stmt = this.db.prepare('SELECT * FROM agent_state WHERE agent_id = ?');
        const row = stmt.get(agentId);

        return row ? JSON.parse(row.state) : null;
    }

    async clearAgentState(agentId) {
        if (this.useJsonFallback) {
            const states = this._readJson(this.jsonFiles.agentState);
            const filtered = states.filter(s => s.agent_id !== agentId);
            this._writeJson(this.jsonFiles.agentState, filtered);
            return;
        }

        const stmt = this.db.prepare('DELETE FROM agent_state WHERE agent_id = ?');
        stmt.run(agentId);
    }

    // ========================================
    // Event Operations
    // ========================================

    async logEvent(eventType, eventData) {
        const now = Date.now();
        const event = {
            event_type: eventType,
            event_data: JSON.stringify(eventData),
            created_at: now
        };

        if (this.useJsonFallback) {
            const events = this._readJson(this.jsonFiles.events);
            event.event_id = events.length + 1;
            events.push(event);
            this._writeJson(this.jsonFiles.events, events);
            return event;
        }

        const stmt = this.db.prepare(`
            INSERT INTO events (event_type, event_data, created_at)
            VALUES (?, ?, ?)
        `);
        const result = stmt.run(eventType, JSON.stringify(eventData), now);

        return {
            event_id: result.lastInsertRowid,
            ...event
        };
    }

    async getEvents(filters = {}, limit = 100) {
        if (this.useJsonFallback) {
            let events = this._readJson(this.jsonFiles.events);

            if (filters.event_type) {
                events = events.filter(e => e.event_type === filters.event_type);
            }

            return events.slice(-limit);
        }

        let query = 'SELECT * FROM events';
        const conditions = [];
        const values = [];

        if (filters.event_type) {
            conditions.push('event_type = ?');
            values.push(filters.event_type);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        values.push(limit);

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...values);

        return rows.map(row => ({
            ...row,
            event_data: row.event_data ? JSON.parse(row.event_data) : null
        }));
    }

    // ========================================
    // Transaction Support
    // ========================================

    async beginTransaction() {
        if (this.useJsonFallback) {
            return { fallback: true };
        }
        this.db.prepare('BEGIN TRANSACTION').run();
        return { db: this.db };
    }

    async commitTransaction(transaction) {
        if (transaction.fallback) return;
        this.db.prepare('COMMIT').run();
    }

    async rollbackTransaction(transaction) {
        if (transaction.fallback) return;
        this.db.prepare('ROLLBACK').run();
    }

    // ========================================
    // Utility Operations
    // ========================================

    async cleanupOldRecords(olderThanDays = 30) {
        const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

        if (this.useJsonFallback) {
            let deletedCount = 0;

            // Clean workflows
            const workflows = this._readJson(this.jsonFiles.workflows);
            const filteredWorkflows = workflows.filter(w => w.created_at >= cutoffTime);
            deletedCount += workflows.length - filteredWorkflows.length;
            this._writeJson(this.jsonFiles.workflows, filteredWorkflows);

            // Clean events
            const events = this._readJson(this.jsonFiles.events);
            const filteredEvents = events.filter(e => e.created_at >= cutoffTime);
            deletedCount += events.length - filteredEvents.length;
            this._writeJson(this.jsonFiles.events, filteredEvents);

            return { deletedCount };
        }

        const workflowStmt = this.db.prepare('DELETE FROM workflows WHERE created_at < ?');
        const eventStmt = this.db.prepare('DELETE FROM events WHERE created_at < ?');

        const workflowResult = workflowStmt.run(cutoffTime);
        const eventResult = eventStmt.run(cutoffTime);

        return {
            deletedCount: workflowResult.changes + eventResult.changes
        };
    }

    async getStats() {
        if (this.useJsonFallback) {
            return {
                connected: this.connected,
                adapterType: 'SQLiteAdapter (JSON fallback)',
                dbPath: this.dbPath,
                workflowCount: this._readJson(this.jsonFiles.workflows).length,
                taskCount: this._readJson(this.jsonFiles.tasks).length,
                eventCount: this._readJson(this.jsonFiles.events).length
            };
        }

        const workflowCount = this.db.prepare('SELECT COUNT(*) as count FROM workflows').get().count;
        const taskCount = this.db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
        const eventCount = this.db.prepare('SELECT COUNT(*) as count FROM events').get().count;

        return {
            connected: this.connected,
            adapterType: 'SQLiteAdapter',
            dbPath: this.dbPath,
            workflowCount,
            taskCount,
            eventCount
        };
    }
}

module.exports = SQLiteAdapter;
