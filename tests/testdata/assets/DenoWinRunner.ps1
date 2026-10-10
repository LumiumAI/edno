$Source = [IO.File]::ReadAllText("$PSScriptRoot\EdnoWinRunner.cs")
$ednoExePath = $args[0]
$scriptPath = $args[1]
$constraints = $args[2]
$timeout = 5000;
Add-Type -TypeDefinition $Source -Language CSharp
Write-Output("Running Edno script: " + $args[1])
$code = [EdnoWinRunner]::RunDenoScript($ednoExePath, $scriptPath, $constraints, $timeout)
Write-Output("Edno.exe or the test wrapper has exited with code: $code")
exit $code
