const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

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
    socket.emit('broadcastMsg', "Welocme !!")
    socket.broadcast.emit("broadcastMsg", "New user joined " + socket.id)

    // recieving client messages
    socket.on('acknowledgeMessage', (clientMessage, callback) => {
        // filtering the messages
        var filter = new Filter()
        filter.addWords('madarchod', 'bsdk', 'lavda')
        if (filter.isProfane(clientMessage)) {
            return callback('bad words !!!!')
        }
        io.emit('broadcastMsg', clientMessage)

        // callback is using to ack the msg delivery status
        callback('Delivered : !')
    })

    // reciving current location and updating to all clients
    socket.on('geoLocation', (geoLocation, callback) => {
        io.emit('broadcastMsg', `https://google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`)
        callback()
    })

    // broadcast all clients if any client is disconnected
    socket.on('disconnect', () => {
        io.emit('broadcastMsg', socket.id + " user left !!")
    })
})

server.listen(port, () => {
    console.log(`App is running on port ${port}!`)
})