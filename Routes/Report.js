const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const errorHandler = require('../Middlewares/errorMiddleware');
const request = require('request');
const User = require('../Models/UserSchema');
require('dotenv').config();


function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}


router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for report'));
});

router.get('/getreport', authTokenHandler, async (req, res) => {
    // get today's calorieIntake
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    let today = new Date();

    let calorieIntake = 0;
    user.calorieIntake.forEach((entry) => {
        if (entry.date.getDate() === today.getDate() && entry.date.getMonth() === today.getMonth() && entry.date.getFullYear() === today.getFullYear()) {
            calorieIntake += entry.calorieIntake;
        }
    });

    // get today's sleep
    let sleep = 0;
    user.sleep.forEach((entry) => {
        if (entry.date.getDate() === today.getDate() && entry.date.getMonth() === today.getMonth() && entry.date.getFullYear() === today.getFullYear()) {
            sleep += entry.durationInHrs;
        }
    });

    // get today's water
    let water = 0;
    user.water.forEach((entry) => {
        if (entry.date.getDate() === today.getDate() && entry.date.getMonth() === today.getMonth() && entry.date.getFullYear() === today.getFullYear()) {
            water += entry.amountInMilliliters;
        }
    });

    // get today's steps
    let steps = 0;
    user.steps.forEach((entry) => {
        if (entry.date.getDate() === today.getDate() && entry.date.getMonth() === today.getMonth() && entry.date.getFullYear() === today.getFullYear()) {
            steps += entry.steps;
        }
    });

    // get today's weight
    let weight = user.weight[user.weight.length - 1].weight;
    // get today's height
    let height = user.height[user.height.length - 1].height;

    // get this week's workout
    let workout = 0;
    user.workouts.forEach((entry) => {
        if (entry.date.getDate() >= today.getDate() - 7 && entry.date.getMonth() === today.getMonth() && entry.date.getFullYear() === today.getFullYear()) {
            workout += 1;
        }
    });



    // get goal calorieIntake

    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    let gender = user.gender;
    if (gender == 'male') {
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age)

    }
    else if (gender == 'female') {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)

    }
    else {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)
    }
    if (user.goal == 'weightLoss') {
        maxCalorieIntake = BMR - 500;
    }
    else if (user.goal == 'weightGain') {
        maxCalorieIntake = BMR + 500;
    }
    else {
        maxCalorieIntake = BMR;
    }



    // get goal weight
    let goalWeight = 22 * ((user.height[user.height.length - 1].height / 100) ** 2);

    // get goal workout
    let goalWorkout = 0;
    if (user.goal == "weightLoss") {
   
        goalWorkout = 7;
    }
    else if (user.goal == "weightGain") {
    
        goalWorkout = 4;
    }
    else {
    
        goalWorkout = 5;
    }


    // get goal steps
    let goalSteps = 0;
    if (user.goal == "weightLoss") {
        goalSteps = 10000;
    }
    else if (user.goal == "weightGain") {
        goalSteps = 5000;
    }
    else {
        goalSteps = 7500;
    }

    // get goal sleep
    let goalSleep = 6;

    // get goal water
    let goalWater = 4000;

    

    let tempResponse = [
        {
            name : "Calorie Intake",
            value : calorieIntake,
            goal : maxCalorieIntake,
            unit : "cal",
        },
        {
            name : "Sleep",
            value : sleep,
            goal : goalSleep,
            unit : "hrs",
        },
        {
            name: "Steps",
            value : steps,
            goal : goalSteps,
            unit : "steps",
        },
        {
            name : "Water",
            value : water,
            goal : goalWater,
            unit : "ml",
        },
        {
            name : "Workout",
            value : workout,
            goal : goalWorkout,
            unit : "days",
        },
        {
            name : "Weight",
            value : weight,
            goal : goalWeight,
            unit : "kg",
        },
        {
            name : "Height",
            value : height,
            goal : "",
            unit : "cm",
        },
    ]

    res.json(createResponse(true, 'Report', tempResponse));
})



module.exports = router;

