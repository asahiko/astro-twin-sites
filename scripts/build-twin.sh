#!/usr/bin/env bash
# Build both sites so that each one shows the other's *current* headlines.
#
# Each site reads its twin's RSS feed at build time. Building them one after the other
# against the live sites would leave the first one a deploy behind, so instead:
#   1. brew  — no sibling headlines; only needed to produce brew's fresh feed
#   2. beans — reads brew's feed from sites/brew/dist
#   3. brew  — rebuilt, reads beans' feed from sites/beans/dist
set -euo pipefail
cd "$(dirname "$0")/.."

SIBLING_FEED_SOURCE="" npm run build -w sites/brew
SIBLING_FEED_SOURCE="$PWD/sites/brew/dist" npm run build -w sites/beans
SIBLING_FEED_SOURCE="$PWD/sites/beans/dist" npm run build -w sites/brew
