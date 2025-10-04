# Security Policy

## Privilege Scope

**EquilateralAgents runs with the same privileges as your user account.**

Agents have access to:
- All files readable/writable by your user
- Environment variables (including API keys)
- Network access
- Shell command execution
- System resources (CPU, memory, disk)

## Security Best Practices

### API Key Management
```bash
# Use separate keys for development
OPENAI_API_KEY=sk-dev-...  # Development key
OPENAI_API_KEY=sk-prod-... # Production key (separate environment)

# Rotate keys regularly
# Set spending limits in provider dashboards
# Never commit .env files
```

### Isolation Strategies

**Docker (Recommended for untrusted workflows):**
```bash
docker run -v $(pwd):/app -w /app node:18 npm start
```

**Separate User Account:**
```bash
# Create limited user for agent execution
sudo useradd -m -s /bin/bash agentuser
sudo su - agentuser
```

**File Permissions:**
```bash
# Restrict sensitive files
chmod 600 .env
chmod 700 .equilateral/
```

### Monitor Agent Activity

Agent logs are stored in `.equilateral/`:
```bash
# Review workflow history
cat .equilateral/workflow-history.json

# Check database activity (if using SQLite)
sqlite3 .equilateral/orchestration.db "SELECT * FROM events ORDER BY created_at DESC LIMIT 10"
```

### Review Agent Code

Before running new agents:
```bash
# Inspect agent implementation
cat agent-packs/security/SecurityScannerAgent.js

# Check for suspicious patterns
grep -r "exec\|eval\|child_process" agent-packs/
```

## Reporting Vulnerabilities

Found a security issue? Please report responsibly:

**Email:** info@happyhippo.ai

**Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

**Do not:**
- Open public GitHub issues for security vulnerabilities
- Exploit vulnerabilities in production systems

**Response time:**
- Initial response: 48 hours
- Status update: 7 days
- Fix timeline: Varies by severity

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅        |
| < 1.0   | ❌        |

## Known Limitations

**SQLite Database:**
- Not encrypted at rest
- Use disk encryption for sensitive data
- Consider PostgreSQL for production

**Environment Variables:**
- Visible to all processes run by your user
- Use secret management tools for production (Vault, AWS Secrets Manager)

**Agent Code Execution:**
- Agents execute JavaScript with full Node.js capabilities
- Review third-party agents before use
- Enterprise edition includes sandboxing (contact info@happyhippo.ai)

## Security Updates

Security fixes are released as patch versions (e.g., 1.0.1 → 1.0.2).

Subscribe to updates:
- Watch this repository for releases
- Check [CHANGELOG.md](CHANGELOG.md) for security notes
- Follow [@happyhippo-ai](https://github.com/happyhippo-ai)

## License

This security policy is part of the EquilateralAgents Open Core project, licensed under MIT.
