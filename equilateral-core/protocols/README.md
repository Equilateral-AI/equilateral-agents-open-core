# Communication Protocols

**EquilateralAgents supports multiple communication protocols for maximum interoperability.**

---

## Supported Protocols

### 1. **Agent Communication Bus** (Internal - Default)
Event-driven pub/sub messaging for agent-to-agent communication.

**Features:**
- Priority-based message queuing
- Delivery guarantees (fire-and-forget, at-least-once, exactly-once)
- Agent registry and health monitoring
- Message history and audit trails
- Capability-based routing

**Use When:** Internal agent coordination within same process

---

### 2. **MCP (Model Context Protocol)**
Anthropic's standardized protocol for AI model integration.

**Features:**
- Compatible with Claude Desktop and other MCP clients
- Server-side tool exposure
- Resource management
- Prompt templates
- Sampling support

**Use When:** Integrating with Claude Desktop, MCP-compatible AI tools

---

### 3. **A2A (Agent-to-Agent Protocol)**
Standardized protocol for inter-agent communication across processes/networks.

**Features:**
- RESTful HTTP-based communication
- Agent discovery and capability advertisement
- Task delegation and result aggregation
- Workflow coordination
- Cross-platform compatibility

**Use When:** Multi-process agent systems, distributed deployments

---

### 4. **AP2 (Agent Protocol v2)**
Enhanced protocol with advanced orchestration features.

**Features:**
- Bidirectional streaming
- Transaction support
- State synchronization
- Event sourcing
- CQRS patterns

**Use When:** Complex multi-agent workflows, enterprise deployments

---

### 5. **WebSockets**
Real-time bidirectional communication for live updates.

**Features:**
- Real-time progress updates
- Live agent status monitoring
- Streaming workflow results
- Dashboard integration
- Low-latency messaging

**Use When:** Real-time UIs, monitoring dashboards, live progress tracking

---

## Quick Start

### Using Agent Communication Bus (Default)

```javascript
const AgentCommunicationBus = require('./protocols/AgentCommunicationBus');

// Create bus
const bus = new AgentCommunicationBus();

// Register agents
bus.registerAgent('agent-1', {
    capabilities: ['code-analysis', 'security-scan'],
    subscriptions: ['workflow-events', 'code-changes']
});

// Send message
bus.sendMessage({
    from: 'agent-1',
    to: 'agent-2',
    type: 'agent_request',
    priority: bus.MESSAGE_PRIORITY.HIGH,
    payload: {
        action: 'analyze-code',
        data: { file: 'app.js' }
    }
});

// Subscribe to messages
bus.subscribe('agent-2', 'code-analysis', (message) => {
    console.log('Received:', message);
});

// Broadcast to all agents
bus.broadcast({
    type: 'status_update',
    payload: { status: 'ready' }
});
```

---

### Using MCP Protocol

```javascript
const { MCPServer } = require('./protocols/MCPProtocol');

// Create MCP server
const mcpServer = new MCPServer({
    name: 'equilateral-agents',
    version: '2.0.0'
});

// Expose tools to MCP clients
mcpServer.addTool({
    name: 'run-security-scan',
    description: 'Run comprehensive security scan',
    inputSchema: {
        type: 'object',
        properties: {
            projectPath: { type: 'string' }
        },
        required: ['projectPath']
    },
    handler: async (params) => {
        const orchestrator = new AgentOrchestrator();
        const result = await orchestrator.executeWorkflow('security-review', params);
        return result;
    }
});

// Start MCP server
await mcpServer.start();
```

---

### Using WebSockets for Real-Time Updates

