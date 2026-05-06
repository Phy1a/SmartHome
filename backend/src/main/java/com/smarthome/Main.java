package com.smarthome;

import com.smarthome.controllers.AdminController;
import com.smarthome.controllers.AuthController;
import com.smarthome.controllers.DeviceController;
import com.smarthome.database.DatabaseManager;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;

public class Main {
    public static void main(String[] args) {
        // Initialize database
        System.out.println("Initializing database...");
        DatabaseManager.getInstance();
        System.out.println("Database initialized successfully.");

        AuthController auth = new AuthController();
        DeviceController devices = new DeviceController();
        AdminController admin = new AdminController();

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson());
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    rule.anyHost();
                    rule.allowCredentials = false;
                });
            });
        });

        // ===== PUBLIC ROUTES =====
        app.get("/api/health", ctx -> ctx.json(java.util.Map.of("status", "OK", "message", "SmartHome API Running")));
        app.get("/api/news", admin::getNews);
        app.get("/api/members/public", admin::getPublicMembers);

        // ===== AUTH ROUTES =====
        app.post("/api/auth/register", auth::register);
        app.post("/api/auth/login", auth::login);
        app.get("/api/auth/me", auth::getMe);
        app.put("/api/auth/profile", auth::updateProfile);

        // ===== DEVICE ROUTES (requires auth) =====
        app.get("/api/devices", devices::getAllDevices);
        app.get("/api/devices/stats", devices::getDeviceStats);
        app.get("/api/devices/{id}", devices::getDeviceById);
        app.get("/api/rooms", devices::getRooms);

        // Requires avancé or expert
        app.post("/api/devices", devices::addDevice);
        app.put("/api/devices/{id}", devices::updateDevice);
        app.patch("/api/devices/{id}/toggle", devices::toggleDeviceStatus);
        app.post("/api/devices/{id}/delete-request", devices::requestDeletion);

        // Requires expert
        app.delete("/api/devices/{id}", devices::deleteDevice);

        // ===== ADMIN ROUTES (requires expert) =====
        app.get("/api/admin/users", admin::getAllUsers);
        app.patch("/api/admin/users/{id}/validate", admin::validateUser);
        app.patch("/api/admin/users/{id}/toggle", admin::toggleUserActive);
        app.patch("/api/admin/users/{id}/level", admin::updateUserLevel);
        app.delete("/api/admin/users/{id}", admin::deleteUser);
        app.get("/api/admin/deletion-requests", admin::getDeletionRequests);
        app.post("/api/admin/deletion-requests/{id}/approve", admin::approveDeletion);
        app.post("/api/admin/deletion-requests/{id}/reject", admin::rejectDeletion);
        app.get("/api/admin/stats", admin::getPlatformStats);
        app.get("/api/alerts", admin::getAlerts);
        app.post("/api/news", admin::addNews);

        app.start(8080);
        System.out.println("🏠 SmartHome API démarrée sur http://localhost:8080");
        System.out.println("📌 Comptes de test:");
        System.out.println("   admin / Admin123!  (expert - accès complet)");
        System.out.println("   marie / Password123!  (avancé)");
        System.out.println("   lucas / Password123!  (intermédiaire)");
        System.out.println("   emma / Password123!   (débutant)");
    }
}
