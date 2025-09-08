/**
 * EquilateralAgents™ Database Manager
 * 
 * Handles database connections for both SQLite (open core) and PostgreSQL (commercial)
 * Open core uses SQLite with limitations to encourage commercial upgrade
 */

const fs = require('fs');
const path = require('path');

class DatabaseManager {
    constructor(config = {}) {
        this.config = {
            type: config.databaseType || process.env.DATABASE_TYPE || 'sqlite',
            sqliteFile: config.sqliteFile || process.env.SQLITE_FILE || './data/equilateral-agents.db',
            postgresUrl: config.postgresUrl || process.env.DATABASE_URL,
            autoMigrate: config.autoMigrate !== false,
            ...config
        };

        this.db = null;
        this.isCommercial = this.config.type === 'postgresql';
    }

    /**
     * Initialize database connection based on configuration
     */
    async initialize() {
        if (this.config.type === 'sqlite') {
            await this.initializeSQLite();
        } else if (this.config.type === 'postgresql') {
            await this.initializePostgreSQL();
        } else {
            throw new Error(`Unsupported database type: ${this.config.type}`);
        }

        if (this.config.autoMigrate) {
            await this.runMigrations();
        }

        console.log(`Database initialized: ${this.config.type}`);
        this.logDatabaseCapabilities();
    }

