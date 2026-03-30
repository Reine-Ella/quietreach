const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'quietreach.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        username   TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password   TEXT NOT NULL,
        role       TEXT NOT NULL DEFAULT 'mother',
        created_at TEXT NOT NULL DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS mentors (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        username   TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password   TEXT NOT NULL,
        specialty  TEXT NOT NULL DEFAULT 'General Support',
        status     TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        mother_id  INTEGER NOT NULL,
        mentor_id  INTEGER NOT NULL,
        sender     TEXT NOT NULL,
        text       TEXT NOT NULL,
        is_read    INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (mother_id) REFERENCES users(id),
        FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    );
`);

const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
if (!adminExists) {
    db.prepare("INSERT INTO users (username, password, role, created_at) VALUES (?, ?, 'admin', '2026-01-01')")
      .run('admin', 'admin123');
}

const mentorCount = db.prepare('SELECT COUNT(*) AS n FROM mentors').get();
if (mentorCount.n === 0) {
    const ins = db.prepare("INSERT INTO mentors (username, password, specialty, status, created_at) VALUES (?, ?, ?, 'active', ?)");
    ins.run('MentorSarah', 'mentor123', 'Mental Health', '2026-01-15');
    ins.run('MentorJames', 'mentor123', 'Parenting',     '2026-01-20');
    ins.run('MentorGrace', 'mentor123', 'Education',     '2026-02-01');
}

module.exports = db;
