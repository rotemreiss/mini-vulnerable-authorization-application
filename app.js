require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

const app = express();

const secretKey = process.env.SECRET_KEY;

app.use(express.json());

// Exclude /api/login from being authenticated
const isRevokedCallback = function(req, payload, done){
    const issuer = payload.iss;
    const tokenId = payload.jti;

    data.getRevokedToken(issuer, tokenId, function(err, token){
        if (err) { return done(err); }
        return done(null, token ? true : false);
    });
};

// Protect the routes
app.use(expressJwt({
    secret: secretKey,
    algorithms: ['HS256'],
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}).unless({ path: ['/api/login'] }));

// Custom error handling middleware
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).send({message: 'Invalid token'});
    }
    next(err);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);

    // Check if user exists and password is correct
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT and send it in the response
    // Create a copy of the user object without the password property
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    const token = jwt.sign(userWithoutPassword, secretKey);
    res.json({ token });
});


app.post('/api/logout', (req, res) => {
    res.json({message: 'User logged out'});
});

app.get('/api/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'You are not authorized' });
    }
    const { username } = req.user;
    const user = users.find(user => user.username === username);
    if (user) {
        res.json(user);
    } else {
        res.status(401).json({ message: 'Invalid user' });
    }
});

app.get('/api/product', (req, res) => {
    res.json({name: 'Dummy Product', sku: 'DUM123', price: 19.99});
});

app.post('/api/product', (req, res) => {
    if (!req.user || req.user.role !== 'admin') return res.status(401).json({message: 'Unauthorized'});
    res.json({ success: true });
});

app.get('/api/store/:storeId', (req, res) => {
    if (!req.user || req.user.store != req.params.storeId) return res.status(401).json({message: 'Unauthorized'});
    res.json({message: `Access granted to store ${req.params.storeId}`});
});

app.listen(3000, () => console.log('App is running on port 3000'));

module.exports = app; // export the app
