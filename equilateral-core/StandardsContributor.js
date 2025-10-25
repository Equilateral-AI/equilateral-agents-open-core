/**
 * EquilateralAgents™ Standards Contributor - Open Core Edition
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Prompts users to contribute learned patterns back to .equilateral-standards
 * Simple post-execution prompt system for community standards evolution
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class StandardsContributor {
  constructor(config = {}) {
    this.standardsDir = config.standardsDir || path.join(process.cwd(), '.standards');
    this.minExecutionsForPattern = config.minExecutionsForPattern || 10;
    this.enabled = config.enabled !== false; // Default: true
  }

  /**
   * Check if execution result is worth creating a standard from
   */
  isPatternWorthy(workflowName, result, memory = null) {
    if (!result || !result.success) {
      return false;
    }

    // Check if there's interesting data
    const hasFindings = result.findings && result.findings.length > 0;
    const hasPatterns = result.patterns && Object.keys(result.patterns).length > 0;
    const hasOptimizations = result.optimizations && result.optimizations.length > 0;

    // Check if we have enough historical data
    const hasEnoughHistory = memory && memory.executionCount >= this.minExecutionsForPattern;

    return (hasFindings || hasPatterns || hasOptimizations) && hasEnoughHistory;
  }

  /**
   * Prompt user to create standard from execution
   */
  async promptForStandardCreation(workflowName, result) {
    if (!this.enabled) {
      return false;
    }

    console.log(`\n📝 This execution revealed useful patterns:\n`);

    // Show what patterns were found
    this._displayPatterns(result);

    console.log(`\nCreate a standard from this execution? [y/N]: `);

    const answer = await this._promptUser();
    return answer.toLowerCase() === 'y';
  }

  /**
   * Display patterns found in execution
   */
  _displayPatterns(result) {
    if (result.findings && result.findings.length > 0) {
      const grouped = this._groupFindings(result.findings);
      Object.entries(grouped).forEach(([type, findings]) => {
        console.log(`   - ${type}: ${findings.length} occurrences`);
      });
    }

    if (result.optimizations && result.optimizations.length > 0) {
      result.optimizations.forEach(opt => {
        console.log(`   - ${opt.description} (${opt.impact}% improvement)`);
      });
    }
  }

  /**
   * Group findings by type
   */
  _groupFindings(findings) {
    return findings.reduce((acc, finding) => {
      const type = finding.type || finding.issue || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(finding);
      return acc;
    }, {});
  }

  /**
   * Create standard files from execution result
   */
  async createStandardFromExecution(workflowName, result) {
    const standards = [];

    // Generate standards based on findings
    if (result.findings && result.findings.length > 0) {
      const grouped = this._groupFindings(result.findings);

      for (const [type, findings] of Object.entries(grouped)) {
        const standard = await this._generateStandard(workflowName, type, findings, result);
        standards.push(standard);
      }
    }

    // Write standards to disk
    const createdFiles = [];
    for (const standard of standards) {
      const filePath = await this._writeStandard(standard);
      createdFiles.push(filePath);
      console.log(`✓ Created: ${filePath}`);
    }

    // Prompt for next steps
    if (createdFiles.length > 0) {
      await this._promptForContribution(createdFiles);
    }

    return createdFiles;
  }

  /**
   * Generate standard markdown content
   */
  async _generateStandard(workflowName, patternType, findings, result) {
    const category = this._categorizePattern(workflowName, patternType);
    const filename = `${this._sanitizeFilename(patternType)}_pattern.md`;

    const content = `# ${this._formatTitle(patternType)} Pattern

**Category**: ${category}
**Discovered**: ${new Date().toISOString()}
**Based on**: ${findings.length} occurrences in production usage
**Workflow**: ${workflowName}

## Problem

${this._describeProblem(patternType, findings)}

## Pattern

${this._describePattern(findings)}

## Solution

${this._describeSolution(patternType, findings)}

## Example

\`\`\`javascript
${this._generateExample(patternType, findings)}
\`\`\`

## Rationale

This pattern was identified through community usage:
- Occurrences: ${findings.length}
- Success rate: ${result.successRate ? (result.successRate * 100).toFixed(1) : 'N/A'}%
- Average impact: ${this._calculateImpact(findings)}

## Related Standards

- See \`${category}/\` for related patterns
- Cross-reference with cost optimization standards

## Contributed By

Community contribution from EquilateralAgents Open Core
`;

    return {
      category,
      filename,
      content,
      patternType
    };
  }

  /**
   * Categorize pattern into standards directory
   */
  _categorizePattern(workflowName, patternType) {
    // Map pattern types to standard categories
    const categoryMap = {
      'hardcoded-secrets': 'security',
      'sql-injection': 'security',
      'xss': 'security',
      'weak-crypto': 'security',
      'deployment-optimization': 'deployment',
      'cost-reduction': 'cost-optimization',
      'performance': 'performance'
    };

    return categoryMap[patternType] || 'general';
  }

  /**
   * Write standard to appropriate directory
   */
  async _writeStandard(standard) {
    const categoryDir = path.join(this.standardsDir, standard.category);

    // Ensure category directory exists
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(categoryDir, standard.filename);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`\n⚠️  Standard already exists: ${filePath}`);
      console.log(`Merge with existing standard? [y/N]: `);
      const answer = await this._promptUser();

      if (answer.toLowerCase() !== 'y') {
        return null;
      }

      // Append to existing
      const existing = fs.readFileSync(filePath, 'utf8');
      standard.content = this._mergeStandards(existing, standard.content);
    }

    fs.writeFileSync(filePath, standard.content);
    return path.relative(process.cwd(), filePath);
  }

  /**
   * Prompt for contribution to community standards
   */
  async _promptForContribution(createdFiles) {
    console.log(`\nWould you like to:`);
    console.log(`  [1] Commit to local standards only`);
    console.log(`  [2] Create PR to community standards`);
    console.log(`  [3] Do nothing (keep local only)`);
    console.log(`\nChoice [3]: `);

    const choice = await this._promptUser();

    switch (choice) {
      case '1':
        await this._commitLocalStandards(createdFiles);
        break;
      case '2':
        await this._createCommunityPR(createdFiles);
        break;
      default:
        console.log(`\n✓ Standards saved locally in ${this.standardsDir}`);
    }
  }

  /**
   * Commit standards to local git
   */
  async _commitLocalStandards(files) {
    const { execSync } = require('child_process');

    try {
      execSync(`git add ${files.join(' ')}`);
      execSync(`git commit -m "chore: Add community-contributed standards

${files.map(f => `- ${f}`).join('\n')}

🤖 Generated with EquilateralAgents
Co-Authored-By: Community <community@equilateral.ai>"`);

      console.log(`\n✓ Standards committed to local repository`);
    } catch (error) {
      console.error(`\n❌ Failed to commit: ${error.message}`);
      console.log(`Files saved in ${this.standardsDir} - commit manually`);
    }
  }

  /**
   * Create PR to community standards repository
   */
  async _createCommunityPR(files) {
    console.log(`\n📤 Creating PR to community standards...`);

    // This would integrate with GitHub API or gh CLI
    console.log(`\n⚠️  Community PR creation requires GitHub token`);
    console.log(`For now, manually:`);
    console.log(`  1. Fork: https://github.com/equilateral/equilateral-standards`);
    console.log(`  2. Copy files to fork`);
    console.log(`  3. Create PR with title: "Community contribution: [pattern name]"`);
    console.log(`\nFiles to contribute:`);
    files.forEach(f => console.log(`  - ${f}`));
  }

  /**
   * Helper: Describe problem
   */
  _describeProblem(patternType, findings) {
    const examples = findings.slice(0, 3).map(f => f.description || f.message || f.file);
    return `Common issue detected: ${patternType}\n\nExamples:\n${examples.map(e => `- ${e}`).join('\n')}`;
  }

  /**
   * Helper: Describe pattern
   */
  _describePattern(findings) {
    return `This pattern occurs when:\n- ${findings[0].description || findings[0].message || 'Common anti-pattern detected'}\n\nFrequency: ${findings.length} occurrences`;
  }

  /**
   * Helper: Describe solution
   */
  _describeSolution(patternType, findings) {
    // Pattern-specific solutions
    const solutions = {
      'hardcoded-secrets': 'Use environment variables or parameter store (SSM)',
      'sql-injection': 'Use parameterized queries or ORM',
      'xss': 'Sanitize user input and use templating engines',
      'weak-crypto': 'Use modern crypto libraries (crypto.subtle, bcrypt)'
    };

    return solutions[patternType] || 'Apply best practices from community standards';
  }

  /**
   * Helper: Generate example code
   */
  _generateExample(patternType, findings) {
    const examples = {
      'hardcoded-secrets': `// Bad
const apiKey = 'sk-1234567890';

// Good
const apiKey = process.env.API_KEY;`,
      'sql-injection': `// Bad
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// Good
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);`
    };

    return examples[patternType] || '// Example code here';
  }

  /**
   * Helper: Calculate impact
   */
  _calculateImpact(findings) {
    const severities = findings.map(f => f.severity || 'low');
    const high = severities.filter(s => s === 'high').length;
    const medium = severities.filter(s => s === 'medium').length;

    if (high > 0) return 'High';
    if (medium > 0) return 'Medium';
    return 'Low';
  }

  /**
   * Helper: Sanitize filename
   */
  _sanitizeFilename(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  /**
   * Helper: Format title
   */
  _formatTitle(str) {
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * Helper: Merge standards
   */
  _mergeStandards(existing, newContent) {
    // Simple merge: append new examples
    return `${existing}\n\n---\n## Updated: ${new Date().toISOString()}\n\n${newContent}`;
  }

  /**
   * Helper: Prompt user for input
   */
  _promptUser() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
}

module.exports = StandardsContributor;
