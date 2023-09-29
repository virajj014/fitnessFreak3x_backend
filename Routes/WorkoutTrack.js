const express = require('express');
const router = express.Router();

const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const User = require('../Models/UserSchema');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/addworkoutentry', authTokenHandler, async (req, res) => {
    const { date, exercise, durationInMinutes } = req.body;

    if (!date || !exercise || !durationInMinutes) {
        return res.status(400).json(createResponse(false, 'Please provide date, exercise, and duration'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.workouts.push({
        date: new Date(date),
        exercise,
        durationInMinutes,
    });

    await user.save();
    res.json(createResponse(true, 'Workout entry added successfully'));
});

router.post('/getworkoutsbydate', authTokenHandler, async (req, res) => {
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.workouts = filterEntriesByDate(user.workouts, date);

        return res.json(createResponse(true, 'Workout entries for today', user.workouts));
    }

    user.workouts = filterEntriesByDate(user.workouts, new Date(date));
    res.json(createResponse(true, 'Workout entries for the date', user.workouts));
});


// has a bug
router.post('/getworkoutsbylimit', authTokenHandler, async (req, res) => {
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All workout entries', user.workouts));
    } else {
        let date = new Date();
        date.setDate(date.getDate() - parseInt(limit));
        user.workouts = filterEntriesByDate(user.workouts, date);

        return res.json(createResponse(true, `Workout entries for the last ${limit} days`, user.workouts));
    }
});

router.delete('/deleteworkoutentry', authTokenHandler, async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json(createResponse(false, 'Please provide date'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.workouts = user.workouts.filter(entry => entry.date !== date);

    await user.save();
    res.json(createResponse(true, 'Workout entry deleted successfully'));
});


// has a bug
router.get('/getuserworkouts', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    res.json(createResponse(true, 'User workout history', { workouts: user.workouts }));
});

router.use(errorHandler);

function filterEntriesByDate(entries, targetDate) {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
            entryDate.getDate() === targetDate.getDate() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getFullYear() === targetDate.getFullYear()
        );
    });
}

module.exports = router;
