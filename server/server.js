const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")

const questions = require("./questions")

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server,{
cors:{origin:"*"}
})

const rooms = {}

function randomRoom(){
return Math.random().toString(36).substring(2,6).toUpperCase()
}

function pickQuestion(){
return questions[Math.floor(Math.random()*questions.length)]
}

// function startRound(roomId){

// const room = rooms[roomId]

// room.answers = {}
// room.votes = {}

// const players = room.players

// const impostorIndex = Math.floor(Math.random()*players.length)

// room.impostor = players[impostorIndex].id

// const q = pickQuestion()

// room.question = q

// players.forEach(player=>{

// if(player.id === room.impostor){

// io.to(player.id).emit("question",{
// text:q.impostor,
// round:room.round
// })

// }else{

// io.to(player.id).emit("question",{
// text:q.normal,
// round:room.round
// })

// }

// })

// }


function startRound(roomId){

const room = rooms[roomId]

room.answers = {}
room.votes = {}

const players = room.players

const impostorIndex = Math.floor(Math.random()*players.length)

room.impostor = players[impostorIndex].id

const q = pickQuestion()

room.question = q

// 🚀 STEP 1 → tell frontend to navigate
io.to(roomId).emit("start-game")

// 🚀 STEP 2 → delay question so frontend is ready
setTimeout(()=>{

players.forEach(player=>{

if(player.id === room.impostor){

io.to(player.id).emit("question",{
text:q.impostor,
round:room.round
})

}else{

io.to(player.id).emit("question",{
text:q.normal,
round:room.round
})

}

})

},800)

}

function showAnswers(roomId){

const room = rooms[roomId]

io.to(roomId).emit("answers",room.answers)

setTimeout(()=>{

io.to(roomId).emit("start-voting",room.players)

},5000)

}

function calculateVotes(roomId){

const room = rooms[roomId]

let count = {}

Object.values(room.votes).forEach(v=>{
count[v] = (count[v]||0)+1
})

let max = 0
let suspect = null

for(let p in count){

if(count[p] > max){
max = count[p]
suspect = p
}

}

room.players.forEach(p=>{

if(p.id === suspect && suspect === room.impostor){
p.score += 20
}

if(p.id !== suspect && p.id !== room.impostor){
p.score += 10
}

})

io.to(roomId).emit("result",{
suspect,
impostor:room.impostor,
players:room.players
})

setTimeout(()=>{
nextRound(roomId)
},5000)

}

function nextRound(roomId){

const room = rooms[roomId]

room.round++

if(room.round > 10){
io.to(roomId).emit("game-over")
return
}

startRound(roomId)

}

io.on("connection",(socket)=>{

socket.on("create-room",({username})=>{

const roomId = randomRoom()

rooms[roomId] = {
players:[{
id:socket.id,
name:username,
score:0
}],
host:socket.id,
round:0,
answers:{},
votes:{}
}

socket.join(roomId)

socket.emit("room-created",roomId)

})

socket.on("join-room",({roomId,username})=>{

if(!rooms[roomId]) return

rooms[roomId].players.push({
id:socket.id,
name:username,
score:0
})

socket.join(roomId)

io.to(roomId).emit("players",rooms[roomId].players)

})


socket.on("get-question", ({ roomId }) => {

  const room = rooms[roomId]
  if (!room || !room.question) return

  const player = room.players.find(p => p.id === socket.id)
  if (!player) return

  if (player.id === room.impostor) {
    socket.emit("question", {
      text: room.question.impostor,
      round: room.round
    })
  } else {
    socket.emit("question", {
      text: room.question.normal,
      round: room.round
    })
  }

})


socket.on("start-game",(roomId)=>{

const room = rooms[roomId]

room.round = 1

startRound(roomId)

})

socket.on("answer",({roomId,answer})=>{

const room = rooms[roomId]

room.answers[socket.id] = answer

if(Object.keys(room.answers).length === room.players.length || Object.keys(room.answers).length >=1 ){
showAnswers(roomId)
}

})

socket.on("vote",({roomId,vote})=>{

const room = rooms[roomId]

room.votes[socket.id] = vote

if(Object.keys(room.votes).length === room.players.length){
calculateVotes(roomId)
}

})

socket.on("chat",({room,msg})=>{
io.to(room).emit("chat",msg)
})

})

