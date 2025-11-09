# Case Studies

Real-world examples of EquilateralAgents in production.

## Featured Case Studies

### [HoneyDoList.vip: Production SaaS in 38-40 Hours](HONEYDOLIST_CASE_STUDY.md)

From vacation prototype to production SaaS platform with:
- 51 Lambda functions deployed
- 93 standards created from lessons learned
- COPPA compliance, Stripe integration
- Sub-200ms API responses
- Live at: https://honeydolist.vip

**Key metrics:**
- Timeline: 2.5 months calendar time
- Active work: 38-40 hours
- Cost: $60 in AI costs
- Efficiency: 30-50x vs traditional development

### [Agent Orchestration Framework](AGENT_ORCHESTRATION_GUARDRAILS.md)

Post-mortem examining when AI should freestyle vs. follow orchestration:

- **Freestyling Index (FI)** - Violation severity after coding (0.0-1.0)
- **Freestyle Decision Index (FDI)** - Safety score before coding (0-10)
- Real data: 60% good freestyles, 40% bad freestyles
- Framework for calibrating AI autonomy over time

**Key insight:** "38-40 hours to production" included BOTH freestyle and orchestration. Neither alone would have worked.

---

[Back to Main README](../README.md)
