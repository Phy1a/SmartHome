#!/bin/bash

MAVEN_VERSION="3.9.6"
MAVEN_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/${MAVEN_VERSION}/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAVEN_DIR="${SCRIPT_DIR}/.mvn/maven-${MAVEN_VERSION}"
MVN_EXE="${MAVEN_DIR}/bin/mvn"

echo ""
echo "======================================="
echo "   SmartHome - Backend Builder"
echo "======================================="
echo ""

# Vérifier Java
if ! command -v java &> /dev/null; then
    echo "[ERREUR] Java introuvable."
    echo "Installe Java 17+ depuis https://adoptium.net puis relance ce script."
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -1)
echo "[OK] Java trouvé : ${JAVA_VER}"

# Télécharger Maven si absent
if [ ! -f "${MVN_EXE}" ]; then
    echo ""
    echo "[1/3] Téléchargement de Maven ${MAVEN_VERSION}..."
    mkdir -p "${SCRIPT_DIR}/.mvn"

    TAR_PATH="${SCRIPT_DIR}/.mvn/maven.tar.gz"

    if command -v curl &> /dev/null; then
        curl -fsSL "${MAVEN_URL}" -o "${TAR_PATH}"
    elif command -v wget &> /dev/null; then
        wget -q "${MAVEN_URL}" -O "${TAR_PATH}"
    else
        echo "[ERREUR] curl ou wget est requis pour télécharger Maven."
        exit 1
    fi

    echo "[OK] Téléchargement terminé."
    echo "[2/3] Extraction de Maven..."
    tar -xzf "${TAR_PATH}" -C "${SCRIPT_DIR}/.mvn/"
    mv "${SCRIPT_DIR}/.mvn/apache-maven-${MAVEN_VERSION}" "${MAVEN_DIR}"
    rm -f "${TAR_PATH}"
    chmod +x "${MVN_EXE}"
    echo "[OK] Maven installé dans .mvn/maven-${MAVEN_VERSION}"
else
    echo "[OK] Maven ${MAVEN_VERSION} déjà présent."
fi

# Compilation
echo ""
echo "[3/3] Compilation du projet..."
echo ""

cd "${SCRIPT_DIR}"
"${MVN_EXE}" clean package -q

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERREUR] La compilation a échoué."
    exit 1
fi

echo ""
echo "[OK] Compilation réussie !"
echo ""
echo "======================================="
echo "   Serveur démarré sur http://localhost:8080"
echo "======================================="
echo ""
echo "Comptes de test :"
echo "  admin / Admin123!       (expert - accès complet)"
echo "  marie / Password123!    (avancé)"
echo "  lucas / Password123!    (intermédiaire)"
echo ""
echo "Ctrl+C pour arrêter le serveur."
echo ""

java -jar "${SCRIPT_DIR}/target/smart-home-backend-1.0-SNAPSHOT.jar"
