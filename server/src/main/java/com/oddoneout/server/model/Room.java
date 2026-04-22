package com.oddoneout.server.model;

import java.util.*;

public class Room {
    public List<Player> players = new ArrayList<>();
    public String host;
    public int round = 0;
    public long roundStartTime;
    public Map<String, String> answers = new HashMap<>();
    public Map<String, String> votes = new HashMap<>();
    public boolean gameStarted = false;
    public boolean answered = false;
    public String impostor;
    public Question question;
    public boolean answersShown = false;
    public boolean votesCalculated = false;
}