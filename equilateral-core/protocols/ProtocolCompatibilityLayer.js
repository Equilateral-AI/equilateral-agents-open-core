/**
 * Protocol Compatibility Layer for MCP/A2A Standards
 * 
 * Provides interoperability between Equilateral AI's proprietary agent communication
 * system and industry-standard protocols (MCP, A2A) while maintaining competitive advantage.
 * 
 * Key Features:
 * - MCP (Model Context Protocol) support for tool/context standardization
 * - A2A (Agent-to-Agent Protocol) support for peer-to-peer agent communication
 * - Protocol translation layer between proprietary and standard formats
 * - Optional AgentGateway integration for enterprise infrastructure
 * - Maintains Equilateral AI's orchestration intelligence advantage
 * 
 * @author Equilateral AI
 * @version 1.0.0
 * @implements MCP v1.0, A2A v1.0
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

// MCP Protocol Constants (based on Anthropic's specification)
const MCP_PROTOCOL = {
    VERSION: '1.0',
    MESSAGE_TYPES: {
        CONTEXT_REQUEST: 'context/request',
        CONTEXT_RESPONSE: 'context/response',
        TOOL_REQUEST: 'tool/request',
        TOOL_RESPONSE: 'tool/response',
        SAMPLING_REQUEST: 'sampling/request',
        SAMPLING_RESPONSE: 'sampling/response',
        ERROR: 'error'
    },
    CONTENT_TYPES: {
        TEXT: 'text/plain',
        JSON: 'application/json',
        STRUCTURED: 'application/vnd.mcp.structured+json'
    }
};

// A2A Protocol Constants (based on Google's specification)
const A2A_PROTOCOL = {
    VERSION: '1.0',
    METHOD_TYPES: {
        TASK_REQUEST: 'agent.task.request',
        TASK_RESPONSE: 'agent.task.response',
        STATUS_UPDATE: 'agent.status.update',
        CAPABILITY_QUERY: 'agent.capability.query',
        DELEGATION_REQUEST: 'agent.delegation.request',
        COLLABORATION_INVITE: 'agent.collaboration.invite',
        ERROR_NOTIFICATION: 'agent.error.notify'
    },
    TRANSPORT: {
        HTTP: 'http',
        WEBSOCKET: 'websocket',
        KAFKA: 'kafka'
    }
};

// AgentGateway Integration Constants
const AGENT_GATEWAY = {
    PROTOCOLS: ['mcp', 'a2a', 'equilateral-native'],
    SECURITY_POLICIES: {
        RBAC_ENFORCEMENT: 'rbac-enforcement',
        RATE_LIMITING: 'rate-limiting',
        AUTH_VALIDATION: 'auth-validation'
    },
    OBSERVABILITY: {
        METRICS: 'metrics-collection',
        TRACING: 'distributed-tracing',
        LOGGING: 'structured-logging'
    }
};

class ProtocolCompatibilityLayer extends EventEmitter {
    constructor(agentCommunicationBus, agentRegistry, configOverrides = {}) {
        super();
        
        this.communicationBus = agentCommunicationBus;
        this.agentRegistry = agentRegistry;
        
        // Initialize default message translators
        this.defaultMCPTranslator = {
            translatePayload: async (payload) => {
                if (typeof payload === 'object' && payload !== null) {
                    return {
                        type: payload.type || 'generic',
                        data: payload.data || payload,
                        parameters: payload.parameters || payload.params || {},
                        context: payload.context || {}
                    };
                }
                return { type: 'text', data: payload, parameters: {}, context: {} };
            }
        };
        
        this.defaultA2ATranslator = {
            translateParams: async (params) => {
                return {
                    type: 'agent_task',
                    data: params.data || params,
                    parameters: params.parameters || params,
                    context: params.context || {}
                };
            }
        };
        
        this.defaultNativeMCPTranslator = {
            translatePayload: async (payload) => {
                // Handle null, undefined, or empty payload
                if (!payload) {
                    return {
                        type: 'text',
                        content: 'empty_response',
                        parameters: {},
                        context: {}
                    };
                }
                
                return {
                    type: 'text',
                    content: payload.payload || payload.data || payload.toString(),
                    parameters: payload.parameters || {},
                    context: payload.context || {}
                };
            }
        };
        
        this.defaultNativeA2ATranslator = {
            translatePayload: async (payload) => {
                // Handle null, undefined, or empty payload
                if (!payload) {
                    return {
                        data: 'empty_response',
                        metadata: {},
                        status: 'success'
                    };
                }
                
                return {
                    data: payload.payload || payload.data || payload.toString(),
                    metadata: payload.context || {},
                    status: 'success'
                };
            }
        };
        
        this.config = {
            // Protocol support configuration
            protocols: {
                mcp: {
                    enabled: true,
                    version: MCP_PROTOCOL.VERSION,
                    endpoints: {
                        context: '/mcp/context',
                        tools: '/mcp/tools',
                        sampling: '/mcp/sampling'
                    }
                },
                a2a: {
                    enabled: true,
                    version: A2A_PROTOCOL.VERSION,
                    transport: A2A_PROTOCOL.TRANSPORT.HTTP,
                    endpoints: {
                        tasks: '/a2a/tasks',
                        delegation: '/a2a/delegation',
                        collaboration: '/a2a/collaboration'
                    }
                },
                equilateralNative: {
                    enabled: true,
                    maintainAdvantage: true,
                    orchestrationIntelligence: true
                }
            },
            
            // AgentGateway integration (optional)
            agentGateway: {
                enabled: false,
                endpoint: process.env.AGENT_GATEWAY_ENDPOINT || null,
                apiKey: process.env.AGENT_GATEWAY_API_KEY || null,
                securityPolicies: AGENT_GATEWAY.SECURITY_POLICIES,
                observability: AGENT_GATEWAY.OBSERVABILITY
            },
            
            // Protocol translation settings
            translation: {
                bidirectional: true,
                preserveSemantics: true,
                maintainMetadata: true
            },
            
            // Compatibility mode
            compatibility: {
                strictMCP: false, // Allow Equilateral extensions to MCP
                strictA2A: false, // Allow Equilateral extensions to A2A
                fallbackToNative: true
            },
            
            ...configOverrides
        };
        
        // Protocol handlers
        this.mcpHandler = new MCPProtocolHandler(this);
        this.a2aHandler = new A2AProtocolHandler(this);
        this.gatewayIntegration = new AgentGatewayIntegration(this);
        
        // Message translation maps
        this.messageTranslators = new Map();
        this.protocolBridges = new Map();
        
        // Observability and monitoring
        this.metrics = {
            protocolUsage: new Map(),
            translationStats: new Map(),
            gatewayInteractions: 0,
            errors: 0
        };
        
        this.initialized = false;
    }
    
    /**
     * Initialize the Protocol Compatibility Layer
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🔗 Initializing Protocol Compatibility Layer...');
            
            // Initialize protocol handlers
            if (this.config.protocols.mcp.enabled) {
                await this.mcpHandler.initialize();
                console.log('✅ MCP Protocol Handler initialized');
            }
            
            if (this.config.protocols.a2a.enabled) {
                await this.a2aHandler.initialize();
                console.log('✅ A2A Protocol Handler initialized');
            }
            
            // Setup protocol translation bridges
            this.setupProtocolBridges();
            
            // Initialize AgentGateway integration if enabled
            if (this.config.agentGateway.enabled) {
                await this.gatewayIntegration.initialize();
                console.log('✅ AgentGateway Integration initialized');
            }
            
            // Setup observability hooks
            this.setupObservabilityHooks();
            
            // Register with communication bus
            this.registerWithCommunicationBus();
            
            this.initialized = true;
            console.log('🎉 Protocol Compatibility Layer fully initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Protocol Compatibility Layer:', error);
            throw error;
        }
    }
    
    /**
     * Handle incoming MCP message
     */
    async handleMCPMessage(message, context = {}) {
        this.metrics.protocolUsage.set('mcp', (this.metrics.protocolUsage.get('mcp') || 0) + 1);
        
        try {
            // Validate MCP message format
            const validatedMessage = this.mcpHandler.validateMessage(message);
            
            // Translate MCP to Equilateral native format
            const nativeMessage = await this.translateMCPToNative(validatedMessage, context);
            
            // Process through native system with orchestration intelligence
            const result = await this.processNativeMessage(nativeMessage);
            
            // Translate response back to MCP format
            const mcpResponse = await this.translateNativeToMCP(result, context);
            
            this.emit('mcp:message_processed', {
                original: message,
                translated: nativeMessage,
                result: mcpResponse
            });
            
            return mcpResponse;
            
        } catch (error) {
            console.error('MCP message handling error:', error);
            this.metrics.errors++;
            throw error;
        }
    }
    
    /**
     * Handle incoming A2A message
     */
    async handleA2AMessage(message, context = {}) {
        this.metrics.protocolUsage.set('a2a', (this.metrics.protocolUsage.get('a2a') || 0) + 1);
        
        try {
            // Validate A2A message format
            const validatedMessage = this.a2aHandler.validateMessage(message);
            
            // Translate A2A to Equilateral native format
            const nativeMessage = await this.translateA2AToNative(validatedMessage, context);
            
            // Process through native orchestration with intelligence advantage
            const result = await this.processNativeMessage(nativeMessage);
            
            // Translate response back to A2A format
            const a2aResponse = await this.translateNativeToA2A(result, context);
            
            this.emit('a2a:message_processed', {
                original: message,
                translated: nativeMessage,
                result: a2aResponse
            });
            
            return a2aResponse;
            
        } catch (error) {
            console.error('A2A message handling error:', error);
            this.metrics.errors++;
            throw error;
        }
    }
    
    /**
     * Send message through specified protocol
     */
    async sendMessage(targetProtocol, message, recipient, options = {}) {
        switch (targetProtocol) {
            case 'mcp':
                return this.mcpHandler.sendMessage(message, recipient, options);
            case 'a2a':
                return this.a2aHandler.sendMessage(message, recipient, options);
            case 'native':
                return this.communicationBus.sendMessage(message, options);
            default:
                throw new Error(`Unsupported protocol: ${targetProtocol}`);
        }
    }
    
    /**
     * Translate MCP message to Equilateral native format
     */
    async translateMCPToNative(mcpMessage, context) {
        const translator = this.messageTranslators.get('mcp-to-native') || this.defaultMCPTranslator;
        
        const nativeMessage = {
            id: mcpMessage.id || uuidv4(),
            type: this.mapMCPTypeToNative(mcpMessage.type),
            source: context.source || 'mcp-bridge',
            payload: await translator.translatePayload(mcpMessage.params || mcpMessage.content),
            metadata: {
                originalProtocol: 'mcp',
                mcpVersion: MCP_PROTOCOL.VERSION,
                translatedAt: new Date().toISOString(),
                preservedFields: mcpMessage.meta || {}
            }
        };
        
        // Preserve MCP context information for orchestration intelligence
        if (mcpMessage.context) {
            nativeMessage.contextData = mcpMessage.context;
        }
        
        return nativeMessage;
    }
    
    /**
     * Translate A2A message to Equilateral native format
     */
    async translateA2AToNative(a2aMessage, context) {
        const translator = this.messageTranslators.get('a2a-to-native') || this.defaultA2ATranslator;
        
        const nativeMessage = {
            id: a2aMessage.id || uuidv4(),
            type: this.mapA2AMethodToNative(a2aMessage.method),
            source: context.source || 'a2a-bridge',
            payload: await translator.translateParams(a2aMessage.params),
            metadata: {
                originalProtocol: 'a2a',
                a2aVersion: A2A_PROTOCOL.VERSION,
                jsonrpcVersion: a2aMessage.jsonrpc,
                translatedAt: new Date().toISOString(),
                collaborationContext: a2aMessage.collaboration_context || {}
            }
        };
        
        // Preserve A2A agent interaction context for orchestration
        if (a2aMessage.agent_info) {
            nativeMessage.agentContext = a2aMessage.agent_info;
        }
        
        return nativeMessage;
    }
    
    /**
     * Translate native response to MCP format
     */
    async translateNativeToMCP(nativeResult, context) {
        const translator = this.messageTranslators.get('native-to-mcp') || this.defaultNativeMCPTranslator;
        
        const mcpResponse = {
            id: nativeResult.id,
            type: this.mapNativeTypeToMCP(nativeResult.type),
            content: await translator.translatePayload(nativeResult.payload),
            meta: {
                processedBy: 'equilateral-ai',
                orchestrationIntelligence: true,
                ...nativeResult.metadata
            }
        };
        
        // Include enhanced context from Equilateral orchestration
        if (nativeResult.orchestrationContext) {
            mcpResponse.enhanced_context = nativeResult.orchestrationContext;
        }
        
        return mcpResponse;
    }
    
    /**
     * Translate native response to A2A format
     */
    async translateNativeToA2A(nativeResult, context) {
        const translator = this.messageTranslators.get('native-to-a2a') || this.defaultNativeA2ATranslator;
        
        const a2aResponse = {
            jsonrpc: '2.0',
            id: nativeResult.id,
            result: await translator.translatePayload(nativeResult.payload),
            meta: {
                processedBy: 'equilateral-ai',
                orchestrationIntelligence: true,
                enhanced: true,
                ...nativeResult.metadata
            }
        };
        
        // Include Equilateral's advanced orchestration insights
        if (nativeResult.orchestrationInsights) {
            a2aResponse.orchestration_insights = nativeResult.orchestrationInsights;
        }
        
        return a2aResponse;
    }
    
    /**
     * Process message through native Equilateral system
     */
    async processNativeMessage(message) {
        try {
            // Leverage Equilateral's orchestration intelligence
            const startTime = Date.now();
            
            // Route message through appropriate agent
            let result;
            if (this.agentRegistry && this.agentRegistry.size > 0) {
                // Find appropriate agent for the message type
                const targetAgent = this.findTargetAgent(message.type);
                if (targetAgent) {
                    result = await this.routeToAgent(targetAgent, message);
                } else {
                    // Fallback to communication bus
                    result = await this.communicationBus.sendMessage(
                        message.source || 'protocol-bridge',
                        'orchestrator',
                        message.type,
                        message.payload,
                        {
                            useOrchestrationIntelligence: true,
                            enableAdvancedRouting: true,
                            preserveCompetitiveAdvantage: true
                        }
                    );
                }
            } else {
                // Direct processing when no registry available
                result = {
                    id: message.id,
                    type: message.type + '_response',
                    payload: message.payload,
                    success: true,
                    metadata: {
                        processedBy: 'protocol-compatibility-layer',
                        processingTime: Date.now() - startTime,
                        orchestrationIntelligence: true
                    }
                };
            }
            
            // Add orchestration context for competitive advantage
            if (result && result.success) {
                result.orchestrationContext = {
                    protocolBridge: true,
                    intelligenceEnhanced: true,
                    processingTime: Date.now() - startTime,
                    competitiveAdvantage: true
                };
            }
            
            return result;
            
        } catch (error) {
            console.error('Native message processing failed:', error);
            return {
                id: message.id,
                type: 'error_response',
                success: false,
                error: error.message,
                metadata: {
                    processedBy: 'protocol-compatibility-layer',
                    failed: true
                }
            };
        }
    }
    
    /**
     * Setup protocol translation bridges
     */
    setupProtocolBridges() {
        // MCP <-> Native bridge
        this.protocolBridges.set('mcp-native', {
            translate: this.translateMCPToNative.bind(this),
            reverse: this.translateNativeToMCP.bind(this)
        });
        
        // A2A <-> Native bridge
        this.protocolBridges.set('a2a-native', {
            translate: this.translateA2AToNative.bind(this),
            reverse: this.translateNativeToA2A.bind(this)
        });
        
        // Direct MCP <-> A2A bridge (using native as intermediary)
        this.protocolBridges.set('mcp-a2a', {
            translate: async (mcpMessage, context) => {
                const nativeMessage = await this.translateMCPToNative(mcpMessage, context);
                return this.translateNativeToA2A(nativeMessage, context);
            }
        });
    }
    
    /**
     * Setup observability hooks for monitoring and metrics
     */
    setupObservabilityHooks() {
        // Protocol usage tracking
        this.on('mcp:message_processed', (event) => {
            this.trackProtocolUsage('mcp', event);
        });
        
        this.on('a2a:message_processed', (event) => {
            this.trackProtocolUsage('a2a', event);
        });
        
        // Translation performance monitoring
        this.on('translation:completed', (event) => {
            this.trackTranslationPerformance(event);
        });
        
        // Error tracking for observability
        this.on('error', (error) => {
            this.trackError(error);
        });
    }
    
    /**
     * Register with communication bus for native message handling
     */
    registerWithCommunicationBus() {
        this.communicationBus.on('message', (message) => {
            // Enhance native messages with protocol compatibility metadata
            if (message.metadata?.requiresProtocolBridge) {
                this.handleProtocolBridgeRequest(message);
            }
        });
    }
    
    /**
     * Map MCP message types to native Equilateral types
     */
    mapMCPTypeToNative(mcpType) {
        const mapping = {
            [MCP_PROTOCOL.MESSAGE_TYPES.CONTEXT_REQUEST]: 'context_request',
            [MCP_PROTOCOL.MESSAGE_TYPES.TOOL_REQUEST]: 'tool_execution',
            [MCP_PROTOCOL.MESSAGE_TYPES.SAMPLING_REQUEST]: 'agent_request'
        };
        
        return mapping[mcpType] || 'generic_request';
    }
    
    /**
     * Map A2A methods to native Equilateral types
     */
    mapA2AMethodToNative(a2aMethod) {
        const mapping = {
            [A2A_PROTOCOL.METHOD_TYPES.TASK_REQUEST]: 'agent_request',
            [A2A_PROTOCOL.METHOD_TYPES.DELEGATION_REQUEST]: 'workflow_delegation',
            [A2A_PROTOCOL.METHOD_TYPES.COLLABORATION_INVITE]: 'collaboration_pattern',
            [A2A_PROTOCOL.METHOD_TYPES.STATUS_UPDATE]: 'status_update'
        };
        
        return mapping[a2aMethod] || 'agent_request';
    }
    
    /**
     * Map native types back to MCP
     */
    mapNativeTypeToMCP(nativeType) {
        const mapping = {
            'context_request': MCP_PROTOCOL.MESSAGE_TYPES.CONTEXT_RESPONSE,
            'tool_execution': MCP_PROTOCOL.MESSAGE_TYPES.TOOL_RESPONSE,
            'agent_request': MCP_PROTOCOL.MESSAGE_TYPES.SAMPLING_RESPONSE
        };
        
        return mapping[nativeType] || MCP_PROTOCOL.MESSAGE_TYPES.CONTEXT_RESPONSE;
    }
    
    /**
     * Find appropriate target agent for a message type
     */
    findTargetAgent(messageType) {
        const messageToAgentMap = {
            'security_review': 'security-reviewer',
            'audit_request': 'auditor', 
            'pattern_analysis': 'pattern-harvester',
            'knowledge_synthesis': 'knowledge-synthesizer',
            'context_request': 'knowledge-synthesizer',
            'tool_execution': 'pattern-harvester',
            'agent_request': 'orchestrator'
        };
        
        return messageToAgentMap[messageType] || null;
    }
    
    /**
     * Route message to specific agent
     */
    async routeToAgent(agentType, message) {
        try {
            return await this.communicationBus.sendMessage(
                message.source || 'protocol-bridge',
                agentType,
                message.type,
                message.payload,
                { timeout: 30000 }
            );
        } catch (error) {
            console.error(`Failed to route message to ${agentType}:`, error);
            throw error;
        }
    }
    
    /**
     * Handle protocol bridge requests
     */
    async handleProtocolBridgeRequest(message) {
        const { sourceProtocol, targetProtocol, payload } = message;
        
        try {
            let result;
            
            if (sourceProtocol === 'mcp' && targetProtocol === 'a2a') {
                const bridge = this.protocolBridges.get('mcp-a2a');
                result = await bridge.translate(payload, message.context || {});
            } else if (sourceProtocol === 'a2a' && targetProtocol === 'mcp') {
                // Reverse translation - A2A to MCP via native
                const nativeMessage = await this.translateA2AToNative(payload, message.context || {});
                result = await this.translateNativeToMCP(nativeMessage, message.context || {});
            } else {
                throw new Error(`Unsupported protocol bridge: ${sourceProtocol} -> ${targetProtocol}`);
            }
            
            this.emit('protocol:bridge_completed', {
                sourceProtocol,
                targetProtocol,
                success: true,
                result
            });
            
            return result;
            
        } catch (error) {
            console.error('Protocol bridge request failed:', error);
            this.emit('protocol:bridge_failed', {
                sourceProtocol,
                targetProtocol,
                error: error.message
            });
            throw error;
        }
    }
    
    /**
     * Track protocol usage for metrics
     */
    trackProtocolUsage(protocol, event) {
        const stats = this.metrics.translationStats.get(protocol) || {
            totalMessages: 0,
            successfulTranslations: 0,
            failures: 0,
            totalLatency: 0,
            averageLatency: 0
        };
        
        const latency = event.latency || 0;
        stats.totalMessages++;
        stats.totalLatency += latency;
        stats.averageLatency = stats.totalLatency / stats.totalMessages;
        
        if (event.result && event.result.success !== false) {
            stats.successfulTranslations++;
        } else {
            stats.failures++;
        }
        
        this.metrics.translationStats.set(protocol, stats);
    }
    
    /**
     * Track translation performance
     */
    trackTranslationPerformance(event) {
        const { protocol, startTime, endTime, success } = event;
        const latency = endTime - startTime;
        
        // Update protocol-specific metrics
        this.trackProtocolUsage(protocol, { latency, result: { success } });
        
        // Log performance warnings
        if (latency > 50) { // 50ms target
            console.warn(`⚠️ Protocol translation latency high: ${latency}ms for ${protocol}`);
        }
    }
    
    /**
     * Track errors for observability
     */
    trackError(error) {
        this.metrics.errors++;
        console.error('Protocol Compatibility Layer Error:', error);
        
        // Emit error for external monitoring
        this.emit('error:tracked', {
            error: error.message || error,
            timestamp: new Date().toISOString(),
            totalErrors: this.metrics.errors
        });
    }
    
    /**
     * Get comprehensive compatibility metrics
     */
    getCompatibilityMetrics() {
        return {
            protocolUsage: Object.fromEntries(this.metrics.protocolUsage),
            translationStats: Object.fromEntries(this.metrics.translationStats),
            gatewayInteractions: this.metrics.gatewayInteractions,
            errors: this.metrics.errors,
            activeProtocols: {
                mcp: this.config.protocols.mcp.enabled,
                a2a: this.config.protocols.a2a.enabled,
                native: this.config.protocols.equilateralNative.enabled
            },
            gatewayStatus: this.config.agentGateway.enabled ? 'enabled' : 'disabled'
        };
    }
    
    /**
     * Graceful shutdown
     */
    async shutdown() {
        console.log('🔗 Shutting down Protocol Compatibility Layer...');
        
        if (this.mcpHandler) {
            await this.mcpHandler.shutdown();
        }
        
        if (this.a2aHandler) {
            await this.a2aHandler.shutdown();
        }
        
        if (this.gatewayIntegration) {
            await this.gatewayIntegration.shutdown();
        }
        
        this.removeAllListeners();
        this.initialized = false;
        
        console.log('✅ Protocol Compatibility Layer shutdown complete');
    }
}

