const Equipment = require('../models/Equipment');
const EquipmentCategory = require('../models/EquipmentCategory');

// Equipment Category CRUD
exports.createCategory = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const category = await EquipmentCategory.create({ name });
    return res.status(201).json({ message: 'Category created.', category });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category.', error: error.message });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const categories = await EquipmentCategory.findAll();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { category_id } = req.params;
    const { name } = req.body;
    const category = await EquipmentCategory.findByPk(category_id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.update({ name });
    return res.status(200).json({ message: 'Category updated.', category });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category.', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { category_id } = req.params;
    const category = await EquipmentCategory.findByPk(category_id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.destroy();
    return res.status(200).json({ message: 'Category deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category.', error: error.message });
  }
};

// Equipment CRUD
exports.createEquipment = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { name, category_id, quantity, condition, price, purchase_date, status } = req.body;
    if (!name || !quantity || !price || !purchase_date) {
      return res.status(400).json({ message: 'Name, quantity, price, and purchase date are required.' });
    }
    const equipment = await Equipment.create({ name, category_id, quantity, condition, price, purchase_date, status });
    return res.status(201).json({ message: 'Equipment created.', equipment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create equipment.', error: error.message });
  }
};

exports.listEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    return res.status(200).json(equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch equipment.', error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { equipment_id } = req.params;
    const { name, category_id, quantity, condition, price, purchase_date, status } = req.body;
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found.' });
    await equipment.update({ name, category_id, quantity, condition, price, purchase_date, status });
    return res.status(200).json({ message: 'Equipment updated.', equipment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update equipment.', error: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { equipment_id } = req.params;
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found.' });
    await equipment.destroy();
    return res.status(200).json({ message: 'Equipment deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete equipment.', error: error.message });
  }
}; 