// Libraries
const router = require('express').Router();
const multer = require('multer')
const fs = require('fs');
const uuid = require('uuid/v1');

// Import Model
const ChatRoom = require('../db/chatroom');

// Import status codes
const { errors, success } = require('../status-codes/codes');

// Multer upload destination
const upload = multer({ dest: 'uploads/' });

/**
 * Route definitions
 */

// Home route
router.get('/', async (req, res) => {
    res.render('home', { rooms: await getAllRooms() });
});

router.get('/room/list', async(req,res) => {
    res.render('rooms', { rooms: await getAllRooms() });
});

// Create a room => POST request
router.post('/room/create', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            throw errors.NotFound('You must provide a logo');
        }
        else {
            // Get the file stream
            let buffer = fs.readFileSync(req.file.path);

            // Create a new object using the model
            const chatRoom = new ChatRoom({
                _id: uuid(),
                name: req.body.name,
                logo: buffer,
                limit: 30,
                createdOn: new Date()
            });

            // Limit the rooms to 10
            let count = await ChatRoom.countDocuments();

            if (count >= 10) {
                throw errors.RateLimiting('You can only create upto a maximum of 10 rooms.');
            }
            else {
                await chatRoom.save();
                let result = success.Success(`Room "${req.body.name}" created successfully`);
                res.redirect(`/room/view/${req.body.name}`);
                // res.status(result.code).render('room', { response: result, rooms : await getAllRooms() });
                // res.status(result.code).render('create-room', { response: result, rooms : await getAllRooms() });
            }
        }
    }
    catch (err) {
        if (err.code === 11000) {
            err = errors.Conflict('Sorry! This room name has already been taken.');
            console.log(err);
            res.status(err.code).render('create-room', { response: err, rooms: await getAllRooms() });
        }
        else if (err.code && err.message) {
            res.status(err.code).render('create-room', { response: err, rooms: await getAllRooms() });
        }
        else {
            // console.log(err);    
            err = errors.InternalServerError();
            res.status(err.code).render('create-room', { response: err, rooms: await getAllRooms() });
        }
    }
});

// Load the web page for room creation
router.get('/room/create', async (req, res) => {
    res.render('create-room', { rooms: await getAllRooms() });
});

// Get all the rooms for the UI dropdown
async function getAllRooms() {
    let data = await ChatRoom.find();
    let rooms = data.map(element =>
        ({
            name: element.name,
            logo: `${process.env.IP}:${process.env.PORT}/room/logo/${element.name}`,
            createdOn: element.createdOn.toDateString()
        }));
    return rooms;
};

router.get('/room/view/:name', async (req, res) => {
    try {
        
        let name = req.params.name;
        // Get db data for the name
        let data = await ChatRoom.findOne({ name });

        if (!data) {
            throw errors.NotFound(`Could not find this room!`);
        }

        let response = {
            name: data.name,
            createdOn: data.createdOn,
            limit: data.limit,
            logo: `/room/logo/${name}`
        }

        res.render('room', { response: response, rooms: await getAllRooms() });
    }
    catch (err) {
        if (err.code) {
            res.status(err.code).render('room', { response: err, rooms: await getAllRooms() });
        }
        else {
            console.log(err);
            err = errors.InternalServerError();
            res.status(err.code).render('room', { response: err, rooms: await getAllRooms() });
        }
    }
});

let Duplex = require('stream').Duplex;
function bufferToStream(buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

router.get('/room/logo/:name', async (req, res) => {
    try {
        let name = req.params.name;
        // Get the image buffer
        let response = await ChatRoom.findOne({ name });
        let logo = response.logo;

        // Convert the buffer to a stream
        let readableStreamBuffer = bufferToStream(logo);

        // Set the headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,' + Object.keys(req.headers).join());
        res.set('Content-Type', 'image/jpeg');

        // Stream the image
        readableStreamBuffer.pipe(res);
    }
    catch (err) {
        if (err.code) {
            res.status(err.code).render('room', { response: err, rooms: await getAllRooms() });
        }
        else {
            err = errors.InternalServerError();
            res.status(err.code).render('room', { response: err, rooms: await getAllRooms() });
        }
    }
});

module.exports = router;