var express = require('express');
var app = express();
var bodyParser = require('body-parser')
const http = require("http")
const server = http.createServer(app);
const { Server } = require("socket.io");
const { disconnect } = require('process');
var io = new Server(server)

let roomCount = 0
let roomArray = []
let matchArray = []

const port = process.env.PORT || '4000'
app.set('port', port);

app.use(express.static(__dirname));

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//////////////////////////////////////////////////////////////////////////////////

function fetchUserId(sock) {
    return sock.id
}

function checkAvailableNames(msg, array) {
    if (msg != null){
        if ((array.includes(msg.toLowerCase()))) {
            return true
        }
    }   
}

function checkSelf(msg1, msg2) {
    if (msg1 != null && msg2 != null) {
        if (msg1.toLowerCase() != msg2.toLowerCase()) {
            return true
        }
    }  
}

function createNewRoom(socket, roomName) {
    //socket.join('room'+ roomCount);
    socket.join(roomName.toLowerCase())
    roomArray.push(roomName.toLowerCase())
    roomCount = roomArray.length
    console.log(`Current rooms: ${roomArray}`)
    socket.broadcast.emit('players online', roomArray)
    socket.emit('players online', roomArray)
}

function createUser(socket, message) {
    socket.data.user = message.toLowerCase()
    socket.data.enemy = ""
    console.log(`User ${socket.data.user} now created`)
    createNewRoom(socket, message)
}

function createMatch(socket, msg) {
    matchArray.push(`${msg[0]}+${msg[1]}`)
    io.in(msg[0]).socketsJoin(`${msg[0]}+${msg[1]}`)
    io.in(msg[1]).socketsJoin(`${msg[0]}+${msg[1]}`)
    //socket.join(`${msg[0]}+${msg[1]}`);
}

function removeRoom(room) {
    if (checkAvailableNames(room, roomArray)) {
        roomArray.splice((roomArray.indexOf(room)), 1)
        roomCount = roomArray.length
    }
    console.log(`Current rooms: ${roomArray}`)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

io.on('connection', async (socket) =>{
    console.log('a user is connected')
    
    socket.on("create user", (msg) => {
        if (!checkAvailableNames(msg, roomArray)) {
            io.to(socket.id).emit('valid user', 'user is created')
            createUser(socket, msg)
        }
        else {
            io.to(socket.id).emit('not valid', 'Username is already taken. Sorry!')
        }
    })


    socket.on("search friend", (msg) => {
        if (checkSelf(msg[0], msg[1])) {
            if (checkAvailableNames(msg[1], roomArray)) {
                io.to(msg[0]).emit('friend found', `friend found! sent request to ${msg[1]}`);
                io.to(msg[1]).emit('request match', [ msg[0], msg[1], `${msg[0]} invited you to a match!`,]);
            }
            else {
                io.to(msg[0]).emit('not online', `${msg[1]} is not online. Sorry!`)
            }
        }
        else {
            io.to(msg[0]).emit('not online', `Error! That's your username!`)
        }
    })

    socket.on('accept match', (msg) => {
        socket.data.enemy = msg[0]
        console.log(`${socket.data.user} is now playing ${socket.data.enemy}`)
        io.to(msg[0]).emit('player color', [msg[2], msg[1]] )
    })

    socket.on('accept rematch', (msg) => {
        socket.data.enemy = msg[0]
        console.log(`${socket.data.user} is now playing ${socket.data.enemy}`)
        io.to(msg[0]).emit('accept rematch', [msg[2], `${msg[0]}+${msg[1]}`] )
    })

    socket.on('reject match', (msg) => {
        io.to(msg[0]).emit('reject match', msg[2])
    })

    const userId = await fetchUserId(socket);
    console.log('ID: ' + userId)


    socket.on("game start", (msg) => {
        socket.data.enemy = msg[0]
        console.log(`${socket.data.user} is now playing ${socket.data.enemy}`)
    })

    
    socket.on('new move', (msg) => {
        console.log(msg)
        io.to(msg.enemy).emit('new move', msg)
    })

    socket.on('disconnect friend', (msg) => {
        io.to(msg[0]).emit("disconnect friend",`${msg[1]} has disconnected`)
    })

    socket.on('disconnect function', (msg) => {
        socket.disconnect(true)
    })

    socket.on('disconnect accepted', (msg) => {
        socket.data.enemy = ''
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        io.to(socket.data.enemy).emit("disconnect friend", `${socket.data.user} has disconnected`)
        console.log('bye ' + socket.data.user);
        removeRoom(socket.data.user)
        socket.broadcast.emit('players online', roomArray)
        socket.emit('players online', roomArray)
    })
    
})


////////////////////////////////////////////////////////////////////////////////


server.listen(port, () => {
    console.log('listening on port: 4000')
})


