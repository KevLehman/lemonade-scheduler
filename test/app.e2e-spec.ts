import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/timers (POST)', () => {
    return request(app.getHttpServer())
      .post('/timers')
      .send({ url: 'http://google.com' })
      .expect(201);
  });

  it('/timers [GET]', () => {
    return request(app.getHttpServer())
      .post('/timers')
      .send({ url: 'http://google.com' })
      .expect((res) => {
        const job = res.body;
        return request(app.getHttpServer())
          .get(`/timers/${job.id}`)
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(job.id);
            expect(res.body.url).toBe(job.url);
            expect(res.body.timeLeft).toBe(0);
          });
      });
  });
});
