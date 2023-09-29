const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const workoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    durationInMinutes: {
        type: Number,
        required: true,
    },
    exercises: [
        {
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            sets: {
                type: Number,
                required: true,
            },
            reps: {
                type: Number,
                required: true,
            },
            imageURL: {
                type: String,
                required: true,
            },
        }
    ],
    imageURL: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})




const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;