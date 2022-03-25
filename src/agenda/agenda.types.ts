// This is a copy of agenda's types. Given that nestjs-agenda doesn't expose the types I had to create mocks for them
// Installing agenda with its types created a conflict with the agenda that was inside nestjs-agenda so that solution was ignored

export interface JobAttributesData {
  [key: string]: any;
}

/**
 * The database record associated with a job.
 */
interface JobAttributes<T extends JobAttributesData = JobAttributesData> {
  /**
   * The record identity.
   */
  _id: string;

  /**
   * The name of the job.
   */
  name: string;

  /**
   * The type of the job (single|normal).
   */
  type: string;

  /**
   * The job details.
   */
  data: T;

  /**
   * The priority of the job.
   */
  priority: number;

  /**
   * How often the job is repeated using a human-readable or cron format.
   */
  repeatInterval: string | number;

  /**
   * The timezone that conforms to [moment-timezone](http://momentjs.com/timezone/).
   */
  repeatTimezone: string;

  /**
   * Date/time the job was las modified.
   */
  lastModifiedBy: string;

  /**
   * Date/time the job will run next.
   */
  nextRunAt: Date;

  /**
   * Date/time the job was locked.
   */
  lockedAt: Date;

  /**
   * Date/time the job was last run.
   */
  lastRunAt: Date;

  /**
   * Date/time the job last finished running.
   */
  lastFinishedAt: Date;

  /**
   * The reason the job failed.
   */
  failReason: string;

  /**
   * The number of times the job has failed.
   */
  failCount: number;

  /**
   * The date/time the job last failed.
   */
  failedAt: Date;

  /**
   * Job's state
   */
  disabled: boolean;
}

/**
 * A scheduled job.
 */
export interface Job<T extends JobAttributesData = JobAttributesData> {
  /**
   * The database record associated with the job.
   */
  attrs: JobAttributes<T>;
}
