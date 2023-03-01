 const mongoose = require('mongoose');

 const launchesSchema = new mongoose.Schema({
    flightNumber: {
        required: true,
        type: Number,
    },
    launchDate:{
        type: Date,
        required: true,
    },
    mission:{
        required: true,
        type: String,
    },
    rocket: {
        required: true,
        type: String,
    },
    target: {
        type: String,       
    },
    upcoming:{
        type: Boolean,
        required: true,
    },
    success:{
        type: Boolean,
        required: true,
        default: true,
    },
    customers: [String],
 });

 //conects launches scheman with the launches collection
 module.exports = mongoose.model('Launch', launchesSchema);