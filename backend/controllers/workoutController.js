const WorkoutCategory = require('../models/WorkoutCategory');
const Workout = require('../models/Workout');
const WeekPlan = require('../models/WeekPlan');
const Exercise = require('../models/Exercise');

// --- Workout Categories ---
exports.createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const category = await WorkoutCategory.create({ name, description });
    return res.status(201).json({ message: 'Category created.', category });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category.', error: error.message });
  }
};
exports.listCategories = async (req, res) => {
  try {
    const categories = await WorkoutCategory.findAll();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { category_id } = req.params;
    const { name, description } = req.body;
    const category = await WorkoutCategory.findByPk(category_id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.update({ name, description });
    return res.status(200).json({ message: 'Category updated.', category });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category.', error: error.message });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { category_id } = req.params;
    const category = await WorkoutCategory.findByPk(category_id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.destroy();
    return res.status(200).json({ message: 'Category deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category.', error: error.message });
  }
};

// --- Workouts ---
exports.createWorkout = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { category_id, name, description } = req.body;
    if (!category_id || !name) return res.status(400).json({ message: 'Category and name are required.' });
    const workout = await Workout.create({ category_id, name, description });
    return res.status(201).json({ message: 'Workout created.', workout });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create workout.', error: error.message });
  }
};
exports.listWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    return res.status(200).json(workouts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch workouts.', error: error.message });
  }
};
exports.updateWorkout = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { workout_id } = req.params;
    const { category_id, name, description } = req.body;
    const workout = await Workout.findByPk(workout_id);
    if (!workout) return res.status(404).json({ message: 'Workout not found.' });
    await workout.update({ category_id, name, description });
    return res.status(200).json({ message: 'Workout updated.', workout });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update workout.', error: error.message });
  }
};
exports.deleteWorkout = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { workout_id } = req.params;
    const workout = await Workout.findByPk(workout_id);
    if (!workout) return res.status(404).json({ message: 'Workout not found.' });
    await workout.destroy();
    return res.status(200).json({ message: 'Workout deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete workout.', error: error.message });
  }
};

// --- Week Plans ---
exports.createWeekPlan = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { workout_id, week_number, description } = req.body;
    if (!workout_id || !week_number) return res.status(400).json({ message: 'Workout and week number are required.' });
    const weekPlan = await WeekPlan.create({ workout_id, week_number, description });
    return res.status(201).json({ message: 'Week plan created.', weekPlan });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create week plan.', error: error.message });
  }
};
exports.listWeekPlans = async (req, res) => {
  try {
    const weekPlans = await WeekPlan.findAll();
    return res.status(200).json(weekPlans);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch week plans.', error: error.message });
  }
};
exports.updateWeekPlan = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { week_plan_id } = req.params;
    const { workout_id, week_number, description } = req.body;
    const weekPlan = await WeekPlan.findByPk(week_plan_id);
    if (!weekPlan) return res.status(404).json({ message: 'Week plan not found.' });
    await weekPlan.update({ workout_id, week_number, description });
    return res.status(200).json({ message: 'Week plan updated.', weekPlan });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update week plan.', error: error.message });
  }
};
exports.deleteWeekPlan = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { week_plan_id } = req.params;
    const weekPlan = await WeekPlan.findByPk(week_plan_id);
    if (!weekPlan) return res.status(404).json({ message: 'Week plan not found.' });
    await weekPlan.destroy();
    return res.status(200).json({ message: 'Week plan deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete week plan.', error: error.message });
  }
};

// --- Exercises ---
exports.createExercise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { week_plan_id, day, name, sets, reps_time, rest_time, description } = req.body;
    if (!week_plan_id || !day || !name) return res.status(400).json({ message: 'Week plan, day, and name are required.' });
    const exercise = await Exercise.create({ week_plan_id, day, name, sets, reps_time, rest_time, description });
    return res.status(201).json({ message: 'Exercise created.', exercise });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create exercise.', error: error.message });
  }
};
exports.listExercises = async (req, res) => {
  try {
    const exercises = await Exercise.findAll();
    return res.status(200).json(exercises);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch exercises.', error: error.message });
  }
};
exports.updateExercise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { exercise_id } = req.params;
    const { week_plan_id, day, name, sets, reps_time, rest_time, description } = req.body;
    const exercise = await Exercise.findByPk(exercise_id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found.' });
    await exercise.update({ week_plan_id, day, name, sets, reps_time, rest_time, description });
    return res.status(200).json({ message: 'Exercise updated.', exercise });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update exercise.', error: error.message });
  }
};
exports.deleteExercise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { exercise_id } = req.params;
    const exercise = await Exercise.findByPk(exercise_id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found.' });
    await exercise.destroy();
    return res.status(200).json({ message: 'Exercise deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete exercise.', error: error.message });
  }
}; 