const express = require('express');
const router = express.Router();
const errorHandler = require('../Middlewares/errorMiddleware');
const adminTokenHandler = require('../Middlewares/checkAdminToken');
const User = require('../Models/UserSchema');
const Workout = require('../Models/WorkoutSchema');


function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}


router.post('/workouts', adminTokenHandler , async (req, res) => {
    try {
        // name: {
        //     type: String,
        //     required: true,
        // },
        // description: {
        //     type: String,
        //     required: true,
        // },
        // durationInMinutes: {
        //     type: Number,
        //     required: true,
        // },
        // exercises: [
        //     {
        //         name: {
        //             type: String,
        //             required: true,
        //         },
        //         description: {
        //             type: String,
        //             required: true,
        //         },
        //         sets: {
        //             type: Number,
        //             required: true,
        //         },
        //         reps: {
        //             type: Number,
        //             required: true,
        //         },
        //         imageURL: {
        //             type: String,
        //             required: true,
        //         },
        //     }
        // ],
        // imageURL: {
        //     type: String,
        //     required: true,
        // },


        const { name, description, durationInMinutes, exercises, imageURL } = req.body;
        const workout = new Workout({
            name,
            description,
            durationInMinutes,
            exercises,
            imageURL,
        });

        await workout.save();
        res.json(createResponse(true, 'Workout created successfully', workout));
    } catch (err) {
        res.json(createResponse(false, err.message));
    }
});

router.get('/workouts', async (req, res) => {
    try {
        const workouts = await Workout.find({});
        res.json(createResponse(true, 'Workouts fetched successfully', workouts));
    } catch (err) {
        res.json(createResponse(false, err.message));
    }
});

router.get('/workouts/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        res.json(createResponse(true, 'Workout fetched successfully', workout));
    } catch (err) {
        res.json(createResponse(false, err.message));
    }
});


router.put('/workouts/:id', adminTokenHandler , async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        const { name, description, durationInMinutes, exercises, imageURL } = req.body;
        workout.name = name;
        workout.description = description;
        workout.durationInMinutes = durationInMinutes;
        workout.exercises = exercises;
        workout.imageURL = imageURL;
        await workout.save();
        res.json(createResponse(true, 'Workout updated successfully', workout));
    } catch (err) {
        res.json(createResponse(false, err.message));
    }
});

router.delete('/workouts/:id', adminTokenHandler , async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        await workout.remove();
        res.json(createResponse(true, 'Workout deleted successfully'));
    } catch (err) {
        res.json(createResponse(false, err.message));
    }
});



router.use(errorHandler);


module.exports = router;
