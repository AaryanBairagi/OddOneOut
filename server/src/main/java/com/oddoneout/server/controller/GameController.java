package com.oddoneout.server.controller;

import com.oddoneout.server.model.*;
import com.oddoneout.server.service.GameService;
import com.oddoneout.server.service.SchedulerService;
import com.oddoneout.server.data.QuestionsData;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;

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
    public void createRoom(@Payload Map<String, String> payload, 
    @Header("simpSessionId") String sessionId) {
    String username = payload.get("username");

    String roomId = GameService.randomRoom();

    Room room = new Room();
    Player player = new Player(UUID.randomUUID().toString(), username);
    player.sessionId = sessionId; // 🔥 ADD THIS
    
    room.players.add(player);
    room.host = player.id;

    GameService.rooms.put(roomId, room);

    // 🔥 SEND TO GLOBAL TOPIC
    messagingTemplate.convertAndSend("/topic/global", roomId);
}

    // // JOIN ROOM
    // @MessageMapping("/join-room")
    // public void joinRoom(@Payload Map<String, String> payload, @Header("simpSessionId") String sessionId) {
    //     String roomId = payload.get("roomId");
    //     String username = payload.get("username");

    //     Room room = GameService.rooms.get(roomId);
    //     if (room == null) return;

    //     boolean alreadyExists = room.players.stream().anyMatch(p -> p.sessionId.equals(sessionId));

    //     if (alreadyExists) {
    //         System.out.println("⚠️ Duplicate join prevented for: " + username);
    //         return;
    //     }

    //     Player newPlayer = new Player(UUID.randomUUID().toString(), username);
    //     newPlayer.sessionId = sessionId; // ✅ ADD THIS
    //     room.players.add(newPlayer);

    //     messagingTemplate.convertAndSend(
    //     "/topic/" + roomId,
    //     Map.of(
    //         "type", "players",
    //         "players", room.players
    //     )
    //     );

    //     // messagingTemplate.convertAndSend(
    //     // "/topic/" + roomId,
    //     // Map.of(
    //     //     "type", "joined",
    //     //     "yourId", newPlayer.id,
    //     //     "username", username
    //     // )
    //     // );

    //     // ✅ send personal ID ONLY to that user
    //     messagingTemplate.convertAndSendToUser(
    //         // newPlayer.id,
    //         sessionId,
    //         "/queue/me",
    //         Map.of("yourId", newPlayer.id)
    //     );
    // }

    @MessageMapping("/join-room")
    public void joinRoom(@Payload Map<String, String> payload,
                     @Header("simpSessionId") String sessionId) {

    String roomId = payload.get("roomId");
    String username = payload.get("username");

    Room room = GameService.rooms.get(roomId);
    if (room == null) return;

    boolean alreadyExists = room.players.stream()
            .anyMatch(p -> p.sessionId.equals(sessionId));

    if (alreadyExists) {
        System.out.println("⚠️ Duplicate join prevented for: " + username);
        return;
    }

    Player newPlayer = new Player(UUID.randomUUID().toString(), username);
    newPlayer.sessionId = sessionId;
    room.players.add(newPlayer);

    // ✅ 1. send players list (unchanged)
    messagingTemplate.convertAndSend(
            "/topic/" + roomId,
            Map.of(
                    "type", "players",
                    "players", room.players
            )
    );

    // // ✅ 2. send ID THROUGH ROOM (THIS IS THE FIX)
    // messagingTemplate.convertAndSend(
    //         "/topic/" + roomId,
    //         Map.of(
    //                 "type", "joined",
    //                 "playerId", newPlayer.id,
    //                 "name", username
    //         )
    // );


    messagingTemplate.convertAndSendToUser(
        sessionId,
        "/queue/me",
        Map.of("yourId", newPlayer.id),
        createHeaders(sessionId)  
        );

    if (room.gameStarted) {
    messagingTemplate.convertAndSendToUser(
        sessionId,
        "/queue/game",
        Map.of("type", "game-started"),
        createHeaders(sessionId)
    );
    }

    }

    @MessageMapping("/start-game")
    public void startGame(Map<String, String> payload) {

    String roomId = payload.get("roomId");

    Room room = GameService.rooms.get(roomId);
    if (room == null) return;

    if (room.gameStarted) {
        System.out.println("⚠️ Game already started, ignoring");
        return;
    }

    room.gameStarted = true;

    System.out.println("🔥 START GAME TRIGGERED for room: " + roomId);

    room.round = 1;
    room.gameStarted = true;
    messagingTemplate.convertAndSend("/topic/" + roomId, "start-game");

    startRound(roomId);
    }

    // ================= GAME FLOW =================

    private void startRound(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.answers.clear();
        room.votes.clear();
        room.answered = false;
        room.answersShown = false;
        room.votesCalculated = false;

        // 🔥 NEW (track round identity)
        room.roundStartTime = System.currentTimeMillis();
        long currentRoundTime = room.roundStartTime;

        int impostorIndex = new Random().nextInt(room.players.size());
        room.impostor = room.players.get(impostorIndex).id;

        room.question = QuestionsData.randomQuestion();
        
        System.out.println("START GAME TRIGGERED for room: " + roomId);

        scheduler.schedule(() -> {

        Room r = GameService.rooms.get(roomId);
        if (r == null) return;

        // 🔥 ensure same round
        if (r.roundStartTime != currentRoundTime) return;

        sendQuestions(roomId);
        }, 4000);

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

            System.out.println("SENDING TO USER: " + p.sessionId + " TEXT: " + text);
            messagingTemplate.convertAndSendToUser(
            p.sessionId,
            "/queue/game",
            Map.of(
                "playerId", p.id,
                "text", text,
                "isImpostor", p.id.equals(room.impostor),
                "round", room.round
            ),
            createHeaders(p.sessionId) 
            );
        }
    }


    @MessageMapping("/answer")
    public void answer(Map<String, String> payload) {

    String roomId = payload.get("roomId");
    String answer = payload.get("answer");
    String playerId = payload.get("playerId");

    Room room = GameService.rooms.get(roomId);
    if (room == null) return;

    long currentRoundTime = room.roundStartTime; // 🔥 ADD THIS

    // prevent duplicate answers
    if (room.answers.containsKey(playerId)) return;

    room.answers.put(playerId, answer);

    if (room.answers.size() == room.players.size()) {

        // 🔥 PREVENT OLD ROUND TRIGGER
        if (room.roundStartTime != currentRoundTime) return;

        room.answered = true;
        showAnswers(roomId);
    }
}

    private void showAnswers(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        if (room.answersShown) return; // 🔥 ADD THIS
        room.answersShown = true;  
        // messagingTemplate.convertAndSend("/topic/" + roomId,
        //         Map.of("type", "answers", "answers", room.answers));

        messagingTemplate.convertAndSend("/topic/" + roomId,
        Map.of(
            "type", "answers",
            "answers", room.answers,
            "players", room.players)
        );

        // scheduler.schedule(() -> {
        //     messagingTemplate.convertAndSend("/topic/" + roomId, "start-voting");
        // }, 8000);
        long roundTime = room.roundStartTime;

        scheduler.schedule(() -> {
        Room r = GameService.rooms.get(roomId);
        if (r == null || r.roundStartTime != roundTime) return;

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

        // ❌ BLOCK SELF VOTE
        if (playerId.equals(vote)) {
            System.out.println("⚠️ Self vote blocked");
            return;
        }
        
        // prevent duplicate vote
        if (room.votes.containsKey(playerId)) return;
        room.votes.put(playerId, vote);


        if (!room.votesCalculated && room.votes.size() == room.players.size()) {
            room.votesCalculated = true;
            System.out.println("✅ ALL VOTES RECEIVED → calculating");
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

    messagingTemplate.convertAndSend("/topic/" + roomId,
    Map.of(
        "type", "result",
        "suspect", suspectPlayer != null ? suspectPlayer.name : "Tie",
        "impostor", impostorPlayer != null ? impostorPlayer.name : "Unknown",
        "players", room.players,
        "votes", room.votes)
    );

    long roundTime = room.roundStartTime;

    scheduler.schedule(() -> {
        Room r = GameService.rooms.get(roomId);
        if (r == null || r.roundStartTime != roundTime) return;

        nextRound(roomId);
    }, 8000);


    scheduler.schedule(() -> {
    Room r = GameService.rooms.get(roomId);
    if (r == null || r.roundStartTime != roundTime) return;

    if (!r.votesCalculated) {
        r.votesCalculated = true;
        calculateVotes(roomId);
    }
    }, 20000);

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

    private Map<String, Object> createHeaders(String sessionId) {
    SimpMessageHeaderAccessor headerAccessor =
        SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);

    headerAccessor.setSessionId(sessionId);
    headerAccessor.setLeaveMutable(true);

    return headerAccessor.getMessageHeaders();
    }

}