```javascript
const { WebSocketServer } = require('./protocols/WebSocketProtocol');

// Create WebSocket server
const wsServer = new WebSocketServer({ port: 8080 });

// Broadcast workflow progress
orchestrator.on('taskCompleted', (task) => {
    wsServer.broadcast({
        type: 'workflow-progress',
        workflowId: task.workflowId,
        progress: task.progress,
        status: task.status
    });
});

// Handle client connections
wsServer.on('connection', (client) => {
    console.log('Client connected');

    client.on('message', async (message) => {
        const { action, data } = JSON.parse(message);

        if (action === 'start-workflow') {
            const handle = await orchestrator.executeWorkflowBackground(
                data.workflowType,
                data.context
            );

            client.send(JSON.stringify({
                type: 'workflow-started',
                workflowId: handle.workflowId
            }));
        }
    });
});
```

---

### Using A2A for Distributed Agents

```javascript
const { A2AProtocol } = require('./protocols/A2AProtocol');

// Create A2A server
const a2aServer = new A2AProtocol({
    agentId: 'agent-1',
    port: 3000,
    capabilities: ['code-analysis', 'security-scan']
});

// Handle incoming requests from other agents
a2aServer.onRequest('analyze-code', async (request) => {
    const result = await performAnalysis(request.data);
    return {
        status: 'success',
        result
    };
});

// Send request to another agent
const response = await a2aServer.sendRequest({
    toAgent: 'agent-2',
    action: 'run-tests',
    data: { projectPath: './my-project' }
});
```

---

## Protocol Compatibility Layer

Use the Protocol Compatibility Layer to support multiple protocols simultaneously:

```javascript
const { ProtocolCompatibilityLayer } = require('./protocols/ProtocolCompatibilityLayer');

// Create compatibility layer
const protocols = new ProtocolCompatibilityLayer({
    enableMCP: true,
    enableA2A: true,
    enableWebSockets: true,
    enableInternalBus: true
});

await protocols.initialize();

// Send message via any protocol
await protocols.send({
    protocol: 'mcp', // or 'a2a', 'websocket', 'internal'
    to: 'agent-id',
    message: {
        action: 'analyze',
        data: { /* ... */ }
    }
});

// Receive on all protocols
protocols.on('message', (message, metadata) => {
    console.log(`Received via ${metadata.protocol}:`, message);
});
```

---

## Protocol Comparison

| Feature | Internal Bus | MCP | A2A | AP2 | WebSockets |
|---------|-------------|-----|-----|-----|------------|
| **Latency** | Very Low | Low | Medium | Low | Very Low |
| **Scalability** | Single Process | Multi-Process | Distributed | Distributed | Multi-Client |
| **Reliability** | High | High | Medium | High | Medium |
| **Complexity** | Low | Medium | Medium | High | Low |
| **Use Case** | Internal | AI Integration | Distributed | Enterprise | Real-Time UI |

---

## Message Types

### Standard Message Format

All protocols support a common message envelope:

```javascript
{
    id: 'msg-123456',              // Unique message ID
    from: 'agent-1',                // Sender agent ID
    to: 'agent-2',                  // Recipient agent ID (or '*' for broadcast)
    type: 'agent_request',          // Message type
    priority: 3,                    // Priority (1-5)
    timestamp: '2025-10-02T12:00:00Z',
    payload: {                      // Message-specific data
        action: 'analyze-code',
        data: { /* ... */ }
    },
    metadata: {                     // Optional metadata
        correlationId: 'workflow-789',
        replyTo: 'agent-1',
        ttl: 30000                  // Time-to-live in ms
    }
}
```

---

## Enterprise Features

Advanced protocol features available in enterprise tiers:

### Transaction Support (AP2)
```javascript
// Begin distributed transaction
const tx = await protocols.beginTransaction();

try {
    await agent1.execute(tx, task1);
    await agent2.execute(tx, task2);
    await agent3.execute(tx, task3);

    await protocols.commit(tx);
} catch (error) {
    await protocols.rollback(tx);
}
```

### Event Sourcing (AP2)
```javascript
// All agent actions recorded as events
protocols.enableEventSourcing({
    store: 'postgresql',
    retention: '90days'
});

// Replay events to reconstruct state
const state = await protocols.replayEvents({
    fromTimestamp: '2025-01-01',
    toTimestamp: '2025-10-01'
});
```

