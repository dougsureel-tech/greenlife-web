#!/bin/bash
# Activate .githooks/* for this clone. Run once per developer machine.
# Idempotent — re-running just resets the config to the same value.
git config core.hooksPath .githooks
echo "✓ git hooks path set to .githooks/ (pre-push gates active)"