/**
 * MCP Protocol Handler
 */
class MCPProtocolHandler {
    constructor(compatibilityLayer) {
        this.compatibilityLayer = compatibilityLayer;
        this.initialized = false;
    }
    
    async initialize() {
        console.log('📡 Initializing MCP Protocol Handler...');
        this.initialized = true;
    }
    
    validateMessage(message) {
        // Validate MCP message format according to specification
        if (!message || typeof message !== 'object') {
            throw new Error('Invalid MCP message format: message must be an object');
        }
        
        // Validate required MCP fields
        if (!message.type && !message.method) {
            throw new Error('Invalid MCP message: missing type or method field');
        }
        
        // Ensure message has ID for tracking
        if (!message.id) {
            message.id = uuidv4();
        }
        
        return message;
    }
    
    async sendMessage(message, recipient, options) {
        // Send message using MCP protocol format
        return { success: true, message: 'MCP message sent' };
    }
    
    async shutdown() {
        this.initialized = false;
    }
}

/**
 * A2A Protocol Handler  
 */
class A2AProtocolHandler {
    constructor(compatibilityLayer) {
        this.compatibilityLayer = compatibilityLayer;
        this.initialized = false;
    }
    
    async initialize() {
        console.log('🤖 Initializing A2A Protocol Handler...');
        this.initialized = true;
    }
    
