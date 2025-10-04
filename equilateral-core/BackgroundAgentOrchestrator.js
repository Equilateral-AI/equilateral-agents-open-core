// BackgroundAgentOrchestrator.js - Enhanced orchestration with background worker support
// Enables agents to run in background while user continues other tasks

const { EventEmitter } = require('events');
const { Worker } = require('worker_threads');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const AgentOrchestrator = require('./AgentOrchestrator');

class BackgroundAgentOrchestrator extends AgentOrchestrator {
    constructor(config = {}) {
        super(config);
        
        this.backgroundWorkers = new Map();
        this.workerResults = new Map();
        this.progressStreams = new Map();
        this.sshTunnels = new Map();
        
        // Enhanced configuration for background execution
        this.backgroundConfig = {
            maxBackgroundWorkers: config.maxBackgroundWorkers || 3,
            progressUpdateInterval: config.progressUpdateInterval || 5000,
            enableRealTimeUpdates: config.enableRealTimeUpdates || true,
            persistWorkerResults: config.persistWorkerResults || true,
            ...config.backgroundConfig
        };
    }

    /**
     * Execute workflow in background with real-time progress updates
     */
    async executeWorkflowBackground(workflowName, options = {}) {
        const workerId = this.generateWorkerId(workflowName);
        
        console.log(`🚀 Dispatching ${workflowName} to background worker ${workerId}`);
        
        try {
            // Create background worker
            const worker = await this.createBackgroundWorker(workflowName, options, workerId);
            
            // Set up progress monitoring
            this.setupProgressMonitoring(worker, workerId);
            
            // Store worker reference
            this.backgroundWorkers.set(workerId, {
                worker,
                workflowName,
                startTime: new Date(),
                status: 'running',
                options
            });
            
            // Emit background start event
            this.emit('background:started', {
                workerId,
                workflowName,
                message: `${workflowName} running in background - you can continue other tasks`
            });
            
            return {
                workerId,
                status: 'background',
                monitor: () => this.getWorkerProgress(workerId),
                results: () => this.getWorkerResults(workerId),
                cancel: () => this.cancelWorker(workerId)
            };
            
        } catch (error) {
            this.emit('background:error', {
                workerId,
                workflowName,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Create background worker using Node.js worker threads
     */
    async createBackgroundWorker(workflowName, options, workerId) {
        const workerScript = path.join(__dirname, 'workers', 'workflow-worker.js');
        
        // Ensure worker script exists
        await this.ensureWorkerScript();
        
        const worker = new Worker(workerScript, {
            workerData: {
                workflowName,
                options,
                workerId,
                projectRoot: this.config.projectRoot,
                agentDirectory: this.config.agentDirectory
            }
        });
        
        return worker;
    }

    /**
     * Set up real-time progress monitoring for background worker
     */
    setupProgressMonitoring(worker, workerId) {
        const progressStream = new EventEmitter();
        this.progressStreams.set(workerId, progressStream);
        
        // Listen to worker messages for progress updates
        worker.on('message', (message) => {
            const { type, data } = message;
            
            switch (type) {
                case 'progress':
                    this.handleProgressUpdate(workerId, data);
                    break;
                case 'step_complete':
                    this.handleStepComplete(workerId, data);
                    break;
                case 'workflow_complete':
                    this.handleWorkflowComplete(workerId, data);
                    break;
                case 'error':
                    this.handleWorkerError(workerId, data);
                    break;
            }
        });
        
        worker.on('error', (error) => {
            this.handleWorkerError(workerId, { error: error.message });
        });
        
        worker.on('exit', (code) => {
            this.handleWorkerExit(workerId, code);
        });
        
        // Set up periodic progress requests
        if (this.backgroundConfig.enableRealTimeUpdates) {
            const progressInterval = setInterval(() => {
                if (this.backgroundWorkers.has(workerId)) {
                    worker.postMessage({ type: 'get_progress' });
                } else {
                    clearInterval(progressInterval);
                }
            }, this.backgroundConfig.progressUpdateInterval);
        }
    }

    /**
     * Handle progress updates from background workers
     */
    handleProgressUpdate(workerId, data) {
        const workerInfo = this.backgroundWorkers.get(workerId);
        if (!workerInfo) return;
        
        // Update worker status
        workerInfo.lastProgress = data;
        workerInfo.lastUpdate = new Date();
        
        // Emit progress event
        this.emit('background:progress', {
            workerId,
            workflowName: workerInfo.workflowName,
            progress: data,
            message: `${workerInfo.workflowName}: ${data.message || 'Processing...'}`
        });
        
        // Console output for immediate feedback
        console.log(`📊 Background ${workerInfo.workflowName} (${workerId}): ${data.message}`);
    }

    /**
     * Handle step completion from background workers
     */
    handleStepComplete(workerId, data) {
        const workerInfo = this.backgroundWorkers.get(workerId);
        if (!workerInfo) return;
        
        this.emit('background:step_complete', {
            workerId,
            workflowName: workerInfo.workflowName,
            step: data.stepName,
            duration: data.duration,
            message: `✅ ${data.stepName} completed in ${data.duration}ms`
        });
        
        console.log(`✅ Background ${workerInfo.workflowName}: ${data.stepName} completed`);
    }

    /**
     * Handle workflow completion from background workers
     */
    async handleWorkflowComplete(workerId, data) {
        const workerInfo = this.backgroundWorkers.get(workerId);
        if (!workerInfo) return;
        
        // Store results
        this.workerResults.set(workerId, {
            results: data.results,
            duration: data.duration,
            completedAt: new Date(),
            workflowName: workerInfo.workflowName
        });
        
        // Persist results if configured
        if (this.backgroundConfig.persistWorkerResults) {
            await this.persistWorkerResults(workerId, data);
        }
        
        // Clean up worker
        this.cleanupWorker(workerId);
        
        // Emit completion event
        this.emit('background:complete', {
            workerId,
            workflowName: workerInfo.workflowName,
            results: data.results,
            duration: data.duration,
            message: `🎉 ${workerInfo.workflowName} completed successfully in background!`
        });
        
        console.log(`🎉 Background workflow ${workerInfo.workflowName} completed!`);
        console.log(`📋 Results available: orchestrator.getWorkerResults('${workerId}')`);
    }

    /**
     * Enhanced workflow execution with SSH tunnel support
     */
    async executeWorkflowWithSSH(workflowName, options = {}) {
        const { sshConfig } = options;
        
        if (sshConfig) {
            console.log(`🔐 Setting up SSH tunnel for ${workflowName}`);
            
            // Create SSH tunnel
            const tunnelId = await this.createSSHTunnel(sshConfig);
            
            // Add tunnel info to options
            options.tunnelId = tunnelId;
            options.dbConfig = {
                ...options.dbConfig,
                host: 'localhost',
                port: sshConfig.localPort
            };
            
            console.log(`✅ SSH tunnel established: localhost:${sshConfig.localPort} -> ${sshConfig.remoteHost}:${sshConfig.remotePort}`);
        }
        
        // Execute workflow (can be background or foreground)
        return options.background 
            ? await this.executeWorkflowBackground(workflowName, options)
            : await this.executeWorkflow(workflowName, options);
    }

    /**
     * Create SSH tunnel for private database access
     */
    async createSSHTunnel(sshConfig) {
        const { host, port, username, privateKey, remoteHost, remotePort, localPort } = sshConfig;
        const tunnelId = `tunnel-${Date.now()}`;
        
        return new Promise((resolve, reject) => {
            const sshProcess = spawn('ssh', [
                '-N', // Don't execute remote command
                '-L', `${localPort}:${remoteHost}:${remotePort}`, // Local port forwarding
                '-i', privateKey, // Private key file
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'UserKnownHostsFile=/dev/null',
                '-o', 'LogLevel=quiet',
                `${username}@${host}`,
                '-p', port.toString()
            ]);
            
            // Store tunnel process
            this.sshTunnels.set(tunnelId, {
                process: sshProcess,
                config: sshConfig,
                createdAt: new Date()
            });
            
            sshProcess.on('error', (error) => {
                console.error(`SSH tunnel error: ${error.message}`);
                reject(error);
            });
            
            // Wait a moment for tunnel to establish
            setTimeout(() => {
                if (sshProcess.exitCode === null) {
                    console.log(`🔐 SSH tunnel ${tunnelId} established`);
                    resolve(tunnelId);
                } else {
                    reject(new Error('SSH tunnel failed to establish'));
                }
            }, 2000);
        });
    }

    /**
     * Enhanced OIDC AWS integration for direct deployment
     */
    async executeAWSDirectDeploy(deploymentConfig) {
        const { 
            environment, 
            services, 
            oidcProfile, 
            skipCI = true,
            backgroundExecution = true 
        } = deploymentConfig;
        
        console.log(`🚀 Direct AWS deployment to ${environment} using OIDC ${oidcProfile}`);
        console.log(`⚡ Skipping traditional CI/CD: ${skipCI}`);
        
        // Create AWS deployment workflow
        const workflowConfig = {
            environment,
            services,
            awsProfile: oidcProfile,
            directDeploy: true,
            skipGitCommit: skipCI,
            background: backgroundExecution
        };
        
        // Execute deployment workflow
        return backgroundExecution
            ? await this.executeWorkflowBackground('aws-direct-deploy', workflowConfig)
            : await this.executeWorkflow('aws-direct-deploy', workflowConfig);
    }

    /**
     * Get current progress of background worker
     */
    getWorkerProgress(workerId) {
        const workerInfo = this.backgroundWorkers.get(workerId);
        if (!workerInfo) {
            return { status: 'not_found' };
        }
        
        return {
            workerId,
            workflowName: workerInfo.workflowName,
            status: workerInfo.status,
            startTime: workerInfo.startTime,
            lastProgress: workerInfo.lastProgress,
            lastUpdate: workerInfo.lastUpdate,
            running: this.backgroundWorkers.has(workerId)
        };
    }

    /**
     * Get results from completed background worker
     */
    getWorkerResults(workerId) {
        return this.workerResults.get(workerId);
    }

    /**
     * List all active background workers
     */
    listBackgroundWorkers() {
        const workers = [];
        for (const [workerId, info] of this.backgroundWorkers) {
            workers.push({
                workerId,
                workflowName: info.workflowName,
                status: info.status,
                startTime: info.startTime,
                lastUpdate: info.lastUpdate
            });
        }
        return workers;
    }

    /**
     * Cancel background worker
     */
    async cancelWorker(workerId) {
        const workerInfo = this.backgroundWorkers.get(workerId);
        if (!workerInfo) {
            return { success: false, message: 'Worker not found' };
        }
        
        // Terminate worker
        await workerInfo.worker.terminate();
        
        // Clean up
        this.cleanupWorker(workerId);
        
        this.emit('background:cancelled', {
            workerId,
            workflowName: workerInfo.workflowName,
            message: `Background ${workerInfo.workflowName} cancelled`
        });
        
        return { success: true, message: `Worker ${workerId} cancelled` };
    }

    /**
     * Clean up worker resources
     */
    cleanupWorker(workerId) {
        this.backgroundWorkers.delete(workerId);
        this.progressStreams.delete(workerId);
    }

    /**
     * Generate unique worker ID
     */
    generateWorkerId(workflowName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const random = Math.random().toString(36).substr(2, 6);
        return `${workflowName}-bg-${timestamp}-${random}`;
    }

    /**
     * Ensure worker script exists
     */
    async ensureWorkerScript() {
        const workerDir = path.join(__dirname, 'workers');
        const workerScript = path.join(workerDir, 'workflow-worker.js');
        
        try {
            await fs.access(workerScript);
        } catch (error) {
            // Create worker directory and script
            await fs.mkdir(workerDir, { recursive: true });
            await this.createWorkerScript(workerScript);
        }
    }

    /**
     * Create worker script for background execution
     */
    async createWorkerScript(workerScriptPath) {
        const workerCode = `
// workflow-worker.js - Background worker for agent orchestration
const { parentPort, workerData } = require('worker_threads');
const AgentOrchestrator = require('../AgentOrchestrator');

async function runWorkflow() {
    const { workflowName, options, workerId, projectRoot, agentDirectory } = workerData;
    
    try {
        // Create orchestrator instance in worker
        const orchestrator = new AgentOrchestrator({
            projectRoot,
            agentDirectory
        });
        
        // Set up progress reporting
        orchestrator.on('step:started', (data) => {
            parentPort.postMessage({
                type: 'progress',
                data: { message: \`Started: \${data.stepName}\`, step: data.stepName }
            });
        });
        
        orchestrator.on('step:completed', (data) => {
            parentPort.postMessage({
                type: 'step_complete',
                data: { stepName: data.stepName, duration: data.duration }
            });
        });
        
        // Execute workflow
        const result = await orchestrator.executeWorkflow(workflowName, options);
        
        // Send completion message
        parentPort.postMessage({
            type: 'workflow_complete',
            data: {
                results: result.results,
                duration: result.duration,
                success: result.success
            }
        });
        
    } catch (error) {
        parentPort.postMessage({
            type: 'error',
            data: { error: error.message, stack: error.stack }
        });
    }
}

// Handle messages from parent
parentPort.on('message', (message) => {
    if (message.type === 'get_progress') {
        parentPort.postMessage({
            type: 'progress',
            data: { message: 'Processing...', timestamp: new Date().toISOString() }
        });
    }
});

// Start workflow execution
runWorkflow().catch(error => {
    parentPort.postMessage({
        type: 'error',
        data: { error: error.message, stack: error.stack }
    });
});
`;
        
        await fs.writeFile(workerScriptPath, workerCode);
        console.log(`📝 Created worker script: ${workerScriptPath}`);
    }

    /**
     * Persist worker results to disk
     */
    async persistWorkerResults(workerId, data) {
        const resultsDir = path.join(this.config.projectRoot, 'agent-results');
        await fs.mkdir(resultsDir, { recursive: true });
        
        const resultsFile = path.join(resultsDir, `${workerId}-results.json`);
        const resultsData = {
            workerId,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        await fs.writeFile(resultsFile, JSON.stringify(resultsData, null, 2));
        console.log(`💾 Results persisted: ${resultsFile}`);
    }
}

module.exports = BackgroundAgentOrchestrator;