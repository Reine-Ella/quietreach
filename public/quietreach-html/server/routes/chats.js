const express = require('express');
const db      = require('../db');
const router  = express.Router();

function requireMother(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'mother') {
        return res.status(403).json({ error: 'Mother access required.' });
    }
    next();
}

function requireMentor(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'mentor') {
        return res.status(403).json({ error: 'Mentor access required.' });
    }
    next();
}

// Mother: get messages with a specific mentor
router.get('/with/:mentorId', requireMother, (req, res) => {
    const messages = db.prepare(`
        SELECT id, sender, text, is_read, created_at
        FROM messages
        WHERE mother_id = ? AND mentor_id = ?
        ORDER BY created_at ASC
    `).all(req.session.user.id, req.params.mentorId);
    res.json({ messages });
});

// Mother: send message to a mentor
router.post('/with/:mentorId', requireMother, (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const mentor = db.prepare("SELECT id FROM mentors WHERE id = ? AND status = 'active'").get(req.params.mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found or unavailable.' });

    const result = db.prepare(`
        INSERT INTO messages (mother_id, mentor_id, sender, text)
        VALUES (?, ?, 'user', ?)
    `).run(req.session.user.id, req.params.mentorId, text.trim());

    res.json({ message: { id: result.lastInsertRowid, sender: 'user', text: text.trim() } });
});

// Mentor: list all conversations
router.get('/conversations', requireMentor, (req, res) => {
    const rows = db.prepare(`
        SELECT
            u.id         AS mother_id,
            u.username   AS mother_username,
            m.text       AS last_message,
            m.created_at AS last_message_time,
            SUM(CASE WHEN m.sender = 'user' AND m.is_read = 0 THEN 1 ELSE 0 END) AS unread_count
        FROM messages m
        JOIN users u ON u.id = m.mother_id
        WHERE m.mentor_id = ?
        GROUP BY m.mother_id
        ORDER BY m.created_at DESC
    `).all(req.session.user.id);
    res.json({ conversations: rows });
});

// Mentor: get messages from a specific mother
router.get('/conversations/:motherId', requireMentor, (req, res) => {
    const messages = db.prepare(`
        SELECT id, sender, text, is_read, created_at
        FROM messages
        WHERE mother_id = ? AND mentor_id = ?
        ORDER BY created_at ASC
    `).all(req.params.motherId, req.session.user.id);
    res.json({ messages });
});

// Mentor: reply to a mother
router.post('/conversations/:motherId', requireMentor, (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const result = db.prepare(`
        INSERT INTO messages (mother_id, mentor_id, sender, text)
        VALUES (?, ?, 'mentor', ?)
    `).run(req.params.motherId, req.session.user.id, text.trim());

    res.json({ message: { id: result.lastInsertRowid, sender: 'mentor', text: text.trim() } });
});

// Mentor: mark messages as read
router.patch('/conversations/:motherId/read', requireMentor, (req, res) => {
    db.prepare(`
        UPDATE messages SET is_read = 1
        WHERE mother_id = ? AND mentor_id = ? AND sender = 'user'
    `).run(req.params.motherId, req.session.user.id);
    res.json({ message: 'Marked as read.' });
});

module.exports = router;
