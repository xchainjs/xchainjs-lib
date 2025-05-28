#!/usr/bin/env bash

# Cross-platform wrapper to run trunk checks in CI or locally

set -euo pipefail

# Default trunk flags
FLAGS="-j8 --ci"

# Define your upstream branch (develop, main, etc.)
UPSTREAM_BRANCH="master"

# Normalize Git paths for all platforms (no color, no paging)
GIT_DIFF="git diff --no-color --no-pager"

# Detect current local branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Detected current Git branch: $CURRENT_BRANCH"

# Determine if we're running in a pull/merge request context or just on a branch
if [ "$CURRENT_BRANCH" != "$UPSTREAM_BRANCH" ]; then
  echo "Running on non-upstream branch: $CURRENT_BRANCH"

  # If config or lockfile changed, run full check
  if ! $GIT_DIFF --exit-code origin/$UPSTREAM_BRANCH -- .trunk/ package.json yarn.lock >/dev/null 2>&1; then
    FLAGS="$FLAGS --all"
  # If a trunk-ignore was added, run full check
  elif $GIT_DIFF --unified=0 --no-prefix origin/$UPSTREAM_BRANCH | sed '/^@@/d' | grep -q 'trunk-ignore'; then
    FLAGS="$FLAGS --all"
  else
    FLAGS="$FLAGS --upstream origin/$UPSTREAM_BRANCH"
  fi
else
  echo "Running on upstream branch: $CURRENT_BRANCH. Running full check."
  FLAGS="$FLAGS --all"
fi

# Run trunk check
echo "▶ Running: trunk check $FLAGS"
# shellcheck disable=SC2086
trunk check $FLAGS
