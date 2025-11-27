// user.api.test.js - API tests for the /api/users endpoint

// We use supertest to test HTTP endpoints.
// We must also import the Express app instance to test it.
// For this example, we'll define a simple mock Express app inline.

const request = require('supertest');
const express = require('express');

// --- Mock Express Application Setup ---
// In a real project, you would usually import this from './server.js' or '../app.js'
const app = express();
app.use(express.json());

// Mock database (in a real app, this would be a database connection)
const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com' },
];

let nextId = 3;

// Mock Router for /api/users
const router = express.Router();

// GET /api/users - Get all users
router.get('/', (req, res) => {
    // Simulate successful retrieval
    res.status(200).json(mockUsers);
});

// GET /api/users/:id - Get a specific user
router.get('/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const user = mockUsers.find(u => u.id === userId);

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// POST /api/users - Create a new user
router.post('/', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        // Simulate bad request if required fields are missing
        return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Simulate creation
    const newUser = { id: nextId++, name, email };
    mockUsers.push(newUser);

    // Respond with 201 Created and the new resource
    res.status(201).json(newUser);
});

// Attach the mock router to the main app instance
app.use('/api/users', router);
// --- End Mock Express Application Setup ---

// --- Jest Tests ---

describe('User API Endpoints', () => {

    // Test GET /api/users
    it('GET /api/users should return all users', async () => {
        const response = await request(app)
            .get('/api/users')
            .expect('Content-Type', /json/) // Check response header
            .expect(200); // Check HTTP status code

        // Check if the response body is an array and contains the mock users
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('name', 'Alice Smith');
    });

    // Test GET /api/users/:id (Success)
    it('GET /api/users/1 should return the user with ID 1', async () => {
        const response = await request(app)
            .get('/api/users/1')
            .expect(200);

        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('email', 'alice@example.com');
    });

    // Test GET /api/users/:id (Not Found)
    it('GET /api/users/999 should return 404 Not Found', async () => {
        const response = await request(app)
            .get('/api/users/999')
            .expect(404);

        expect(response.body).toHaveProperty('message', 'User not found');
    });

    // Test POST /api/users (Success)
    it('POST /api/users should create a new user and return 201', async () => {
        const newUserData = {
            name: 'Charlie Brown',
            email: 'charlie@peanuts.com',
        };

        const response = await request(app)
            .post('/api/users')
            .send(newUserData) // Send the payload
            .expect('Content-Type', /json/)
            .expect(201); // Expect 201 Created

        // Check if the response body contains the new user data with an assigned ID
        expect(response.body).toMatchObject(newUserData);
        expect(response.body).toHaveProperty('id');

        // Optional: Verify the user was actually added to the mock database
        expect(mockUsers.some(u => u.email === 'charlie@peanuts.com')).toBe(true);
    });

    // Test POST /api/users (Validation Error)
    it('POST /api/users should return 400 if name is missing', async () => {
        const badUserData = {
            email: 'missingname@test.com', // Name is missing
        };

        const response = await request(app)
            .post('/api/users')
            .send(badUserData)
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Name and email are required.');
    });
});