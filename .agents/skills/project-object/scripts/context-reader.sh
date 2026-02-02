#!/bin/bash
# Context Reader - Zero-dependency bash script
# Reads the project-object context file for the current project.
# Outputs context to stdout. Exits 0 with no output if not found.

# Determine project name
PROJECT_NAME=""
if command -v git &>/dev/null && git rev-parse --is-inside-work-tree &>/dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    if [ -n "$REMOTE_URL" ]; then
        PROJECT_NAME=$(basename "$REMOTE_URL" .git)
    fi
fi

if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME=$(basename "$(pwd)")
fi

# Read context file
CONTEXT_FILE="$HOME/.project-object/$PROJECT_NAME/context.md"

if [ -f "$CONTEXT_FILE" ]; then
    cat "$CONTEXT_FILE"
fi
