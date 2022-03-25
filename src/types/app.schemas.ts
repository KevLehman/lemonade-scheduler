import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';

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
