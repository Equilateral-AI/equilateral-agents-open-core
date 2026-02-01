/**
 * EquilateralAgents™ Standards Loader - Open Core Edition
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * EquilateralAgents™ is a trademark of HappyHippo.ai
 *
 * Loads YAML standards from a three-layer directory hierarchy:
 *   1. .standards/yaml/       (Open Standards submodule)
 *   2. .standards-community/  (Community Standards submodule)
 *   3. .standards-local/      (Project-specific standards)
 *
 * Later directories take precedence when standards share the same id.
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class StandardsLoader {
    /**
     * @param {Object} config
     * @param {string} [config.projectRoot] - Root directory of the project (defaults to cwd)
     * @param {string[]} [config.standardsDirs] - Override the default three-layer directory list
     */
    constructor(config = {}) {
        this.projectRoot = config.projectRoot || process.cwd();

        this.standardsDirs = config.standardsDirs || [
            path.join(this.projectRoot, '.standards', 'yaml'),
            path.join(this.projectRoot, '.standards-community'),
            path.join(this.projectRoot, '.standards-local')
        ];

        /** @type {Map<string, Object>} */
        this._cache = new Map();

        /** @type {boolean} */
        this._cacheLoaded = false;

        /**
         * Agent type to relevant tags mapping.
         * Used by getRulesForAgent() to filter standards.
         * @private
         */
        this._agentTagMap = {
            SecurityReviewerAgent: ['security', 'authentication', 'authorization', 'input-validation'],
            SecurityScannerAgent: ['security', 'credential-scanning', 'vulnerability'],
            AuditorAgent: ['core', 'code-quality', 'error-handling', 'maintainability'],
            CodeReviewAgent: ['core', 'code-quality', 'error-handling', 'api-design']
        };
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Load all standards from every configured directory.
     * Standards loaded from later directories override earlier ones when ids collide.
     *
     * @returns {Promise<Object[]>} Array of parsed standard objects
     */
    async loadAll() {
        await this._ensureCache();
        return Array.from(this._cache.values());
    }

    /**
     * Load a single standard by its `id` field.
     *
     * @param {string} id - The standard id to look up
     * @returns {Promise<Object|null>} The standard object, or null if not found
     */
    async loadStandard(id) {
        await this._ensureCache();
        return this._cache.get(id) || null;
    }

    /**
     * Load all standards that match a given category.
     *
     * @param {string} category
     * @returns {Promise<Object[]>}
     */
    async loadByCategory(category) {
        await this._ensureCache();
        const results = [];
        for (const standard of this._cache.values()) {
            if (standard.category === category) {
                results.push(standard);
            }
        }
        return results;
    }

    /**
     * Load standards that have ANY of the given tags.
     *
     * @param {string[]} tags
     * @returns {Promise<Object[]>}
     */
    async loadByTags(tags) {
        await this._ensureCache();

        if (!Array.isArray(tags) || tags.length === 0) {
            return [];
        }

        const tagSet = new Set(tags);
        const results = [];

        for (const standard of this._cache.values()) {
            const standardTags = standard.tags;
            if (Array.isArray(standardTags) && standardTags.some(t => tagSet.has(t))) {
                results.push(standard);
            }
        }

        return results;
    }

    /**
     * Load all rules across every standard that use a specific action
     * (e.g., 'NEVER', 'ALWAYS', 'USE', 'PREFER', 'AVOID').
     *
     * Returns an array of rule objects, each augmented with a `_standardId`
     * field so callers know which standard the rule came from.
     *
     * @param {string} action - The action to filter by (case-insensitive)
     * @returns {Promise<Object[]>}
     */
    async loadByAction(action) {
        await this._ensureCache();

        const normalizedAction = action.toUpperCase();
        const results = [];

        for (const standard of this._cache.values()) {
            if (!Array.isArray(standard.rules)) {
                continue;
            }
            for (const rule of standard.rules) {
                if (rule.action && rule.action.toUpperCase() === normalizedAction) {
                    results.push({
                        ...rule,
                        _standardId: standard.id
                    });
                }
            }
        }

        return results;
    }

    /**
     * Convenience method: given an agent type string, return the standards
     * that are relevant to that agent based on a pre-defined tag mapping.
     *
     * Supported agent types:
     *   - SecurityReviewerAgent
     *   - SecurityScannerAgent
     *   - AuditorAgent
     *   - CodeReviewAgent
     *
     * @param {string} agentType
     * @returns {Promise<Object[]>}
     */
    getRulesForAgent(agentType) {
        const relevantTags = this._agentTagMap[agentType];
        if (!relevantTags) {
            console.warn(`[StandardsLoader] Unknown agent type: ${agentType}. Returning empty array.`);
            return Promise.resolve([]);
        }
        return this.loadByTags(relevantTags);
    }

    // -----------------------------------------------------------------------
    // Cache management
    // -----------------------------------------------------------------------

    /**
     * Populate the internal cache if it hasn't been loaded yet.
     * @private
     */
    async _ensureCache() {
        if (this._cacheLoaded) {
            return;
        }

        for (const dir of this.standardsDirs) {
            const files = await this._scanDirectory(dir);
            for (const filePath of files) {
                const standard = await this._parseStandardFile(filePath);
                if (standard && standard.id) {
                    // Later directories override earlier ones (last-write-wins by id)
                    this._cache.set(standard.id, standard);
                }
            }
        }

        this._cacheLoaded = true;
    }

    // -----------------------------------------------------------------------
    // File scanning & parsing
    // -----------------------------------------------------------------------

    /**
     * Recursively find all .yaml and .yml files in a directory.
     *
     * @param {string} dir - Absolute path to directory
     * @returns {Promise<string[]>} Sorted list of absolute file paths
     * @private
     */
    async _scanDirectory(dir) {
        const results = [];

        try {
            await fs.access(dir);
        } catch {
            console.warn(`[StandardsLoader] Standards directory does not exist: ${dir}`);
            return results;
        }

        await this._walkDirectory(dir, results);

        // Sort for deterministic load order within a single directory
        results.sort();
        return results;
    }

    /**
     * Recursive directory walker.
     *
     * @param {string} dir
     * @param {string[]} accumulator
     * @private
     */
    async _walkDirectory(dir, accumulator) {
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch (err) {
            console.warn(`[StandardsLoader] Unable to read directory ${dir}: ${err.message}`);
            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip hidden directories
                if (entry.name.startsWith('.')) {
                    continue;
                }
                await this._walkDirectory(fullPath, accumulator);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === '.yaml' || ext === '.yml') {
                    accumulator.push(fullPath);
                }
            }
        }
    }

    /**
     * Read and parse a single YAML standard file.
     * Returns null on any error (graceful degradation).
     *
     * @param {string} filePath
     * @returns {Promise<Object|null>}
     * @private
     */
    async _parseStandardFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = yaml.load(content);

            if (!parsed || typeof parsed !== 'object') {
                console.warn(`[StandardsLoader] Empty or non-object YAML in ${filePath}`);
                return null;
            }

            if (!parsed.id) {
                console.warn(`[StandardsLoader] Missing required 'id' field in ${filePath}`);
                return null;
            }

            // Attach source metadata
            parsed._source = filePath;

            return parsed;
        } catch (err) {
            console.warn(`[StandardsLoader] Failed to parse ${filePath}: ${err.message}`);
            return null;
        }
    }
}

module.exports = StandardsLoader;
