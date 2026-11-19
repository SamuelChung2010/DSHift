param(
  [Parameter(Mandatory = $true)][string]$Script,
  [string[]]$Arguments = @()
)
# Run a JavaScript file with Electron's Node runtime (ASAR-aware), redirecting output.
$scriptText = [System.IO.File]::ReadAllText((Resolve-Path $Script))
$start = [System.Diagnostics.ProcessStartInfo]::new($env:DSH_NODE_EXECUTABLE)
$start.Arguments = '-e "eval(process.env.ENODE_SCRIPT)"'
$start.UseShellExecute = $false
$start.WorkingDirectory = (Get-Location).Path
$start.RedirectStandardOutput = $true
$start.RedirectStandardError = $true
$start.StandardOutputEncoding = [System.Text.Encoding]::UTF8
$start.StandardErrorEncoding = [System.Text.Encoding]::UTF8
$start.EnvironmentVariables['ELECTRON_RUN_AS_NODE'] = '1'
$start.EnvironmentVariables['ENODE_SCRIPT'] = $scriptText
if ($Arguments.Count -gt 0) {
  $start.Arguments = '-e "eval(process.env.ENODE_SCRIPT)" -- ' + (($Arguments | ForEach-Object { if ($_ -match '\s') { '"' + ($_ -replace '"','\"') + '"' } else { $_ } }) -join ' ')
}
$process = [System.Diagnostics.Process]::Start($start)
$stderr = $process.StandardError.ReadToEndAsync()
$stdout = $process.StandardOutput.ReadToEnd()
$process.WaitForExit()
[Console]::Out.Write($stdout)
[Console]::Error.Write($stderr.Result)
exit $process.ExitCode
