const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db.json');

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { users: [], items: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function findUserByUsername(username) {
  const db = readDB();
  return db.users.find(user => user.username === username);
}

function findUserById(id) {
  const db = readDB();
  return db.users.find(user => user.id === id);
}

function findItemsByUser(userId) {
  const db = readDB();
  return db.items.filter(item => item.userId === userId);
}

function findItemById(id, userId) {
  const db = readDB();
  return db.items.find(item => item.id === id && item.userId === userId);
}

function saveItem(item) {
  const db = readDB();
  db.items.push(item);
  writeDB(db);
  return item;
}

function updateItem(id, userId, updates) {
  const db = readDB();
  const index = db.items.findIndex(item => item.id === id && item.userId === userId);
  if (index === -1) return null;
  db.items[index] = { ...db.items[index], ...updates };
  writeDB(db);
  return db.items[index];
}

function deleteItem(id, userId) {
  const db = readDB();
  const index = db.items.findIndex(item => item.id === id && item.userId === userId);
  if (index === -1) return false;
  db.items.splice(index, 1);
  writeDB(db);
  return true;
}

function saveUser(user) {
  const db = readDB();
  const maxId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) : 0;
  const newUser = { ...user, id: maxId + 1 };
  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

module.exports = {
  readDB,
  writeDB,
  findUserByUsername,
  findUserById,
  findItemsByUser,
  findItemById,
  saveItem,
  updateItem,
  deleteItem,
  saveUser
};