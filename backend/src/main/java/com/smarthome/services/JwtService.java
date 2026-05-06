package com.smarthome.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;

public class JwtService {
    private static final String SECRET = "smarthome-secret-key-2025-very-secure";
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);
    private static final long EXPIRATION = 24 * 60 * 60 * 1000L; // 24h

    public static String generateToken(int userId, String username, String level) {
        return JWT.create()
            .withSubject(String.valueOf(userId))
            .withClaim("username", username)
            .withClaim("level", level)
            .withIssuedAt(new Date())
            .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION))
            .sign(ALGORITHM);
    }

    public static DecodedJWT verifyToken(String token) throws JWTVerificationException {
        return JWT.require(ALGORITHM).build().verify(token);
    }

    public static Integer getUserId(String token) {
        try {
            DecodedJWT jwt = verifyToken(token);
            return Integer.parseInt(jwt.getSubject());
        } catch (Exception e) {
            return null;
        }
    }

    public static String getLevel(String token) {
        try {
            return verifyToken(token).getClaim("level").asString();
        } catch (Exception e) {
            return null;
        }
    }
}
