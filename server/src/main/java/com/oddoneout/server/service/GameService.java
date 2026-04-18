package com.oddoneout.server.service;

import com.oddoneout.server.model.Room;
import java.util.*;

public class GameService {
    public static Map<String, Room> rooms = new HashMap<>();

    public static String randomRoom() {
        return UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}