const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//Set up static file
app.use(express.static(path.join(__dirname, 'Public')));

const Name = 'ChatChord Bot';
const Name2 = 'ChatChord BOT';

//Run when a client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {


        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        console.log('New Web Socket connection! ');

        socket.emit('message', formatMessage(Name, 'Welcome to ChatCord!'));

        // Broadcat when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(Name, `${user.username} has joined the chat`)); //Will notify everyone except the user

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chat Message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client dissconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(Name2, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));