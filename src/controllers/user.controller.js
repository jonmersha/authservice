import pool from '../config/db.config.js';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT uid, email, name, status, last_system_used, login_count, last_ip, last_device, last_location FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT uid, email, name, status, last_system_used, login_count, last_ip, last_device, last_location FROM users WHERE uid = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || req.body.email;
    const { name, status, system, location } = req.body;
    const finalStatus = status || 'active';
    const lastSystemUsed = system || 'unknown';

    // Capture metadata
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    const deviceInfo = req.headers['user-agent'] || 'unknown';
    const finalLocation = location || null;

    await pool.query(
      `INSERT INTO users (uid, email, name, status, last_system_used, login_count, last_ip, last_device, last_location) 
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       email = VALUES(email), name = VALUES(name), status = VALUES(status),
       last_system_used = VALUES(last_system_used), login_count = login_count + 1,
       last_ip = VALUES(last_ip), last_device = VALUES(last_device), last_location = VALUES(last_location)`,
      [uid, email, name, finalStatus, lastSystemUsed, ipAddress, deviceInfo, finalLocation]
    );

    // Insert an auth event log
    await pool.query(
      `INSERT INTO auth_events (uid, event_type, \`system\`, ip_address, device_info, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid, 'login_sync', lastSystemUsed, ipAddress, deviceInfo, finalLocation]
    );

    // Generate Custom JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_dev_secret_key';
    const customToken = jwt.sign(
      { uid, email, name, status: finalStatus },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({ uid, token: customToken });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message, sqlMessage: error.sqlMessage, stack: error.stack });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, status, system, location } = req.body;

    // Fetch current user to fallback for missing fields
    const [existing] = await pool.query('SELECT uid, email, name, status, last_system_used, login_count, last_ip, last_device, last_location FROM users WHERE uid = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = existing[0];

    const finalEmail = email !== undefined ? email : currentUser.email;
    const finalName = name !== undefined ? name : currentUser.name;
    const finalStatus = status !== undefined ? status : currentUser.status;
    const finalSystem = system !== undefined ? system : currentUser.last_system_used;
    const finalLocation = location !== undefined ? location : currentUser.last_location;

    await pool.query(
      'UPDATE users SET email = ?, name = ?, status = ?, last_system_used = ?, last_location = ? WHERE uid = ?',
      [finalEmail, finalName, finalStatus, finalSystem, finalLocation, id]
    );

    res.json({ message: 'User updated' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE uid = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


