# Methodology Guides

Complete v2.5.0 methodology for building institutional knowledge through standards.

## The Three Guides

### [BUILDING_YOUR_STANDARDS.md](BUILDING_YOUR_STANDARDS.md)
**Week 1 → Year 3 roadmap for building your standards library**

- When to create vs wait ("3 times rule")
- Measuring ROI (prevented incidents, time saved, cost avoided)
- Automation options (DIY librarian agent)
- Graduation path (local → community → universal standards)

**Time investment:** 15-30 minutes/week for knowledge harvest
**Payoff:** 30-50 standards by year 1, 80%+ incident reduction

---

### [PAIN_TO_PATTERN.md](PAIN_TO_PATTERN.md)
**"What Happened, The Cost, The Rule" formula for every standard**

- Real Incident + Cost Analysis + Root Cause → Standard
- Incident capture templates (timeline, impact, root cause)
- Cost quantification (time, money, trust)
- Pattern extraction (anti-pattern → correct pattern → general rule)
- Enforcement strategies (CLAUDE.md, pre-commit hooks, CI/CD)

**Key insight:** Every standard tells a story. The cost makes it memorable. The rule prevents recurrence.

---

### [KNOWLEDGE_HARVEST.md](KNOWLEDGE_HARVEST.md)
**Daily/weekly harvest process for extracting patterns from agent memory**

- Data sources: Agent memory files, todo lists, workflow history
- Pattern identification: What failed 3+ times? What worked 85%+ of the time?
- Documentation workflow: From pattern to standard
- Manual vs automated approaches (librarian agent in commercial)

**Key insight:** Agents track everything. You synthesize the lessons. Weekly harvest becomes routine.

---

## Quick Start

1. Run your first workflows:
   ```bash
   npm run workflow:security
   npm run workflow:quality
   ```

2. Review what agents found:
   ```bash
   cat .equilateral/workflow-history.json
   ```

3. Create your first standard using the "What Happened, The Cost, The Rule" format from PAIN_TO_PATTERN.md

4. Add to `.standards-local/` and reference in `.claude/CLAUDE.md`

---

[Back to Main README](../../README.md)
