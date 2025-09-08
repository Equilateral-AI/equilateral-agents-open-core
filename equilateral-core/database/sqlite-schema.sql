-- EquilateralAgents™ Open Core SQLite Schema
-- Simplified database for local development and evaluation
-- Commercial tiers use PostgreSQL with advanced multi-tenant features

-- Core agent coordination table (SQLite compatible)
CREATE TABLE IF NOT EXISTS agent_coordination (
    coordination_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tenant_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    task_data TEXT NOT NULL DEFAULT '{}',
    dependencies TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending',
    result_data TEXT,
    error_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

-- Workflow management table
CREATE TABLE IF NOT EXISTS workflows (
    workflow_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tenant_id TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    workflow_name TEXT,
    context TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    error_message TEXT
);

-- Basic audit trail table (limited in SQLite)
CREATE TABLE IF NOT EXISTS agent_audit_log (
    audit_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tenant_id TEXT NOT NULL,
    workflow_id TEXT,
    agent_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_data TEXT NOT NULL DEFAULT '{}',
    timestamp TEXT DEFAULT (datetime('now')),
    correlation_id TEXT
);

-- Agent registry table
CREATE TABLE IF NOT EXISTS agent_registry (
    agent_id TEXT PRIMARY KEY,
    agent_name TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    capabilities TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active',
    tier TEXT NOT NULL DEFAULT 'open_core',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Single tenant configuration for SQLite (no multi-tenancy)
CREATE TABLE IF NOT EXISTS tenant_config (
    tenant_id TEXT PRIMARY KEY,
    tenant_name TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'open_core',
    config TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance (SQLite compatible)
CREATE INDEX IF NOT EXISTS idx_coordination_tenant_workflow ON agent_coordination(tenant_id, workflow_id);
CREATE INDEX IF NOT EXISTS idx_coordination_status ON agent_coordination(status);
CREATE INDEX IF NOT EXISTS idx_coordination_agent ON agent_coordination(agent_id);

CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON agent_audit_log(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_workflow ON agent_audit_log(workflow_id);
CREATE INDEX IF NOT EXISTS idx_audit_agent ON agent_audit_log(agent_id);

-- Basic agent registry data for open core
INSERT OR IGNORE INTO agent_registry (agent_id, agent_name, agent_type, capabilities, tier) VALUES
('code-generator', 'Code Generator Agent', 'development', '["template_generation", "basic_code_generation"]', 'open_core'),
('security-scanner', 'Security Scanner Agent', 'security', '["vulnerability_scan", "secrets_detection"]', 'open_core'),
('deployment-agent', 'Deployment Agent', 'infrastructure', '["aws_deploy", "basic_validation"]', 'open_core'),
('test-runner', 'Test Runner Agent', 'quality', '["unit_testing", "basic_reporting"]', 'open_core'),
('cost-analyzer', 'Cost Analyzer Agent', 'infrastructure', '["basic_cost_analysis", "usage_reporting"]', 'open_core');

-- Single tenant setup for open core evaluation
INSERT OR IGNORE INTO tenant_config (tenant_id, tenant_name, tier, config) VALUES
('open-core-tenant', 'Open Core Evaluation', 'open_core', '{"max_concurrent_workflows": 3, "sqlite_limitations": true}');

-- SQLite-specific function alternatives (basic implementations)
-- Note: These are simplified versions of PostgreSQL functions
-- Commercial PostgreSQL has advanced dependency resolution and optimizations

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_coordination_timestamp 
    AFTER UPDATE ON agent_coordination
BEGIN
    UPDATE agent_coordination 
    SET updated_at = datetime('now') 
    WHERE coordination_id = NEW.coordination_id;
END;

CREATE TRIGGER IF NOT EXISTS update_workflows_timestamp
    AFTER UPDATE ON workflows
BEGIN
    UPDATE workflows 
    SET updated_at = datetime('now') 
    WHERE workflow_id = NEW.workflow_id;
END;

-- SQLite limitations notice
CREATE TABLE IF NOT EXISTS sqlite_limitations (
    limitation TEXT PRIMARY KEY,
    description TEXT,
    commercial_solution TEXT
);

INSERT OR IGNORE INTO sqlite_limitations VALUES
('row_level_security', 'SQLite does not support Row Level Security - single tenant only', 'PostgreSQL with RLS provides perfect multi-tenant isolation'),
('advanced_json', 'Limited JSON operations compared to PostgreSQL JSONB', 'PostgreSQL JSONB provides advanced querying and indexing'),
('concurrent_writes', 'SQLite writer locks limit concurrent operations', 'PostgreSQL supports high-concurrency multi-agent coordination'),
('advanced_functions', 'No custom functions or advanced dependency resolution', 'Commercial PostgreSQL includes ML-based optimization'),
('scalability', 'File-based storage limits enterprise scale', 'Commercial tiers use horizontally scalable PostgreSQL');

-- Comments explaining open core vs commercial differences
-- This schema provides basic functionality for evaluation
-- Commercial PostgreSQL schema includes:
-- - Advanced multi-tenant isolation with Row Level Security
-- - JSONB for efficient JSON operations and indexing
-- - Custom functions for intelligent dependency resolution
-- - Advanced audit capabilities for compliance
-- - High-performance concurrent operations
-- - Machine learning integration for optimization