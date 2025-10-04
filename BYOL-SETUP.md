# Bring Your Own LLM (BYOL) Setup Guide

EquilateralAgents™ works with your existing AI subscriptions. No need for additional AI costs - use what you already have!

## Quick Start

### 1. Choose Your Provider

Create a `.env` file in your project root:

#### OpenAI (GPT-3.5/4)
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4  # Optional: gpt-3.5-turbo, gpt-4, gpt-4-turbo
```

#### Anthropic (Claude)
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229  # Optional: claude-3-haiku, claude-3-sonnet
```

#### GitHub Copilot
```bash
LLM_PROVIDER=copilot
GITHUB_TOKEN=ghp_...
```

#### Local Models (Ollama)
```bash
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama  # or: mistral, llama2, etc.
```

#### Azure OpenAI
```bash
LLM_PROVIDER=azure
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_MODEL=gpt-35-turbo
```

### 2. Install Provider SDK (If Needed)

Some providers require their SDK:

```bash
# For OpenAI
npm install openai

# For Anthropic
npm install @anthropic-ai/sdk

# For Ollama (no SDK needed, uses HTTP)
# Just ensure Ollama is running locally
```

### 3. Test Your Setup

```bash
# Run the AI-enhanced demo
npm run examples/ai-enhanced-workflow.js
```

## Configuration Options

### Per-Agent Configuration

Override global settings for specific agents:

```javascript
const agent = new CodeAnalyzerAgent({
  enableAI: true,
  ai: {
    provider: 'anthropic',  // Use Claude for this agent
    model: 'claude-3-opus-20240229',
    temperature: 0.2,       // More focused responses
    maxTokens: 2000,
    capabilities: [
      'explain_complexity',
      'suggest_refactors',
      'generate_tests'
    ]
  }
});
```

### Workflow-Level Configuration

Different AI providers for different tasks:

```javascript
const orchestrator = new AgentOrchestrator({
  ai: {
    // Use GPT-4 for analysis
    analysis: { provider: 'openai', model: 'gpt-4' },
    // Use Claude for code generation
    generation: { provider: 'anthropic', model: 'claude-3-opus' },
    // Use local model for simple tasks
    basic: { provider: 'ollama', model: 'mistral' }
  }
});
```

## Cost Optimization

### Free Tier Options

1. **Ollama (Completely Free)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh

   # Pull a model
   ollama pull codellama

   # Configure EquilateralAgents
   echo "LLM_PROVIDER=ollama" >> .env
   ```

2. **OpenAI Free Credits**
   - New accounts get $5-18 in credits
   - GPT-3.5-turbo is very cost-effective

3. **Anthropic Claude Free Tier**
   - Limited free usage available
   - Claude Haiku is most economical

### Token Management

Control costs by limiting token usage:

```javascript
const agent = new MyAgent({
  ai: {
    maxTokens: 500,        // Limit response length
    temperature: 0.1,      // More deterministic = fewer retries
    cacheResponses: true   // Avoid duplicate API calls
  }
});
```

## Troubleshooting

### No API Key Error
```
Error: No API key found for provider 'openai'
```
**Solution**: Ensure your `.env` file is in the project root and contains the correct key.

### Rate Limiting
```
Error: Rate limit exceeded
```
**Solution**:
- Add delays between requests
- Use a lower-tier model for development
- Consider local models with Ollama

### Model Not Available
```
Error: Model 'gpt-4' not available
```
**Solution**:
- Check your API tier/permissions
- Fall back to gpt-3.5-turbo
- Verify model name spelling

## Provider Comparison

| Provider | Best For | Cost | Speed | Quality |
|----------|----------|------|--------|---------|
| OpenAI GPT-4 | Complex reasoning | $$$ | Medium | Excellent |
| OpenAI GPT-3.5 | General tasks | $ | Fast | Good |
| Claude Opus | Long context tasks | $$$ | Slow | Excellent |
| Claude Sonnet | Balanced performance | $$ | Fast | Excellent |
| Claude Haiku | Simple/fast tasks | $ | Very Fast | Good |
| Ollama | Local/free | Free | Varies | Good |
| Copilot | Code completion | $$ | Fast | Good |

## Security Best Practices

1. **Never commit API keys**
   ```bash
   # Add to .gitignore
   .env
   *.key
   ```

2. **Use environment variables**
   ```javascript
   // Good
   const key = process.env.OPENAI_API_KEY;

   // Bad
   const key = "sk-abc123...";
   ```

3. **Rotate keys regularly**
   - Set calendar reminders
   - Use different keys for dev/prod

4. **Monitor usage**
   - Set up billing alerts
   - Review API dashboard regularly

## Advanced Patterns

### Fallback Chains
```javascript
// Try primary provider, fall back if needed
const providers = [
  { provider: 'openai', model: 'gpt-4' },
  { provider: 'anthropic', model: 'claude-3-haiku' },
  { provider: 'ollama', model: 'mistral' }
];
```

### Context Caching
```javascript
// Reuse context across agent calls
const sharedContext = new LLMContext({
  systemPrompt: "You are a code review expert",
  examples: loadExamples(),
  cache: true
});
```

### Streaming Responses
```javascript
// For real-time feedback
const agent = new StreamingAgent({
  ai: {
    stream: true,
    onToken: (token) => process.stdout.write(token)
  }
});
```

## Migration Guide

### From ChatGPT/Claude Web
If you're used to web interfaces:
1. Export your conversations as context
2. Use that context in agent prompts
3. Agents maintain conversation history

### From Copilot
If you have GitHub Copilot:
1. Use your GitHub token
2. Agents will use Copilot's API
3. Same quality, better orchestration

### From Local Scripts
If you have custom scripts:
1. Wrap them in agents
2. Add AI enhancement gradually
3. Keep existing logic intact

## Next Steps

1. **Start Simple**: Try one agent with AI first
2. **Compare Providers**: Test different models for your use case
3. **Optimize Costs**: Monitor usage, adjust parameters
4. **Build Custom Agents**: Extend with your own AI logic

## Commercial Alternative

Don't want to manage API keys and providers?

**EquilateralAgents Commercial Edition** includes:
- ✨ Embedded AI - no configuration needed
- ✨ Automatic model selection
- ✨ Cost optimization built-in
- ✨ No rate limits for your team

Learn more: [equilateral.ai/commercial](https://equilateral.ai/commercial)