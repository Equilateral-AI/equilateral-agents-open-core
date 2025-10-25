/**
 * EquilateralAgents™ Simple Agent Memory - Open Core Edition
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Lightweight execution memory system for individual agents.
 * Tracks patterns, learns from outcomes, optimizes performance.
 *
 * Open Core Features:
 * - Single-agent memory (no cross-agent synthesis)
 * - Short-term history (last 100 executions)
 * - File-based persistence
 * - Pattern recognition
 * - Success rate tracking
 *
 * Enterprise Features (not included):
 * - Multi-agent coordination
 * - Long-term database-backed memory
 * - Patent-protected privacy isolation
 * - Semantic search (150x faster)
 * - Cross-project learning
 */

const fs = require('fs');
const path = require('path');

class SimpleAgentMemory {
  constructor(agentId, config = {}) {
    this.agentId = agentId;
    this.maxExecutions = config.maxExecutions || 100;
    this.memoryDir = config.memoryDir || path.join(process.cwd(), '.agent-memory');
    this.agentMemoryPath = path.join(this.memoryDir, agentId);
    this.memoryFile = path.join(this.agentMemoryPath, 'memory.json');

    // In-memory storage
    this.executions = new Map();
    this.patterns = {
      successRate: 0,
      avgDuration: 0,
      commonPatterns: {},
      failurePatterns: {},
      lastUpdated: null
    };

    this._ensureDirectories();
    this._load();
  }

