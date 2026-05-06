package com.smarthome.controllers;

import com.smarthome.database.DatabaseManager;
import com.smarthome.services.JwtService;
import io.javalin.http.Context;

import java.sql.*;
import java.util.*;

public class DeviceController {

    private Integer getAuthUserId(Context ctx) {
        String auth = ctx.header("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        return JwtService.getUserId(auth.substring(7));
    }

    private String getAuthLevel(Context ctx) {
        String auth = ctx.header("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        return JwtService.getLevel(auth.substring(7));
    }

    private boolean hasAccess(Context ctx, String... allowedLevels) {
        String level = getAuthLevel(ctx);
        if (level == null) return false;
        for (String l : allowedLevels) if (l.equals(level)) return true;
        return false;
    }

    public void getAllDevices(Context ctx) {
        Integer userId = getAuthUserId(ctx);
        if (userId == null) { ctx.status(401).json(Map.of("error", "Non authentifié")); return; }

        // Award action points
        awardActionPoints(userId, 0.5);

        String keyword = ctx.queryParam("keyword");
        String type = ctx.queryParam("type");
        String status = ctx.queryParam("status");
        String brand = ctx.queryParam("brand");
        String room = ctx.queryParam("room");

        StringBuilder sql = new StringBuilder("SELECT d.*, GROUP_CONCAT(da.attribute_key || '=' || da.attribute_value, '|') as attributes FROM devices d LEFT JOIN device_attributes da ON d.id = da.device_id WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            sql.append(" AND (d.name LIKE ? OR d.description LIKE ? OR d.unique_id LIKE ?)");
            String k = "%" + keyword + "%";
            params.add(k); params.add(k); params.add(k);
        }
        if (type != null && !type.isBlank()) { sql.append(" AND d.type=?"); params.add(type); }
        if (status != null && !status.isBlank()) { sql.append(" AND d.status=?"); params.add(status); }
        if (brand != null && !brand.isBlank()) { sql.append(" AND d.brand LIKE ?"); params.add("%" + brand + "%"); }
        if (room != null && !room.isBlank()) { sql.append(" AND d.room=?"); params.add(room); }

        sql.append(" GROUP BY d.id ORDER BY d.name");

        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> devices = new ArrayList<>();
            while (rs.next()) {
                devices.add(mapDevice(rs));
            }
            ctx.json(devices);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getDeviceById(Context ctx) {
        Integer userId = getAuthUserId(ctx);
        if (userId == null) { ctx.status(401).json(Map.of("error", "Non authentifié")); return; }

        int deviceId = Integer.parseInt(ctx.pathParam("id"));
        awardActionPoints(userId, 0.5);

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "SELECT d.*, GROUP_CONCAT(da.attribute_key || '=' || da.attribute_value, '|') as attributes FROM devices d LEFT JOIN device_attributes da ON d.id = da.device_id WHERE d.id=? GROUP BY d.id");
            ps.setInt(1, deviceId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) { ctx.status(404).json(Map.of("error", "Appareil introuvable")); return; }

            Map<String, Object> device = mapDevice(rs);

            // Fetch recent data
            PreparedStatement dataPs = conn.prepareStatement(
                "SELECT data_type, value, unit, recorded_at FROM device_data WHERE device_id=? ORDER BY recorded_at DESC LIMIT 50");
            dataPs.setInt(1, deviceId);
            ResultSet dataRs = dataPs.executeQuery();
            List<Map<String, Object>> history = new ArrayList<>();
            while (dataRs.next()) {
                Map<String, Object> entry = new java.util.HashMap<>();
                entry.put("type", dataRs.getString("data_type") != null ? dataRs.getString("data_type") : "");
                entry.put("value", dataRs.getDouble("value"));
                entry.put("unit", dataRs.getString("unit") != null ? dataRs.getString("unit") : "");
                entry.put("recordedAt", dataRs.getString("recorded_at") != null ? dataRs.getString("recorded_at") : "");
                history.add(entry);
            }
            device.put("history", history);

            ctx.json(device);
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    public void addDevice(Context ctx) {
        if (!hasAccess(ctx, "avancé", "expert")) {
            ctx.status(403).json(Map.of("error", "Accès refusé - niveau avancé ou expert requis"));
            return;
        }
        Integer userId = getAuthUserId(ctx);
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            String uniqueId = "DEV_" + System.currentTimeMillis();
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO devices (unique_id, name, description, type, brand, room, status, energy_consumption, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, uniqueId);
            ps.setString(2, (String) body.getOrDefault("name", "Nouvel appareil"));
            ps.setString(3, (String) body.getOrDefault("description", ""));
            ps.setString(4, (String) body.getOrDefault("type", "autre"));
            ps.setString(5, (String) body.getOrDefault("brand", ""));
            ps.setString(6, (String) body.getOrDefault("room", ""));
            ps.setString(7, (String) body.getOrDefault("status", "actif"));
            Object ec = body.get("energyConsumption");
            ps.setDouble(8, ec != null ? Double.parseDouble(ec.toString()) : 0);
            ps.setInt(9, userId);
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            int newId = keys.next() ? keys.getInt(1) : -1;

            ctx.status(201).json(Map.of("message", "Appareil ajouté", "id", newId, "uniqueId", uniqueId));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void updateDevice(Context ctx) {
        if (!hasAccess(ctx, "avancé", "expert")) {
            ctx.status(403).json(Map.of("error", "Accès refusé"));
            return;
        }
        int deviceId = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE devices SET name=?, description=?, type=?, brand=?, room=?, status=?, energy_consumption=?, last_interaction=datetime('now') WHERE id=?");
            ps.setString(1, (String) body.getOrDefault("name", ""));
            ps.setString(2, (String) body.getOrDefault("description", ""));
            ps.setString(3, (String) body.getOrDefault("type", ""));
            ps.setString(4, (String) body.getOrDefault("brand", ""));
            ps.setString(5, (String) body.getOrDefault("room", ""));
            ps.setString(6, (String) body.getOrDefault("status", "actif"));
            Object ec = body.get("energyConsumption");
            ps.setDouble(7, ec != null ? Double.parseDouble(ec.toString()) : 0);
            ps.setInt(8, deviceId);
            ps.executeUpdate();

            // Update attributes if provided
            @SuppressWarnings("unchecked")
            Map<String, String> attrs = (Map<String, String>) body.get("attributes");
            if (attrs != null) {
                PreparedStatement del = conn.prepareStatement("DELETE FROM device_attributes WHERE device_id=?");
                del.setInt(1, deviceId);
                del.executeUpdate();
                PreparedStatement ins = conn.prepareStatement("INSERT INTO device_attributes (device_id, attribute_key, attribute_value) VALUES (?, ?, ?)");
                for (Map.Entry<String, String> e : attrs.entrySet()) {
                    ins.setInt(1, deviceId);
                    ins.setString(2, e.getKey());
                    ins.setString(3, e.getValue());
                    ins.executeUpdate();
                }
            }

            ctx.json(Map.of("message", "Appareil mis à jour"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void toggleDeviceStatus(Context ctx) {
        if (!hasAccess(ctx, "avancé", "expert")) {
            ctx.status(403).json(Map.of("error", "Accès refusé"));
            return;
        }
        int deviceId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement get = conn.prepareStatement("SELECT status FROM devices WHERE id=?");
            get.setInt(1, deviceId);
            ResultSet rs = get.executeQuery();
            if (!rs.next()) { ctx.status(404).json(Map.of("error", "Introuvable")); return; }
            String newStatus = rs.getString("status").equals("actif") ? "inactif" : "actif";
            PreparedStatement ps = conn.prepareStatement("UPDATE devices SET status=?, last_interaction=datetime('now') WHERE id=?");
            ps.setString(1, newStatus);
            ps.setInt(2, deviceId);
            ps.executeUpdate();
            ctx.json(Map.of("status", newStatus, "message", "Statut mis à jour"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void requestDeletion(Context ctx) {
        if (!hasAccess(ctx, "avancé", "expert")) {
            ctx.status(403).json(Map.of("error", "Accès refusé"));
            return;
        }
        Integer userId = getAuthUserId(ctx);
        int deviceId = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String reason = (String) body.getOrDefault("reason", "");

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO deletion_requests (device_id, requested_by, reason) VALUES (?, ?, ?)");
            ps.setInt(1, deviceId);
            ps.setInt(2, userId);
            ps.setString(3, reason);
            ps.executeUpdate();
            ctx.status(201).json(Map.of("message", "Demande de suppression envoyée à l'administrateur"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void deleteDevice(Context ctx) {
        if (!hasAccess(ctx, "expert")) {
            ctx.status(403).json(Map.of("error", "Accès refusé - niveau expert requis"));
            return;
        }
        int deviceId = Integer.parseInt(ctx.pathParam("id"));
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE FROM devices WHERE id=?");
            ps.setInt(1, deviceId);
            ps.executeUpdate();
            ctx.json(Map.of("message", "Appareil supprimé"));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getDeviceStats(Context ctx) {
        Integer userId = getAuthUserId(ctx);
        if (userId == null) { ctx.status(401).json(Map.of("error", "Non authentifié")); return; }

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            Map<String, Object> stats = new LinkedHashMap<>();

            ResultSet total = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM devices");
            stats.put("total", total.getInt("c"));

            ResultSet active = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM devices WHERE status='actif'");
            stats.put("active", active.getInt("c"));

            ResultSet inactive = conn.createStatement().executeQuery("SELECT COUNT(*) as c FROM devices WHERE status='inactif'");
            stats.put("inactive", inactive.getInt("c"));

            ResultSet energy = conn.createStatement().executeQuery("SELECT SUM(energy_consumption) as total FROM devices");
            stats.put("totalEnergy", Math.round(energy.getDouble("total") * 100.0) / 100.0);

            // By type
            ResultSet byType = conn.createStatement().executeQuery("SELECT type, COUNT(*) as c FROM devices GROUP BY type ORDER BY c DESC");
            List<Map<String, Object>> types = new ArrayList<>();
            while (byType.next()) {
                types.add(Map.of("type", byType.getString("type"), "count", byType.getInt("c")));
            }
            stats.put("byType", types);

            // By room
            ResultSet byRoom = conn.createStatement().executeQuery("SELECT room, COUNT(*) as c FROM devices GROUP BY room ORDER BY c DESC");
            List<Map<String, Object>> rooms = new ArrayList<>();
            while (byRoom.next()) {
                rooms.add(Map.of("room", byRoom.getString("room") != null ? byRoom.getString("room") : "Non assigné", "count", byRoom.getInt("c")));
            }
            stats.put("byRoom", rooms);

            // Energy trend (last 7 days)
            ResultSet trend = conn.createStatement().executeQuery(
                "SELECT date(recorded_at) as day, SUM(value) as total FROM device_data WHERE data_type='consommation_energie' AND recorded_at >= date('now', '-7 days') GROUP BY day ORDER BY day");
            List<Map<String, Object>> energyTrend = new ArrayList<>();
            while (trend.next()) {
                energyTrend.add(Map.of("day", trend.getString("day"), "total", Math.round(trend.getDouble("total") * 100.0) / 100.0));
            }
            stats.put("energyTrend", energyTrend);

            ctx.json(stats);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void getRooms(Context ctx) {
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT * FROM rooms ORDER BY floor, name")) {
            List<Map<String, Object>> rooms = new ArrayList<>();
            while (rs.next()) {
                rooms.add(Map.of("id", rs.getInt("id"), "name", rs.getString("name"), "floor", rs.getInt("floor")));
            }
            ctx.json(rooms);
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> mapDevice(ResultSet rs) throws SQLException {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("id", rs.getInt("id"));
        d.put("uniqueId", rs.getString("unique_id"));
        d.put("name", rs.getString("name"));
        d.put("description", rs.getString("description"));
        d.put("type", rs.getString("type"));
        d.put("brand", rs.getString("brand"));
        d.put("room", rs.getString("room"));
        d.put("status", rs.getString("status"));
        d.put("connectivity", rs.getString("connectivity"));
        d.put("signalStrength", rs.getString("signal_strength"));
        d.put("batteryLevel", rs.getInt("battery_level"));
        d.put("energyConsumption", rs.getDouble("energy_consumption"));
        d.put("lastInteraction", rs.getString("last_interaction"));
        d.put("createdAt", rs.getString("created_at"));

        // Parse attributes
        String attrStr = rs.getString("attributes");
        Map<String, String> attrs = new LinkedHashMap<>();
        if (attrStr != null) {
            for (String pair : attrStr.split("\\|")) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2) attrs.put(kv[0], kv[1]);
            }
        }
        d.put("attributes", attrs);
        return d;
    }

    private void awardActionPoints(int userId, double points) {
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE users SET action_count=action_count+1, points=points+? WHERE id=?");
            ps.setDouble(1, points);
            ps.setInt(2, userId);
            ps.executeUpdate();

            // Update level
            PreparedStatement fetchPoints = conn.prepareStatement("SELECT points FROM users WHERE id=?");
            fetchPoints.setInt(1, userId);
            ResultSet rs = fetchPoints.executeQuery();
            double totalPoints = rs.getDouble("points");
            String level = totalPoints >= 7 ? "expert" : totalPoints >= 5 ? "avancé" : totalPoints >= 3 ? "intermédiaire" : "débutant";
            PreparedStatement updateLevel = conn.prepareStatement("UPDATE users SET level=? WHERE id=?");
            updateLevel.setString(1, level);
            updateLevel.setInt(2, userId);
            updateLevel.executeUpdate();
        } catch (SQLException ignored) {}
    }
}
