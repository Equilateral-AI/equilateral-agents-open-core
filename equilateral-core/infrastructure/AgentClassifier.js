/**
 * Adrian's Multiagent Task Classification System
 * Automatically selects appropriate agents based on task analysis and agent memory
 */

const fs = require('fs');
const path = require('path');

class TimComboAgentClassifier {
  constructor() {
    this.agentsDir = path.join(__dirname, 'agents');
    this.agentProfiles = this.loadAgentProfiles();
  }

  /**
   * Load agent profiles from memory structure
   */
  loadAgentProfiles() {
    const profiles = {};
    
    if (!fs.existsSync(this.agentsDir)) {
      return profiles;
    }

    const agentDirs = fs.readdirSync(this.agentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const agentId of agentDirs) {
      try {
        const statePath = path.join(this.agentsDir, agentId, 'state.json');
        const knowledgePath = path.join(this.agentsDir, agentId, 'knowledge.md');
        
        if (fs.existsSync(statePath)) {
          const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
          let knowledge = '';
          
          if (fs.existsSync(knowledgePath)) {
            knowledge = fs.readFileSync(knowledgePath, 'utf8');
          }
          
          profiles[agentId] = {
            ...state,
            knowledge,
            lastAccessed: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn(`Failed to load agent profile for ${agentId}:`, error.message);
      }
    }

    return profiles;
  }

  /**
   * Adrian's automatic task classification algorithm
   */
  classifyTask(description) {
    const taskKeywords = this.extractKeywords(description.toLowerCase());
    const scores = {};

    // Score each agent based on capabilities, keywords, and past success
    for (const [agentId, profile] of Object.entries(this.agentProfiles)) {
      scores[agentId] = this.calculateAgentScore(taskKeywords, profile, description);
    }

    // Sort by score and return best match
    const sortedAgents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([agentId, score]) => ({ agentId, score, agent: this.agentProfiles[agentId] }));

    return {
      recommendedAgent: sortedAgents[0],
      alternatives: sortedAgents.slice(1, 3),
      confidence: sortedAgents[0]?.score || 0
    };
  }

  /**
   * Calculate agent fitness score for task
   */
  calculateAgentScore(taskKeywords, profile, description) {
    let score = 0;

    // 1. Capability matching (40% weight)
    const capabilityScore = this.scoreCapabilities(taskKeywords, profile.capabilities || []);
    score += capabilityScore * 0.4;

    // 2. Knowledge base relevance (30% weight)
    const knowledgeScore = this.scoreKnowledgeRelevance(description, profile.knowledge || '');
    score += knowledgeScore * 0.3;

    // 3. Current agent status (20% weight)
    const statusScore = this.scoreAgentStatus(profile);
    score += statusScore * 0.2;

    // 4. Past success with similar tasks (10% weight)
    const historyScore = this.scoreTaskHistory(taskKeywords, profile);
    score += historyScore * 0.1;

    return score;
  }

  /**
   * Score agent capabilities against task keywords
   */
  scoreCapabilities(taskKeywords, capabilities) {
    if (!capabilities.length) return 0;

    const matches = capabilities.filter(capability => 
      taskKeywords.some(keyword => 
        capability.toLowerCase().includes(keyword) || 
        keyword.includes(capability.toLowerCase())
      )
    );

    return matches.length / capabilities.length;
  }

  /**
   * Score knowledge base relevance using keyword matching
   */
  scoreKnowledgeRelevance(description, knowledge) {
    if (!knowledge) return 0;

    const knowledgeText = knowledge.toLowerCase();
    const descriptionWords = description.toLowerCase().split(/\s+/);
    
    const matches = descriptionWords.filter(word => 
      word.length > 3 && knowledgeText.includes(word)
    );

    return Math.min(matches.length / descriptionWords.length, 1);
  }

  /**
   * Score agent current status and availability
   */
  scoreAgentStatus(profile) {
    switch (profile.status) {
      case 'active': return 1.0;
      case 'idle': return 0.9;
      case 'busy': return 0.3;
      case 'completed': return 0.7; // Can be reactivated
      case 'error': return 0.1;
      default: return 0.5;
    }
  }

  /**
   * Score based on task history and past success
   */
  scoreTaskHistory(taskKeywords, profile) {
    // This would analyze completed_tasks in tasks.json
    // For now, return baseline score
    return 0.5;
  }

  /**
   * Extract meaningful keywords from task description
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => /^[a-zA-Z-]+$/.test(word)); // Only alphabetic words
  }

  /**
   * Get agent memory for context
   */
  getAgentMemory(agentId) {
    return this.agentProfiles[agentId] || null;
  }

  /**
   * Update agent state after task assignment
   */
  updateAgentState(agentId, updates) {
    if (!this.agentProfiles[agentId]) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const statePath = path.join(this.agentsDir, agentId, 'state.json');
    const currentState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    
    const newState = {
      ...currentState,
      ...updates,
      last_updated: new Date().toISOString()
    };

    fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));
    this.agentProfiles[agentId] = { ...this.agentProfiles[agentId], ...newState };
  }

  /**
   * Tim-Combo specific agent classification patterns
   */
  getTimComboAgentSuggestion(description) {
    const classification = this.classifyTask(description);
    
    // Core Agent Classification (Adrian's system)
    if (description.includes('implement') || description.includes('code') || description.includes('build') || description.includes('create')) {
      return { type: 'coder', confidence: 0.9, agent: this.agentProfiles['coder'] };
    }
    
    if (description.includes('plan') || description.includes('strategy') || description.includes('roadmap') || description.includes('phase')) {
      return { type: 'planner', confidence: 0.9, agent: this.agentProfiles['planner'] };
    }
    
    if (description.includes('research') || description.includes('analyze') || description.includes('documentation') || description.includes('API')) {
      return { type: 'researcher', confidence: 0.8, agent: this.agentProfiles['researcher'] };
    }
    
    if (description.includes('review') || description.includes('security') || description.includes('quality') || description.includes('validate')) {
      return { type: 'reviewer', confidence: 0.8, agent: this.agentProfiles['reviewer'] };
    }
    
    if (description.includes('test') || description.includes('validation') || description.includes('QA') || description.includes('scenarios')) {
      return { type: 'tester', confidence: 0.9, agent: this.agentProfiles['tester'] };
    }

    // Specialized Agent Classification (Tim-Combo specific)
    if (description.includes('frontend') || description.includes('React') || description.includes('TypeScript')) {
      return { type: 'frontend-specialist', confidence: 0.9 };
    }
    
    if (description.includes('Lambda') || description.includes('handler') || description.includes('backend')) {
      return { type: 'backend-specialist', confidence: 0.9 };
    }
    
    if (description.includes('integration') || description.includes('transformation') || description.includes('mapping')) {
      return { type: 'integration-specialist', confidence: 0.8 };
    }
    
    if (description.includes('CloudFormation') || description.includes('deploy') || description.includes('infrastructure')) {
      return { type: 'infrastructure-specialist', confidence: 0.8 };
    }

    return classification;
  }
}

module.exports = TimComboAgentClassifier;

// CLI usage
if (require.main === module) {
  const classifier = new TimComboAgentClassifier();
  const taskDescription = process.argv[2];
  
  if (!taskDescription) {
    console.log('Usage: node agent-classifier.js "task description"');
    process.exit(1);
  }
  
  const result = classifier.getTimComboAgentSuggestion(taskDescription);
  console.log('Agent Classification Result:');
  console.log(JSON.stringify(result, null, 2));
}