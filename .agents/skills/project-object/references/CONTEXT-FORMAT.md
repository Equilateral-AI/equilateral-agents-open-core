# Context File Format Reference

Project/Object stores context as plain markdown at:
```
~/.project-object/{project-name}/context.md
```

## Template

```markdown
# Project Context: {project-name}

## Decisions
- Key architectural and tooling choices
- Each item is one line, starting with "- "
- Most important decisions first

## Patterns
- Coding conventions and recurring practices
- File organization rules
- Naming conventions

## Corrections
- Past mistakes to avoid repeating
- Clarifications about project specifics
- Common misunderstandings

## Notes
- General project knowledge
- Environment details
- Useful commands or workflows
```

## Guidelines

- **Max 200 lines**: If context grows beyond this, prune low-value items
- **One fact per bullet**: Keep items atomic and scannable
- **Specific over general**: "Deploy with `./ops/deploy.sh prod`" beats "There's a deploy script"
- **Current over historical**: Remove items that no longer apply
- **Human-editable**: The file is plain markdown. Edit it anytime with `project-object edit`

## Project Name Resolution

The project name is determined by:
1. Git remote URL: `git remote get-url origin` -> extract repo name
2. Fallback: `basename` of the current working directory

This means the same context is shared across all clones of the same repo.