server.listen(5000,()=>{
console.log("Server running on 5000")
})










// const express = require("express")
// const http = require("http")
// const cors = require("cors")
// const { Server } = require("socket.io")

// const questions = require("./questions")

// const app = express()
// app.use(cors())

// const server = http.createServer(app)

// const io = new Server(server,{
// cors:{origin:"*"}
// })

// const rooms = {}

// function randomRoom(){
// return Math.random().toString(36).substring(2,6).toUpperCase()
// }

// function pickQuestion(){
// return questions[Math.floor(Math.random()*questions.length)]
// }

// function startRound(roomId){

// const room = rooms[roomId]

// room.answers = {}
// room.votes = {}

// const players = room.players

// const impostorIndex = Math.floor(Math.random()*players.length)

// room.impostor = players[impostorIndex].id

// const q = pickQuestion()

// room.question = q

// players.forEach(player=>{

// if(player.id === room.impostor){

// io.to(player.id).emit("question",{
// text:q.impostor,
// round:room.round
// })

// }else{

// io.to(player.id).emit("question",{
// text:q.normal,
// round:room.round
// })

// }

// })

// }

// function showAnswers(roomId){

// const room = rooms[roomId]

// io.to(roomId).emit("answers",room.answers)

// setTimeout(()=>{

// io.to(roomId).emit("start-voting",room.players)

// },5000)

// }

// function calculateVotes(roomId){

// const room = rooms[roomId]

// let count = {}

// Object.values(room.votes).forEach(v=>{
// count[v] = (count[v]||0)+1
// })

// let max = 0
// let suspect = null

// for(let p in count){

// if(count[p] > max){
// max = count[p]
// suspect = p
// }

// }

// room.players.forEach(p=>{

// if(p.id === suspect && suspect === room.impostor){
// p.score += 20
// }

// if(p.id !== suspect && p.id !== room.impostor){
// p.score += 10
// }

// })

// io.to(roomId).emit("result",{
// suspect,
// impostor:room.impostor,
// players:room.players
// })

// setTimeout(()=>{
// nextRound(roomId)
// },5000)

// }

// function nextRound(roomId){

// const room = rooms[roomId]

// room.round++

// if(room.round > 10){
// io.to(roomId).emit("game-over")
// return
// }

// startRound(roomId)

// }

// io.on("connection",(socket)=>{

// socket.on("create-room",({username})=>{

// const roomId = randomRoom()

// rooms[roomId] = {
// players:[{
// id:socket.id,
// name:username,
// score:0
// }],
// host:socket.id,
// round:0,
// answers:{},
// votes:{}
// }

// socket.join(roomId)

// socket.emit("room-created",roomId)

// })

// socket.on("join-room",({roomId,username})=>{

// if(!rooms[roomId]) return

// rooms[roomId].players.push({
// id:socket.id,
// name:username,
// score:0
// })

// socket.join(roomId)

// io.to(roomId).emit("players",rooms[roomId].players)

// })

// socket.on("start-game",(roomId)=>{

// const room = rooms[roomId]

// room.round = 1

// startRound(roomId)

// })

// socket.on("answer",({roomId,answer})=>{

// const room = rooms[roomId]

// room.answers[socket.id] = answer

// if(Object.keys(room.answers).length === room.players.length){
// showAnswers(roomId)
// }

// })

// socket.on("vote",({roomId,vote})=>{

// const room = rooms[roomId]

// room.votes[socket.id] = vote

// if(Object.keys(room.votes).length === room.players.length){
// calculateVotes(roomId)
// }

// })

// socket.on("chat",({room,msg})=>{
// io.to(room).emit("chat",msg)
// })

// })

// server.listen(5000,()=>{
// console.log("Server running on 5000")
// })