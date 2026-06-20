const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbType = process.env.DB_TYPE || 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

if (dbType === 'mysql') {
  console.log('Database type set to MySQL. Initializing MySQL pool...');
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'o2h_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  console.log('Database type set to SQLite. Initializing SQLite file database...');
  const dbFile = path.resolve(__dirname, '../database.sqlite');
  sqliteDb = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
    } else {
      console.log(`SQLite database successfully opened at: ${dbFile}`);
    }
  });
}

// Promisified query function that abstracts DB details
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [results] = await mysqlPool.execute(sql, params);
    return results;
  } else {
    return new Promise((resolve, reject) => {
      // For SELECT queries, use db.all. For INSERT/UPDATE/DELETE, use db.run.
      const queryType = sql.trim().substring(0, 6).toUpperCase();
      if (queryType === 'SELECT') {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) {
            console.error('SQLite execute error:', sql, params, err);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) {
            console.error('SQLite execute error:', sql, params, err);
            reject(err);
          } else {
            // Return compatibility object with insertId (this.lastID) and affectedRows (this.changes)
            resolve({
              insertId: this.lastID,
              affectedRows: this.changes
            });
          }
        });
      }
    });
  }
}

// Automatically create database and tables on startup
async function initDb() {
  try {
    if (dbType === 'mysql') {
      // If using MySQL, verify database exists or create it first.
      // We do this by creating a temp connection without database selected.
      const tempConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'o2h_portal'}\``);
      await tempConn.end();
      console.log(`Verified or created MySQL database: ${process.env.DB_NAME || 'o2h_portal'}`);

      // Create Tables
      await query(`
        CREATE TABLE IF NOT EXISTS Users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS Tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL DEFAULT NULL,
          user_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('MySQL database tables verified/created successfully.');
    } else {
      // SQLite Migrations
      await query(`
        CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS Tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'Pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME DEFAULT NULL,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        );
      `);
      console.log('SQLite database tables verified/created successfully.');
    }

    // Seed default user if database is empty
    const users = await query('SELECT id FROM Users LIMIT 1');
    if (users.length === 0) {
      await query(
        'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
        ['Default User', 'admin@example.com', '$2a$10$I5dEmtfReCFEpOYL95oxoO1pRRivDvDb7Sh16.IBp.UyFR2ym19vm']
      );
      console.log('Successfully seeded default user credentials: admin@example.com / password123');
    }
  } catch (error) {
    console.error('Database migration/init failed:', error.message);
    // Don't crash immediately in case we're offline, but log warning
  }
}

module.exports = {
  query,
  initDb,
  dbType
};
