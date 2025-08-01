const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Mock User Data (Replace with a real database)
const users = [
    { email: 'admin@pu.ac.in', passwordHash: bcrypt.hashSync('admin123', 10) }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
    secret: 'YOUR_VERY_STRONG_SECRET_KEY_HERE_CHANGE_THIS',
    resave: false,
    saveUninitialized: false,
    name: 'session_id', // <--- IMPORTANT: Give your session cookie a specific name
                        // This makes it easier to target for clearing.
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        if (req.accepts('html')) {
            res.redirect('/login.html');
        } else {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
        }
    }
}

// --- API Routes ---

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    req.session.userId = user.email;
    req.session.isLoggedIn = true;
    res.json({ success: true, message: 'Login successful!' });
});

// Logout endpoint with explicit cookie clearing
// server.js
app.post('/api/logout', (req, res) => {
    console.log('Logout attempt received.');
    if (req.session) {
        console.log('Session exists before destroy. Session ID:', req.sessionID);
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ success: false, message: 'Could not log out.' });
            }
            console.log('Session destroyed successfully.');

            // Explicitly clear the cookie with the correct options
            // Ensure 'session_id' matches the 'name' in your session config
            res.clearCookie('session_id', { // Assuming 'session_id' is your cookie name
                path: '/', // Crucial: Must match the path the cookie was set with
                domain: 'localhost', // Or your domain, e.g., 'youruniversity.com'
                secure: process.env.NODE_ENV === 'production', // Must match 'secure' setting
                httpOnly: true // Must match 'httpOnly' setting
            });
            console.log('Cookie clear instruction sent for session_id.');

            res.json({ success: true, message: 'Logged out successfully.' });
        });
    } else {
        console.log('No active session to destroy.');
        // Still clear the cookie just in case client has a stale one
        res.clearCookie('session_id', {
            path: '/',
            domain: 'localhost',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
        });
        res.json({ success: true, message: 'No active session, but cookie cleared.' });
    }
});

app.get('/api/check-auth', requireAuth, (req, res) => {
    res.json({ success: true, isAuthenticated: true, user: req.session.userId });
});

// --- HTML Route Protection ---

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard.html', requireAuth, (req, res) => {
    // Add Cache-Control headers to prevent caching of the dashboard page
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/dashboard.html');
    } else {
        res.redirect('/login.html');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} or http://localhost:${PORT}/login.html to start.`);
});