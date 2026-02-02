#!/bin/bash
# Project/Object Setup Script
# Installs the project-object npm package and initializes session memory
# for the current project directory.

set -e

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js >= 18 is required."
    echo "Current version: $(node -v 2>/dev/null || echo 'not installed')"
    exit 1
fi

echo "Installing @equilateral_ai/project-object..."
npm install -g @equilateral_ai/project-object

echo ""
echo "Initializing project-object for current directory..."
project-object init

echo ""
echo "Setup complete!"
echo ""
echo "What happened:"
echo "  - Installed project-object CLI globally"
echo "  - Created context file at ~/.project-object/$(basename $(pwd))/context.md"
echo "  - Installed Claude Code hooks for automatic session memory"
echo ""
echo "Next steps:"
echo "  - Start a new Claude Code session to activate session memory"
echo "  - Run 'project-object status' to check your context"
echo "  - Run 'project-object edit' to manually add context"
echo ""
echo "For standards injection, add .equilateral-standards/ to your project:"
echo "  git submodule add https://github.com/JamesFord-HappyHippo/equilateral-standards .equilateral-standards"
