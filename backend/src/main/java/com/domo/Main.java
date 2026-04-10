package com.domo;

import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        var app = Javalin.create()
            .get("/", ctx -> ctx.result("Serveur Domotique prêt !"))
            .start(7070);
    }
}
