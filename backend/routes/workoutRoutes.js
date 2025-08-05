const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const workoutController = require('../controllers/workoutController');

// Workout Categories
router.post('/categories', authenticate, workoutController.createCategory);
router.get('/categories', authenticate, workoutController.listCategories);
router.put('/categories/:category_id', authenticate, workoutController.updateCategory);
router.delete('/categories/:category_id', authenticate, workoutController.deleteCategory);

// Workouts
router.post('/workouts', authenticate, workoutController.createWorkout);
router.get('/workouts', authenticate, workoutController.listWorkouts);
router.put('/workouts/:workout_id', authenticate, workoutController.updateWorkout);
router.delete('/workouts/:workout_id', authenticate, workoutController.deleteWorkout);

// Week Plans
router.post('/week-plans', authenticate, workoutController.createWeekPlan);
router.get('/week-plans', authenticate, workoutController.listWeekPlans);
router.put('/week-plans/:week_plan_id', authenticate, workoutController.updateWeekPlan);
router.delete('/week-plans/:week_plan_id', authenticate, workoutController.deleteWeekPlan);

// Exercises
router.post('/exercises', authenticate, workoutController.createExercise);
router.get('/exercises', authenticate, workoutController.listExercises);
router.put('/exercises/:exercise_id', authenticate, workoutController.updateExercise);
router.delete('/exercises/:exercise_id', authenticate, workoutController.deleteExercise);

module.exports = router; 