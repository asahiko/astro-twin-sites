#!/usr/bin/env bash
# Point a site back at an earlier release.
#
#   scripts/rollback.sh <brew|beans>             # list releases
#   scripts/rollback.sh <brew|beans> <release>   # make <release> live
#   scripts/rollback.sh <brew|beans> previous    # the release before the live one
#
# Env: DEPLOY_DIR  directory name on the server, if the deploy used one (default: the site name)
set -euo pipefail
site="${1:?usage: rollback.sh <brew|beans> [release|previous]}"
target="${2:-}"
remote="${DEPLOY_REMOTE:-sakura}"

ssh "$remote" sh -s -- "${DEPLOY_DIR:-$site}" "$target" <<'REMOTE'
set -eu
site=$1 target=${2:-}  # an empty argument does not survive ssh
cd "$HOME/deploy/$site"
live=$(basename "$(readlink current)")
if [ -z "$target" ]; then
  for r in $(ls -1 releases | sort -r); do
    [ "$r" = "$live" ] && echo "* $r (live)" || echo "  $r"
  done
  exit 0
fi
if [ "$target" = previous ]; then
  target=$(ls -1 releases | sort -r | awk -v live="$live" 'found { print; exit } $0 == live { found = 1 }')
  [ -n "$target" ] || { echo "No release older than $live" >&2; exit 1; }
fi
[ -d "releases/$target" ] || { echo "No such release: $target" >&2; exit 1; }
rm -f current.tmp
ln -s "releases/$target" current.tmp
mv -T current.tmp current 2>/dev/null || mv -fh current.tmp current
echo "live: $(readlink current) (was $live)"
REMOTE
