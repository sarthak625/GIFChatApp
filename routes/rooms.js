// Libraries
const router = require('express').Router();
const multer  = require('multer')
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

// Create a room => POST request
router.post('/create', upload.single('logo'), async (req,res) => {
    // Get the file stream
    let buffer = fs.readFileSync(req.file.path);
    
    try{
        // Create a new object using the model
        const chatRoom = new ChatRoom({
            _id : uuid(),
            name : req.body.name,
            logo : buffer,
            limit: 30,
            createdOn : new Date()
        });
        
        // Limit the rooms to 10
        let count = await ChatRoom.countDocuments();
        
        if (count >= 10){
            throw errors.RateLimiting();
        }
        else{
            await chatRoom.save();
            let result = success.Success(`Room "${req.body.name}" created successfully`);
            res.status(result.code).render('create-room', { response: result } );
        }
    }
    catch(err){
        if (err.code){
            res.status(err.code).render('create-room', { response: err });
        }
        else{
            console.log(err);
            err = errors.InternalServerError();
            res.status(err.code).render('create-room', { response: err });
        }
    }
});

// Load the web page for room creation
router.get('/create',(req,res)=> {
    res.render('create-room');
});

module.exports = router;