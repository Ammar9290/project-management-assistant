import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/register (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'E2E User',
        email: `e2e_${Date.now()}@test.com`,
        password: 'password123',
      })
      .expect(201);
      
    expect(res.body.access_token).toBeDefined();
    token = res.body.access_token;
  });

  it('/api/v1/auth/login (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com', // Seeded admin
        password: 'password123',
      })
      .expect(201); // NestJS POST default is 201
      
    expect(res.body.access_token).toBeDefined();
    token = res.body.access_token;
  });

  it('/api/v1/projects (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E Project' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    projectId = res.body.id;
  });

  it('/api/v1/projects/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.name).toBe('E2E Project');
    expect(res.body.taskCounts).toBeDefined();
  });

  it('/api/v1/tasks (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E Task', projectId })
      .expect(201);

    expect(res.body.id).toBeDefined();
    taskId = res.body.id;
  });

  it('/api/v1/ai/query (POST)', async () => {
    // Mock the OpenAI response ideally or let it fail if no key.
    // Assuming AI endpoint handles it gracefully and returns some structure
    const res = await request(app.getHttpServer())
      .post('/api/v1/ai/query')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Hello' });
      
    expect(res.status).toBe(201);
    expect(res.body.reply).toBeDefined();
    expect(res.body.toolsUsed).toBeDefined();
  });
});
