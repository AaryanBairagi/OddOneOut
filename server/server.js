const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const questions = require("./questions");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

function randomRoom() {
  return Math.random().toString(36).substring(2,6).toUpperCase();
}

function pickQuestion() {
  return questions[Math.floor(Math.random()*questions.length)];
}

io.on("connection",(socket)=>{

console.log("User connected",socket.id)

socket.on("create-room",({username})=>{

const roomId = randomRoom();

rooms[roomId] = {
players:[{id:socket.id,name:username}],
host:socket.id,
round:0
}

socket.join(roomId)

socket.emit("room-created",roomId)

})

socket.on("join-room",({roomId,username})=>{

if(!rooms[roomId]) return

rooms[roomId].players.push({
id:socket.id,
name:username
})

socket.join(roomId)

io.to(roomId).emit("players",rooms[roomId].players)

})

socket.on("start-game",(roomId)=>{

const room = rooms[roomId]

room.round++

const players = room.players

const impostorIndex = Math.floor(Math.random()*players.length)

room.impostor = players[impostorIndex].id

const q = pickQuestion()

room.question = q

players.forEach(player=>{

if(player.id === room.impostor){

io.to(player.id).emit("question",q.impostor)

}else{

io.to(player.id).emit("question",q.normal)

}

})

})

socket.on("answer",({roomId,answer})=>{

const room = rooms[roomId]

if(!room.answers) room.answers = {}

room.answers[socket.id] = answer

if(Object.keys(room.answers).length === room.players.length){

io.to(roomId).emit("answers",room.answers)

}

})

socket.on("vote",({roomId,vote})=>{

const room = rooms[roomId]

if(!room.votes) room.votes = {}

room.votes[socket.id] = vote

if(Object.keys(room.votes).length === room.players.length){

let count = {}

Object.values(room.votes).forEach(v=>{
count[v] = (count[v] || 0)+1
})

let max = 0
let suspect = null

for(let p in count){

if(count[p] > max){
max = count[p]
suspect = p
}

}

io.to(roomId).emit("result",{
suspect,
impostor:room.impostor,
question:room.question
})

}

})

})

server.listen(5000,()=>{
console.log("Server running on 5000")
})