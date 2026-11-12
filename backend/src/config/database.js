import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../gym.db');

class DatabaseWrapper {
  constructor(filePath) {
    this.rawDb = new DatabaseSync(filePath);
    
    // Performance and Concurrency Pragmas
    this.rawDb.exec('PRAGMA journal_mode = WAL;');
    this.rawDb.exec('PRAGMA synchronous = NORMAL;');
    this.rawDb.exec('PRAGMA foreign_keys = ON;');
    this.rawDb.exec('PRAGMA cache_size = -64000;');
    this.rawDb.exec('PRAGMA busy_timeout = 5000;');
  }

  exec(sql) {
    return this.rawDb.exec(sql);
  }

  prepare(sql) {
    const stmt = this.rawDb.prepare(sql);
    return {
      run: (...params) => {
        const res = stmt.run(...params);
        return {
          changes: Number(res.changes),
          lastInsertRowid: Number(res.lastInsertRowid)
        };
      },
      get: (...params) => {
        return stmt.get(...params);
      },
      all: (...params) => {
        return stmt.all(...params);
      }
    };
  }

  transaction(fn) {
    return (...args) => {
      this.rawDb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        const result = fn(...args);
        this.rawDb.exec('COMMIT');
        return result;
      } catch (err) {
        this.rawDb.exec('ROLLBACK');
        throw err;
      }
    };
  }
}

export const db = new DatabaseWrapper(dbPath);

export function initDatabase() {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 1. Users Table (Authentication & RBAC)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Members Table (Profile & Membership details)
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_code TEXT UNIQUE NOT NULL,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      photo_url TEXT,
      joining_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Performance Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
    CREATE INDEX IF NOT EXISTS idx_members_expiry ON members(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_members_joining ON members(joining_date);
    CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
    CREATE INDEX IF NOT EXISTS idx_members_code ON members(member_code);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `);

  console.log('Database initialized successfully with native node:sqlite WAL mode at:', dbPath);
}
