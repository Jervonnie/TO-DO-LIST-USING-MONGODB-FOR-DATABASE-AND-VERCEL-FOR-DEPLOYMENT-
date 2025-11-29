const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied, token missing' });
    }
    
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id }; // This line is critical — sets req.user.id
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};