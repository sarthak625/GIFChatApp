// Configure envs
require('dotenv').config();

// Import libs
const express = require('express');
const logger = require('morgan');
const path = require('path');

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

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('The user got disconnected');
    });

    socket.on('some message', function(val){
        console.log(`Message recieved at ${new Date()}`);
    })
});

http.listen(port, ()=> console.log(`Server running at port ${port}`));