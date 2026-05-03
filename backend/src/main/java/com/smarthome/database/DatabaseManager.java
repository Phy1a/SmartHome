package com.smarthome.database;

import java.sql.*;

public class DatabaseManager {
    private static final String DB_URL = "jdbc:sqlite:smarthome.db";
    private static DatabaseManager instance;

    private DatabaseManager() {
        initializeDatabase();
    }

    public static DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    private void initializeDatabase() {
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            // Users table
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    age INTEGER,
                    gender TEXT,
                    birth_date TEXT,
                    member_type TEXT DEFAULT 'membre',
                    photo_url TEXT,
                    level TEXT DEFAULT 'debutant',
                    points REAL DEFAULT 0,
                    login_count INTEGER DEFAULT 0,
                    action_count INTEGER DEFAULT 0,
                    is_validated INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1,
                    created_at TEXT DEFAULT (datetime('now')),
                    last_login TEXT
                )
            """);

            // Devices (objets connectés)
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS devices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    unique_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    type TEXT NOT NULL,
                    brand TEXT,
                    room TEXT,
                    status TEXT DEFAULT 'actif',
                    connectivity TEXT DEFAULT 'Wi-Fi',
                    signal_strength TEXT DEFAULT 'fort',
                    battery_level INTEGER DEFAULT 100,
                    energy_consumption REAL DEFAULT 0,
                    last_interaction TEXT DEFAULT (datetime('now')),
                    created_at TEXT DEFAULT (datetime('now')),
                    added_by INTEGER,
                    FOREIGN KEY (added_by) REFERENCES users(id)
                )
            """);

            // Device attributes (dynamic attributes per device type)
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS device_attributes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id INTEGER NOT NULL,
                    attribute_key TEXT NOT NULL,
                    attribute_value TEXT,
                    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
                )
            """);

            // Device data history
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS device_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id INTEGER NOT NULL,
                    data_type TEXT NOT NULL,
                    value REAL,
                    unit TEXT,
                    recorded_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
                )
            """);

            // Rooms/Zones
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS rooms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT,
                    floor INTEGER DEFAULT 0
                )
            """);

            // News / Actualites
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS news (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT DEFAULT 'general',
                    created_at TEXT DEFAULT (datetime('now')),
                    author_id INTEGER,
                    FOREIGN KEY (author_id) REFERENCES users(id)
                )
            """);

            // Alerts
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id INTEGER,
                    type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    severity TEXT DEFAULT 'info',
                    is_read INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (device_id) REFERENCES devices(id)
                )
            """);

            // Deletion requests
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS deletion_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id INTEGER NOT NULL,
                    requested_by INTEGER NOT NULL,
                    reason TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (device_id) REFERENCES devices(id),
                    FOREIGN KEY (requested_by) REFERENCES users(id)
                )
            """);

            // User login history
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS login_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    logged_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """);

            seedData(conn);

        } catch (SQLException e) {
            throw new RuntimeException("Failed to initialize database: " + e.getMessage(), e);
        }
    }

    private void seedData(Connection conn) throws SQLException {
        // Check if already seeded
        try (Statement check = conn.createStatement();
             ResultSet rs = check.executeQuery("SELECT COUNT(*) FROM users")) {
            if (rs.getInt(1) > 0) return;
        }

        // Seed rooms
        String[] rooms = {"Salon", "Cuisine", "Chambre Principale", "Chambre Enfant", "Salle de Bain", "Bureau", "Cave", "Garage", "Jardin"};
        try (PreparedStatement ps = conn.prepareStatement("INSERT INTO rooms (name, floor) VALUES (?, ?)")) {
            int[] floors = {0, 0, 1, 1, 1, 1, -1, 0, 0};
            for (int i = 0; i < rooms.length; i++) {
                ps.setString(1, rooms[i]);
                ps.setInt(2, floors[i]);
                ps.executeUpdate();
            }
        }

        // Seed admin user (password: Admin123!)
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO users (username, email, password_hash, first_name, last_name, member_type, level, points, is_validated, login_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
            ps.setString(1, "admin");
            ps.setString(2, "admin@maison.fr");
            ps.setString(3, org.mindrot.jbcrypt.BCrypt.hashpw("Admin123!", org.mindrot.jbcrypt.BCrypt.gensalt()));
            ps.setString(4, "Admin");
            ps.setString(5, "Système");
            ps.setString(6, "père");
            ps.setString(7, "expert");
            ps.setDouble(8, 50.0);
            ps.setInt(9, 1);
            ps.setInt(10, 42);
            ps.executeUpdate();
        }

        // Seed regular users
        String[][] users = {
            {"marie", "marie@maison.fr", "Marie", "Dupont", "mère", "avancé", "15.5"},
            {"lucas", "lucas@maison.fr", "Lucas", "Dupont", "enfant", "intermédiaire", "6.0"},
            {"emma", "emma@maison.fr", "Emma", "Dupont", "enfant", "débutant", "1.5"},
        };
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO users (username, email, password_hash, first_name, last_name, member_type, level, points, is_validated, login_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
            for (String[] u : users) {
                ps.setString(1, u[0]);
                ps.setString(2, u[1]);
                ps.setString(3, org.mindrot.jbcrypt.BCrypt.hashpw("Password123!", org.mindrot.jbcrypt.BCrypt.gensalt()));
                ps.setString(4, u[2]);
                ps.setString(5, u[3]);
                ps.setString(6, u[4]);
                ps.setString(7, u[5]);
                ps.setDouble(8, Double.parseDouble(u[6]));
                ps.setInt(9, 1);
                ps.setInt(10, (int)(Math.random() * 20));
                ps.executeUpdate();
            }
        }

        // Seed devices
        Object[][] devices = {
            {"THERMO_001", "Thermostat Salon", "Contrôle la température du salon", "thermostat", "Nest", "Salon", "actif"},
            {"THERMO_002", "Thermostat Chambre", "Contrôle la température de la chambre principale", "thermostat", "Nest", "Chambre Principale", "actif"},
            {"LIGHT_001", "Lumière Salon", "Éclairage intelligent du salon", "lumière", "Philips Hue", "Salon", "actif"},
            {"LIGHT_002", "Lumière Cuisine", "Éclairage intelligent de la cuisine", "lumière", "Philips Hue", "Cuisine", "actif"},
            {"LIGHT_003", "Lumière Chambre", "Éclairage intelligent chambre principale", "lumière", "Philips Hue", "Chambre Principale", "inactif"},
            {"CAMERA_001", "Caméra Entrée", "Surveillance de l'entrée principale", "caméra", "Ring", "Garage", "actif"},
            {"CAMERA_002", "Caméra Jardin", "Surveillance du jardin", "caméra", "Ring", "Jardin", "actif"},
            {"WASH_001", "Machine à Laver", "Machine à laver connectée", "électroménager", "Samsung", "Cave", "actif"},
            {"DISH_001", "Lave-Vaisselle", "Lave-vaisselle connecté", "électroménager", "Bosch", "Cuisine", "inactif"},
            {"VAC_001", "Aspirateur Robot", "Nettoyage automatique", "robot", "iRobot Roomba", "Salon", "actif"},
            {"LOCK_001", "Serrure Connectée", "Contrôle d'accès porte principale", "sécurité", "August", "Salon", "actif"},
            {"SENSOR_001", "Capteur CO2 Salon", "Qualité de l'air du salon", "capteur", "Netatmo", "Salon", "actif"},
            {"SENSOR_002", "Capteur Humidité SDB", "Humidité salle de bain", "capteur", "Eve", "Salle de Bain", "actif"},
            {"FRIDGE_001", "Réfrigérateur", "Réfrigérateur connecté", "électroménager", "LG", "Cuisine", "actif"},
            {"PLUG_001", "Prise Intelligente Bureau", "Contrôle consommation bureau", "prise", "TP-Link", "Bureau", "actif"},
        };

        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO devices (unique_id, name, description, type, brand, room, status, battery_level, energy_consumption, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)")) {
            for (Object[] d : devices) {
                ps.setString(1, (String)d[0]);
                ps.setString(2, (String)d[1]);
                ps.setString(3, (String)d[2]);
                ps.setString(4, (String)d[3]);
                ps.setString(5, (String)d[4]);
                ps.setString(6, (String)d[5]);
                ps.setString(7, (String)d[6]);
                ps.setInt(8, 60 + (int)(Math.random() * 40));
                ps.setDouble(9, 0.1 + Math.random() * 2.5);
                ps.executeUpdate();
            }
        }

        // Seed device attributes
        seedDeviceAttributes(conn);

        // Seed device data (historical energy consumption)
        seedDeviceData(conn);

        // Seed news
        String[][] newsItems = {
            {"Bienvenue sur SmartHome!", "Votre plateforme intelligente est maintenant opérationnelle. Gérez tous vos appareils connectés depuis un seul endroit.", "général"},
            {"Mise à jour du thermostat", "Les thermostats Nest ont reçu une mise à jour firmware. Nouvelles fonctionnalités d'économie d'énergie disponibles.", "appareil"},
            {"Alerte: Consommation élevée", "La consommation énergétique a augmenté de 15% ce mois-ci. Vérifiez vos appareils.", "énergie"},
            {"Nouveau mode nuit activé", "Le mode nuit automatique a été configuré pour éteindre les lumières à 23h.", "automatisation"},
        };
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO news (title, content, category, author_id) VALUES (?, ?, ?, 1)")) {
            for (String[] n : newsItems) {
                ps.setString(1, n[0]);
                ps.setString(2, n[1]);
                ps.setString(3, n[2]);
                ps.executeUpdate();
            }
        }

        // Seed alerts
        String[][] alertItems = {
            {"1", "énergie", "Consommation élevée détectée sur le lave-vaisselle", "warning"},
            {"6", "batterie", "Batterie caméra entrée faible (15%)", "warning"},
            {"8", "maintenance", "Machine à laver: filtre à nettoyer", "info"},
            {"11", "sécurité", "Serrure connectée: tentative d'accès non autorisée détectée", "critical"},
        };
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO alerts (device_id, type, message, severity) VALUES (?, ?, ?, ?)")) {
            for (String[] a : alertItems) {
                ps.setInt(1, Integer.parseInt(a[0]));
                ps.setString(2, a[1]);
                ps.setString(3, a[2]);
                ps.setString(4, a[3]);
                ps.executeUpdate();
            }
        }
    }

    private void seedDeviceAttributes(Connection conn) throws SQLException {
        // Thermostat attributes
        insertAttr(conn, 1, "temperature_actuelle", "21");
        insertAttr(conn, 1, "temperature_cible", "23");
        insertAttr(conn, 1, "mode", "Automatique");
        insertAttr(conn, 2, "temperature_actuelle", "19");
        insertAttr(conn, 2, "temperature_cible", "20");
        insertAttr(conn, 2, "mode", "Manuel");

        // Light attributes
        insertAttr(conn, 3, "luminosite", "80");
        insertAttr(conn, 3, "couleur", "#FFFFFF");
        insertAttr(conn, 4, "luminosite", "100");
        insertAttr(conn, 4, "couleur", "#FFF3E0");
        insertAttr(conn, 5, "luminosite", "0");
        insertAttr(conn, 5, "couleur", "#E3F2FD");

        // Camera attributes
        insertAttr(conn, 6, "resolution", "1080p");
        insertAttr(conn, 6, "detection_mouvement", "activée");
        insertAttr(conn, 6, "vision_nocturne", "activée");
        insertAttr(conn, 7, "resolution", "4K");
        insertAttr(conn, 7, "detection_mouvement", "activée");

        // Washing machine
        insertAttr(conn, 8, "programme", "Cotton 60°");
        insertAttr(conn, 8, "temps_restant", "45 min");
        insertAttr(conn, 8, "consommation_eau", "50L");

        // Robot vacuum
        insertAttr(conn, 10, "superficie_nettoyee", "45m²");
        insertAttr(conn, 10, "mode", "Auto");
        insertAttr(conn, 10, "carte", "Activée");

        // CO2 sensor
        insertAttr(conn, 12, "co2", "412 ppm");
        insertAttr(conn, 12, "temperature", "21.5°C");
        insertAttr(conn, 12, "qualite_air", "Bonne");

        // Humidity sensor
        insertAttr(conn, 13, "humidite", "68%");
        insertAttr(conn, 13, "temperature", "22°C");
        insertAttr(conn, 13, "alerte_moisissure", "Non");
    }

    private void insertAttr(Connection conn, int deviceId, String key, String value) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO device_attributes (device_id, attribute_key, attribute_value) VALUES (?, ?, ?)")) {
            ps.setInt(1, deviceId);
            ps.setString(2, key);
            ps.setString(3, value);
            ps.executeUpdate();
        }
    }

    private void seedDeviceData(Connection conn) throws SQLException {
        // Generate 30 days of energy data for key devices
        int[] deviceIds = {1, 2, 3, 4, 8, 9, 10};
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO device_data (device_id, data_type, value, unit, recorded_at) VALUES (?, ?, ?, ?, datetime('now', ?))")) {
            for (int deviceId : deviceIds) {
                for (int day = 29; day >= 0; day--) {
                    for (int hour = 0; hour < 24; hour += 4) {
                        ps.setInt(1, deviceId);
                        ps.setString(2, "consommation_energie");
                        ps.setDouble(3, Math.round((0.1 + Math.random() * 0.8) * 100.0) / 100.0);
                        ps.setString(4, "kWh");
                        ps.setString(5, String.format("-%d days -%d hours", day, hour));
                        ps.executeUpdate();
                    }
                }
            }
        }
    }
}
