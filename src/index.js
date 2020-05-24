const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const port = process.env.PORT || 3000

// created socket which can communicate clients
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

let message = 'Welocme !!'
// enables chat soket to access in web pages
io.on('connection', (socket) => {
    console.log("Chat Socket !!")
    socket.emit('broadcastMsg', message)

    socket.on('acknowledgeMessage', (ackMessage)=>{
        io.emit('broadcastMsg', ackMessage)
    })
})

server.listen(port, () => {
    console.log(`App is running on port ${port}!`)
})