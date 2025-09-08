-- EquilateralAgents™ Open Core Database Schema
-- Core orchestration tables that demonstrate database-mediated agent coordination

-- Core agent coordination table
CREATE TABLE agent_coordination (
    coordination_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    workflow_id UUID NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    task_data JSONB NOT NULL DEFAULT '{}',
    dependencies JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    result_data JSONB,
    error_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Tenant isolation index
    INDEX tenant_workflow_idx (tenant_id, workflow_id),
    INDEX status_idx (status),
    INDEX agent_idx (agent_id)
);

-- Workflow management table
CREATE TABLE workflows (
    workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(255),
    context JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Tenant isolation
    INDEX tenant_idx (tenant_id),
    INDEX workflow_type_idx (workflow_type),
    INDEX status_idx (status)
);

-- Basic audit trail table
CREATE TABLE agent_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    workflow_id UUID,
    agent_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    correlation_id UUID,
    
    -- Audit query optimization
    INDEX tenant_temporal_idx (tenant_id, timestamp),
    INDEX workflow_idx (workflow_id),
    INDEX agent_action_idx (agent_id, action_type)
);

-- Agent registry table
CREATE TABLE agent_registry (
    agent_id VARCHAR(255) PRIMARY KEY,
    agent_name VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    tier VARCHAR(50) NOT NULL DEFAULT 'open_core', -- open_core, professional, enterprise
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant configuration table  
CREATE TABLE tenant_config (
    tenant_id VARCHAR(255) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'open_core',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for multi-tenant isolation
ALTER TABLE agent_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies (example - customize for your auth system)
CREATE POLICY tenant_isolation_coordination ON agent_coordination
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant'));

CREATE POLICY tenant_isolation_workflows ON workflows
    FOR ALL TO authenticated  
    USING (tenant_id = current_setting('app.current_tenant'));

CREATE POLICY tenant_isolation_audit ON agent_audit_log
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant'));

-- Functions for dependency checking
CREATE OR REPLACE FUNCTION check_dependencies_satisfied(
    task_dependencies JSONB,
    workflow_id UUID,
    tenant_id VARCHAR(255)
) RETURNS BOOLEAN AS $$
BEGIN
    -- Simple dependency checking logic for open core
    -- Commercial tiers have advanced dependency resolution
    RETURN (
        SELECT COUNT(*) = 0
        FROM jsonb_array_elements_text(task_dependencies) AS dep
        WHERE NOT EXISTS (
            SELECT 1 FROM agent_coordination 
            WHERE coordination_id::text = dep
              AND tenant_id = check_dependencies_satisfied.tenant_id
              AND status = 'completed'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_agent_coordination_updated_at
    BEFORE UPDATE ON agent_coordination
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at  
    BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Basic agent registry data for open core
INSERT INTO agent_registry (agent_id, agent_name, agent_type, capabilities, tier) VALUES
('code-generator', 'Code Generator Agent', 'development', '["code_generation", "template_processing"]', 'open_core'),
('test-runner', 'Test Runner Agent', 'quality', '["unit_testing", "integration_testing"]', 'open_core'),
('security-scanner', 'Security Scanner Agent', 'security', '["vulnerability_scan", "dependency_check"]', 'open_core'),
('deployment-agent', 'Deployment Agent', 'infrastructure', '["aws_deploy", "validation", "rollback"]', 'open_core'),
('cost-analyzer', 'Cost Analyzer Agent', 'infrastructure', '["cost_analysis", "optimization_recommendations"]', 'open_core');

-- Example tenant for demo purposes
INSERT INTO tenant_config (tenant_id, tenant_name, tier, config) VALUES
('demo-tenant', 'Demo Organization', 'open_core', '{"max_concurrent_workflows": 5, "retention_days": 30}');

-- Comments explaining the innovation
COMMENT ON TABLE agent_coordination IS 'Core innovation: Agents coordinate via persistent database state within tenant boundaries';
COMMENT ON TABLE workflows IS 'Workflow orchestration with complete state persistence and recovery capabilities';
COMMENT ON TABLE agent_audit_log IS 'Complete audit trail for compliance and debugging - every agent interaction recorded';
COMMENT ON FUNCTION check_dependencies_satisfied IS 'Basic dependency resolution - commercial tiers include advanced dependency optimization';