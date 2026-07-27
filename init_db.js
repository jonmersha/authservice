import dotenv from 'dotenv';
dotenv.config();

import pool from './src/config/db.config.js';

async function init() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      uid VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      last_system_used VARCHAR(100),
      login_count INT DEFAULT 0,
      last_ip VARCHAR(100),
      last_device VARCHAR(255),
      last_location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    console.log("users table initialized in authdb");

    await pool.query(`CREATE TABLE IF NOT EXISTS auth_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uid VARCHAR(255) NOT NULL,
      event_type VARCHAR(100),
      \`system\` VARCHAR(100),
      ip_address VARCHAR(100),
      device_info VARCHAR(255),
      location VARCHAR(255),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
    )`);
    console.log("auth_events table initialized in authdb");
    
    process.exit(0);
  } catch (error) {
    console.error("DB init error:", error);
    process.exit(1);
  }
}

init();
