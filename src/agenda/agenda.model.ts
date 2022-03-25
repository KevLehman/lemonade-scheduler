import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class MapWithUnknown {
  [k: string]: unknown;
}

export type AgendaJobDocument = AgendaJob & Document;

@Schema({ collection: 'agendaJobs' })
export class AgendaJob {
  @Prop()
  name: string;

  @Prop({ type: MapWithUnknown })
  data: MapWithUnknown;

  @Prop()
  type: string;

  @Prop()
  nextRunAt: Date;

  @Prop()
  lastFinishedAt: Date;
}

export const AgendaJobSchema = SchemaFactory.createForClass(AgendaJob);
