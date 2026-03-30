require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const path     = require('path');

require('./db');

const authRoutes   = require('./routes/auth');
const mentorRoutes = require('./routes/mentors');
const chatRoutes   = require('./routes/chats');
const adminRoutes  = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'quietreach-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use('/api/auth',    authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/chats',   chatRoutes);
app.use('/api',         adminRoutes);

app.use(express.static(path.join(__dirname, '..')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\nQuietReach is running at http://localhost:${PORT}\n`);
});
