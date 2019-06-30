const mongoose = require('mongoose');

let connection = mongoose.createConnection(process.env.MONGODB_URI, {useNewUrlParser: true});

module.exports = {
    connection,
    mongoose
}