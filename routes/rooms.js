const router = require('express').Router();
const { ChatRoom } = require('../db/chatroom');
const { errors, success } = require('../status-codes/codes');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

router.post('/create', upload.single('logo'), async (req,res) => {
    console.log(req.file);
    console.log(req)
    //     const chatRoom = new ChatRoom({
    //         name : req.body.name,
    //         logo : req.body.buffer,
    //         limit: 30,
    //         createdOn : new Date()
    //     });
        
    //     await chatRoom.save();
    //     let result = success.Success();
    //     res.status(result.code).send(result);
    // }
    // catch(err){
    //     console.log(err);
    //     err = errors.InternalServerError();
    //     res.status(err.code).send(err);
    // }
});

router.get('/create',(req,res)=> {
    res.render('create-room');
})

module.exports = router;