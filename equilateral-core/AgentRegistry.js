/**
 * EquilateralAgents™ Agent Registry
 * 
 * Manages agent capabilities and client configurations.
 * Open Core: Single model/key configuration
 * Commercial: Per-client model preferences and advanced agent access
 */

class AgentRegistry {
    constructor(config = {}) {
        this.tenantId = config.tenantId;
        
        // Open Core: Simple global configuration
        // Commercial: Per-client model preferences from SaaS setup
        this.globalConfig = {
            llm: {
                // Most users will have GitHub Copilot or use Anthropic free tier
                provider: config.llmProvider || process.env.LLM_PROVIDER || 'anthropic',
                model: config.llmModel || process.env.LLM_MODEL || 'claude-3-haiku-20240307', // Free tier model
                apiKey: config.llmApiKey || process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY,
                endpoint: config.llmEndpoint || process.env.LLM_ENDPOINT,
                
                // Fallback configurations
                fallbackToFree: !process.env.LLM_API_KEY && !process.env.ANTHROPIC_API_KEY,
                rateLimits: {
                    requestsPerMinute: 10, // Conservative for free tier
                    tokensPerMinute: 10000
                }
            },
            
            aws: {
                region: config.awsRegion || process.env.AWS_REGION || 'us-east-1',
                useInstanceProfile: true, // Default for simplicity
                accessKeyId: config.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
            }
        };

        // Agent registry with tier-based access
        this.agents = new Map();
        this.initializeOpenCoreAgents();
    }

    /**
     * Initialize open core agents with basic capabilities
     */
    initializeOpenCoreAgents() {
        const openCoreAgents = [
            {
                id: 'code-generator',
                name: 'Code Generator',
                type: 'development',
                tier: 'open_core',
                capabilities: ['template_generation', 'basic_code_generation'],
                requiresLLM: true,
                className: 'CodeGeneratorAgent',
                status: 'active'
            },
            {
                id: 'security-scanner', 
                name: 'Security Scanner',
                type: 'security',
                tier: 'open_core',
                capabilities: ['vulnerability_scan', 'secrets_detection', 'basic_analysis'],
                requiresLLM: false,
                className: 'SecurityScannerAgent', 
                status: 'active'
            },
            {
                id: 'deployment-agent',
                name: 'Deployment Agent', 
                type: 'infrastructure',
                tier: 'open_core',
                capabilities: ['aws_deploy', 'basic_validation', 'cost_estimation'],
                requiresLLM: false,
                requiresAWS: true,
                className: 'DeploymentAgent',
                status: 'active'
            },
            {
                id: 'test-runner',
                name: 'Test Runner',
                type: 'quality',
                tier: 'open_core', 
                capabilities: ['unit_testing', 'basic_reporting'],
                requiresLLM: false,
                className: 'TestRunnerAgent',
                status: 'active'
            },
            {
                id: 'cost-analyzer',
                name: 'Cost Analyzer',
                type: 'infrastructure',
                tier: 'open_core',
                capabilities: ['basic_cost_analysis', 'usage_reporting'],
                requiresLLM: false,
                requiresAWS: true,
                className: 'CostAnalyzerAgent',
                status: 'active'
            }
        ];

        // Commercial agents (available as Lambda endpoints)
        const commercialAgents = [
            {
                id: 'standards-enforcer',
                name: 'Standards Enforcement Agent',
                type: 'quality',
                tier: 'professional',
                capabilities: ['intelligent_standards', 'boundary_management', 'architectural_governance'],
                requiresLLM: true,
                lambdaEndpoint: true,
                status: 'commercial',
                pricing: 'included_in_professional'
            },
            {
                id: 'compliance-orchestrator',
                name: 'Compliance Orchestration Agent',
                type: 'compliance', 
                tier: 'enterprise',
                capabilities: ['automated_compliance', 'audit_orchestration', 'policy_enforcement'],
                requiresLLM: true,
                lambdaEndpoint: true,
                status: 'commercial',
                pricing: 'included_in_enterprise'
            },
            {
                id: 'business-intelligence',
                name: 'Business Intelligence Agent',
                type: 'analytics',
                tier: 'professional',
                capabilities: ['advanced_analytics', 'decision_support', 'predictive_insights'],
                requiresLLM: true,
                lambdaEndpoint: true,
                status: 'commercial', 
                pricing: 'included_in_professional'
            }
        ];

        // Register all agents
        [...openCoreAgents, ...commercialAgents].forEach(agent => {
            this.agents.set(agent.id, agent);
        });
    }

    /**
     * Get available agents for current tier
     */
    getAvailableAgents(tier = 'open_core') {
        const tierHierarchy = {
            'open_core': ['open_core'],
            'professional': ['open_core', 'professional'], 
            'enterprise': ['open_core', 'professional', 'enterprise']
        };

        const availableTiers = tierHierarchy[tier] || ['open_core'];
        
        return Array.from(this.agents.values())
            .filter(agent => availableTiers.includes(agent.tier))
            .map(agent => ({
                ...agent,
                available: this.isAgentAvailable(agent),
                configuration_needed: this.getConfigurationNeeds(agent)
            }));
    }

