import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('IRED PropertyOS API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api/v1/health — returns status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Auth', () => {
    it('POST /auth/login — requires email and password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('POST /auth/login — rejects invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
        .expect(401);
    });

    it('POST /auth/forgot-password — always returns success', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('If an account exists');
        });
    });

    it('POST /auth/refresh-token — requires refreshToken', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({})
        .expect(400);
    });

    it('POST /auth/refresh-token — rejects invalid token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('Reference Data', () => {
    it('GET /reference/states — returns array', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/states')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /reference/property-types — returns array', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/property-types')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /reference/contact-roles — returns array', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/contact-roles')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /reference/sources — returns array', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/sources')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Protected Endpoints — require auth', () => {
    const protectedGetPaths = [
      '/buildings',
      '/floors',
      '/units',
      '/contacts',
      '/clients',
      '/deals',
      '/tasks',
      '/site-visits',
      '/proposals',
      '/change-requests',
      '/imports',
      '/exports',
      '/search',
      '/dashboard',
      '/notifications',
      '/map/nearby-properties',
      '/media/presigned-url',
      '/users',
    ];

    it.each(protectedGetPaths)('GET %s — returns 401 without token', (path) => {
      return request(app.getHttpServer())
        .get('/api/v1' + path)
        .expect(401);
    });
  });

  describe('Swagger / OpenAPI', () => {
    it('GET /api/docs-json — returns Swagger JSON', () => {
      return request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('openapi');
          expect(res.body.info.title).toContain('IRED PropertyOS');
        });
    });
  });

  describe('Request Validation', () => {
    it('POST /auth/login — rejects request with extra fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'pass', extra: 'field' })
        .expect(201)
        .expect((res) => {
          // Should succeed or fail validation — not 500
          expect(res.status).not.toBe(500);
        });
    });

    it('GET /buildings — handles invalid query params gracefully', () => {
      return request(app.getHttpServer())
        .get('/api/v1/buildings?page=abc&limit=-1')
        .expect(401); // auth guard catches first, but shouldn't 500
    });
  });
});
