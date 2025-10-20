/**
 * Minimal MCP Server
 *
 * Provides minimum viable MCP (Model Context Protocol) implementation for:
 * - Claude Code plugins
 * - VS Code extensions
 * - Remote MCP clients
 *
 * Implements MCP specification 2024-11-05:
 * - JSON-RPC 2.0 message format
 * - Stateful connections (STDIO + HTTP)
 * - Server capability negotiation
 * - Tools (executable functions)
 *
 * License: MIT
 * @version 1.0.0
 */

const EventEmitter = require('events');
const http = require('http');
const readline = require('readline');

class MinimalMCPServer extends EventEmitter {
    constructor(config = {}) {
        super();

        this.config = {
            name: config.name || 'equilateral-mcp-server',
            version: config.version || '1.0.0',
            description: config.description || 'Minimal MCP Server for Equilateral Agents',
            transports: config.transports || ['stdio', 'http'],
            port: config.port || 3000,
            ...config
        };

        // Registered tools
        this.tools = new Map();

        // Active connections
        this.connections = new Set();

        // Server instances
        this.servers = {};

        // Statistics
        this.stats = {
            requests: 0,
            responses: 0,
            errors: 0,
            toolCalls: 0
        };

        // Server capabilities
        this.capabilities = {
            tools: {},
            prompts: {},
            resources: {}
        };
    }

    /**
     * Initialize MCP server
     */
    async initialize() {
        console.log('🚀 Initializing Minimal MCP Server...');
        console.log(`   Name: ${this.config.name}`);
        console.log(`   Version: ${this.config.version}`);
        console.log(`   Transports: ${this.config.transports.join(', ')}\n`);

        // Start requested transports
        for (const transport of this.config.transports) {
            await this.startTransport(transport);
        }

        this.emit('ready');
        console.log('✅ Minimal MCP Server ready\n');
    }

    /**
     * Start a specific transport
     */
    async startTransport(type) {
        switch(type) {
            case 'stdio':
                await this.startSTDIO();
                break;
            case 'http':
                await this.startHTTP();
                break;
            default:
                console.warn(`Unknown transport type: ${type}`);
        }
    }

