import pool from './src/config/db.config.js';

async function check() {
  const uid = 'test_uid_123';
  const email = 'test@test.com';
  const name = 'Test User';
  const finalStatus = 'active';
  const lastSystemUsed = 'Web-ERP';
  const ipAddress = '127.0.0.1';
  const deviceInfo = 'node-fetch';
  const finalLocation = null;

  try {
    console.log('Query 1...');
    await pool.query(
      `INSERT INTO users (uid, email, name, status, last_system_used, login_count, last_ip, last_device, last_location) 
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       email = VALUES(email), name = VALUES(name), status = VALUES(status),
       last_system_used = VALUES(last_system_used), login_count = login_count + 1,
       last_ip = VALUES(last_ip), last_device = VALUES(last_device), last_location = VALUES(last_location)`,
      [uid, email, name, finalStatus, lastSystemUsed, ipAddress, deviceInfo, finalLocation]
    );
    console.log('Query 1 OK');

    console.log('Query 2...');
    await pool.query(
      `INSERT INTO auth_events (uid, event_type, \`system\`, ip_address, device_info, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid, 'login_sync', lastSystemUsed, ipAddress, deviceInfo, finalLocation]
    );
    console.log('Query 2 OK');

  } catch(e) {
    console.error('Error:', e.message);
    console.error('SQL Message:', e.sqlMessage);
  }
  process.exit();
}
check();
