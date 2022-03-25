import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgendaModule } from 'nestjs-agenda';
import { HttpModule } from '@nestjs/axios';
import { JoiPipeModule } from 'nestjs-joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaJob, AgendaJobSchema } from './agenda/agenda.model';

@Module({
  imports: [
    JoiPipeModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({
      timeout: 5000,
      timeoutErrorMessage: 'Cannot process your request right now',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGO_URL'),
      }),
    }),
    MongooseModule.forFeature([
      { name: AgendaJob.name, schema: AgendaJobSchema },
    ]),
    AgendaModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        db: { address: config.get('MONGO_URL') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
