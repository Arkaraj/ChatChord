const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const BotName = 'ChatChord Bot';
const BotName2 = 'ChatChord BOT';

const joinSound = new Audio("join.mp3");
joinSound.crossOrigin = "anonymous";
const leaveSound = new Audio("leave.mp3");
leaveSound.crossOrigin = "anonymous";


//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});


socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    console.log(msg);

    // Emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    if (message.username == BotName) {
        var promise = joinSound.play();

        if (promise !== undefined) {
            promise.then(_ => {
                joinSound.play();
            }).catch(error => {
                console.log(error);
            });
        }
    }
    if (message.username == BotName2) {
        var promise = leaveSound.play();

        if (promise !== undefined) {
            promise.then(_ => {
                leaveSound.play();
            }).catch(error => {
                console.log(error);
            });
        }
    }
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p><p class="text"> 
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
