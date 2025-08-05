const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const equipmentController = require('../controllers/equipmentController');

// Equipment Category routes
router.post('/categories', authenticate, equipmentController.createCategory);
router.get('/categories', authenticate, equipmentController.listCategories);
router.put('/categories/:category_id', authenticate, equipmentController.updateCategory);
router.delete('/categories/:category_id', authenticate, equipmentController.deleteCategory);

// Equipment routes
router.post('/', authenticate, equipmentController.createEquipment);
router.get('/', authenticate, equipmentController.listEquipment);
router.put('/:equipment_id', authenticate, equipmentController.updateEquipment);
router.delete('/:equipment_id', authenticate, equipmentController.deleteEquipment);

module.exports = router; 