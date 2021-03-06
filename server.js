const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
//Socket Server. Path set to './socket.io' and serverClient to 'true' by default
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
})
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer)

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

// var ExpressPeerServer = require("peer").ExpressPeerServer;    
var options = {
    debug: true,
    allow_discovery: true,
};

// let peerServer = ExpressPeerServer(server, options);
// app.use("/peerjs", peerServer);


//io.of('/).on = io.on 
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        //socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        // messages
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        })

        // user disconnected
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server Started on ${PORT}`))