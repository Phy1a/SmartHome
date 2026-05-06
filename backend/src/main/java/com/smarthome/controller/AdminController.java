package com.smarthome.controllers;

import com.smarthome.database.DatabaseManager;
import com.smarthome.services.JwtService;
import io.javalin.http.Context;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;
import java.util.*;

public class AdminController {

    private boolean isAdmin(Context ctx) {
        String auth = ctx.header("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return false;
        String level = JwtService.getLevel(auth.substring(7));
        return "expert".equals(level);
    }

    public void getAllUsers(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé - administrateur requis")); return; }

        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, username, email, first_name, last_name, member_type, level, points, login_count, action_count, is_validated, is_active, created_at, last_login FROM users ORDER BY created_at DESC")) {
            List<Map<String, Object>> users = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id", rs.getInt("id"));
                u.put("username", rs.getString("username"));
                u.put("email", rs.getString("email"));
                u.put("firstName", rs.getString("first_name"));
                u.put("lastName", rs.getString("last_name"));
                u.put("memberType", rs.getString("member_type"));
                u.put("level", rs.getString("level"));
                u.put("points", rs.getDouble("points"));
                u.put("loginCount", rs.getInt("login_count"));
                u.put("actionCount", rs.getInt("action_count"));
                u.put("isValidated", rs.getInt("is_validated") == 1);
                u.put("isActive", rs.getInt("is_active") == 1);
                u.put("createdAt", rs.getString("created_at"));
                u.put("lastLogin", rs.getString("last_login"));
                users.add(u);
            }
            ctx.json(users);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void validateUser(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        int userId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement("UPDATE users SET is_validated=1 WHERE id=?");
            ps.setInt(1, userId);
            ps.executeUpdate();
            ctx.json(Map.of("message", "Utilisateur validé"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void toggleUserActive(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        int userId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement get = conn.prepareStatement("SELECT is_active FROM users WHERE id=?");
            get.setInt(1, userId);
            ResultSet rs = get.executeQuery();
            if (!rs.next()) { ctx.status(404).json(Map.of("error", "Introuvable")); return; }
            int newActive = rs.getInt("is_active") == 1 ? 0 : 1;
            PreparedStatement ps = conn.prepareStatement("UPDATE users SET is_active=? WHERE id=?");
            ps.setInt(1, newActive);
            ps.setInt(2, userId);
            ps.executeUpdate();
            ctx.json(Map.of("isActive", newActive == 1));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void updateUserLevel(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        int userId = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String level = (String) body.get("level");
        if (level == null) { ctx.status(400).json(Map.of("error", "Niveau requis")); return; }

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement("UPDATE users SET level=? WHERE id=?");
            ps.setString(1, level);
            ps.setInt(2, userId);
            ps.executeUpdate();
            ctx.json(Map.of("message", "Niveau mis à jour"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void deleteUser(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        int userId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE FROM users WHERE id=?");
            ps.setInt(1, userId);
            ps.executeUpdate();
            ctx.json(Map.of("message", "Utilisateur supprimé"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getDeletionRequests(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(
                "SELECT dr.*, d.name as device_name, u.username as requester FROM deletion_requests dr JOIN devices d ON dr.device_id=d.id JOIN users u ON dr.requested_by=u.id WHERE dr.status='pending' ORDER BY dr.created_at DESC")) {
            List<Map<String, Object>> reqs = new ArrayList<>();
            while (rs.next()) {
                reqs.add(Map.of(
                    "id", rs.getInt("id"),
                    "deviceId", rs.getInt("device_id"),
                    "deviceName", rs.getString("device_name"),
                    "requester", rs.getString("requester"),
                    "reason", rs.getString("reason") != null ? rs.getString("reason") : "",
                    "createdAt", rs.getString("created_at")
                ));
            }
            ctx.json(reqs);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void approveDeletion(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        int reqId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement get = conn.prepareStatement("SELECT device_id FROM deletion_requests WHERE id=?");
            get.setInt(1, reqId);
            ResultSet rs = get.executeQuery();
            if (!rs.next()) { ctx.status(404).json(Map.of("error", "Demande introuvable")); return; }
            int deviceId = rs.getInt("device_id");

            PreparedStatement del = conn.prepareStatement("DELETE FROM devices WHERE id=?");
            del.setInt(1, deviceId);
            del.executeUpdate();

            PreparedStatement upd = conn.prepareStatement("UPDATE deletion_requests SET status='approved' WHERE id=?");
            upd.setInt(1, reqId);
            upd.executeUpdate();

            ctx.json(Map.of("message", "Appareil supprimé"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void rejectDeletion(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        int reqId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement upd = conn.prepareStatement("UPDATE deletion_requests SET status='rejected' WHERE id=?");
            upd.setInt(1, reqId);
            upd.executeUpdate();
            ctx.json(Map.of("message", "Demande rejetée"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getAlerts(Context ctx) {
        Integer userId = JwtService.getUserId(ctx.header("Authorization") != null ? ctx.header("Authorization").substring(7) : "");
        if (userId == null) { ctx.status(401).json(Map.of("error", "Non authentifié")); return; }

        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(
                "SELECT a.*, d.name as device_name FROM alerts a LEFT JOIN devices d ON a.device_id=d.id ORDER BY a.created_at DESC LIMIT 20")) {
            List<Map<String, Object>> alerts = new ArrayList<>();
            while (rs.next()) {
                alerts.add(Map.of(
                    "id", rs.getInt("id"),
                    "deviceId", rs.getInt("device_id"),
                    "deviceName", rs.getString("device_name") != null ? rs.getString("device_name") : "",
                    "type", rs.getString("type"),
                    "message", rs.getString("message"),
                    "severity", rs.getString("severity"),
                    "isRead", rs.getInt("is_read") == 1,
                    "createdAt", rs.getString("created_at")
                ));
            }
            ctx.json(alerts);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getPlatformStats(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            Map<String, Object> stats = new LinkedHashMap<>();
            ResultSet u = conn.createStatement().executeQuery("SELECT COUNT(*) as c, SUM(CASE WHEN is_validated=1 THEN 1 ELSE 0 END) as validated FROM users");
            stats.put("totalUsers", u.getInt("c"));
            stats.put("validatedUsers", u.getInt("validated"));

            ResultSet d = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM devices");
            stats.put("totalDevices", d.getInt("c"));

            ResultSet a = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM alerts WHERE is_read=0");
            stats.put("unreadAlerts", a.getInt("c"));

            ResultSet logins = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM login_history WHERE logged_at >= date('now', '-7 days')");
            stats.put("loginsLastWeek", logins.getInt("c"));

            ResultSet pending = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM deletion_requests WHERE status='pending'");
            stats.put("pendingDeletions", pending.getInt("c"));

            // Users by level
            ResultSet byLevel = conn.createStatement().executeQuery("SELECT level, COUNT(*) as c FROM users GROUP BY level");
            Map<String, Integer> levels = new LinkedHashMap<>();
            while (byLevel.next()) levels.put(byLevel.getString("level"), byLevel.getInt("c"));
            stats.put("usersByLevel", levels);

            ctx.json(stats);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getNews(Context ctx) {
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT n.*, u.username as author FROM news n LEFT JOIN users u ON n.author_id=u.id ORDER BY n.created_at DESC")) {
            List<Map<String, Object>> newsList = new ArrayList<>();
            while (rs.next()) {
                newsList.add(Map.of(
                    "id", rs.getInt("id"),
                    "title", rs.getString("title"),
                    "content", rs.getString("content"),
                    "category", rs.getString("category"),
                    "author", rs.getString("author") != null ? rs.getString("author") : "Système",
                    "createdAt", rs.getString("created_at")
                ));
            }
            ctx.json(newsList);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void addNews(Context ctx) {
        if (!isAdmin(ctx)) { ctx.status(403).json(Map.of("error", "Accès refusé")); return; }
        String auth = ctx.header("Authorization");
        Integer userId = JwtService.getUserId(auth.substring(7));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement("INSERT INTO news (title, content, category, author_id) VALUES (?, ?, ?, ?)");
            ps.setString(1, (String) body.getOrDefault("title", ""));
            ps.setString(2, (String) body.getOrDefault("content", ""));
            ps.setString(3, (String) body.getOrDefault("category", "général"));
            ps.setInt(4, userId);
            ps.executeUpdate();
            ctx.status(201).json(Map.of("message", "Actualité publiée"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getPublicMembers(Context ctx) {
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, username, age, gender, member_type, level, points, photo_url FROM users WHERE is_validated=1 AND is_active=1 ORDER BY username")) {
            List<Map<String, Object>> members = new ArrayList<>();
            while (rs.next()) {
                members.add(Map.of(
                    "id", rs.getInt("id"),
                    "username", rs.getString("username"),
                    "age", rs.getInt("age"),
                    "gender", rs.getString("gender") != null ? rs.getString("gender") : "",
                    "memberType", rs.getString("member_type"),
                    "level", rs.getString("level"),
                    "points", rs.getDouble("points"),
                    "photoUrl", rs.getString("photo_url") != null ? rs.getString("photo_url") : ""
                ));
            }
            ctx.json(members);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}
