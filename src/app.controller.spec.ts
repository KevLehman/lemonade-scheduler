import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AgendaModule } from 'nestjs-agenda';
import { AgendaJob, AgendaJobSchema } from './agenda/agenda.model';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  describe('/timers', () => {
    let appController: AppController;
    let appService: AppService;
    let mongod: MongoMemoryServer;

    beforeAll(async () => {
      mongod = await MongoMemoryServer.create({
        binary: { version: '5.0.0' },
      });
      const url = mongod.getUri();

      const app: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          HttpModule.register({
            timeout: 5000,
            timeoutErrorMessage: 'Cannot process your request right now',
          }),
          MongooseModule.forRoot(url),
          MongooseModule.forFeature([
            { name: AgendaJob.name, schema: AgendaJobSchema },
          ]),
          AgendaModule.register({ db: { address: url } }),
        ],
        controllers: [AppController],
        providers: [AppService],
      }).compile();

      appController = app.get<AppController>(AppController);
      appService = app.get<AppService>(AppService);
    });

    afterAll(async () => {
      try {
        await mongoose.connection.close();
        await appService.stopAgenda();
        await mongod.stop();
      } catch (e) {
        console.log(e);
      }
    });

    it('should return a valid timer', (done) => {
      appController
        .setTimer({
          hours: 0,
          minutes: 0,
          seconds: 20,
          url: 'http://google.com',
        })
        .then((value) => {
          expect(value).toHaveProperty('id');
        })
        .then(() => done());
    });

    it('should return the info of a current timer', (done) => {
      appController
        .setTimer({
          hours: 0,
          minutes: 0,
          seconds: 20,
          url: 'http://google.com/thisshit',
        })
        .then((job) => {
          return appController.getTimer(job.id);
        })
        .then((timer) => {
          expect(timer).toMatchObject(
            expect.objectContaining({
              id: expect.any(String),
              nextRunAt: expect.any(Date),
              url: expect.any(String),
              alreadyConsumed: expect.any(Boolean),
              timeLeft: expect.any(Number),
            }),
          );
        })
        .then(() => done());
    });
  });
});
