/**
 * Adrian's Agent Memory Management System
 * Implements persistent memory with cross-agent coordination
 */

const fs = require('fs');
const path = require('path');

class TimComboAgentMemoryManager {
  constructor() {
    this.memoryDir = path.join(__dirname, 'agents');
    this.sharedDir = path.join(__dirname, 'shared');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
    if (!fs.existsSync(this.sharedDir)) {
      fs.mkdirSync(this.sharedDir, { recursive: true });
    }
  }

  /**
   * Create new agent memory structure
   */
  createAgent(agentId, config = {}) {
    const agentDir = path.join(this.memoryDir, agentId);
    
    if (fs.existsSync(agentDir)) {
      throw new Error(`Agent ${agentId} already exists`);
    }

    fs.mkdirSync(agentDir, { recursive: true });

    // Initialize agent state
    const initialState = {
      agent_id: agentId,
      status: 'idle',
      created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      capabilities: config.capabilities || [],
      memory_namespace: `project/tim-combo/${agentId}`,
      ...config
    };

    this.saveAgentState(agentId, initialState);

    // Initialize knowledge base
    const initialKnowledge = `# ${agentId} Knowledge Base

## Current Status
**Created**: ${new Date().toISOString()}

## Capabilities
${(config.capabilities || []).map(cap => `- ${cap}`).join('\n')}

## Learning Log
- Agent initialized with base configuration

## Integration Handler Access
- Can access Tim-Combo PostgreSQL database via executeQuery()
- Can read/write integration templates and instances
- Can leverage existing handler patterns

## Next Steps
- Awaiting first task assignment
`;

    this.saveAgentKnowledge(agentId, initialKnowledge);

    // Initialize task tracking
    const initialTasks = {
      active_tasks: [],
      completed_tasks: [],
      blocked_tasks: [],
      backlog: []
    };

    this.saveAgentTasks(agentId, initialTasks);

    return agentId;
  }

  /**
   * Save agent state with atomic write
   */
  saveAgentState(agentId, state) {
    const statePath = path.join(this.memoryDir, agentId, 'state.json');
    const tempPath = statePath + '.tmp';
    
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
    fs.renameSync(tempPath, statePath);
  }