    /**
     * Check if agent is available with current configuration
     */
    isAgentAvailable(agent) {
        // Check LLM requirements
        if (agent.requiresLLM && this.globalConfig.llm.fallbackToFree && !agent.tier === 'open_core') {
            return false; // Commercial agents need real LLM access
        }

        // Check AWS requirements  
        if (agent.requiresAWS && !this.globalConfig.aws.useInstanceProfile && 
            (!this.globalConfig.aws.accessKeyId || !this.globalConfig.aws.secretAccessKey)) {
            return false;
        }

        return true;
    }

    /**
     * Get configuration needs for agent
     */
    getConfigurationNeeds(agent) {
        const needs = [];

        if (agent.requiresLLM && this.globalConfig.llm.fallbackToFree) {
            needs.push({
                type: 'llm_api_key',
                message: 'Set LLM_API_KEY or ANTHROPIC_API_KEY for enhanced capabilities',
                optional: agent.tier === 'open_core'
            });
        }

        if (agent.requiresAWS && !this.globalConfig.aws.useInstanceProfile && !this.globalConfig.aws.accessKeyId) {
            needs.push({
                type: 'aws_credentials', 
                message: 'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for AWS operations',
                optional: false
            });
        }

        return needs;
    }

    /**
     * Get LLM configuration for agents
     */
    getLLMConfig() {
        return {
            ...this.globalConfig.llm,
            isConfigured: !this.globalConfig.llm.fallbackToFree,
            recommendedSetup: this.getRecommendedLLMSetup()
        };
    }

    /**
     * Get AWS configuration for agents
     */
    getAWSConfig() {
        return {
            ...this.globalConfig.aws,
            isConfigured: this.globalConfig.aws.useInstanceProfile || 
                         (this.globalConfig.aws.accessKeyId && this.globalConfig.aws.secretAccessKey)
        };
    }

    /**
     * Get recommended setup for users
     */
    getRecommendedLLMSetup() {
        return {
            github_copilot_users: {
                message: 'GitHub Copilot users can integrate their existing access',
                setup: 'Configure GitHub Copilot API access in your environment'
            },
            anthropic_free_tier: {
                message: 'Get free Anthropic API key for Claude Haiku access',
                setup: 'Sign up at console.anthropic.com for free API access',
                model: 'claude-3-haiku-20240307'
            },
            openai_users: {
                message: 'OpenAI API users can configure GPT access',
                setup: 'Set LLM_PROVIDER=openai and LLM_API_KEY=your_openai_key'
            }
        };
    }

    /**
     * Update global configuration
     */
    updateGlobalConfig(newConfig) {
        if (newConfig.llm) {
            this.globalConfig.llm = { ...this.globalConfig.llm, ...newConfig.llm };
            this.globalConfig.llm.fallbackToFree = !this.globalConfig.llm.apiKey;
        }

        if (newConfig.aws) {
            this.globalConfig.aws = { ...this.globalConfig.aws, ...newConfig.aws };
        }

        console.log('Global configuration updated for tenant:', this.tenantId);
        return this.getConfigurationStatus();
    }

    /**
     * Get current configuration status
     */
    getConfigurationStatus() {
        const llmConfigured = !this.globalConfig.llm.fallbackToFree;
        const awsConfigured = this.globalConfig.aws.useInstanceProfile || 
                             (this.globalConfig.aws.accessKeyId && this.globalConfig.aws.secretAccessKey);

        return {
            llm: {
                configured: llmConfigured,
                provider: this.globalConfig.llm.provider,
                model: this.globalConfig.llm.model,
                fallback_mode: this.globalConfig.llm.fallbackToFree
            },
            aws: {
                configured: awsConfigured,
                region: this.globalConfig.aws.region,
                using_instance_profile: this.globalConfig.aws.useInstanceProfile
            },
            available_agents: this.getAvailableAgents().length,
            configuration_complete: llmConfigured && awsConfigured
        };
    }

    /**
     * Register custom agent (for extensibility)
     */
    registerCustomAgent(agentConfig) {
        if (this.agents.has(agentConfig.id)) {
            throw new Error(`Agent ${agentConfig.id} already registered`);
        }

        const agent = {
            tier: 'open_core', // Custom agents are open core by default
            status: 'active',
            requiresLLM: false,
            requiresAWS: false,
            ...agentConfig
        };

        this.agents.set(agent.id, agent);
        console.log(`Registered custom agent: ${agent.id}`);
        return agent;
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * Get agents by type
     */
    getAgentsByType(type) {
        return Array.from(this.agents.values()).filter(agent => agent.type === type);
    }

    /**
     * Get commercial upgrade information
     */
    getUpgradeInformation() {
        const commercialAgents = Array.from(this.agents.values())
            .filter(agent => agent.tier !== 'open_core');

        return {
            commercial_agents_available: commercialAgents.length,
            professional_tier: {
                price: '$149/month',
                additional_agents: commercialAgents.filter(a => a.tier === 'professional').length,
                key_features: ['Standards enforcement', 'Business intelligence', 'Advanced cost optimization']
            },
            enterprise_tier: {
                price: '$499/month', 
                additional_agents: commercialAgents.filter(a => a.tier === 'enterprise').length,
                key_features: ['Compliance orchestration', 'Advanced security', 'Custom integrations']
            },
            lambda_endpoints: commercialAgents.filter(a => a.lambdaEndpoint).length
        };
    }
}

module.exports = AgentRegistry;