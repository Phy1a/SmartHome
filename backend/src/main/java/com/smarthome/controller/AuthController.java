package com.smarthome.controllers;

import com.smarthome.database.DatabaseManager;
import com.smarthome.services.JwtService;
import io.javalin.http.Context;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;
import java.util.*;

public class AuthController {

    public void register(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String username = (String) body.get("username");
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String firstName = (String) body.get("firstName");
        String lastName = (String) body.get("lastName");
        String memberType = (String) body.getOrDefault("memberType", "membre");
        Object ageObj = body.get("age");
        int age = ageObj != null ? Integer.parseInt(ageObj.toString()) : 0;

        if (username == null || email == null || password == null) {
            ctx.status(400).json(Map.of("error", "Champs requis manquants"));
            return;
        }

        if (password.length() < 8) {
            ctx.status(400).json(Map.of("error", "Le mot de passe doit contenir au moins 8 caractères"));
            return;
        }

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            // Check if user exists
            PreparedStatement check = conn.prepareStatement("SELECT id FROM users WHERE username=? OR email=?");
            check.setString(1, username);
            check.setString(2, email);
            ResultSet rs = check.executeQuery();
            if (rs.next()) {
                ctx.status(409).json(Map.of("error", "Nom d'utilisateur ou email déjà utilisé"));
                return;
            }

            String hash = BCrypt.hashpw(password, BCrypt.gensalt());
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO users (username, email, password_hash, first_name, last_name, member_type, age, is_validated) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, hash);
            ps.setString(4, firstName);
            ps.setString(5, lastName);
            ps.setString(6, memberType);
            ps.setInt(7, age);
            ps.executeUpdate();

