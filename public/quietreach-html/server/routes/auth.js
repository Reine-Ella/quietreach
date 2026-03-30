const express = require('express');
const db      = require('../db');
const router  = express.Router();

router.post('/login', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password and role are required.' });
    }

    if (role === 'mentor') {
        const mentor = db.prepare(
            'SELECT * FROM mentors WHERE username = ? AND password = ?'
        ).get(username, password);

        if (!mentor) return res.status(401).json({ error: 'Invalid username or password.' });
        if (mentor.status === 'pending')  return res.status(403).json({ error: 'Your account is pending admin approval.' });
        if (mentor.status === 'rejected') return res.status(403).json({ error: 'Your application was not approved. Contact the administrator.' });
        if (mentor.status === 'inactive') return res.status(403).json({ error: 'Your account is deactivated. Contact the administrator.' });

        const user = { id: mentor.id, username: mentor.username, role: 'mentor', specialty: mentor.specialty, createdAt: mentor.created_at };
        req.session.user = user;
        return res.json({ user });
    }

    const user = db.prepare(
        'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?'
    ).get(username, password, role);

    if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

    const sessionUser = { id: user.id, username: user.username, role: user.role, createdAt: user.created_at };
    req.session.user = sessionUser;
    res.json({ user: sessionUser });
});

router.post('/register', (req, res) => {
    const { username, password, role, specialty } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser   = db.prepare('SELECT id FROM users   WHERE username = ?').get(username);
    const existingMentor = db.prepare('SELECT id FROM mentors WHERE username = ?').get(username);
    if (existingUser || existingMentor) {
        return res.status(409).json({ error: 'Username already taken. Please choose another.' });
    }

    if (role === 'mentor') {
        db.prepare(
            "INSERT INTO mentors (username, password, specialty, status) VALUES (?, ?, ?, 'pending')"
        ).run(username, password, specialty || 'General Support');
        return res.json({ message: 'Mentor application submitted. Await admin approval before logging in.' });
    }

    const result = db.prepare(
        "INSERT INTO users (username, password, role) VALUES (?, ?, 'mother')"
    ).run(username, password);

    const newUser = { id: result.lastInsertRowid, username, role: 'mother' };
    req.session.user = newUser;
    res.json({ user: newUser });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

router.get('/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated.' });
    res.json({ user: req.session.user });
});

module.exports = router;
