# 🏠 SmartHome — Plateforme Maison Connectée

Plateforme IoT intelligente pour maison connectée — Projet ING1 2025-2026.

---

## 📁 Structure du projet

```
Smart-Basement-Management/
├── backend/              ← Javalin (Java 17+, Maven)
│   ├── pom.xml
│   └── src/main/java/com/smarthome/
│       ├── Main.java
│       ├── database/DatabaseManager.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── DeviceController.java
│       │   └── AdminController.java
│       └── services/JwtService.java
│
└── frontend/             ← React 18 + TypeScript (react-scripts)
    ├── package.json
    └── src/
        ├── index.tsx
        ├── App.tsx
        ├── index.css
        ├── utils/        (api.ts, helpers.ts)
        ├── hooks/        (useAuth.ts, useToast.ts)
        ├── components/   (Sidebar.tsx, AppLayout.tsx)
        └── pages/        (toutes les pages)
```

---

## 🚀 Lancement

### Prérequis

- **Java 17+** (vérifier : `java -version`)
- **Maven 3.8+** (vérifier : `mvn -version`)
- **Node.js 18+** (vérifier : `node -v`)

> 💡 Sur macOS, si `mvn` n'est pas installé : `brew install maven`.
> Si `JAVA_HOME` n'est pas défini : `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`.

---

### 1️⃣ Backend (Javalin — port 8080)

```bash
cd backend
mvn clean package -q
java -jar target/smart-home-backend-1.0-SNAPSHOT.jar
```

✅ Le serveur démarre sur **http://localhost:8080**
✅ La base SQLite `smarthome.db` est créée automatiquement avec des données de test au premier lancement.

> Pour repartir d'une base propre : `rm backend/smarthome.db` puis relancer.

---

### 2️⃣ Frontend (React — port 3000)

Dans un **nouveau terminal** :

```bash
cd frontend
npm install      # uniquement la 1ère fois
npm start
```

✅ L'application s'ouvre sur **http://localhost:3000**

---

## 👤 Comptes de test

| Utilisateur | Mot de passe   | Niveau         | Accès                                 |
| ----------- | -------------- | -------------- | ------------------------------------- |
| `admin`     | `Admin123!`    | Expert         | Tous les modules                      |
| `marie`     | `Password123!` | Avancé         | Information + Visualisation + Gestion |
| `lucas`     | `Password123!` | Intermédiaire  | Information + Visualisation          |
| `emma`      | `Password123!` | Débutant       | Information + Visualisation          |

---

## 🗂️ Modules

### Module Information (visiteur + connecté)

- Page publique avec actualités et membres
- Recherche avec filtres (mot-clé + catégorie)
- Inscription depuis la page d'accueil

### Module Visualisation (débutant / intermédiaire)

- Tableau de bord avec statistiques
- Système XP et progression de niveau
- Recherche et consultation des appareils
- Gestion du profil (public + privé)
- Consultation des membres

### Module Gestion (avancé)

- CRUD complet des appareils connectés
- Activation/désactivation (toggle)
- Demandes de suppression à l'admin
- Statistiques et rapports (charts)
- Alertes système

### Module Administration (expert)

- Gestion des utilisateurs (valider, activer, niveau, supprimer)
- Approbation des demandes de suppression
- Rapports globaux de la plateforme
- Publication d'actualités

---

## 🔑 Système de points / niveaux

| Niveau         | Points requis | Modules débloqués |
| -------------- | ------------- | ----------------- |
| Débutant       | 1 pt          | Visualisation     |
| Intermédiaire  | 3 pts         | Visualisation     |
| Avancé         | 5 pts         | + Gestion         |
| Expert         | 7 pts         | + Administration  |

**Gain de points :**

- Connexion : +0.25 pt
- Consultation d'un appareil : +0.50 pt

---

## 🗄️ Base de données (SQLite)

Tables : `users`, `devices`, `device_attributes`, `device_data`, `rooms`, `news`, `alerts`, `deletion_requests`, `login_history`.

Le fichier `smarthome.db` est créé dans le répertoire `backend/` au premier lancement et **n'est pas versionné**.

---

## 🛠️ Technologies

- **Backend** : Java 17, Javalin 6, SQLite, BCrypt, JWT (auth0)
- **Frontend** : React 18, TypeScript, React Router 6, Recharts, Axios
- **Base de données** : SQLite (embarquée, pas d'installation requise)

---

## 🎨 Palette de couleurs

| Nom                        | Hex       | Usage                           |
| -------------------------- | --------- | ------------------------------- |
| Violet (Primaire)          | `#7C3AED` | Actions, nav active, logo       |
| Émeraude (Secondaire)      | `#10B981` | Succès, actif, confirmation     |
| Ambre (Accent)             | `#F59E0B` | Alertes, énergie, XP            |
| Rouge (Danger)             | `#EF4444` | Inactif, erreurs                |
| Nuit (Fond sombre)         | `#1a1a2e` | Sidebar, navbar                 |
| Blanc lavande (Fond clair) | `#F8F7FF` | Background général              |

---

## 🐛 Dépannage rapide

| Symptôme                                | Cause probable           | Solution                                              |
| --------------------------------------- | ------------------------ | ----------------------------------------------------- |
| `mvn: command not found`                | Maven non installé       | `brew install maven`                                  |
| `invalid target release: 17`            | Mauvaise version de Java | `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`    |
| Modifs admin/seed non prises en compte  | Base déjà existante      | `rm backend/smarthome.db` puis relancer le backend    |
| Frontend ne se connecte pas au backend  | Backend non démarré      | Vérifier que **http://localhost:8080** répond         |
| Page de détail appareil vide            | Erreur backend 500       | Lire la stack trace dans le terminal backend          |

---

## 👥 Auteurs

Projet réalisé dans le cadre du cursus ING1 (2025-2026).
