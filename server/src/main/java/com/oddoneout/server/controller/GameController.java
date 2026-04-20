package com.oddoneout.server.controller;

import com.oddoneout.server.model.*;
import com.oddoneout.server.service.GameService;
import com.oddoneout.server.service.SchedulerService;
import com.oddoneout.server.data.QuestionsData;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.*;

@Controller
public class GameController {

    private final SimpMessagingTemplate messagingTemplate;
    private final SchedulerService scheduler;

    public GameController(SimpMessagingTemplate messagingTemplate,
                          SchedulerService scheduler) {
        this.messagingTemplate = messagingTemplate;
        this.scheduler = scheduler;
    }

    // CREATE ROOM
    @MessageMapping("/create-room")
    public void createRoom(Map<String, String> payload) {
    String username = payload.get("username");

    String roomId = GameService.randomRoom();

    Room room = new Room();
    Player player = new Player(UUID.randomUUID().toString(), username);

    room.players.add(player);
    room.host = player.id;

    GameService.rooms.put(roomId, room);

    // 🔥 SEND TO GLOBAL TOPIC
    messagingTemplate.convertAndSend("/topic/global", roomId);
}

    // JOIN ROOM
    @MessageMapping("/join-room")
    public void joinRoom(@Payload Map<String, String> payload, @Header("simpSessionId") String sessionId) {
        String roomId = payload.get("roomId");
        String username = payload.get("username");

        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        boolean alreadyExists = room.players.stream().anyMatch(p -> p.name.equals(username));

        if (alreadyExists) {
            System.out.println("⚠️ Duplicate join prevented for: " + username);
            return;
        }

        Player newPlayer = new Player(UUID.randomUUID().toString(), username);
        room.players.add(newPlayer);

        messagingTemplate.convertAndSend(
        "/topic/" + roomId,
        Map.of(
            "type", "players",
            "players", room.players
        )
        );

        messagingTemplate.convertAndSend(
        "/topic/" + roomId,
        Map.of(
            "type", "joined",
            "yourId", newPlayer.id,
            "username", username
        )
        );

        // ✅ send personal ID ONLY to that user
        messagingTemplate.convertAndSendToUser(
            // newPlayer.id,
            sessionId,
            "/queue/me",
            Map.of("yourId", newPlayer.id)
        );
    }

    // START GAME
    @MessageMapping("/start-game")
public void startGame(Map<String, String> payload) {

    String roomId = payload.get("roomId");

    System.out.println("🔥 START GAME TRIGGERED for room: " + roomId);

    Room room = GameService.rooms.get(roomId);
    System.out.println("ROOM DATA : " + room);

    if (room == null) {
        System.out.println("❌ ROOM NOT FOUND");
        return;
    }

    room.round = 1;

    // ✅ FIRST notify clients
    messagingTemplate.convertAndSend("/topic/" + roomId, "start-game");

    // ✅ THEN ACTUALLY START GAME
    startRound(roomId);
    }

    // ================= GAME FLOW =================

    private void startRound(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.answers.clear();
        room.votes.clear();
        room.answered = false;

        // 🔥 NEW (track round identity)
        room.roundStartTime = System.currentTimeMillis();
        long currentRoundTime = room.roundStartTime;

        int impostorIndex = new Random().nextInt(room.players.size());
        room.impostor = room.players.get(impostorIndex).id;

        room.question = QuestionsData.randomQuestion();
        
        System.out.println("START GAME TRIGGERED for room: " + roomId);

        messagingTemplate.convertAndSend("/topic/" + roomId, "start-game");

        // ⏱ send question after 800ms
        // scheduler.schedule(() -> sendQuestions(roomId), 2000);
        new Thread(() -> {
        try {
            Thread.sleep(1000);
        } catch (Exception e) {}

        System.out.println("🔥 MANUAL THREAD RUNNING");
        sendQuestions(roomId);
        }).start();

        // ⏱ auto end answers after 45s
        // scheduler.schedule(() -> {
        //     if (!room.answered) {
        //         room.answered = true;
        //         showAnswers(roomId);
        //     }
        // }, 45000);
        scheduler.schedule(() -> {

        if (room.roundStartTime != currentRoundTime) return;

        if (!room.answered) {
            room.answered = true;
            showAnswers(roomId);
        }
        }, 45000);
    }

