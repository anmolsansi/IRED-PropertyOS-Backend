import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  setupTestContainers,
  teardownTestContainers,
  seedTestData,
} from './setup';

describe('IRED PropertyOS API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { prisma } = await setupTestContainers();
    await seedTestData(prisma);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app?.close();
    await teardownTestContainers();
  }, 30000);

  describe('Health', () => {
    it('GET /api/v1/health — returns status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Auth Flow', () => {
    it('POST /auth/login — rejects invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
        .expect(401);
    });

    it('POST /auth/forgot-password — always returns success', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'admin@test.com' })
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
  });

  describe('Reference Data', () => {
    it('GET /reference/states — returns states', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/states')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('GET /reference/property-types — returns property types', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/property-types')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.some((p: any) => p.name === 'Office')).toBe(true);
        });
    });

    it('GET /reference/sources — returns sources', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reference/sources')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Protected Endpoints', () => {
    it('GET /buildings — returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/buildings')
        .expect(401);
    });

    it('GET /clients — returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/clients')
        .expect(401);
    });

    it('GET /deals — returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/deals')
        .expect(401);
    });

    it('GET /tasks — returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks')
        .expect(401);
    });

    it('GET /proposals — returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proposals')
        .expect(401);
    });
  });

  describe('Swagger', () => {
    it('GET /api/docs-json — returns OpenAPI spec', () => {
      return request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('openapi');
          expect(res.body.info.title).toContain('IRED PropertyOS');
        });
    });
  });
});
