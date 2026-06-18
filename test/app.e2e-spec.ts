import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Auth Endpoints', () => {
    it('POST /api/v1/auth/login - should require email and password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('POST /api/v1/auth/login - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
        .expect(401);
    });

    it('POST /api/v1/auth/forgot-password - should always return success', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('If an account exists');
        });
    });

    it('POST /api/v1/auth/refresh-token - should require refreshToken', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({})
        .expect(400);
    });
  });

  describe('Reference Endpoints', () => {
    it('GET /api/v1/reference/states - should return states', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/states')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /api/v1/reference/property-types - should return property types', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/property-types')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Protected Endpoints', () => {
    it('GET /api/v1/buildings - should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/buildings')
        .expect(401);
    });

    it('GET /api/v1/clients - should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/clients')
        .expect(401);
    });

    it('GET /api/v1/deals - should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/deals')
        .expect(401);
    });

    it('GET /api/v1/tasks - should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks')
        .expect(401);
    });
  });
});