    /**
     * Initialize SQLite for open core
     */
    async initializeSQLite() {
        const sqlite3 = require('sqlite3').verbose();
        const { open } = require('sqlite');

        // Ensure data directory exists
        const dataDir = path.dirname(this.config.sqliteFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = await open({
            filename: this.config.sqliteFile,
            driver: sqlite3.Database
        });

        // Enable foreign keys and WAL mode for better performance
        await this.db.exec('PRAGMA foreign_keys = ON');
        await this.db.exec('PRAGMA journal_mode = WAL');
        
        console.log(`SQLite database initialized: ${this.config.sqliteFile}`);
        this.showSQLiteLimitations();
    }

    /**
     * Initialize PostgreSQL for commercial tiers
     */
    async initializePostgreSQL() {
        const { Pool } = require('pg');
        
        if (!this.config.postgresUrl) {
            throw new Error('PostgreSQL connection string required for commercial tiers. Set DATABASE_URL environment variable.');
        }

        this.db = new Pool({
            connectionString: this.config.postgresUrl,
            // Commercial-grade connection pooling
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test connection
        const client = await this.db.connect();
        await client.query('SELECT 1');
        client.release();

        console.log('PostgreSQL database initialized for commercial tier');
    }

    /**
     * Run database migrations
     */
    async runMigrations() {
        try {
            if (this.config.type === 'sqlite') {
                const schemaPath = path.join(__dirname, 'database', 'sqlite-schema.sql');
                const schema = fs.readFileSync(schemaPath, 'utf8');
                await this.db.exec(schema);
                console.log('SQLite schema migrations completed');
            } else if (this.config.type === 'postgresql') {
                const schemaPath = path.join(__dirname, 'database', 'schema.sql');
                const schema = fs.readFileSync(schemaPath, 'utf8');
                const client = await this.db.connect();
                await client.query(schema);
                client.release();
                console.log('PostgreSQL schema migrations completed');
            }
        } catch (error) {
            console.error('Migration failed:', error.message);
            throw error;
        }
    }

    /**
     * Execute query with database-specific handling
     */
    async query(sql, params = []) {
        try {
            if (this.config.type === 'sqlite') {
                if (sql.toLowerCase().includes('select')) {
                    return await this.db.all(sql, params);
                } else {
                    const result = await this.db.run(sql, params);
                    return { rows: [], changes: result.changes, lastID: result.lastID };
                }
            } else {
                const result = await this.db.query(sql, params);
                return result;
            }
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    /**
     * Get database capabilities and limitations
     */
    getDatabaseCapabilities() {
        const capabilities = {
            type: this.config.type,
            multiTenant: this.isCommercial,
            concurrentWrites: this.isCommercial,
            advancedJSON: this.isCommercial,
            customFunctions: this.isCommercial,
            rowLevelSecurity: this.isCommercial,
            scalability: this.isCommercial ? 'high' : 'limited',
            upgradeRecommended: !this.isCommercial
        };

        return capabilities;
    }

    /**
     * Show SQLite limitations to encourage commercial upgrade
     */
    showSQLiteLimitations() {
        console.log('\n📋 SQLite Open Core Limitations:');
        console.log('  • Single tenant only (no multi-tenant isolation)');
        console.log('  • Limited concurrent operations');  
        console.log('  • Basic JSON support (no advanced querying)');
        console.log('  • No custom functions or ML optimization');
        console.log('  • File-based storage (not enterprise scalable)');
        console.log('\n💼 Upgrade to Commercial for:');
        console.log('  • PostgreSQL with full multi-tenant isolation');
        console.log('  • High-performance concurrent agent coordination'); 
        console.log('  • Advanced JSON operations and indexing');
        console.log('  • ML-based dependency resolution');
        console.log('  • Enterprise scalability and reliability');
        console.log('  • Advanced compliance and audit features');
        console.log('\n🚀 Learn more: https://equilateral-agents.com/commercial\n');
    }

    /**
     * Log current database capabilities
     */
    logDatabaseCapabilities() {
        const capabilities = this.getDatabaseCapabilities();
        console.log('Database Capabilities:', {
            type: capabilities.type,
            multiTenant: capabilities.multiTenant,
            scalability: capabilities.scalability,
            commercial: this.isCommercial
        });

        if (capabilities.upgradeRecommended) {
            console.log('💡 Consider upgrading to commercial tiers for production use');
        }
    }

    /**
     * Check if feature is available in current database
     */
    hasFeature(feature) {
        const features = {
            'multi_tenant': this.isCommercial,
            'row_level_security': this.isCommercial,
            'advanced_json': this.isCommercial,
            'custom_functions': this.isCommercial,
            'high_concurrency': this.isCommercial,
            'horizontal_scaling': this.isCommercial
        };

        return features[feature] || false;
    }

    /**
     * Get upgrade information for missing features
     */
    getUpgradeInfo(feature) {
        const upgradeInfo = {
            'multi_tenant': {
                limitation: 'SQLite supports single tenant only',
                solution: 'PostgreSQL with Row Level Security provides perfect tenant isolation',
                tier: 'Professional ($149/month)'
            },
            'high_concurrency': {
                limitation: 'SQLite has writer locks limiting concurrent operations',
                solution: 'PostgreSQL supports high-concurrency multi-agent coordination',
                tier: 'Professional ($149/month)'
            },
            'advanced_json': {
                limitation: 'Limited JSON operations in SQLite',
                solution: 'PostgreSQL JSONB provides advanced querying and indexing',
                tier: 'Professional ($149/month)'
            },
            'horizontal_scaling': {
                limitation: 'File-based SQLite cannot scale horizontally',
                solution: 'Commercial PostgreSQL with clustering and replication',
                tier: 'Enterprise ($499/month)'
            }
        };

        return upgradeInfo[feature] || {
            limitation: 'Feature not available in open core',
            solution: 'Available in commercial tiers with PostgreSQL',
            tier: 'Professional or Enterprise'
        };
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            if (this.config.type === 'sqlite') {
                await this.db.close();
            } else {
                await this.db.end();
            }
            this.db = null;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            if (this.config.type === 'sqlite') {
                await this.db.get('SELECT 1');
            } else {
                const client = await this.db.connect();
                await client.query('SELECT 1');
                client.release();
            }

            return {
                healthy: true,
                database: this.config.type,
                commercial: this.isCommercial,
                capabilities: this.getDatabaseCapabilities()
            };
        } catch (error) {
            return {
                healthy: false,
                database: this.config.type,
                error: error.message
            };
        }
    }
}

module.exports = DatabaseManager;