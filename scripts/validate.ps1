# Same checks as validate.mjs, for machines without Node.js. Run from anywhere:
#   pwsh scripts/validate.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
function Fail($message) { Write-Error "FAIL: $message"; exit 1 }

$required = 'README.md', 'COORDINATION.md', 'spec/SOURCE-DOCUMENTS-TODO.md', 'spec/amendment-b-common-simulation-standard.md',
  'spec/body-v2/amendment-b-0.1.0-full-simulation-standard.md', 'spec/body-v2/simulation-harness.md', 'spec/body-v2/submission-contract.md',
  'simulation/README.md', 'contestants/README.md', 'data/status.json', 'site/index.html', 'site/app.js', 'site/styles.css', 'site/README.md'
foreach ($path in $required) { if (-not (Test-Path (Join-Path $root $path))) { Fail "missing $path" } }

$status = Get-Content (Join-Path $root 'data/status.json') -Raw | ConvertFrom-Json
if ($status.schema_version -ne '2.0') { Fail 'schema_version must be 2.0' }
if ($status.phase -ne 'design-sprint') { Fail 'phase must be design-sprint' }
if ($status.sprint.budget_usd -ne 100) { Fail 'budget must be 100' }
if ($status.sprint.demo_day -ne '2026-10-19') { Fail 'demo day must be 2026-10-19' }
if (($status.sprint.mission -join ',') -ne 'Hear,Find,Grab,Return,Speak') { Fail 'mission steps changed' }
$preOrdered = ($status.sprint.pre_ordered | Measure-Object -Property price_usd -Sum).Sum
if ($null -eq $preOrdered) { $preOrdered = 0 }
if ([math]::Round($preOrdered, 2) -ne [math]::Round($status.sprint.pre_ordered_total_usd, 2)) { Fail 'pre_ordered_total_usd does not match the parts' }
if ($preOrdered -gt $status.sprint.budget_usd) { Fail 'pre-ordered parts exceed the budget' }
if (($status.contestants.name -join ',') -ne 'Gemini,Grok,ChatGPT,Claude,Meta AI,Microsoft Copilot') { Fail 'contestant list changed' }
if (($status.contestants.id | Sort-Object -Unique).Count -ne 6) { Fail 'contestant ids must be unique' }
foreach ($c in $status.contestants) {
  if ($c.entry_status -notin 'not_submitted', 'locked', 'late') { Fail "$($c.id): bad entry_status" }
  if ($c.entry_gate -notin 'not_run', 'pass', 'fail') { Fail "$($c.id): bad entry_gate" }
  if ($null -ne $c.score -and ($c.entry_gate -ne 'pass' -or $c.score -lt 0 -or $c.score -gt 100)) { Fail "$($c.id): score needs a passed gate and 0-100" }
  if ($c.entry_status -eq 'not_submitted') { if ($null -ne $c.entry_sha256) { Fail "$($c.id): hash without entry" } }
  elseif ($c.entry_sha256 -notmatch '^[0-9a-fA-F]{64}$') { Fail "$($c.id): locked entry needs a SHA-256" }
}
if (($status.milestones.id | Sort-Object -Unique).Count -ne $status.milestones.Count) { Fail 'milestone ids must be unique' }
foreach ($m in $status.milestones) { if ($m.status -notin 'completed', 'pending') { Fail "milestone $($m.id): bad status" } }

$spec = Get-Content (Join-Path $root $required[3]) -Raw
if ((([regex]::Matches($spec, '(?m)^\| (E\d) \|') | ForEach-Object { $_.Groups[1].Value }) -join ',') -ne 'E1,E2,E3,E4,E5') { Fail 'entry gate must list E1-E5' }
if ((([regex]::Matches($spec, '(?m)^\| (D\d) \|') | ForEach-Object { $_.Groups[1].Value }) -join ',') -ne 'D1,D2,D3,D4,D5,D6') { Fail 'demo checks must list D1-D6' }
$v2 = Get-Content (Join-Path $root $required[4]) -Raw
if ([regex]::Matches($v2, '(?m)^\| A\d\d \|').Count -ne 14) { Fail 'Body V2 spec must keep 14 gate items' }

foreach ($path in $required | Where-Object { $_ -like '*.md' }) {
  $dir = Split-Path (Join-Path $root $path) -Parent
  foreach ($m in [regex]::Matches((Get-Content (Join-Path $root $path) -Raw), '\]\(([^)]+)\)')) {
    $href = $m.Groups[1].Value
    if ($href -match '^(https?:|#)') { continue }
    if (-not (Test-Path (Join-Path $dir ($href -split '#')[0]))) { Fail "$path links to missing $href" }
  }
}
Write-Output "PASS: $($required.Count) required files, valid status JSON, six contestants, 5 entry checks, 6 demo checks, 14 deferred gate items and local document links."