  /**
   * Ensure memory directories exist
   */
  _ensureDirectories() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
    if (!fs.existsSync(this.agentMemoryPath)) {
      fs.mkdirSync(this.agentMemoryPath, { recursive: true });
    }
  }

  /**
   * Record an execution result
   */
  recordExecution(task, outcome) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const execution = {
      id: executionId,
      task: {
        type: task.taskType || 'unknown',
        description: task.description || '',
        context: task.context || {}
      },
      outcome: {
        success: outcome.success || false,
        duration: outcome.duration || 0,
        result: outcome.result || null,
        error: outcome.error || null
      },
      timestamp: new Date().toISOString()
    };

    this.executions.set(executionId, execution);

    // Maintain size limit (keep last 100)
    if (this.executions.size > this.maxExecutions) {
      const oldestKey = Array.from(this.executions.keys())[0];
      this.executions.delete(oldestKey);
    }

    // Update patterns
    this._updatePatterns();

    // Persist to disk
    this._save();

    return executionId;
  }

  /**
   * Update pattern recognition based on execution history
   */
  _updatePatterns() {
    const executions = Array.from(this.executions.values());

    if (executions.length === 0) {
      return;
    }

    // Calculate success rate
    const successful = executions.filter(e => e.outcome.success);
    this.patterns.successRate = successful.length / executions.length;

    // Calculate average duration
    const durations = executions.map(e => e.outcome.duration);
    this.patterns.avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Identify common patterns in successful executions
    this.patterns.commonPatterns = this._identifyPatterns(successful);

    // Identify failure patterns
    const failures = executions.filter(e => !e.outcome.success);
    this.patterns.failurePatterns = this._identifyPatterns(failures);

    this.patterns.lastUpdated = new Date().toISOString();
  }

  /**
   * Identify patterns in execution set
   */
  _identifyPatterns(executions) {
    const patterns = {};

    executions.forEach(exec => {
      const taskType = exec.task.type;

      if (!patterns[taskType]) {
        patterns[taskType] = {
          count: 0,
          avgDuration: 0,
          examples: []
        };
      }

      patterns[taskType].count++;
      patterns[taskType].avgDuration =
        (patterns[taskType].avgDuration * (patterns[taskType].count - 1) + exec.outcome.duration) /
        patterns[taskType].count;

      // Keep last 3 examples
      if (patterns[taskType].examples.length < 3) {
        patterns[taskType].examples.push({
          description: exec.task.description,
          duration: exec.outcome.duration,
          timestamp: exec.timestamp
        });
      }
    });

    return patterns;
  }

  /**
   * Get success patterns for a specific task type
   */
  getSuccessPatterns(taskType) {
    const executions = Array.from(this.executions.values());
    const relevant = executions.filter(e =>
      e.task.type === taskType && e.outcome.success === true
    );

    if (relevant.length === 0) {
      return null;
    }

    const avgDuration = relevant.reduce((sum, e) => sum + e.outcome.duration, 0) / relevant.length;

    return {
      taskType,
      successCount: relevant.length,
      totalAttempts: executions.filter(e => e.task.type === taskType).length,
      successRate: relevant.length / executions.filter(e => e.task.type === taskType).length,
      avgDuration,
      recentExamples: relevant.slice(-10)
    };
  }

  /**
   * Suggest optimal approach based on past experience
   */
  suggestOptimalWorkflow(context) {
    const taskType = context.taskType || 'unknown';
    const patterns = this.getSuccessPatterns(taskType);

    if (!patterns) {
      return {
        hasExperience: false,
        message: `No prior experience with ${taskType} tasks`
      };
    }

    return {
      hasExperience: true,
      taskType,
      successRate: patterns.successRate,
      estimatedDuration: patterns.avgDuration,
      confidence: Math.min(patterns.successCount / 10, 1.0), // 0-1 based on experience
      recommendation: this._buildRecommendation(patterns),
      basedOn: patterns.successCount
    };
  }

  /**
   * Build recommendation based on patterns
   */
  _buildRecommendation(patterns) {
    if (patterns.successRate >= 0.9) {
      return `High confidence - this task type succeeds ${(patterns.successRate * 100).toFixed(0)}% of the time`;
    } else if (patterns.successRate >= 0.7) {
      return `Moderate confidence - review failure patterns to improve success rate`;
    } else {
      return `Low confidence - this task type has ${(patterns.successRate * 100).toFixed(0)}% success rate. Consider alternative approach.`;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const executions = Array.from(this.executions.values());

    if (executions.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        avgDuration: 0,
        improvement: null
      };
    }

    // Calculate overall metrics
    const metrics = {
      totalExecutions: executions.length,
      successRate: this.patterns.successRate,
      avgDuration: this.patterns.avgDuration,
      commonPatterns: this.patterns.commonPatterns,
      failurePatterns: this.patterns.failurePatterns
    };

    // Calculate improvement trend if enough data
    if (executions.length >= 20) {
      const first10 = executions.slice(0, 10);
      const last10 = executions.slice(-10);

      const first10Success = first10.filter(e => e.outcome.success).length / 10;
      const last10Success = last10.filter(e => e.outcome.success).length / 10;

      const first10Duration = first10.reduce((sum, e) => sum + e.outcome.duration, 0) / 10;
      const last10Duration = last10.reduce((sum, e) => sum + e.outcome.duration, 0) / 10;

      metrics.improvement = {
        successRateDelta: last10Success - first10Success,
        durationImprovement: ((first10Duration - last10Duration) / first10Duration) * 100,
        trend: last10Success > first10Success ? 'improving' : 'declining'
      };
    }

    return metrics;
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      agentId: this.agentId,
      executionCount: this.executions.size,
      maxExecutions: this.maxExecutions,
      patterns: this.patterns,
      memorySize: this._calculateMemorySize(),
      lastUpdated: this.patterns.lastUpdated
    };
  }

  /**
   * Calculate memory size in bytes
   */
  _calculateMemorySize() {
    try {
      const stats = fs.statSync(this.memoryFile);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Reset memory (useful when codebase changes significantly)
   */
  reset() {
    this.executions.clear();
    this.patterns = {
      successRate: 0,
      avgDuration: 0,
      commonPatterns: {},
      failurePatterns: {},
      lastUpdated: null
    };
    this._save();
  }

  /**
   * Export memory for migration or backup
   */
  export() {
    return {
      agentId: this.agentId,
      executions: Array.from(this.executions.entries()),
      patterns: this.patterns,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import memory from backup
   */
  import(data) {
    if (data.agentId !== this.agentId) {
      throw new Error(`Import failed: agentId mismatch (expected ${this.agentId}, got ${data.agentId})`);
    }

    this.executions = new Map(data.executions);
    this.patterns = data.patterns;
    this._save();
  }

  /**
   * Save memory to disk
   */
  _save() {
    try {
      const data = {
        agentId: this.agentId,
        executions: Array.from(this.executions.entries()),
        patterns: this.patterns,
        savedAt: new Date().toISOString()
      };

      const tempFile = this.memoryFile + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
      fs.renameSync(tempFile, this.memoryFile);
    } catch (error) {
      console.warn(`Failed to save memory for ${this.agentId}:`, error.message);
    }
  }

  /**
   * Load memory from disk
   */
  _load() {
    if (!fs.existsSync(this.memoryFile)) {
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));

      if (data.agentId !== this.agentId) {
        console.warn(`Memory file agentId mismatch: expected ${this.agentId}, got ${data.agentId}`);
        return;
      }

      this.executions = new Map(data.executions);
      this.patterns = data.patterns || this.patterns;
    } catch (error) {
      console.warn(`Failed to load memory for ${this.agentId}:`, error.message);
      // Continue with empty memory
    }
  }
}

module.exports = SimpleAgentMemory;

// CLI usage for testing
if (require.main === module) {
  const memory = new SimpleAgentMemory('test-agent');

  // Simulate some executions
  console.log('Simulating executions...');

  for (let i = 0; i < 15; i++) {
    memory.recordExecution(
      { taskType: 'code-review', description: `Review file ${i}` },
      { success: Math.random() > 0.3, duration: 10000 + Math.random() * 5000 }
    );
  }

  // Show patterns
  console.log('\nMemory Stats:', memory.getStats());
  console.log('\nCode Review Patterns:', memory.getSuccessPatterns('code-review'));
  console.log('\nOptimal Workflow Suggestion:', memory.suggestOptimalWorkflow({ taskType: 'code-review' }));
  console.log('\nPerformance Metrics:', memory.getPerformanceMetrics());
}
