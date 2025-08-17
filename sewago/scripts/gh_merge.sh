#!/usr/bin/env bash
set -euo pipefail
OWNER=${OWNER:-ojaydev11}
REPO=${REPO:-sewago-final}
TOKEN=${GH_TOKEN:-${GITHUB_TOKEN:-}}
if [ -z "${TOKEN}" ]; then echo "ERROR: GH_TOKEN missing" >&2; exit 1; fi
api() { curl -sS -H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github+json" "$@"; }
json_eval(){ node -e "let d='';process.stdin.on('data',x=>d+=x).on('end',()=>{try{let j=JSON.parse(d);console.log(eval(process.argv[1])||'');}catch(e){console.log('');}})" "$1"; }
get_pr(){ local br="$1"; api "https://api.github.com/repos/${OWNER}/${REPO}/pulls?head=${OWNER}:${br}&state=open" | json_eval "Array.isArray(j)&&j[0]?j[0].number:''"; }
create_pr(){ local br="$1"; local title="$2"; local body="$3"; api -X POST -H "Content-Type: application/json" -d "$(node -e 'console.log(JSON.stringify({title:process.argv[1],head:process.argv[2],base:"main",body:process.argv[3]}))' "${title}" "${br}" "${body}")" "https://api.github.com/repos/${OWNER}/${REPO}/pulls"; }
merge_pr(){ local num="$1"; api -X PUT -H "Content-Type: application/json" -d '{"merge_method":"squash"}' "https://api.github.com/repos/${OWNER}/${REPO}/pulls/${num}/merge"; }
add_labels(){ local num="$1"; api -X POST -H "Content-Type: application/json" -d '{"labels":["infra","stability"]}' "https://api.github.com/repos/${OWNER}/${REPO}/issues/${num}/labels" >/dev/null || true; }
process_branch(){ local br="$1"; local title="$2"; local body="$3"; echo "Processing ${br}"; local pr; pr=$(get_pr "${br}"); if [ -z "${pr}" ]; then echo "Creating PR for ${br}"; local res; res=$(create_pr "${br}" "${title}" "${body}"); pr=$(printf "%s" "$res" | json_eval "j.number"); [ -z "$pr" ] && { echo "ERROR: failed to create PR for ${br}"; echo "$res"; return 2; }; add_labels "$pr"; fi; local m; m=$(merge_pr "$pr"); local merged sha msg; merged=$(printf "%s" "$m" | json_eval "j.merged"); sha=$(printf "%s" "$m" | json_eval "j.sha"); msg=$(printf "%s" "$m" | json_eval "j.message"); if [ "${merged}" = "true" ] && [ -n "${sha}" ]; then echo "${br} merged: PR #${pr}, SHA ${sha}"; echo "${br}:${pr}:${sha}" >> /tmp/merge_results.txt; return 0; else echo "MERGE BLOCKED for ${br}: ${msg}"; echo "$m"; return 3; fi }
: > /tmp/merge_results.txt
process_branch feat/cursor-run-001 "feat(frontend): proxy /api to backend + add frontend health route" "Proxy /api/:path* to \${NEXT_PUBLIC_API_URL}; keep /api/_frontend/* internal via beforeFiles; add /api-frontend/health; update env.example; remove local /api/health; builds pass." || exit $?
process_branch feat/cursor-run-002 "fix(i18n): next-intl middleware + / and /en routing" "Add src/i18n.ts; update middleware to import it; matcher ['/', '/(en|ne)/:path*']; build passes." || exit $?
process_branch feat/cursor-run-003 "chore(backend): dev/start scripts, health script, PORT=8001 default" "Dev uses tsx watch; add health script; confirm PORT binding; build passes." || exit $?
process_branch feat/cursor-run-004 "docs(backend): Railway deployment guide" "Add backend/deploy/RAILWAY.md; remove Render artifacts; no runtime changes." || exit $?
echo "--- MERGE RESULTS ---"; cat /tmp/merge_results.txt