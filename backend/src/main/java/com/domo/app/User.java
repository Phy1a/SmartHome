package com.domo.app;

public class User {
    public String firstName;
    public String lastName;
    public String email;
    public String password;
    public String role;

    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = "user";
    }
}