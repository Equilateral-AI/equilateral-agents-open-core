# Bring Your Own License (BYOL) Terms

EquilateralAgents™ Open Core is designed with a **Bring Your Own License (BYOL)** model for third-party services. This means **you are responsible** for providing your own API keys, credentials, and compliance with third-party services.

## 🔑 Required User-Provided Services

### Large Language Models (LLM)
**You must provide:**
- Your own LLM API keys (OpenAI, Anthropic Claude, etc.)
- IDE integration tools (GitHub Copilot, Cursor, CodeWhisperer, etc.)
- Compliance with LLM provider terms of service
- Payment for all LLM API usage costs

**We provide:**
- Integration framework and intelligent model routing
- IDE plugin compatibility layer
- Open source orchestration software only

**Configuration Options:**
```bash
# Option 1: Direct LLM API access
export LLM_API_KEY=your_openai_or_anthropic_key
export LLM_PROVIDER=openai  # or anthropic, etc.
export LLM_MODEL=gpt-4      # or claude-3-sonnet, etc.

# Option 2: IDE integration (uses your existing subscriptions)
export IDE_PROVIDER=github_copilot  # or cursor, codewhisperer, etc.
export IDE_INTEGRATION=true
export GITHUB_TOKEN=your_github_token  # for Copilot integration
```

### AWS Cloud Services
**You must provide:**
- Your own AWS account and credentials
- Payment for all AWS service costs (Lambda, S3, CloudFormation, etc.)
- Compliance with AWS terms of service
- AWS resource management and security

**We provide:**
- CloudFormation templates and deployment automation
- Cost analysis tools and optimization recommendations

**Configuration:**
```bash
# Set your own AWS credentials
export AWS_ACCESS_KEY_ID=your_aws_access_key
export AWS_SECRET_ACCESS_KEY=your_aws_secret_key
export AWS_REGION=us-east-1
```

### Security Services (Optional)
**You may provide:**
- NVD API key for enhanced vulnerability data
- Snyk token for advanced dependency scanning
- Other security service API keys

**We provide:**
- Basic security scanning with open-source patterns
- Integration framework for enhanced services

**Configuration:**
```bash
# Optional: Enhanced security scanning
export NVD_API_KEY=your_nvd_api_key
export SNYK_TOKEN=your_snyk_token
```

### IDE Integration Services (Optional)
**You may provide:**
- GitHub Copilot subscription and access token
- Cursor Pro subscription
- Amazon CodeWhisperer credentials
- JetBrains AI Assistant subscription
- Other IDE AI coding assistants

**We provide:**
- IDE plugin compatibility framework
- Agent-to-IDE communication layer
- Integration with existing developer workflows

**Configuration:**
```bash
# Optional: IDE integrations (leverage existing subscriptions)
export GITHUB_COPILOT_TOKEN=your_github_token
export CURSOR_API_KEY=your_cursor_api_key  
export CODEWHISPERER_PROFILE=your_aws_profile
export JETBRAINS_AI_TOKEN=your_jetbrains_token
```

## ⚖️ Legal Responsibilities

### Your Responsibilities
- **API Costs**: You pay all third-party API and service costs
- **IDE Subscriptions**: You maintain your own IDE AI assistant subscriptions
- **Compliance**: You ensure compliance with all third-party terms of service
- **Security**: You manage security of your own credentials and data
- **Usage Monitoring**: You monitor and control your own service usage
- **Data Protection**: You ensure appropriate data handling per your requirements

### Our Responsibilities
- **Open Source Software**: We provide MIT-licensed orchestration software
- **Documentation**: We provide setup and usage documentation
- **Bug Fixes**: We maintain the open source codebase
- **Community Support**: We provide community support via GitHub Issues

### What We Don't Provide
- ❌ LLM API access or keys
- ❌ IDE AI assistant subscriptions (Copilot, Cursor, etc.)
- ❌ AWS accounts or credits  
- ❌ Payment for third-party services
- ❌ Compliance guarantees for third-party services
- ❌ Data processing or storage services
- ❌ SLA guarantees for third-party integrations

## 💼 Commercial Tier Differences

### Open Core (Free)
- BYOL model for all services
- Community support only

## 🛡️ Risk Disclaimers

### Service Availability
- Third-party services may be unavailable or rate-limited
- We cannot guarantee availability of services you don't control
- Your usage may be subject to third-party rate limits and quotas

### Cost Management
- Third-party service costs can accumulate quickly
- You are responsible for monitoring and controlling costs
- We recommend setting up billing alerts and usage limits

### Security and Compliance
- You are responsible for securing your own credentials
- Compliance with regulations (GDPR, HIPAA, etc.) is your responsibility
- We recommend reviewing all third-party service compliance documentation

### Data Processing
- Your data will be processed by third-party services under your agreements
- We do not store, process, or have access to your data
- Data residency and processing locations depend on your service selections

## 📞 Getting Help

### Open Source Support
- **GitHub Issues**: Community support and bug reports
- **Documentation**: Complete setup and usage guides
- **Examples**: Working examples and tutorials

### Commercial Support
- **Sales**: info@happyhippo.ai - Questions about commercial tiers
- **Technical**: info@happyhippo.ai - Technical support
- **Legal**: info@happyhippo.ai - Licensing and compliance questions

### Migration to Commercial
Ready to eliminate BYOL complexity?
- **Professional Tier**: Managed LLM access, no more API key management
- **Enterprise Tier**: Fully managed services with SLA guarantees
- **Custom**: White-glove setup and management for large organizations

---

**By using EquilateralAgents™ Open Core, you acknowledge that you understand and accept the BYOL model and your responsibilities for third-party service costs, compliance, and management.**