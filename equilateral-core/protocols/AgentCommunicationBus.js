/**
 * Agent Communication Bus - Central message routing and event-driven messaging
 * 
 * Provides event-driven messaging between agents with pub/sub patterns,
 * message queuing with priority handling, cross-agent context sharing,
 * and real-time agent status broadcasting.
 */

const EventEmitter = require('events');
const AgentConfiguration = require('../config/AgentConfiguration');

// Message priorities
const MESSAGE_PRIORITY = {
    CRITICAL: 5,
    HIGH: 4,
    NORMAL: 3,
    LOW: 2,
    BACKGROUND: 1
};

// Message types
const MESSAGE_TYPES = {
    AGENT_REQUEST: 'agent_request',
    AGENT_RESPONSE: 'agent_response',
    STATUS_UPDATE: 'status_update',
    HEALTH_CHECK: 'health_check',
    WORKFLOW_EVENT: 'workflow_event',
    CONTEXT_UPDATE: 'context_update',
    ERROR_NOTIFICATION: 'error_notification',
    BROADCAST: 'broadcast'
};

// Delivery guarantees
const DELIVERY_MODES = {
    FIRE_AND_FORGET: 'fire_and_forget',
    AT_LEAST_ONCE: 'at_least_once',
    EXACTLY_ONCE: 'exactly_once'
};

class AgentCommunicationBus extends EventEmitter {
    constructor(configOverrides = {}) {
        super();
        this.setMaxListeners(100); // Support many agents
        
        this.config = new AgentConfiguration(configOverrides);
        
        // Message queues by priority
        this.messageQueues = new Map();
        Object.values(MESSAGE_PRIORITY).forEach(priority => {
            this.messageQueues.set(priority, []);
        });
        
        // Agent registry and status
        this.agents = new Map();
        this.agentStatus = new Map();
        
        // Message tracking and audit
        this.messageHistory = [];
        this.messageDeliveryTracking = new Map();
        this.undeliveredMessages = new Map();
        
        // Routing rules and capabilities
        this.routingRules = new Map();
        this.capabilityRouting = new Map();
        
        // Processing state
        this.processingQueue = false;
        this.messageProcessorInterval = null;
        
        this.initializeMessageProcessor();
        this.setupHealthMonitoring();
    }

    /**
     * Initialize the message processing system
     */
    initializeMessageProcessor() {
        // Process messages every 100ms
        this.messageProcessorInterval = setInterval(() => {
            this.processMessageQueue();
        }, 100);
        
        // Setup graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    /**
     * Register an agent with the communication bus
     */
    registerAgent(agentId, agentInfo = {}) {
        const registration = {
            agentId,
            capabilities: agentInfo.capabilities || [],
            subscriptions: agentInfo.subscriptions || [],
            registeredAt: new Date().toISOString(),
            lastHeartbeat: new Date().toISOString(),
            status: 'active',
            messageCount: 0,
            errorCount: 0,
            ...agentInfo
        };

        this.agents.set(agentId, registration);
        this.agentStatus.set(agentId, 'active');
        
        // Setup capability routing
        registration.capabilities.forEach(capability => {
            if (!this.capabilityRouting.has(capability)) {
                this.capabilityRouting.set(capability, new Set());
            }
            this.capabilityRouting.get(capability).add(agentId);
        });

        this.logActivity('agent_registered', { agentId, capabilities: registration.capabilities });
        
        // Broadcast agent registration
        this.broadcast({
            type: MESSAGE_TYPES.STATUS_UPDATE,
            event: 'agent_registered',
            agentId,
            capabilities: registration.capabilities
        }, MESSAGE_PRIORITY.NORMAL);

        return registration;
    }

    /**
     * Unregister an agent
     */
    unregisterAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return false;
        }

        // Remove from capability routing
        agent.capabilities.forEach(capability => {
            const capabilityAgents = this.capabilityRouting.get(capability);
            if (capabilityAgents) {
                capabilityAgents.delete(agentId);
                if (capabilityAgents.size === 0) {
                    this.capabilityRouting.delete(capability);
                }
            }
        });

