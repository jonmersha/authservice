import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

const initDb = async () => {
  try {
    // Connect without specifying a database to create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: MYSQL_HOST || 'localhost',
      user: MYSQL_USER || 'erpuser',
      password: MYSQL_PASSWORD || 'Yohannes@hira123321',
      port: parseInt(MYSQL_PORT || '3306'),
    });

    console.log('Connected to MySQL server.');

    // Create authdb
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE || 'authdb'}\`;`);
    console.log(`Database \`${MYSQL_DATABASE || 'authdb'}\` created or already exists.`);

    // Switch to authdb
    await connection.query(`USE \`${MYSQL_DATABASE || 'authdb'}\`;`);

    // Create users table
    await connection.query('DROP TABLE IF EXISTS `auth_events`;');
    await connection.query('DROP TABLE IF EXISTS `users`;');

    const createUsersTableQuery = `
      CREATE TABLE \`users\` (
        \`uid\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`last_system_used\` varchar(255) DEFAULT NULL,
        \`login_count\` int DEFAULT 0,
        \`last_ip\` varchar(45) DEFAULT NULL,
        \`last_device\` text DEFAULT NULL,
        \`last_location\` text DEFAULT NULL,
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`status\` enum('active','inactive') DEFAULT 'active',
        PRIMARY KEY (\`uid\`)
      );
    `;
    await connection.query(createUsersTableQuery);
    console.log('Table `users` created or already exists.');

    const createAuthEventsTableQuery = `
      CREATE TABLE \`auth_events\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`uid\` varchar(255) NOT NULL,
        \`event_type\` varchar(50) NOT NULL,
        \`system\` varchar(255) DEFAULT NULL,
        \`ip_address\` varchar(45) DEFAULT NULL,
        \`device_info\` text DEFAULT NULL,
        \`location\` text DEFAULT NULL,
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`fk_auth_events_user\` (\`uid\`),
        CONSTRAINT \`fk_auth_events_user\` FOREIGN KEY (\`uid\`) REFERENCES \`users\` (\`uid\`) ON DELETE CASCADE
      ) ;
    `;
    await connection.query(createAuthEventsTableQuery);
    console.log('Table `auth_events` created or already exists.');

    console.log('Auth-service database initialization completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb();