    /**
     * STDIO Transport (for Claude Code CLI)
     */
    async startSTDIO() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        rl.on('line', async (line) => {
            try {
                const request = JSON.parse(line);
                const response = await this.handleRequest(request);
                console.log(JSON.stringify(response));
            } catch (error) {
                console.error(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32700,
                        message: 'Parse error',
                        data: error.message
                    }
                }));
            }
        });

        this.servers.stdio = rl;
        console.log('  📝 STDIO transport started');
    }

    /**
     * HTTP Transport (for remote clients)
     */
    async startHTTP() {
        const server = http.createServer(async (req, res) => {
            // CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // Health check
            if (req.url === '/health' && req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'healthy',
                    server: this.config.name,
                    version: this.config.version,
                    uptime: process.uptime()
                }));
                return;
            }

            // MCP endpoint
            if (req.url === '/mcp' || req.url === '/' ) {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    try {
                        const request = JSON.parse(body || '{}');
                        const response = await this.handleRequest(request);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: -32700,
                                message: 'Parse error',
                                data: error.message
                            }
                        }));
                    }
                });
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        });

        server.listen(this.config.port);
        this.servers.http = server;
        console.log(`  🌐 HTTP transport started on port ${this.config.port}`);
    }

    /**
     * Handle incoming MCP request (JSON-RPC 2.0)
     */
    async handleRequest(request) {
        this.stats.requests++;

        try {
            const { method, params = {}, id } = request;

            // Validate JSON-RPC 2.0 format
            if (!request.jsonrpc || request.jsonrpc !== '2.0') {
                throw {
                    code: -32600,
                    message: 'Invalid Request',
                    data: 'Must be JSON-RPC 2.0'
                };
            }

            let result;

            switch(method) {
                case 'initialize':
                    result = this.handleInitialize(params);
                    break;

                case 'tools/list':
                    result = this.handleListTools();
                    break;

                case 'tools/call':
                    result = await this.handleCallTool(params);
                    break;

                case 'ping':
                    result = { status: 'pong' };
                    break;

                default:
                    throw {
                        code: -32601,
                        message: 'Method not found',
                        data: `Unknown method: ${method}`
                    };
            }

            this.stats.responses++;

            return {
                jsonrpc: '2.0',
                id,
                result
            };

        } catch (error) {
            this.stats.errors++;

            return {
                jsonrpc: '2.0',
                id: request.id,
                error: typeof error === 'object' && error.code ? error : {
                    code: -32603,
                    message: 'Internal error',
                    data: error.message || String(error)
                }
            };
        }
    }

    /**
     * Handle initialize request (capability negotiation)
     */
    handleInitialize(params) {
        return {
            protocolVersion: '2024-11-05',
            serverInfo: {
                name: this.config.name,
                version: this.config.version,
                description: this.config.description
            },
            capabilities: {
                tools: this.tools.size > 0 ? {} : undefined,
                prompts: undefined,
                resources: undefined
            }
        };
    }

    /**
     * Handle tools/list request
     */
    handleListTools() {
        const tools = [];

        for (const [name, tool] of this.tools) {
            tools.push({
                name,
                description: tool.description,
                inputSchema: tool.inputSchema || {
                    type: 'object',
                    properties: {},
                    required: []
                }
            });
        }

        return { tools };
    }

    /**
     * Handle tools/call request
     */
    async handleCallTool(params) {
        const { name, arguments: args } = params;

        this.stats.toolCalls++;

        const tool = this.tools.get(name);
        if (!tool) {
            throw {
                code: -32602,
                message: 'Invalid params',
                data: `Tool not found: ${name}`
            };
        }

        try {
            const result = await tool.handler(args || {});

            return {
                content: [
                    {
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                    }
                ]
            };

        } catch (error) {
            throw {
                code: -32603,
                message: 'Tool execution failed',
                data: error.message || String(error)
            };
        }
    }

    /**
     * Register a tool
     *
     * @param {string} name - Tool name
     * @param {Object} config - Tool configuration
     * @param {string} config.description - Tool description
     * @param {Object} config.inputSchema - JSON Schema for input validation
     * @param {Function} config.handler - Tool execution function
     */
    registerTool(name, config) {
        if (!name || !config.handler) {
            throw new Error('Tool must have name and handler function');
        }

        this.tools.set(name, {
            description: config.description || `Execute ${name}`,
            inputSchema: config.inputSchema || {
                type: 'object',
                properties: {},
                required: []
            },
            handler: config.handler
        });

        console.log(`✓ Registered tool: ${name}`);
        this.emit('tool:registered', { name });
    }

    /**
     * Register multiple tools at once
     *
     * @param {Array<Object>} tools - Array of tool definitions
     */
    registerTools(tools) {
        for (const tool of tools) {
            if (tool.name) {
                this.registerTool(tool.name, tool);
            }
        }
    }

    /**
     * Get server statistics
     */
    getStats() {
        return {
            ...this.stats,
            tools: this.tools.size,
            connections: this.connections.size,
            uptime: process.uptime()
        };
    }

    /**
     * Shutdown server
     */
    async shutdown() {
        console.log('\n🛑 Shutting down Minimal MCP Server...');

        // Close connections
        for (const connection of this.connections) {
            if (connection.close) {
                connection.close();
            }
        }

        // Stop servers
        if (this.servers.http) {
            this.servers.http.close();
        }
        if (this.servers.stdio) {
            this.servers.stdio.close();
        }

        this.removeAllListeners();
        console.log('✅ Shutdown complete');
    }
}

// CLI usage example
if (require.main === module) {
    const server = new MinimalMCPServer({
        name: 'equilateral-mcp-demo',
        transports: ['stdio', 'http'],
        port: 3000
    });

    // Register example tool
    server.registerTool('echo', {
        description: 'Echo back the input',
        inputSchema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'Message to echo' }
            },
            required: ['message']
        },
        handler: async (args) => {
            return `Echo: ${args.message}`;
        }
    });

    // Initialize server
    server.initialize().then(() => {
        console.log('Server ready for MCP requests');
        console.log('\nExample request (STDIO):');
        console.log(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
        }));
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        await server.shutdown();
        process.exit(0);
    });
}

module.exports = MinimalMCPServer;
