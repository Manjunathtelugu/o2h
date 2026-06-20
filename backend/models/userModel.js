const db = require('../config/db');

async function createUser(name, email, passwordHash) {
  const sql = `
    INSERT INTO Users (name, email, password)
    VALUES (?, ?, ?)
  `;
  const result = await db.query(sql, [name, email, passwordHash]);
  return {
    id: result.insertId,
    name,
    email
  };
}

async function findUserByEmail(email) {
  const sql = `
    SELECT * FROM Users
    WHERE email = ?
    LIMIT 1
  `;
  const rows = await db.query(sql, [email]);
  return rows.length > 0 ? rows[0] : null;
}

async function findUserById(id) {
  const sql = `
    SELECT id, name, email, created_at FROM Users
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await db.query(sql, [id]);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