  /**
   * Load agent state with error handling
   */
  loadAgentState(agentId) {
    const statePath = path.join(this.memoryDir, agentId, 'state.json');
    
    if (!fs.existsSync(statePath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch (error) {
      console.error(`Failed to load agent state for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Save agent knowledge with automatic backup
   */
  saveAgentKnowledge(agentId, knowledge) {
    const knowledgePath = path.join(this.memoryDir, agentId, 'knowledge.md');
    const backupPath = path.join(this.memoryDir, agentId, `knowledge.md.backup.${Date.now()}`);
    
    // Backup existing knowledge
    if (fs.existsSync(knowledgePath)) {
      fs.copyFileSync(knowledgePath, backupPath);
    }
    
    fs.writeFileSync(knowledgePath, knowledge);
    
    // Keep only last 5 backups
    this.cleanupBackups(path.join(this.memoryDir, agentId), 'knowledge.md.backup', 5);
  }

  /**
   * Load agent knowledge base
   */
  loadAgentKnowledge(agentId) {
    const knowledgePath = path.join(this.memoryDir, agentId, 'knowledge.md');
    
    if (!fs.existsSync(knowledgePath)) {
      return '';
    }

    return fs.readFileSync(knowledgePath, 'utf8');
  }

  /**
   * Save agent task tracking
   */
  saveAgentTasks(agentId, tasks) {
    const tasksPath = path.join(this.memoryDir, agentId, 'tasks.json');
    const tempPath = tasksPath + '.tmp';
    
    fs.writeFileSync(tempPath, JSON.stringify(tasks, null, 2));
    fs.renameSync(tempPath, tasksPath);
  }

  /**
   * Load agent task tracking
   */
  loadAgentTasks(agentId) {
    const tasksPath = path.join(this.memoryDir, agentId, 'tasks.json');
    
    if (!fs.existsSync(tasksPath)) {
      return { active_tasks: [], completed_tasks: [], blocked_tasks: [], backlog: [] };
    }

    try {
      return JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    } catch (error) {
      console.error(`Failed to load agent tasks for ${agentId}:`, error);
      return { active_tasks: [], completed_tasks: [], blocked_tasks: [], backlog: [] };
    }
  }

  /**
   * Add task to agent with automatic state management
   */
  assignTask(agentId, task) {
    const state = this.loadAgentState(agentId);
    const tasks = this.loadAgentTasks(agentId);
    
    if (!state) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Add to active tasks
    const newTask = {
      task_id: task.task_id || `task_${Date.now()}`,
      description: task.description,
      status: 'assigned',
      assigned: new Date().toISOString(),
      priority: task.priority || 'medium',
      dependencies: task.dependencies || [],
      ...task
    };

    tasks.active_tasks.push(newTask);
    
    // Update agent status
    state.status = 'active';
    state.current_task = newTask.description;
    state.last_updated = new Date().toISOString();
    
    this.saveAgentState(agentId, state);
    this.saveAgentTasks(agentId, tasks);

    return newTask;
  }

  /**
   * Complete task and update agent memory
   */
  completeTask(agentId, taskId, outcome = {}) {
    const state = this.loadAgentState(agentId);
    const tasks = this.loadAgentTasks(agentId);
    
    if (!state) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Move from active to completed
    const taskIndex = tasks.active_tasks.findIndex(t => t.task_id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found in active tasks`);
    }

    const task = tasks.active_tasks.splice(taskIndex, 1)[0];
    task.status = 'completed';
    task.completed = new Date().toISOString();
    task.outcome = outcome;

    tasks.completed_tasks.push(task);

    // Update agent status
    if (tasks.active_tasks.length === 0) {
      state.status = 'idle';
      state.current_task = null;
    } else {
      state.current_task = tasks.active_tasks[0].description;
    }
    
    state.last_updated = new Date().toISOString();
    
    this.saveAgentState(agentId, state);
    this.saveAgentTasks(agentId, tasks);

    return task;
  }

  /**
   * Store shared knowledge across agents
   */
  storeSharedKnowledge(namespace, key, content) {
    const namespacePath = path.join(this.sharedDir, namespace);
    
    if (!fs.existsSync(namespacePath)) {
      fs.mkdirSync(namespacePath, { recursive: true });
    }
    
    const filePath = path.join(namespacePath, `${key}.md`);
    const metadata = {
      stored: new Date().toISOString(),
      namespace,
      key
    };
    
    const fullContent = `---
${Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join('\n')}
---

${content}`;
    
    fs.writeFileSync(filePath, fullContent);
  }

  /**
   * Retrieve shared knowledge
   */
  getSharedKnowledge(namespace, key) {
    const filePath = path.join(this.sharedDir, namespace, `${key}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract metadata and content
    const metadataMatch = content.match(/^---\n(.*?)\n---\n(.*)$/s);
    
    if (!metadataMatch) {
      return { content };
    }
    
    const metadata = {};
    metadataMatch[1].split('\n').forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        metadata[key] = value;
      }
    });
    
    return {
      metadata,
      content: metadataMatch[2]
    };
  }

  /**
   * Get agent context for task execution
   */
  getAgentContext(agentId) {
    const state = this.loadAgentState(agentId);
    const knowledge = this.loadAgentKnowledge(agentId);
    const tasks = this.loadAgentTasks(agentId);
    
    if (!state) {
      return null;
    }
    
    return {
      state,
      knowledge,
      tasks,
      capabilities: state.capabilities || [],
      namespace: state.memory_namespace
    };
  }

  /**
   * Cleanup old backup files
   */
  cleanupBackups(dir, prefix, keepCount) {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.startsWith(prefix))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          mtime: fs.statSync(path.join(dir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      // Remove old backups
      files.slice(keepCount).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.warn('Failed to cleanup backups:', error.message);
    }
  }

  /**
   * List all agents with status
   */
  listAgents() {
    if (!fs.existsSync(this.memoryDir)) {
      return [];
    }

    return fs.readdirSync(this.memoryDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const agentId = dirent.name;
        const state = this.loadAgentState(agentId);
        return {
          agentId,
          status: state?.status || 'unknown',
          lastUpdated: state?.last_updated,
          currentTask: state?.current_task
        };
      });
  }
}

module.exports = TimComboAgentMemoryManager;

// CLI usage for testing
if (require.main === module) {
  const manager = new TimComboAgentMemoryManager();
  
  const command = process.argv[2];
  const agentId = process.argv[3];
  
  if (command === 'list') {
    console.log('Agents:', manager.listAgents());
  } else if (command === 'context' && agentId) {
    console.log(`Agent ${agentId} context:`, manager.getAgentContext(agentId));
  } else {
    console.log('Usage: node agent-memory-manager.js <list|context> [agentId]');
  }
}