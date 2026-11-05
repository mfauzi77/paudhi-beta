$nodeHome = Join-Path $PSScriptRoot '.local\node-v26.12.1-win-x64'
$nodeExe = Join-Path $nodeHome 'node.exe'

if (-not (Test-Path -LiteralPath $nodeExe)) {
    throw "Project Node.js runtime not found at $nodeExe"
}

$env:Path = "$nodeHome;$env:Path"
node --version
