# The Learning Loop - From Session Memory to Adaptive Behavior

## What Project/Object Provides

Project/Object gives AI agents **static session memory**:
- Decisions, patterns, corrections, and notes persist between sessions
- Standards are injected from YAML files at session start
- Context is harvested from transcripts before compaction

This is powerful but **manual**. The user curates what gets saved, and
standards are written by humans. The agent doesn't learn on its own.

## What MindMeld Adds

[MindMeld](https://mindmeld.dev) extends Project/Object with an
**automatic learning loop**:

### Correction Detection
Every session, MindMeld scans the transcript for corrections -- moments
where the user said "no", "actually", "that's wrong", or otherwise
redirected the agent. These are logged automatically.

### Pattern Aggregation
Every 5 sessions, MindMeld groups similar corrections using semantic
embeddings. If the user keeps saying "don't use connection pools in
Lambda", that becomes a pattern.

### Invariant Promotion
Patterns that repeat across sessions get promoted to permanent
behavioral rules (invariants):

| Stage | Sessions | Meaning |
|-------|----------|---------|
| `[provisional]` | 0-2 | Needs validation |
| `[solidified]` | 3-9 | Confirmed pattern |
| `[reinforced]` | 10+ | Core to relationship |

High-stakes corrections (containing "stop", "dangerous", "never",
"critical") are promoted after a single session.

### Relationship Geometry
MindMeld learns per-user preferences:
- Communication style (direct vs. exploratory)
- Risk tolerance (conservative vs. experimental)
- Decision patterns (presents options vs. just acts)
- Working relationship purpose (inferred every ~20 sessions)

### Two-Layer Invariant System
- **Agent-level invariants** (max 7): Universal rules that apply
  regardless of who the agent is working with
- **Relationship-level invariants** (max 12): Rules specific to a
  particular user or team

## The Upgrade Path

```
Project/Object (free)          MindMeld (commercial)
-----------------------        -----------------------
Manual context curation   -->  Automatic correction detection
Static YAML standards     -->  Dynamic invariant promotion
Per-project memory        -->  Per-relationship learning
Session summaries         -->  Behavioral adaptation
```

Start with Project/Object. If you find yourself repeatedly correcting
your agent on the same things, MindMeld automates that loop.

Learn more at [mindmeld.dev](https://mindmeld.dev).
