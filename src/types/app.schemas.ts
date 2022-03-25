import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';

// Assumption: extra keys on Timer DTO should not be allowed, just the subset
// Assumption 2: all props but URL are optional. This allows user to schedule a job to run inmediately, or to omit props
@JoiSchemaOptions({
  allowUnknown: false,
})
export class TimerDto {
  @JoiSchema(Joi.number().min(0))
  hours: number;
  @JoiSchema(Joi.number().min(0))
  minutes: number;
  @JoiSchema(Joi.number().min(0))
  seconds: number;
  @JoiSchema(Joi.string().uri().required())
  url: string;
}
