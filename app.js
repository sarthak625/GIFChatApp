// Configure envs
require('dotenv').config();

// Import libs
const express = require('express');
const logger = require('morgan');
const path = require('path');

const giphy = require('./giphy/search');

const app = express();


// Set up view engine and static directory
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares

// Set up logger
app.use(logger('dev'));
// app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb' , extended: true}));

// Routes
app.use('/', require('./routes/rooms'));

// Listen on port
let port = process.env.PORT || 3000;

const http = require('http').createServer(app);
var io = require('socket.io')(http);

// Connect to DB
require('./db/connect');

// Server name
const server = "SERVER";

String.prototype.getQueryWithinQuotes = function(){

    let query = this;

    let words = [];
    let quotesLoc = [], j=0;
    for (let i=0; i<query.length; i++){
        if (query[i] === '"') {
            quotesLoc[j] = i;
            j++;
        } 
    }

    for (let i=0;i+2 <= quotesLoc.length; i+=2){
        let start = quotesLoc[i] + 1;
        let end =   quotesLoc[i+1];

        let word = query.substring(start, end);
        words.push(word);
    }

    return words;
}   

let activeUsers = {};
io.on('connection', function(socket){

    socket.on('addUser', (username, room) => {
        console.log('Username: ',username);
        console.log('Room: ',room);
        
        socket.username = username;
        socket.room = room;
        socket.join(room);

        if (!activeUsers[room]){
            activeUsers[room] = {};
        }
        activeUsers[room][username] = 1;
        
        console.log(activeUsers)
        socket.emit('messageUser', server, `You have connected to room: ${room}`,[],activeUsers[room]);
        socket.broadcast.to(room).emit('messageUser', server, `${username} has connected to this room`,[],activeUsers[room]);
    });

    socket.on('disconnect', function(){
        if (socket.room && socket.username){
            console.log(`${socket.username} got disconnected`);
            delete activeUsers[socket.room][socket.username];
            socket.broadcast.to(socket.room).emit('messageUser', server, `${socket.username} left this room`,[], activeUsers[socket.room]);
        }
    });

    socket.on('chat message', async function(message){
        console.log(`Message recieved at ${new Date()}`);
        console.log(`Sending ${socket.username}, ${message}, ${socket.room}`);

        // Check for gifs
        let gifs = message.getQueryWithinQuotes();

        let gifUrls = [];
        if (gifs.length != 0){
            gifUrls = await giphy.generateGIFURLBulk(gifs);
        }

        socket.emit('messageUser', socket.username, message, gifUrls, activeUsers[socket.room]);
        socket.broadcast.to(socket.room).emit('chat message', socket.username, message, gifUrls );
    })
});

http.listen(port, ()=> console.log(`Server running at port ${port}`));