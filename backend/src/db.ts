import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig: any = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '4000', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

export const pool = mysql.createPool({
  ...dbConfig,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to TiDB.');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),
        UNIQUE KEY uk_users_email (email),
        
        INDEX idx_users_created_at (created_at),

        CONSTRAINT chk_users_name_not_empty CHECK (CHAR_LENGTH(TRIM(name)) > 0),
        CONSTRAINT chk_users_email_not_empty CHECK (CHAR_LENGTH(TRIM(email)) > 0)
      ) AUTO_INCREMENT=1000;
    `);

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      category_id BIGINT UNSIGNED NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      type ENUM('income', 'expense') NOT NULL,
      transaction_date DATE NOT NULL,
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      INDEX idx_expenses_user_id (user_id),
      INDEX idx_expenses_category_id (category_id),
      INDEX idx_expenses_type (type),
      INDEX idx_expenses_transaction_date (transaction_date),
      INDEX idx_expenses_user_date (user_id, transaction_date),
      INDEX idx_expenses_user_type (user_id, type),
      INDEX idx_expenses_user_category (user_id, category_id),

      CONSTRAINT fk_expenses_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE RESTRICT,

      CONSTRAINT fk_expenses_category
          FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE RESTRICT
          ON UPDATE RESTRICT,

      CONSTRAINT chk_expenses_amount_positive CHECK (amount > 0)
    );
    `);

    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      type ENUM('income', 'expense', 'both') NOT NULL DEFAULT 'expense',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      UNIQUE KEY uk_categories_user_name (user_id, name),
      INDEX idx_categories_user_id (user_id),
      INDEX idx_categories_type (type),

      CONSTRAINT fk_categories_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE RESTRICT,

      CONSTRAINT chk_categories_name_not_empty CHECK (CHAR_LENGTH(TRIM(name)) > 0)
    );
    `);


    console.log('Database tables initialized.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to Database:', error);
  }
};
