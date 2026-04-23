# 🎭 OddOneOut – Real-Time Multiplayer Game

A real-time multiplayer web game inspired by social deduction mechanics (like *Among Us* / *Spyfall*), where players must identify the impostor through discussion and voting.

---

## 🎓 Academic Context

**Distributed Systems Mini Project (BE 2019 Pattern, SPPU 2026)**  

This project was developed as part of the **Distributed Systems** course to demonstrate core concepts such as:

- Real-time client-server communication using WebSockets  
- Event-driven architecture  
- State synchronization across multiple clients  
- Handling concurrency in multiplayer environments  
- Scalable message broadcasting and user-specific messaging  

---

## 🚀 Live Demo

* 🌐 Frontend (Vercel): https://oddoneout.vercel.app *(update if needed)*
* ⚙️ Backend (Render): https://oddoneout-backend.onrender.com

---

## 🧠 Game Flow

1. Players join a room
2. Each player gets a role:

   * 🟢 Normal Player → receives actual question
   * 🔴 Impostor → receives a different/misleading question
3. Players discuss answers
4. Voting phase begins
5. Players vote who they think is the impostor
6. Result is revealed 🎉

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Framer Motion

### Backend

* Spring Boot (Java)
* WebSocket (STOMP protocol)
* SockJS

### Deployment

* Frontend → Vercel
* Backend → Render (Docker)

---

## 🔌 WebSocket Architecture

### Endpoint

```
/ws
```

### Message Flow

| Type           | Destination        | Description              |
| -------------- | ------------------ | ------------------------ |
| Send message   | `/app/{action}`    | Client → Server          |
| Room broadcast | `/topic/{roomId}`  | Server → All players     |
| Private user   | `/user/queue/game` | Server → Specific player |

---

## 🧩 Frontend Socket Setup

Using:

* `sockjs-client`
* `@stomp/stompjs`

### Connect

```js
connectSocket(() => {
  console.log("Connected")
})
```

### Subscribe to room

```js
subscribeRoom(roomId, (msg) => {
  console.log(msg)
})
```

### Send message

```js
sendMessage("join", {
  roomId,
  playerId
})
```

### Private user messages

```js
subscribePrivateUser((msg) => {
  console.log(msg)
})
```

---

## ⚙️ Backend Configuration

### WebSocketConfig.java

Key configs:

* Broker:

```
/topic
/queue
```

* Application prefix:

```
/app
```

* User prefix:

```
/user
```

### Important Fix

```java
accessor.setUser(() -> sessionId);
```

This ensures:

* Proper private messaging
* Unique user identification

---

## 🌍 Environment Variables

### Backend (Render)

```
PORT=10000
```

### Spring Boot

```
server.port=${PORT:8080}
```

---

## 🐳 Docker Setup (Backend)

```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY server /app
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

---

## ⚠️ Common Issues (Solved)

### 1. Timer resetting multiple times

* Cause: React re-renders triggering reset
* Fix: Use `phase`-based trigger

---

### 2. WebSocket double connection

* Cause: Multiple connect calls
* Fix: `isConnecting` flag

---

### 3. Private messages not working

* Fix:

```java
accessor.setUser(() -> sessionId);
```

---

### 4. Render build errors

* `mvn: command not found` → use Docker
* `Dockerfile not found` → place at root

---

## 📌 Future Improvements

* ✅ UI feedback (vote submitted, answer submitted)
* ⏱️ Stable timer system
* 🎨 Better animations
* 🔐 Authentication
* 📊 Score tracking

---

## 🙌 Author

Aaryan Bairagi
GitHub: https://github.com/AaryanBairagi

---

## ⭐ If you like this project

Give it a star ⭐ and share it!

