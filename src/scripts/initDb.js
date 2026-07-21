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
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`uid\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`roles\` json NOT NULL,
        \`company_id\` char(36) DEFAULT NULL,
        \`unit_id\` char(36) DEFAULT NULL,
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`status\` enum('active','inactive') DEFAULT 'active',
        PRIMARY KEY (\`uid\`),
        KEY \`fk_user_company\` (\`company_id\`),
        KEY \`fk_user_unit\` (\`unit_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await connection.query(createUsersTableQuery);
    console.log('Table `users` created or already exists.');

    console.log('Auth-service database initialization completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb();
