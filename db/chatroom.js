const { mongoose, connection } = require('./connect');
const uuid = require('uuid/v1');

const Schema = mongoose.Schema;

const chatRoom = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
            uuid()
        }
    },
    name: String,
    logo: Buffer,
    limit: Number,
    createdOn: Date
});

const ChatRoom = connection.model('ChatRoom', chatRoom);

module.exports = ChatRoom;