            ctx.status(201).json(Map.of(
                "message", "Inscription réussie. Un administrateur doit valider votre compte.",
                "email", email
            ));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", "Erreur serveur: " + e.getMessage()));
        }
    }

    public void login(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String username = (String) body.get("username");
        String password = (String) body.get("password");

        if (username == null || password == null) {
            ctx.status(400).json(Map.of("error", "Identifiants requis"));
            return;
        }

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "SELECT id, username, email, password_hash, level, points, is_validated, is_active, first_name, last_name, member_type, login_count, action_count, photo_url FROM users WHERE username=? OR email=?");
            ps.setString(1, username);
            ps.setString(2, username);
            ResultSet rs = ps.executeQuery();

            if (!rs.next()) {
                ctx.status(401).json(Map.of("error", "Identifiants incorrects"));
                return;
            }

            String hash = rs.getString("password_hash");
            if (!BCrypt.checkpw(password, hash)) {
                ctx.status(401).json(Map.of("error", "Identifiants incorrects"));
                return;
            }

            if (rs.getInt("is_validated") == 0) {
                ctx.status(403).json(Map.of("error", "Compte non encore validé par un administrateur"));
                return;
            }

            if (rs.getInt("is_active") == 0) {
                ctx.status(403).json(Map.of("error", "Compte désactivé"));
                return;
            }

            int userId = rs.getInt("id");
            String level = rs.getString("level");

            // Update login stats and award points
            double loginPoints = 0.25;
            PreparedStatement update = conn.prepareStatement(
                "UPDATE users SET login_count=login_count+1, points=points+?, last_login=datetime('now') WHERE id=?");
            update.setDouble(1, loginPoints);
            update.setInt(2, userId);
            update.executeUpdate();

            // Log login history
            PreparedStatement logLogin = conn.prepareStatement("INSERT INTO login_history (user_id) VALUES (?)");
            logLogin.setInt(1, userId);
            logLogin.executeUpdate();

            // Re-fetch updated points (le niveau NE change PAS automatiquement,
            // l'utilisateur doit choisir manuellement de monter de niveau)
            PreparedStatement fetchUpdated = conn.prepareStatement("SELECT points, level FROM users WHERE id=?");
            fetchUpdated.setInt(1, userId);
            ResultSet updatedRs = fetchUpdated.executeQuery();
            double newPoints = updatedRs.getDouble("points");
            level = updatedRs.getString("level"); // on garde le niveau actuel

            String token = JwtService.generateToken(userId, rs.getString("username"), level);

            Map<String, Object> user = new LinkedHashMap<>();
            user.put("id", userId);
            user.put("username", rs.getString("username"));
            user.put("email", rs.getString("email"));
            user.put("firstName", rs.getString("first_name"));
            user.put("lastName", rs.getString("last_name"));
            user.put("memberType", rs.getString("member_type"));
            user.put("level", level);
            user.put("points", newPoints + loginPoints);
            user.put("loginCount", rs.getInt("login_count") + 1);
            user.put("actionCount", rs.getInt("action_count"));
            user.put("photoUrl", rs.getString("photo_url"));

            ctx.json(Map.of("token", token, "user", user));

        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", "Erreur serveur: " + e.getMessage()));
        }
    }

    public void getMe(Context ctx) {
        String auth = ctx.header("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            ctx.status(401).json(Map.of("error", "Non authentifié"));
            return;
        }
        String token = auth.substring(7);
        Integer userId = JwtService.getUserId(token);
        if (userId == null) {
            ctx.status(401).json(Map.of("error", "Token invalide"));
            return;
        }

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "SELECT id, username, email, first_name, last_name, age, gender, birth_date, member_type, photo_url, level, points, login_count, action_count FROM users WHERE id=?");
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                ctx.status(404).json(Map.of("error", "Utilisateur introuvable"));
                return;
            }
            Map<String, Object> user = new LinkedHashMap<>();
            user.put("id", rs.getInt("id"));
            user.put("username", rs.getString("username"));
            user.put("email", rs.getString("email"));
            user.put("firstName", rs.getString("first_name"));
            user.put("lastName", rs.getString("last_name"));
            user.put("age", rs.getInt("age"));
            user.put("gender", rs.getString("gender"));
            user.put("birthDate", rs.getString("birth_date"));
            user.put("memberType", rs.getString("member_type"));
            user.put("photoUrl", rs.getString("photo_url"));
            user.put("level", rs.getString("level"));
            user.put("points", rs.getDouble("points"));
            user.put("loginCount", rs.getInt("login_count"));
            user.put("actionCount", rs.getInt("action_count"));
            ctx.json(user);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void updateProfile(Context ctx) {
        String auth = ctx.header("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) { ctx.status(401).json(Map.of("error", "Non authentifié")); return; }
        Integer userId = JwtService.getUserId(auth.substring(7));
        if (userId == null) { ctx.status(401).json(Map.of("error", "Token invalide")); return; }

        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE users SET first_name=?, last_name=?, age=?, gender=?, birth_date=?, member_type=?, photo_url=? WHERE id=?");
            ps.setString(1, (String) body.getOrDefault("firstName", ""));
            ps.setString(2, (String) body.getOrDefault("lastName", ""));
            Object ageObj = body.get("age");
            int ageVal = 0;
            if (ageObj != null && !ageObj.toString().isBlank()) {
                try { ageVal = Integer.parseInt(ageObj.toString().trim()); }
                catch (NumberFormatException nfe) { ageVal = 0; }
            }
            ps.setInt(3, ageVal);
            ps.setString(4, (String) body.getOrDefault("gender", ""));
            ps.setString(5, (String) body.getOrDefault("birthDate", ""));
            ps.setString(6, (String) body.getOrDefault("memberType", "membre"));
            ps.setString(7, (String) body.getOrDefault("photoUrl", ""));
            ps.setInt(8, userId);
            ps.executeUpdate();

            // Change password if provided
            String newPassword = (String) body.get("newPassword");
            if (newPassword != null && !newPassword.isEmpty()) {
                String hash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
                PreparedStatement pw = conn.prepareStatement("UPDATE users SET password_hash=? WHERE id=?");
                pw.setString(1, hash);
                pw.setInt(2, userId);
                pw.executeUpdate();
            }

            ctx.json(Map.of("message", "Profil mis à jour"));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }


    public void getPoints(Context ctx) {
        String auth = ctx.header("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) { ctx.status(401).json(Map.of("error", "Non authentifié")); return; }
        Integer userId = JwtService.getUserId(auth.substring(7));
        if (userId == null) { ctx.status(401).json(Map.of("error", "Token invalide")); return; }
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT points, level, action_count, login_count FROM users WHERE id=?");
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) { ctx.status(404).json(Map.of("error", "Introuvable")); return; }
            ctx.json(Map.of(
                "points", rs.getDouble("points"),
                "level", rs.getString("level"),
                "actionCount", rs.getInt("action_count"),
                "loginCount", rs.getInt("login_count")
            ));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    private String computeLevel(double points) {
        if (points >= 7) return "expert";
        if (points >= 5) return "avancé";
        if (points >= 3) return "intermédiaire";
        return "débutant";
    }
}
