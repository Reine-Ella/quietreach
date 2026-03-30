const express = require('express');
const db      = require('../db');
const router  = express.Router();

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated.' });
    next();
}

router.get('/active', requireAuth, (req, res) => {
    const mentors = db.prepare(
        "SELECT id, username, specialty, status, created_at FROM mentors WHERE status = 'active' ORDER BY username"
    ).all();
    res.json({ mentors });
});

router.get('/', requireAdmin, (req, res) => {
    const mentors = db.prepare(
        'SELECT id, username, specialty, status, created_at FROM mentors ORDER BY created_at DESC'
    ).all();
    res.json({ mentors });
});

router.post('/', requireAdmin, (req, res) => {
    const { username, password, specialty } = req.body;
    if (!username || !password || !specialty) {
        return res.status(400).json({ error: 'Username, password and specialty are required.' });
    }
    const existing     = db.prepare('SELECT id FROM mentors WHERE username = ?').get(username);
    const existingUser = db.prepare('SELECT id FROM users   WHERE username = ?').get(username);
    if (existing || existingUser) {
        return res.status(409).json({ error: 'Username already taken.' });
    }
    const result = db.prepare(
        "INSERT INTO mentors (username, password, specialty, status) VALUES (?, ?, ?, 'active')"
    ).run(username, password, specialty);
    res.json({
        mentor: { id: result.lastInsertRowid, username, specialty, status: 'active' },
        message: `Mentor "${username}" added. They can log in immediately.`
    });
});

router.patch('/:id/status', requireAdmin, (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
    }
    db.prepare('UPDATE mentors SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: `Mentor status updated to ${status}.` });
});

router.delete('/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM messages WHERE mentor_id = ?').run(req.params.id);
    db.prepare('DELETE FROM mentors  WHERE id = ?').run(req.params.id);
    res.json({ message: 'Mentor removed.' });
});

module.exports = router;
