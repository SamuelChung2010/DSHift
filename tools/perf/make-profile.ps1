# Test-only helper: create an isolated DSH profile whose Chat plugin resolves to
# a chosen bundle directory. The profile owns a real node_modules directory with
# junctions to the installed desktop profile packages; only
# @local/deepseek-chat-mode is redirected, so the running desktop profile is
# never modified. Requires Windows (junctions) and a DSH install.
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$BundleDir,
  [Parameter(Mandatory = $true)][string]$PerfHome,
  [string]$SourceProfile = 'C:\Users\Zhong\.dsh\profiles\desktop'
)

$ErrorActionPreference = 'Stop'
$profileDir = Join-Path $PerfHome "profiles\$Name"
$sourceNodes = Join-Path $SourceProfile 'node_modules'

if (-not (Test-Path $BundleDir)) { throw "bundle dir not found: $BundleDir" }
if (-not (Test-Path $sourceNodes)) { throw "source node_modules not found: $sourceNodes" }
if (Test-Path $profileDir) { Remove-Item -LiteralPath $profileDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $profileDir | Out-Null

Copy-Item (Join-Path $SourceProfile 'cordis.patch.yml') (Join-Path $profileDir 'cordis.patch.yml') -ErrorAction SilentlyContinue
Copy-Item (Join-Path $SourceProfile 'cordis.yml') (Join-Path $profileDir 'cordis.yml') -ErrorAction SilentlyContinue
Copy-Item (Join-Path $SourceProfile 'pnpm-workspace.yaml') (Join-Path $profileDir 'pnpm-workspace.yaml') -ErrorAction SilentlyContinue

$package = Get-Content (Join-Path $SourceProfile 'package.json') -Raw | ConvertFrom-Json
$package.name = "dsh-profile-$Name"
$package | ConvertTo-Json -Depth 12 | Set-Content (Join-Path $profileDir 'package.json')

$nodes = Join-Path $profileDir 'node_modules'
New-Item -ItemType Directory -Force -Path $nodes | Out-Null
foreach ($entry in Get-ChildItem $sourceNodes -Force) {
  if ($entry.Name -eq '@local') { continue }
  $dest = Join-Path $nodes $entry.Name
  if ($entry.PSIsContainer) {
    New-Item -ItemType Junction -Path $dest -Target $entry.FullName | Out-Null
  } else {
    Copy-Item $entry.FullName $dest
  }
}
New-Item -ItemType Directory -Force -Path (Join-Path $nodes '@local') | Out-Null
New-Item -ItemType Junction -Path (Join-Path $nodes '@local\deepseek-chat-mode') -Target (Resolve-Path $BundleDir).Path | Out-Null

$sharedNodes = Join-Path $PerfHome 'profiles\node_modules'
if (-not (Test-Path $sharedNodes)) {
  New-Item -ItemType Junction -Path $sharedNodes -Target 'C:\Users\Zhong\.dsh\profiles\node_modules' | Out-Null
}

Write-Output "profile $Name -> $((Resolve-Path $BundleDir).Path)"
