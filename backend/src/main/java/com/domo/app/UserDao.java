package com.domo.app;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

public class UserDao {
    // UserDao is a Data Access Object (DAO) class responsible for handling 
    // database operations related to the User entity
    public static void createTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user'
            )
        """;


        try (Connection conn = Database.connect();
             Statement stmt = conn.createStatement()) {
            /* 
            This code creates a JDBC `Statement` object from a database connection for 
            executing SQL queries. The `conn.createStatement()` method is called on a 
            `Connection` object (typically obtained via JDBC driver manager) to obtain a 
            `Statement` instance that can send SQL commands to the database.

            The closing parenthesis and brace at the end indicate this is the resource declaration portion
            of a try-with-resources statement:

            ```java
            try (Statement stmt = conn.createStatement()) {
                // SQL operations using stmt
            }
            ```

            The try-with-resources construct automatically closes the `Statement` when the try 
            block completes, ensuring proper resource cleanup even if exceptions occur. 
            This is preferred over manually calling `stmt.close()` as it handles cleanup automatically
            and is more concise.

            The `Statement` object can then be used to execute queries with methods like `executeQuery()`
            for SELECT statements (returning a `ResultSet`) or `executeUpdate()` for INSERT, UPDATE, 
            or DELETE operations (returning an affected row count).
            */

            stmt.execute(sql);

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void insertUser(User user) throws SQLException {
    String sql = """
        INSERT INTO users(first_name, last_name, email, password, role)
        VALUES (?, ?, ?, ?, ?)
    """;

    try (Connection conn = Database.connect();
         PreparedStatement stmt = conn.prepareStatement(sql)) {

        stmt.setString(1, user.firstName);
        stmt.setString(2, user.lastName);
        stmt.setString(3, user.email);
        stmt.setString(4, user.password);
        stmt.setString(5, user.role);

        stmt.executeUpdate();
        }
    }
}