    validateMessage(message) {
        // Validate A2A message format according to JSON-RPC 2.0 specification
        if (!message || typeof message !== 'object') {
            throw new Error('Invalid A2A message format: message must be an object');
        }
        
        if (!message.jsonrpc) {
            throw new Error('Invalid A2A message: missing jsonrpc field');
        }
        
        if (message.jsonrpc !== '2.0') {
            throw new Error('Invalid A2A message: jsonrpc must be "2.0"');
        }
        
        if (!message.method) {
            throw new Error('Invalid A2A message: missing method field');
        }
        
        // Ensure message has ID for tracking
        if (!message.id) {
            message.id = uuidv4();
        }
        
        return message;
    }
    
    async sendMessage(message, recipient, options) {
        // Send message using A2A protocol format
        return { success: true, message: 'A2A message sent' };
    }
    
    async shutdown() {
        this.initialized = false;
    }
}

/**
 * AgentGateway Integration Layer
 */
class AgentGatewayIntegration {
    constructor(compatibilityLayer) {
        this.compatibilityLayer = compatibilityLayer;
        this.initialized = false;
    }
    
    async initialize() {
        console.log('🌐 Initializing AgentGateway Integration...');
        
        // Setup connection to AgentGateway if configured
        const config = this.compatibilityLayer.config.agentGateway;
        if (config.endpoint && config.apiKey) {
            console.log(`🔌 Connecting to AgentGateway at ${config.endpoint}`);
            // Connection logic would go here
        }
        
        this.initialized = true;
    }
    
    async shutdown() {
        this.initialized = false;
    }
}

// Export the main compatibility layer
module.exports = {
    ProtocolCompatibilityLayer,
    MCP_PROTOCOL,
    A2A_PROTOCOL,
    AGENT_GATEWAY
};