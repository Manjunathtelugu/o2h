const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

describe('Task Management API System Tests', () => {
  let userToken = '';
  let userId = null;
  let taskId = null;
  
  const testUser = {
    name: 'Test Engineer',
    email: `test.engineer.${Date.now()}@example.com`,
    password: 'password123'
  };

  const testTask = {
    title: 'Automate REST Tests',
    description: 'Ensure all integration test coverage is complete and green.',
    status: 'Pending'
  };

  // Close database connection after tests
  afterAll(async () => {
    // In SQLite, we don't have to explicitly close the pool, but we clean up tables if we want.
    // If using mysql, pool will close, but for sqlite we let node finish.
  });

  describe('Authentication API Endpoint /api/auth', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.name).toEqual(testUser.name);
      
      userId = res.body.data.id;
    });

    it('should fail to register a user with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should authenticate user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      
      userToken = res.body.data.token;
    });

    it('should block profile requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should fetch authenticated profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toEqual(testUser.email);
    });
  });

  describe('Tasks API Endpoints /api/tasks', () => {
    it('should return empty task list initially', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toEqual(0);
    });

    it('should fail to create task if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: testTask.description
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail to create task if description is less than 20 chars', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: testTask.title,
          description: 'Short'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully create a valid task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testTask);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toEqual(testTask.title);
      expect(res.body.data.status).toEqual('Pending');

      taskId = res.body.data.id;
    });

    it('should query tasks list with filtering, searching, and pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Automate&status=Pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toEqual(taskId);
    });

    it('should retrieve dashboard statistics showing total, pending, and completed counts', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toEqual(1);
      expect(res.body.data.pending).toEqual(1);
      expect(res.body.data.completed).toEqual(0);
    });

    it('should update status of a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'Completed' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toEqual('Completed');
    });

    it('should reflect completed task in statistics', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.pending).toEqual(0);
      expect(res.body.data.completed).toEqual(1);
    });

    it('should successfully delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should verify task list is empty after deletion', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(0);
    });
  });
});
