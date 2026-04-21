package com.oddoneout.server.model;

public class Player {
    public String id;
    public String name;
    public String sessionId;
    public int score = 0;

    public Player(String id, String name) {
        this.id = id;
        this.name = name;
    }
}