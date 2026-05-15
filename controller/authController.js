const bcrypt = require('bcryptjs');
const User = require('../model/User');

const toPublicUser = (user) => ({
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
});

// POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

        if (!name || !phone || !email || !password) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'This email is already registered. Please sign in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, phone, email, password: hashedPassword });

        res.status(201).json({ user: toPublicUser(user) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create account', error: err.message });
    }
};

// POST /api/auth/signin
exports.signin = async (req, res) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.status(200).json({ user: toPublicUser(user) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to sign in', error: err.message });
    }
};

// GET /api/auth/me?email=
exports.getMe = async (req, res) => {
    try {
        const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user: toPublicUser(user) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load user', error: err.message });
    }
};