        this.agents.delete(agentId);
        this.agentStatus.delete(agentId);
        
        this.logActivity('agent_unregistered', { agentId });
        
        // Broadcast agent unregistration
        this.broadcast({
            type: MESSAGE_TYPES.STATUS_UPDATE,
            event: 'agent_unregistered',
            agentId
        }, MESSAGE_PRIORITY.NORMAL);

        return true;
    }

    /**
     * Send a message to specific agent(s)
     */
    sendMessage(message, options = {}) {
        const messageId = this.generateMessageId();
        const timestamp = new Date().toISOString();
        
        const fullMessage = {
            id: messageId,
            timestamp,
            type: message.type || MESSAGE_TYPES.AGENT_REQUEST,
            from: message.from,
            to: message.to,
            payload: message.payload,
            priority: options.priority || MESSAGE_PRIORITY.NORMAL,
            deliveryMode: options.deliveryMode || DELIVERY_MODES.FIRE_AND_FORGET,
            ttl: options.ttl || 300000, // 5 minutes default TTL
            retryCount: 0,
            maxRetries: options.maxRetries || 3,
            routingRules: options.routingRules || [],
            ...message
        };

        // Add to appropriate priority queue
        this.messageQueues.get(fullMessage.priority).push(fullMessage);
        
        // Track delivery if required
        if (fullMessage.deliveryMode !== DELIVERY_MODES.FIRE_AND_FORGET) {
            this.messageDeliveryTracking.set(messageId, {
                message: fullMessage,
                attempts: 0,
                lastAttempt: null,
                delivered: false
            });
        }

        this.logActivity('message_queued', { 
            messageId, 
            type: fullMessage.type, 
            from: fullMessage.from, 
            to: fullMessage.to,
            priority: fullMessage.priority
        });

        return messageId;
    }

    /**
     * Send message to agents with specific capability
     */
    sendToCapability(capability, message, options = {}) {
        const capableAgents = this.capabilityRouting.get(capability);
        if (!capableAgents || capableAgents.size === 0) {
            this.logActivity('no_capable_agents', { capability, messageType: message.type });
            return [];
        }

        const messageIds = [];
        const agentsList = Array.from(capableAgents);
        
        // Apply load balancing if specified
        const targetAgents = this.applyLoadBalancing(agentsList, options.loadBalancing);
        
        targetAgents.forEach(agentId => {
            if (this.agentStatus.get(agentId) === 'active') {
                const messageId = this.sendMessage({
                    ...message,
                    to: agentId
                }, options);
                messageIds.push(messageId);
            }
        });

        return messageIds;
    }

    /**
     * Broadcast message to all agents or filtered subset
     */
    broadcast(message, priority = MESSAGE_PRIORITY.NORMAL, filter = null) {
        const messageId = this.generateMessageId();
        const timestamp = new Date().toISOString();
        
        const broadcastMessage = {
            id: messageId,
            timestamp,
            type: MESSAGE_TYPES.BROADCAST,
            from: message.from || 'system',
            payload: message.payload || message,
            priority,
            broadcast: true,
            filter,
            ...message
        };

        // Add to high priority queue for broadcasts
        this.messageQueues.get(Math.max(priority, MESSAGE_PRIORITY.HIGH)).push(broadcastMessage);
        
        this.logActivity('broadcast_queued', { 
            messageId, 
            type: broadcastMessage.type, 
            priority,
            agentCount: this.agents.size
        });

        return messageId;
    }

    /**
     * Process message queues in priority order
     */
    processMessageQueue() {
        if (this.processingQueue) return;
        
        this.processingQueue = true;
        
        try {
            // Process queues from highest to lowest priority
            const priorities = Object.values(MESSAGE_PRIORITY).sort((a, b) => b - a);
            
            for (const priority of priorities) {
                const queue = this.messageQueues.get(priority);
                if (queue.length > 0) {
                    // Process up to 10 messages per cycle per priority
                    const messagesToProcess = queue.splice(0, 10);
                    messagesToProcess.forEach(message => this.deliverMessage(message));
                }
            }
            
            // Cleanup expired messages
            this.cleanupExpiredMessages();
        } finally {
            this.processingQueue = false;
        }
    }

    /**
     * Deliver a message to its intended recipients
     */
    deliverMessage(message) {
        try {
            const now = Date.now();
            const messageTime = new Date(message.timestamp).getTime();
            
            // Check TTL
            if (message.ttl && (now - messageTime) > message.ttl) {
                this.logActivity('message_expired', { messageId: message.id });
                return;
            }

            if (message.broadcast) {
                this.deliverBroadcastMessage(message);
            } else {
                this.deliverDirectMessage(message);
            }

        } catch (error) {
            this.logActivity('delivery_error', { 
                messageId: message.id, 
                error: error.message 
            });
            
            this.handleDeliveryFailure(message, error);
        }
    }

    /**
     * Deliver broadcast message to all eligible agents
     */
    deliverBroadcastMessage(message) {
        const eligibleAgents = this.getEligibleAgents(message.filter);
        let deliveredCount = 0;
        
        eligibleAgents.forEach(agentId => {
            try {
                this.emit(`agent:${agentId}`, message);
                deliveredCount++;
            } catch (error) {
                this.logActivity('broadcast_delivery_error', { 
                    messageId: message.id, 
                    agentId, 
                    error: error.message 
                });
            }
        });

        this.logActivity('broadcast_delivered', { 
            messageId: message.id, 
            deliveredCount,
            totalAgents: eligibleAgents.length
        });
    }

    /**
     * Deliver direct message to specific agent
     */
    deliverDirectMessage(message) {
        const targetAgent = message.to;
        
        if (!this.agents.has(targetAgent)) {
            this.logActivity('agent_not_found', { 
                messageId: message.id, 
                targetAgent 
            });
            return;
        }

        if (this.agentStatus.get(targetAgent) !== 'active') {
            this.logActivity('agent_inactive', { 
                messageId: message.id, 
                targetAgent,
                status: this.agentStatus.get(targetAgent)
            });
            
            if (message.deliveryMode !== DELIVERY_MODES.FIRE_AND_FORGET) {
                this.handleDeliveryFailure(message, new Error('Agent inactive'));
            }
            return;
        }

        try {
            this.emit(`agent:${targetAgent}`, message);
            
            // Update delivery tracking
            if (this.messageDeliveryTracking.has(message.id)) {
                const tracking = this.messageDeliveryTracking.get(message.id);
                tracking.delivered = true;
                tracking.deliveredAt = new Date().toISOString();
            }

            // Update agent statistics
            const agent = this.agents.get(targetAgent);
            agent.messageCount++;
            agent.lastMessageAt = new Date().toISOString();

            this.logActivity('message_delivered', { 
                messageId: message.id, 
                targetAgent,
                type: message.type
            });
            
        } catch (error) {
            this.handleDeliveryFailure(message, error);
        }
    }

    /**
     * Handle message delivery failures with retry logic
     */
    handleDeliveryFailure(message, error) {
        if (message.deliveryMode === DELIVERY_MODES.FIRE_AND_FORGET) {
            return; // Don't retry fire-and-forget messages
        }

        const tracking = this.messageDeliveryTracking.get(message.id);
        if (!tracking) {
            return;
        }

        tracking.attempts++;
        tracking.lastAttempt = new Date().toISOString();
        tracking.lastError = error.message;

        if (tracking.attempts < message.maxRetries) {
            // Exponential backoff: retry after 2^attempts seconds
            const retryDelay = Math.pow(2, tracking.attempts) * 1000;
            
            setTimeout(() => {
                message.retryCount = tracking.attempts;
                this.messageQueues.get(message.priority).push(message);
            }, retryDelay);
            
            this.logActivity('message_retry_scheduled', { 
                messageId: message.id, 
                attempt: tracking.attempts,
                retryDelay
            });
        } else {
            // Max retries exceeded
            this.undeliveredMessages.set(message.id, {
                message,
                tracking,
                failedAt: new Date().toISOString()
            });
            
            this.messageDeliveryTracking.delete(message.id);
            
            this.logActivity('message_failed', { 
                messageId: message.id,
                attempts: tracking.attempts,
                error: error.message
            });
            
            // Emit failure event for monitoring
            this.emit('message:failed', { message, error });
        }
    }

    /**
     * Get agents eligible for broadcast based on filter
     */
    getEligibleAgents(filter) {
        let eligible = Array.from(this.agents.keys());
        
        if (filter) {
            eligible = eligible.filter(agentId => {
                const agent = this.agents.get(agentId);
                const status = this.agentStatus.get(agentId);
                
                if (filter.status && status !== filter.status) return false;
                if (filter.capabilities) {
                    const hasCapability = filter.capabilities.some(cap => 
                        agent.capabilities.includes(cap)
                    );
                    if (!hasCapability) return false;
                }
                if (filter.agentTypes) {
                    if (!filter.agentTypes.includes(agent.type)) return false;
                }
                
                return true;
            });
        }
        
        // Only include active agents
        return eligible.filter(agentId => this.agentStatus.get(agentId) === 'active');
    }

    /**
     * Apply load balancing to agent selection
     */
    applyLoadBalancing(agents, strategy = 'round_robin') {
        switch (strategy) {
            case 'random':
                return [agents[Math.floor(Math.random() * agents.length)]];
                
            case 'all':
                return agents;
                
            case 'least_loaded':
                return agents
                    .map(agentId => ({
                        agentId,
                        messageCount: this.agents.get(agentId).messageCount || 0
                    }))
                    .sort((a, b) => a.messageCount - b.messageCount)
                    .slice(0, 1)
                    .map(item => item.agentId);
                    
            case 'round_robin':
            default:
                // Simple round-robin based on current time
                const index = Date.now() % agents.length;
                return [agents[index]];
        }
    }

    /**
     * Update agent heartbeat and status
     */
    updateAgentHeartbeat(agentId, status = 'active', metadata = {}) {
        if (!this.agents.has(agentId)) {
            return false;
        }

        const agent = this.agents.get(agentId);
        agent.lastHeartbeat = new Date().toISOString();
        agent.metadata = { ...agent.metadata, ...metadata };
        
        this.agentStatus.set(agentId, status);
        
        // Broadcast status update if status changed
        if (agent.status !== status) {
            agent.status = status;
            this.broadcast({
                type: MESSAGE_TYPES.STATUS_UPDATE,
                event: 'agent_status_changed',
                agentId,
                status,
                metadata
            }, MESSAGE_PRIORITY.HIGH);
        }

        return true;
    }

    /**
     * Setup health monitoring for agents
     */
    setupHealthMonitoring() {
        // Check agent health every 30 seconds
        setInterval(() => {
            const now = Date.now();
            const staleThreshold = 60000; // 1 minute
            
            this.agents.forEach((agent, agentId) => {
                const lastHeartbeat = new Date(agent.lastHeartbeat).getTime();
                
                if (now - lastHeartbeat > staleThreshold) {
                    const currentStatus = this.agentStatus.get(agentId);
                    
                    if (currentStatus === 'active') {
                        this.agentStatus.set(agentId, 'stale');
                        agent.errorCount++;
                        
                        this.logActivity('agent_stale', { agentId, lastHeartbeat: agent.lastHeartbeat });
                        
                        this.broadcast({
                            type: MESSAGE_TYPES.STATUS_UPDATE,
                            event: 'agent_stale',
                            agentId
                        }, MESSAGE_PRIORITY.HIGH);
                    }
                    
                    // Mark as inactive after 2 minutes
                    if (now - lastHeartbeat > staleThreshold * 2) {
                        if (currentStatus !== 'inactive') {
                            this.agentStatus.set(agentId, 'inactive');
                            
                            this.logActivity('agent_inactive', { agentId });
                            
                            this.broadcast({
                                type: MESSAGE_TYPES.STATUS_UPDATE,
                                event: 'agent_inactive',
                                agentId
                            }, MESSAGE_PRIORITY.HIGH);
                        }
                    }
                }
            });
        }, 30000);
    }

    /**
     * Cleanup expired messages and tracking data
     */
    cleanupExpiredMessages() {
        const now = Date.now();
        const maxAge = 3600000; // 1 hour
        
        // Cleanup message history
        this.messageHistory = this.messageHistory.filter(entry => 
            now - new Date(entry.timestamp).getTime() < maxAge
        );
        
        // Cleanup delivery tracking
        for (const [messageId, tracking] of this.messageDeliveryTracking.entries()) {
            const messageTime = new Date(tracking.message.timestamp).getTime();
            if (now - messageTime > maxAge) {
                this.messageDeliveryTracking.delete(messageId);
            }
        }
        
        // Cleanup undelivered messages
        for (const [messageId, data] of this.undeliveredMessages.entries()) {
            const failTime = new Date(data.failedAt).getTime();
            if (now - failTime > maxAge) {
                this.undeliveredMessages.delete(messageId);
            }
        }
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `msg_${timestamp}_${random}`;
    }

    /**
     * Log communication activity
     */
    logActivity(event, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            data
        };
        
        this.messageHistory.push(logEntry);
        
        if (this.config.get('behavior').verboseLogging) {
            console.log(`🔄 AgentCommunicationBus: ${event}`, data);
        }
        
        // Emit for external monitoring
        this.emit('activity', logEntry);
    }

    /**
     * Get communication statistics
     */
    getStatistics() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        
        const recentMessages = this.messageHistory.filter(entry => 
            new Date(entry.timestamp).getTime() > oneHourAgo
        );
        
        return {
            agents: {
                total: this.agents.size,
                active: Array.from(this.agentStatus.values()).filter(status => status === 'active').length,
                stale: Array.from(this.agentStatus.values()).filter(status => status === 'stale').length,
                inactive: Array.from(this.agentStatus.values()).filter(status => status === 'inactive').length
            },
            messages: {
                queuedTotal: Array.from(this.messageQueues.values()).reduce((total, queue) => total + queue.length, 0),
                queuesByPriority: Object.fromEntries(
                    Array.from(this.messageQueues.entries()).map(([priority, queue]) => [priority, queue.length])
                ),
                recentActivity: recentMessages.length,
                pendingDelivery: this.messageDeliveryTracking.size,
                failed: this.undeliveredMessages.size
            },
            capabilities: Array.from(this.capabilityRouting.keys()),
            uptime: now - (this.startTime || now)
        };
    }

    /**
     * Subscribe agent to specific message types or events
     */
    subscribeAgent(agentId, subscription) {
        if (!this.agents.has(agentId)) {
            return false;
        }

        const agent = this.agents.get(agentId);
        if (!agent.subscriptions) {
            agent.subscriptions = [];
        }
        
        if (!agent.subscriptions.includes(subscription)) {
            agent.subscriptions.push(subscription);
        }
        
        return true;
    }

    /**
     * Graceful shutdown
     */
    shutdown() {
        console.log('🔄 AgentCommunicationBus: Shutting down...');
        
        if (this.messageProcessorInterval) {
            clearInterval(this.messageProcessorInterval);
        }
        
        // Process remaining messages
        this.processMessageQueue();
        
        // Notify agents of shutdown
        this.broadcast({
            type: MESSAGE_TYPES.STATUS_UPDATE,
            event: 'bus_shutdown'
        }, MESSAGE_PRIORITY.CRITICAL);
        
        this.removeAllListeners();
        console.log('🔄 AgentCommunicationBus: Shutdown complete');
    }
}

// Export constants for use by agents
AgentCommunicationBus.MESSAGE_PRIORITY = MESSAGE_PRIORITY;
AgentCommunicationBus.MESSAGE_TYPES = MESSAGE_TYPES;
AgentCommunicationBus.DELIVERY_MODES = DELIVERY_MODES;

module.exports = AgentCommunicationBus;