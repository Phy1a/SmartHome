package com.domo.app;

import io.javalin.Javalin;
import java.util.Map;

public class Main {
    public static void main(String[] args) {

        UserDao.createTable();

        /*
        This code creates and starts a Javalin web application server with CORS 
        (Cross-Origin Resource Sharing) enabled.

        The `Javalin.create()` method takes a configuration lambda that receives a config object.
        Inside this lambda, the code accesses `bundledPlugins` to enable built-in plugins, 
        specifically the CORS plugin via `enableCors()`. This plugin handles cross-origin 
        requests by adding appropriate HTTP headers.

        Within the CORS configuration, `addRule()` defines a specific CORS rule. 
        The lambda parameter `it` represents a CorsHandler instance, and `it.allowHost()` 
        whitelist the origin "http://localhost:5173".

        Finally, `.start(7000)` binds the application to port 7000 and begins listening for 
        incoming HTTP requests. The returned `app` variable holds the Javalin instance,
        which can be used to stop the server later with `app.stop()` or to add routes 
        programmatically. 
        */

        var app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> it.allowHost("http://localhost:5173"));
            });
        }).start(7000);

        app.post("/api/register", ctx -> {
            RegisterRequest request = ctx.bodyAsClass(RegisterRequest.class);

            /*Informative answers (100 — 199)
                Success responses (200 — 299)
                Redirection messages (300 — 399)
                Client errors (400 — 499)
                Server errors (500 — 599) */
            if (request.firstName == null || request.firstName.isBlank()) {
                ctx.status(400).json(Map.of("message", "First name required"));
                return;
            }

            if (request.lastName == null || request.lastName.isBlank()) {
                ctx.status(400).json(Map.of("message", "Last name required"));
                return;
            }

            if (request.email == null || request.email.isBlank()) {
                ctx.status(400).json(Map.of("message", "Email required"));
                return;
            }

            if (request.password == null || request.password.length() < 6) {
                ctx.status(400).json(Map.of("message", "Password too short"));

                return;
            }

            if (request.confirmPassword == null || !request.password.equals(request.confirmPassword)) {
                ctx.status(400).json(Map.of("message", "Passwords do not match"));
                return;
            }

            try {
                User user = new User(request.firstName, request.lastName, request.email, request.password);
                UserDao.insertUser(user);
                ctx.status(201).json(Map.of("message", "User registered"));

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).json("Database error");
            }
        });
    }
}