    private void sendQuestions(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        for (Player p : room.players) {
            String text = p.id.equals(room.impostor)
                    ? room.question.getImpostor()
                    : room.question.getNormal();

            System.out.println("SENDING TO USER: " + p.id + " TEXT: " + text);

            // messagingTemplate.convertAndSendToUser(
            //     p.id,
            //     "/queue/question",
            //     Map.of("text", text, "round", room.round)
            // );

            messagingTemplate.convertAndSend(
            "/topic/" + roomId,
            Map.of(
                "text", text,
                "playerId", p.id,
                "round", room.round
            )
        );
        }
    }

    // ANSWER
    @MessageMapping("/answer")
    public void answer(Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String answer = payload.get("answer");
        String playerId = payload.get("playerId");

        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        // ❌ BLOCK SELF VOTE
        if (playerId.equals(vote)) {
            System.out.println("⚠️ Self vote blocked");
            return;
        }

        // prevent duplicate answers
        if (room.answers.containsKey(playerId)) {
            return;
        }

        room.answers.put(playerId, answer);

        if (room.answers.size() == room.players.size()) {
            room.answered = true;
            showAnswers(roomId);
        }
    }

    private void showAnswers(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        // messagingTemplate.convertAndSend("/topic/" + roomId,
        //         Map.of("type", "answers", "answers", room.answers));

        messagingTemplate.convertAndSend("/topic/" + roomId,
        Map.of(
            "type", "answers",
            "answers", room.answers,
            "players", room.players)
        );

        scheduler.schedule(() -> {
            messagingTemplate.convertAndSend("/topic/" + roomId, "start-voting");
        }, 8000);
    }

    // VOTE
    @MessageMapping("/vote")
    public void vote(Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String vote = payload.get("vote");

        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        // room.votes.put(UUID.randomUUID().toString(), vote);
        String playerId = payload.get("playerId");

        // prevent duplicate vote
        if (room.votes.containsKey(playerId)) return;
        room.votes.put(playerId, vote);

        if (room.votes.size() == room.players.size()) {
            calculateVotes(roomId);
        }
    }

    private void calculateVotes(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        Map<String, Integer> count = new HashMap<>();

        for (String v : room.votes.values()) {
            count.put(v, count.getOrDefault(v, 0) + 1);
        }

        // int max = 0;
        // String suspect = null;

        // for (String p : count.keySet()) {
        //     if (count.get(p) > max) {
        //         max = count.get(p);
        //         suspect = p;
        //     }
        // }

        int max = 0;
        List<String> top = new ArrayList<>();

        for (String p : count.keySet()) {
            int c = count.get(p);

            if (c > max) {
                max = c;
                top.clear();
                top.add(p);
            } else if (c == max) {
                top.add(p);
            }
        }

        // 🔥 FINAL SUSPECT
        String suspect = top.size() == 1 ? top.get(0) : null;

        Player suspectPlayer = null;
        Player impostorPlayer = null;

        for (Player p : room.players) {
            if (p.id.equals(suspect)) suspectPlayer = p;
            if (p.id.equals(room.impostor)) impostorPlayer = p;
        }

        // 🎯 CASE 1: impostor caught
        if (suspect != null && suspect.equals(room.impostor)) {

        for (Player p : room.players) {
            String votedFor = room.votes.get(p.id);

            if (votedFor != null && votedFor.equals(room.impostor)) {
                p.score += 20; // correct voters
            }
        }
    } else {
    // 🎯 CASE 2: impostor survives
        for (Player p : room.players) {
            if (p.id.equals(room.impostor)) {
                p.score += 30;
            }
        }
        }
    }

    messagingTemplate.convertAndSend("/topic/" + roomId,
    Map.of(
        "type", "result",
        "suspect", suspectPlayer != null ? suspectPlayer.name : "Tie",
        "impostor", impostorPlayer != null ? impostorPlayer.name : "Unknown",
        "players", room.players,
        "votes", room.votes)
    );

    scheduler.schedule(() -> nextRound(roomId), 8000);

    }

    private void nextRound(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.round++;

        if (room.round > 10) {
            messagingTemplate.convertAndSend("/topic/" + roomId, "game-over");
            return;
        }

        startRound(roomId);
    }

    // CHAT
    @MessageMapping("/chat")
    public void chat(Map<String, String> payload) {
        messagingTemplate.convertAndSend("/topic/" + payload.get("room"), payload.get("msg"));
    }
}