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

router.post('/addstepentry', authTokenHandler, async (req, res) => {
    const { date, steps } = req.body;

    if (!date || !steps) {
        return res.status(400).json(createResponse(false, 'Please provide date and steps count'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.steps.push({
        date: new Date(date),
        steps,
    });

    await user.save();
    res.json(createResponse(true, 'Steps entry added successfully'));
});

router.post('/getstepsbydate', authTokenHandler, async (req, res) => {
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.steps = filterEntriesByDate(user.steps, date);

        return res.json(createResponse(true, 'Steps entries for today', user.steps));
    }

    user.steps = filterEntriesByDate(user.steps, new Date(date));
    res.json(createResponse(true, 'Steps entries for the date', user.steps));
});


// has a bug
router.post('/getstepsbylimit', authTokenHandler, async (req, res) => {
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All steps entries', user.steps));
    } else {
        let date = new Date();
        date.setDate(date.getDate() - parseInt(limit));
        user.steps = filterEntriesByDate(user.steps, date);

        return res.json(createResponse(true, `Steps entries for the last ${limit} days`, user.steps));
    }
});

router.delete('/deletestepentry', authTokenHandler, async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json(createResponse(false, 'Please provide date'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.steps = user.steps.filter(entry => entry.date !== date);

    await user.save();
    res.json(createResponse(true, 'Steps entry deleted successfully'));
});


// has a bug
router.get('/getusersteps', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const totalSteps = user.steps.reduce((total, entry) => total + entry.steps, 0);

    res.json(createResponse(true, 'User steps information', { totalSteps }));
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
