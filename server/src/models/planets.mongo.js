const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    keplerName: {
        required: true,
        type: String,
    }
});

module.exports = mongoose.model('Planets', planetSchema);