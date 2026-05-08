const { findItemsByUser, findItemById, saveItem, updateItem, deleteItem } = require('../utils/helpers');

class ItemModel {
  static async findByUser(userId) {
    return findItemsByUser(userId);
  }

  static async findById(id, userId) {
    return findItemById(id, userId);
  }

  static async create(itemData, userId) {
    const newItem = {
      id: Date.now(),
      ...itemData,
      userId,
      purchased: false,
      createdAt: new Date().toISOString()
    };
    return saveItem(newItem);
  }

  static async update(id, userId, updates) {
    return updateItem(id, userId, updates);
  }

  static async delete(id, userId) {
    return deleteItem(id, userId);
  }
}

module.exports = ItemModel;