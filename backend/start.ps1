$env:Path = "$env:JAVA_HOME\bin;C:\Windows\System32;C:\Windows"

$MAVEN_VERSION = "3.9.6"
$MAVEN_URL = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MAVEN_VERSION/apache-maven-$MAVEN_VERSION-bin.zip"
$MAVEN_DIR = "$PSScriptRoot\.mvn\maven-$MAVEN_VERSION"
$MVN_EXE = "$MAVEN_DIR\bin\mvn.cmd"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   SmartHome - Backend Builder" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check Java

try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "[OK] Java detecte : $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Java introuvable. Installe Java 17 depuis https://adoptium.net" -ForegroundColor Red
    exit 1
}

# Download Maven if needed
if (-Not (Test-Path $MVN_EXE)) {
    Write-Host ""
    Write-Host "[1/3] Telechargement de Maven $MAVEN_VERSION..." -ForegroundColor Yellow
    
    $zipPath = "$PSScriptRoot\.mvn\maven.zip"
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\.mvn" | Out-Null

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($MAVEN_URL, $zipPath)
        Write-Host "[OK] Telechargement termine." -ForegroundColor Green
    } catch {
        Write-Host "[ERREUR] Echec du telechargement : $_" -ForegroundColor Red
        exit 1
    }

    Write-Host "[2/3] Extraction de Maven..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath "$PSScriptRoot\.mvn\" -Force
    Rename-Item "$PSScriptRoot\.mvn\apache-maven-$MAVEN_VERSION" "maven-$MAVEN_VERSION" -ErrorAction SilentlyContinue
    Remove-Item $zipPath -Force
    Write-Host "[OK] Maven installe dans .mvn\maven-$MAVEN_VERSION" -ForegroundColor Green
} else {
    Write-Host "[OK] Maven $MAVEN_VERSION deja present." -ForegroundColor Green
}

# Build
Write-Host ""
Write-Host "[3/3] Compilation du projet (Maven package)..." -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
& $MVN_EXE clean package "-q"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] La compilation a echoue." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Compilation reussie !" -ForegroundColor Green
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Demarrage du serveur sur :8080" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comptes de test :" -ForegroundColor White
Write-Host "  admin / Admin123!       (expert - acces complet)" -ForegroundColor Gray
Write-Host "  marie / Password123!    (avance)" -ForegroundColor Gray
Write-Host "  lucas / Password123!    (intermediaire)" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuie sur Ctrl+C pour arreter le serveur." -ForegroundColor Gray
Write-Host ""

& java -jar "$PSScriptRoot\target\smart-home-backend-1.0-SNAPSHOT.jar"
