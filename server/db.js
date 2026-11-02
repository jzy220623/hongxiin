const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.db');
const SQL_WASM_PATH = path.join(path.dirname(require.resolve('sql.js')), 'sql-wasm.wasm');

let _db = null;
let _ready = false;

// SQL.js wrapper that mimics better-sqlite3 API
function createWrapper(sqlDb) {
  return {
    _sqlDb: sqlDb,
    _dirty: false,

    exec(sql) {
      this._sqlDb.run(sql);
      this._dirty = true;
    },

    prepare(sql) {
      const self = this;
      return {
        run(...params) {
          self._sqlDb.run(sql, params);
          self._dirty = true;
          return {
            lastInsertRowid: self._lastInsertId(),
            changes: self._sqlDb.getRowsModified()
          };
        },
        get(...params) {
          const stmt = self._sqlDb.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            stmt.free();
            return self._rowToObject(cols, vals);
          }
          stmt.free();
          return undefined;
        },
        all(...params) {
          const stmt = self._sqlDb.prepare(sql);
          stmt.bind(params);
          const results = [];
          const cols = stmt.getColumnNames();
          while (stmt.step()) {
            const vals = stmt.get();
            results.push(self._rowToObject(cols, vals));
          }
          stmt.free();
          return results;
        }
      };
    },

    _lastInsertId() {
      const result = this._sqlDb.exec('SELECT last_insert_rowid() as id');
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return 0;
    },

    _rowToObject(cols, vals) {
      const obj = {};
      for (let i = 0; i < cols.length; i++) {
        obj[cols[i]] = vals[i];
      }
      return obj;
    },

    pragma(key) {
      this._sqlDb.run('PRAGMA ' + key + ';');
      this._dirty = true;
    },

    saveToFile(filePath) {
      const data = this._sqlDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(filePath, buffer);
      this._dirty = false;
    },

    close() {
      this._sqlDb.close();
    }
  };
}

async function init() {
  // Read wasm directly to avoid fetch/URL issues on newer Node versions.
  const SQL = await initSqlJs({
    wasmBinary: fs.readFileSync(SQL_WASM_PATH)
  });

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  _db = createWrapper(sqlDb);

  // Enable WAL and foreign keys
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      summary TEXT,
      cover_image TEXT,
      category TEXT DEFAULT 'general',
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      type TEXT DEFAULT 'sci_tech',
      status TEXT DEFAULT 'upcoming',
      start_date TEXT,
      end_date TEXT,
      location TEXT,
      schedule TEXT,
      registration_open INTEGER DEFAULT 1,
      max_participants INTEGER DEFAULT 100,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      competition TEXT,
      award_level TEXT,
      award_rank TEXT,
      project_name TEXT,
      description TEXT,
      image TEXT,
      team_members TEXT,
      award_date TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS core_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      department TEXT,
      avatar TEXT,
      user_id INTEGER REFERENCES users(id),
      bio TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER REFERENCES events(id),
      name TEXT NOT NULL,
      nickname TEXT,
      student_id TEXT,
      phone TEXT,
      email TEXT,
      department TEXT,
      major TEXT,
      class_name TEXT,
      advisor TEXT,
      grade TEXT,
      reason TEXT,
      interests TEXT,
      status TEXT DEFAULT 'pending',
      registration_type TEXT DEFAULT 'event',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL,
      content TEXT NOT NULL,
      reply TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password_hash TEXT NOT NULL,
      name TEXT,
      student_id TEXT,
      phone TEXT,
      department TEXT,
      grade TEXT,
      avatar TEXT,
      security_question TEXT,
      security_answer TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS club_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slogan TEXT,
      description TEXT,
      founded_date TEXT,
      logo TEXT,
      stats_members INTEGER DEFAULT 0,
      stats_awards INTEGER DEFAULT 0,
      stats_events INTEGER DEFAULT 0,
      contact_email TEXT,
      contact_phone TEXT,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS club_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      student_id TEXT,
      phone TEXT,
      email TEXT,
      department TEXT,
      grade TEXT,
      advisor TEXT,
      role TEXT DEFAULT '成员',
      join_date TEXT DEFAULT (datetime('now','localtime')),
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS honor_wall (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT,
      cohort TEXT NOT NULL,
      role TEXT,
      member_type TEXT DEFAULT 'tech',
      achievements TEXT,
      full_achievements TEXT,
      projects TEXT,
      message TEXT,
      destination TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  // Migration: add columns if they don't exist (for existing databases)
  try { _db.exec('ALTER TABLE users ADD COLUMN security_question TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE users ADD COLUMN security_answer TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE users ADD COLUMN avatar TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE registrations ADD COLUMN user_id INTEGER REFERENCES users(id)'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE registrations ADD COLUMN major TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE registrations ADD COLUMN class_name TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE registrations ADD COLUMN advisor TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE registrations ADD COLUMN interests TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE registrations ADD COLUMN nickname TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE core_members ADD COLUMN user_id INTEGER REFERENCES users(id)'); _db._dirty = true; } catch (e) { /* already exists */ }
  try { _db.exec('ALTER TABLE club_members ADD COLUMN advisor TEXT'); _db._dirty = true; } catch (e) { /* already exists */ }

  _db.saveToFile(DB_PATH);
  _ready = true;

  // Auto-save every 30 seconds
  setInterval(() => {
    if (_db._dirty) {
      _db.saveToFile(DB_PATH);
    }
  }, 30000);

  return _db;
}

// Proxy that delegates to the real db after initialization
const db = new Proxy({}, {
  get(target, prop) {
    if (prop === 'init') return init;
    if (prop === '_ready') return _ready;
    if (!_ready) {
      throw new Error('数据库尚未初始化，请先调用 db.init()');
    }
    const val = _db[prop];
    if (typeof val === 'function') {
      return function (...args) {
        const result = val.apply(_db, args);
        if (_db._dirty) {
          _db.saveToFile(DB_PATH);
        }
        return result;
      };
    }
    return val;
  }
});

module.exports = db;