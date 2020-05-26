const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/user.js')

const app = express()
const port = process.env.PORT || 3000

// created socket which can communicate clients
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

// enables chat soket to access in web pages
io.on('connection', (socket) => {
    console.log("new Socket connection initaited !!", socket.id)

    // join client room
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('broadcastMsg', generateMessage("Admin", "Welocme !!"))
        socket.broadcast.to(user.room).emit("broadcastMsg", generateMessage("Admin", `${user.username} joined`))
        callback()
    })

    // recieving client messages
    socket.on('acknowledgeMessage', (clientMessage, callback) => {
        // filtering the messages
        var filter = new Filter()
        filter.addWords('madarchod', 'bsdk', 'lavda')
        if (filter.isProfane(clientMessage)) {
            return callback('bad words !!!!')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('broadcastMsg', generateMessage(user.username, clientMessage))

        // callback is using to ack the msg delivery status
        callback('Delivered : !')
    })

    // reciving current location and updating to all clients
    socket.on('geoLocation', (geoLocation, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`))
        callback()
    })

    // broadcast all clients if any client is disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('broadcastMsg', generateMessage("Admin", `${user.username} has left!`))
        }
    })
})

server.listen(port, () => {
    console.log(`App is running on port ${port}!`)
})