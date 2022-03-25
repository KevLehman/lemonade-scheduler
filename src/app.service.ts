import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { add, differenceInSeconds } from 'date-fns';
import { AgendaService } from 'nestjs-agenda';
import { Timer, TimerDto, TimerJob } from './types/app.interfaces';
import { Job } from './agenda/agenda.types';
import { InjectModel } from '@nestjs/mongoose';
import { AgendaJob, AgendaJobDocument } from './agenda/agenda.model';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly agenda: AgendaService,
    private httpService: HttpService,
    @InjectModel(AgendaJob.name)
    private agendaJobModel: Model<AgendaJobDocument>,
    private config: ConfigService,
  ) {
    this.agenda.defaultLockLifetime(5000);

    // App is always in "production" mode. "dev" mode is for testing (as jest puts NODE_ENV=dev instead of test)
    if (this.config.get('NODE_ENV') === 'prod') {
      this.reschedule().then(() =>
        this.logger.log('All jobs rescheduled successfully'),
      );
    }
  }

  async stopAgenda(): Promise<boolean> {
    await this.agenda.cancel({});
    await this.agenda.stop();

    return true;
  }

  async reschedule(): Promise<void> {
    // Try to re-schedule jobs not run before server restarted
    const jobs = await this.agendaJobModel
      .find({
        $or: [{ lastFinishedAt: { $exists: false } }, { lastFinishedAt: null }],
      })
      .exec();

    // Assumption: previous jobs should be run at the time they were scheduled for
    // If a job should've been run when server was stopped, this will cause it to run inmediately
    for await (const job of jobs) {
      // Cancel, just in case
      await this.agenda.cancel({ name: job.name });

      // Redefine with old nextRunAt, so it's picked on next iter
      this.agenda.define(job.name, this.runTimer.bind(this));
      await this.agenda.schedule(job.nextRunAt, job.name, {
        url: job.data.url as string,
      });
    }
  }

  runTimer({
    attrs: {
      name,
      data: { url },
    },
  }: Job<TimerJob>): void {
    this.logger.log(`Executing job with ID ${name}`);

    // Assumption: endpoint called will exists for the path given
    // Otherwise, this will always return 404
    const httpCall = this.httpService.post(
      `${url.endsWith('/') ? url.replace(/\/$/, '') : url}/${name}`,
    );

    lastValueFrom(httpCall)
      .then((response) => {
        // Assumption: we do not care about what the server responds, just if it responds or not
        this.logger.log(`Server responded with status code ${response.status}`);
      })
      .catch((response) => {
        // Assumption: if job fails we don't need to retry
        this.logger.error(
          `Something happened. Server response was ${response}`,
        );
      });
  }

  async setTimer({ hours, minutes, seconds, url }: TimerDto): Promise<Timer> {
    this.logger.log(`Scheduling new job for url ${url}`);

    // Assumption: counterId is a job identificator. Using UUIDs serves the same purpose
    const jobName = uuidv4();
    const when = add(new Date(), {
      ...(hours && { hours }),
      ...(minutes && { minutes }),
      ...(seconds && { seconds }),
    });

    this.agenda.define(jobName, this.runTimer.bind(this));
    const { attrs } = await this.agenda.schedule(when, jobName, {
      url,
    });

    this.logger.log(`Job with id ${jobName} scheduled to be run at ${when}`);
    return {
      id: jobName,
      nextRunAt: attrs.nextRunAt,
      url: url,
    };
  }

  getTimeLeft(job: AgendaJobDocument): number {
    const timeLeft = job.nextRunAt
      ? differenceInSeconds(job.nextRunAt, new Date())
      : 0;

    return timeLeft < 0 ? 0 : timeLeft;
  }

  async getJob(
    jobId: string,
  ): Promise<AgendaJobDocument & { timeLeft: number }> {
    const job = await this.agendaJobModel.findOne({ name: jobId });

    if (!job) return null;

    return Object.assign(job, { timeLeft: this.getTimeLeft(job) });
  }
}
