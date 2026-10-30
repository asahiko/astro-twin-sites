#!/usr/bin/env bash
# Deploy one built site to the Sakura rental server without ever exposing a half-copied tree.
#
#   scripts/deploy.sh <brew|beans>
#
# Server layout (paths relative to the remote home directory; <site> is DEPLOY_DIR if set):
#   deploy/<site>/releases/<UTC timestamp>-<git sha>/   one complete upload per deploy
#   deploy/<site>/current -> releases/<id>               swapped atomically after the upload
#   www/<site>            -> ../deploy/<site>/current    document root set in the control panel
#
# The upload goes into a new release directory that nothing serves yet; only after rsync has
# succeeded does `current` get repointed (rename of a symlink, atomic). If anything fails
# before that, the live site is untouched. Older releases are kept for rollback.
#
# Env: DEPLOY_DIR     directory name on the server (default: the site name). A build for a
#                   subdirectory of the initial domain (BREW_URL=https://<host>/<dir>/) must
#                   use the same <dir>, since www/<dir> is what the initial domain serves there.
#      DEPLOY_REMOTE  ssh destination (default "sakura", a Host alias in ~/.ssh/config)
#      KEEP_RELEASES  releases to keep (default 5)
set -euo pipefail
cd "$(dirname "$0")/.."

site="${1:?usage: deploy.sh <brew|beans>}"
dist="sites/$site/dist"
dir="${DEPLOY_DIR:-$site}"
remote="${DEPLOY_REMOTE:-sakura}"
keep="${KEEP_RELEASES:-5}"
release="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"

[[ -f "$dist/index.html" ]] || { echo "No build at $dist; run npm run build first" >&2; exit 1; }

echo "==> $site: uploading release $release to $dir"
ssh "$remote" "mkdir -p deploy/$dir/releases"
# Unchanged files are hard-linked from the live release, so each upload only sends the diff.
rsync -rlptz --delete --link-dest="../../current/" "$dist/" "$remote:deploy/$dir/releases/$release/"

echo "==> $site: switching current -> $release"
# Piped to `sh -s` because the account's login shell may be csh.
ssh "$remote" sh -s -- "$dir" "$release" "$keep" <<'REMOTE'
set -eu
site=$1 release=$2 keep=$3  # $site is the directory name on the server
cd "$HOME/deploy/$site"

# Keep anything the server itself placed in the docroot (e.g. certificate challenges).
if [ -d current/.well-known ] && [ ! -e "releases/$release/.well-known" ]; then
  cp -Rp current/.well-known "releases/$release/"
fi

rm -f current.tmp  # left behind by an interrupted deploy
ln -s "releases/$release" current.tmp
# GNU mv has -T; BSD mv (FreeBSD) uses -h to replace the symlink rather than follow it.
mv -T current.tmp current 2>/dev/null || mv -fh current.tmp current

# First deploy: make the docroot a symlink to current, moving any panel-created folder aside.
www="$HOME/www/$site"
if [ ! -L "$www" ]; then
  if [ -e "$www" ]; then
    mv "$www" "$HOME/deploy/$site/docroot-before-symlink.$(date +%s)"
  fi
  mkdir -p "$HOME/www"
  ln -s "../deploy/$site/current" "$www"
fi

# Prune old releases (newest first; the live one is always the newest).
ls -1d releases/*/ | sort -r | tail -n +"$((keep + 1))" | while read -r old; do rm -rf "$old"; done
echo "live: $(readlink current)"
REMOTE
