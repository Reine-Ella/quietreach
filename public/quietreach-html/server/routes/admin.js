const express = require('express');
const db      = require('../db');
const router  = express.Router();

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

router.get('/users', requireAdmin, (req, res) => {
    const users = db.prepare(
        "SELECT id, username, role, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC"
    ).all();
    res.json({ users });
});

router.get('/stats', requireAdmin, (req, res) => {
    const totalMothers   = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'mother'").get().n;
    const totalMentors   = db.prepare("SELECT COUNT(*) AS n FROM mentors WHERE status = 'active'").get().n;
    const pendingMentors = db.prepare("SELECT COUNT(*) AS n FROM mentors WHERE status = 'pending'").get().n;
    res.json({ totalUsers: totalMothers, totalMothers, totalMentors, pendingMentors });
});

module.exports = router;
