const ItemModel = require('../models/Item.model');

class ItemController {
  static async getAllItems(req, res) {
    try {
      const items = await ItemModel.findByUser(req.userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching items' });
    }
  }

  static async getItemById(req, res) {
    try {
      const item = await ItemModel.findById(parseInt(req.params.id), req.userId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching item' });
    }
  }

  static async createItem(req, res) {
    try {
      const { name, quantity, category } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Item name is required' });
      }

      const newItem = await ItemModel.create(
        { name: name.trim(), quantity: quantity || '1', category: category || 'General' },
        req.userId
      );
      
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: 'Error creating item' });
    }
  }

  static async updateItem(req, res) {
    try {
      const { purchased, name, quantity, category } = req.body;
      const updates = {};
      
      if (purchased !== undefined) updates.purchased = purchased;
      if (name !== undefined) updates.name = name;
      if (quantity !== undefined) updates.quantity = quantity;
      if (category !== undefined) updates.category = category;

      const updatedItem = await ItemModel.update(parseInt(req.params.id), req.userId, updates);
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: 'Error updating item' });
    }
  }

  static async deleteItem(req, res) {
    try {
      const deleted = await ItemModel.delete(parseInt(req.params.id), req.userId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting item' });
    }
  }
}

module.exports = ItemController;