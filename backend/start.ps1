$ErrorActionPreference = "Stop"

$MAVEN_VERSION = "3.9.6"
$MAVEN_URL = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MAVEN_VERSION/apache-maven-$MAVEN_VERSION-bin.zip"
$MAVEN_DIR = "$PSScriptRoot\.mvn\maven-$MAVEN_VERSION"
$MVN_EXE = "$MAVEN_DIR\bin\mvn.cmd"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   SmartHome - Backend Builder" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Trouver Java - priorite au PATH (Get-Command)
$JAVA_EXEC = $null

try {
    $found = Get-Command java -ErrorAction SilentlyContinue
    if ($found -and (Test-Path $found.Source)) {
        $JAVA_EXEC = $found.Source
    }
} catch {}

# Fallback : recherche manuelle dans tous les emplacements connus
if (-not $JAVA_EXEC) {
    $searchBases = @(
        "C:\Program Files\Eclipse Adoptium",
        "C:\Program Files\Java",
        "C:\Program Files\Microsoft",
        "C:\Program Files\Amazon Corretto",
        "C:\Program Files\BellSoft",
        "C:\Program Files\Zulu",
        "${env:LOCALAPPDATA}\Programs\Eclipse Adoptium",
        "${env:LOCALAPPDATA}\Programs\Java"
    )
    foreach ($base in $searchBases) {
        if (Test-Path $base) {
            $found = Get-ChildItem -Path $base -Filter "java.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                $JAVA_EXEC = $found.FullName
                break
            }
        }
    }
}

if (-not $JAVA_EXEC) {
    Write-Host "[ERREUR] Java introuvable." -ForegroundColor Red
    Write-Host "Installe Java 21 depuis https://adoptium.net puis relance." -ForegroundColor Yellow
    Read-Host "Appuie sur Entree pour quitter"
    exit 1
}

# Calculer JAVA_HOME : remonter depuis bin\java.exe -> bin -> jdk-xxxx
$JAVA_HOME_COMPUTED = Split-Path (Split-Path $JAVA_EXEC -Parent) -Parent
$env:JAVA_HOME = $JAVA_HOME_COMPUTED

Write-Host "[OK] Java trouve    : $JAVA_EXEC" -ForegroundColor Green
Write-Host "[OK] JAVA_HOME      : $env:JAVA_HOME" -ForegroundColor Green

# Telecharger Maven si absent
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
        Read-Host "Appuie sur Entree pour quitter"
        exit 1
    }

    Write-Host "[2/3] Extraction de Maven..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath "$PSScriptRoot\.mvn\" -Force
    $extractedDir = "$PSScriptRoot\.mvn\apache-maven-$MAVEN_VERSION"
    if (Test-Path $extractedDir) {
        Rename-Item $extractedDir "maven-$MAVEN_VERSION" -ErrorAction SilentlyContinue
    }
    Remove-Item $zipPath -Force
    Write-Host "[OK] Maven installe." -ForegroundColor Green
} else {
    Write-Host "[OK] Maven $MAVEN_VERSION deja present." -ForegroundColor Green
}

# Compilation
Write-Host ""
Write-Host "[3/3] Compilation du projet..." -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
& $MVN_EXE clean package "-q"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] La compilation a echoue." -ForegroundColor Red
    Read-Host "Appuie sur Entree pour quitter"
    exit 1
}

Write-Host ""
Write-Host "[OK] Compilation reussie !" -ForegroundColor Green
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Serveur demarre sur http://localhost:8080" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comptes de test :" -ForegroundColor White
Write-Host "  admin / Admin123!       (expert - acces complet)" -ForegroundColor Gray
Write-Host "  marie / Password123!    (avance)" -ForegroundColor Gray
Write-Host "  lucas / Password123!    (intermediaire)" -ForegroundColor Gray
Write-Host ""
Write-Host "Ctrl+C pour arreter le serveur." -ForegroundColor Gray
Write-Host ""

& "$JAVA_EXEC" -jar "$PSScriptRoot\target\smart-home-backend-1.0-SNAPSHOT.jar"