### CQRS Patterns (AP2)
```javascript
// Separate read and write models
protocols.configureReadModel({
    projection: 'workflow-status',
    updateOn: ['workflow-started', 'workflow-completed']
});

// Query optimized read model
const status = await protocols.query('workflow-status', {
    workflowId: '123'
});
```

**Interested in enterprise protocol features?** Contact info@happyhippo.ai

---

## Configuration

### Environment Variables

```bash
# Protocol Configuration
PROTOCOL_MODE=hybrid                    # internal|mcp|a2a|ap2|websocket|hybrid
MCP_SERVER_PORT=3001
A2A_SERVER_PORT=3002
WEBSOCKET_PORT=8080

# Security
PROTOCOL_AUTH_ENABLED=true
PROTOCOL_TLS_ENABLED=true
PROTOCOL_API_KEY=your-api-key

# Performance
MESSAGE_QUEUE_SIZE=1000
MESSAGE_TTL=30000
MAX_RETRY_ATTEMPTS=3
```

### Code Configuration

```javascript
const protocols = new ProtocolCompatibilityLayer({
    // Enable/disable protocols
    enableMCP: true,
    enableA2A: false,
    enableWebSockets: true,

    // Protocol-specific config
    mcp: {
        port: 3001,
        name: 'equilateral-agents',
        version: '2.0.0'
    },

    websocket: {
        port: 8080,
        path: '/ws',
        heartbeatInterval: 30000
    },

    // Security
    security: {
        requireAuth: true,
        apiKey: process.env.PROTOCOL_API_KEY
    },

    // Performance
    messageQueue: {
        maxSize: 1000,
        maxRetries: 3,
        retryDelay: 1000
    }
});
```

---

## Best Practices

### 1. Choose the Right Protocol

- **Development:** Use Internal Bus (simplest)
- **AI Integration:** Use MCP
- **Distributed Systems:** Use A2A
- **Real-Time UIs:** Add WebSockets
- **Enterprise:** Use AP2 with all features

### 2. Handle Failures Gracefully

```javascript
// Set message TTL
bus.sendMessage({
    // ...
    metadata: {
        ttl: 30000,  // 30 seconds
        retryPolicy: 'exponential-backoff',
        maxRetries: 3
    }
});

// Handle delivery failures
bus.on('message-failed', (message, error) => {
    console.error('Message delivery failed:', message.id, error);
    // Implement fallback logic
});
```

### 3. Monitor Performance

```javascript
// Track message metrics
protocols.on('metrics', (metrics) => {
    console.log({
        messagesProcessed: metrics.processed,
        averageLatency: metrics.avgLatency,
        failureRate: metrics.failures / metrics.processed
    });
});
```

### 4. Secure Communication

```javascript
// Enable authentication
protocols.enableAuth({
    type: 'api-key',  // or 'jwt', 'oauth'
    validate: async (credentials) => {
        return await validateCredentials(credentials);
    }
});

// Enable encryption
protocols.enableTLS({
    cert: './certs/server.crt',
    key: './certs/server.key'
});
```

---

## Troubleshooting

### Message Not Delivered

**Check:**
1. Agent registered? `bus.agents.has('agent-id')`
2. Agent subscribed? Check agent subscriptions
3. Message priority too low? Increase priority
4. TTL expired? Increase TTL

### High Latency

**Solutions:**
1. Increase message processor interval
2. Use priority queues for urgent messages
3. Implement message batching
4. Consider distributed protocols (A2A, AP2)

### Connection Drops (WebSocket)

**Solutions:**
1. Implement reconnection logic
2. Use heartbeat/ping-pong
3. Buffer messages during disconnect
4. Enable message persistence

---

## Examples

See the `examples/` directory for complete examples:
- `examples/protocol-integration-demo.js` - All protocols
- `examples/mcp-server-demo.js` - MCP server
- `examples/websocket-dashboard.js` - Real-time dashboard
- `examples/distributed-agents-demo.js` - A2A distributed system

---

**Built with ❤️ by HappyHippo.ai**
**Questions?** Contact info@happyhippo.ai
