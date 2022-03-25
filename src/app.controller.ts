import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Param,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Timer } from './types/app.interfaces';
import { TimerDto } from './types/app.schemas';
import { AppService } from './app.service';

// Instead of using / as base path, use /timers
@Controller('timers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(201)
  async setTimer(@Body() data: TimerDto): Promise<Pick<Timer, 'id'>> {
    const { id } = await this.appService.setTimer(data);
    return {
      id,
    };
  }

  @Get('/:timerId')
  async getTimer(
    @Param('timerId', new ParseUUIDPipe({ version: '4' })) timerId: string,
  ): Promise<Timer & { alreadyConsumed: boolean; timeLeft: number }> {
    const job = await this.appService.getJob(timerId);
    if (!job) {
      throw new NotFoundException('A job with a matching ID was not found');
    }

    // Assumption: returning extra props is not bad :)
    return {
      id: job.name,
      url: job.data.url as string,
      nextRunAt: job.nextRunAt,
      alreadyConsumed: !job.nextRunAt,
      timeLeft: job.timeLeft,
    };
  }
}
