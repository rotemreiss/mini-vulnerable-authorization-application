require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

const app = express();

const secretKey = process.env.SECRET_KEY || "SECRET_KEY"
const featureFlagBroken = process.env.FEATURE_FLAG_BROKEN === 'true' || process.env.FEATURE_FLAG_BROKEN !== 'false'

console.log("Authorization is in broken state: " + featureFlagBroken)

app.use(express.json());

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

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: API endpoints for user authentication
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         role:
 *           type: string
 *           description: User's role
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Generated JWT token
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logged out
 */
app.post('/api/logout', (req, res) => {
    res.json({message: 'User logged out'});
});

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized or invalid user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get product information
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Product information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Product name
 *                 sku:
 *                   type: string
 *                   description: Product SKU
 *                 price:
 *                   type: number
 *                   description: Product price
 */
app.get('/api/product', (req, res) => {
    res.json({name: 'Dummy Product', sku: 'DUM123', price: 19.99});
});

const adminOnly = (req, res) => {
    if (!featureFlagBroken && (!req.user || req.user.role !== 'admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    res.json({ success: true });
}

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the product was created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/product', adminOnly);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Admin only route
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/api/admin', adminOnly);

/**
 * @swagger
 * /api/store/{storeId}:
 *   get:
 *     summary: Access a specific store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/api/store/:storeId', (req, res) => {
    if (!req.user || req.user.store != req.params.storeId) return res.status(401).json({message: 'Unauthorized'});
    res.json({ success: true });
});

app.listen(3000, () => console.log('App is running on port 3000'));

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'mVAA API',
            version: '1.0.0',
        },
    },
    apis: ['./app.js'], // Specify the path to your app.js file
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

module.exports = app; // export the app
