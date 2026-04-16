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

        messagingTemplate.convertAndSend("/topic/" + roomId, room);
    }

    // JOIN ROOM
    @MessageMapping("/join-room")
    public void joinRoom(Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String username = payload.get("username");

        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.players.add(new Player(UUID.randomUUID().toString(), username));

        messagingTemplate.convertAndSend("/topic/" + roomId, room.players);
    }

    // START GAME
    @MessageMapping("/start-game")
    public void startGame(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.round = 1;
        startRound(roomId);
    }

    // ================= GAME FLOW =================

    private void startRound(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.answers.clear();
        room.votes.clear();
        room.answered = false;

        int impostorIndex = new Random().nextInt(room.players.size());
        room.impostor = room.players.get(impostorIndex).id;

        room.question = QuestionsData.randomQuestion();

        messagingTemplate.convertAndSend("/topic/" + roomId, "start-game");

        // ⏱ send question after 800ms
        scheduler.schedule(() -> sendQuestions(roomId), 800);

        // ⏱ auto end answers after 45s
        scheduler.schedule(() -> {
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

            messagingTemplate.convertAndSend("/topic/" + roomId,
                    Map.of("playerId", p.id, "text", text, "round", room.round));
        }
    }

    // ANSWER
    @MessageMapping("/answer")
    public void answer(Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String answer = payload.get("answer");

        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.answers.put(UUID.randomUUID().toString(), answer);

        if (!room.answered) {
            room.answered = true;
            showAnswers(roomId);
        }
    }

    private void showAnswers(String roomId) {
        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        messagingTemplate.convertAndSend("/topic/" + roomId,
                Map.of("type", "answers", "answers", room.answers));

        scheduler.schedule(() -> {
            messagingTemplate.convertAndSend("/topic/" + roomId, "start-voting");
        }, 240000);
    }

    // VOTE
    @MessageMapping("/vote")
    public void vote(Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String vote = payload.get("vote");

        Room room = GameService.rooms.get(roomId);
        if (room == null) return;

        room.votes.put(UUID.randomUUID().toString(), vote);

        if (room.votes.size() >= 1) {
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
        String suspect = null;

        for (String p : count.keySet()) {
            if (count.get(p) > max) {
                max = count.get(p);
                suspect = p;
            }
        }

        Player suspectPlayer = null;
        Player impostorPlayer = null;

        for (Player p : room.players) {
            if (p.id.equals(suspect)) suspectPlayer = p;
            if (p.id.equals(room.impostor)) impostorPlayer = p;
        }

        for (Player p : room.players) {
            if (p.id.equals(suspect) && suspect.equals(room.impostor)) {
                p.score += 20;
            }

            if (!p.id.equals(suspect) && !p.id.equals(room.impostor)) {
                p.score += 10;
            }
        }

        messagingTemplate.convertAndSend("/topic/" + roomId,
                Map.of(
                        "type", "result",
                        "suspect", suspectPlayer != null ? suspectPlayer.name : "No one",
                        "impostor", impostorPlayer != null ? impostorPlayer.name : "Unknown",
                        "players", room.players
                )
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