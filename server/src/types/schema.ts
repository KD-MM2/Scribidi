import { type Request } from "express";

export interface User {
  id: string;
  email: string;
  hashed_password: string;
  name?: string;
  settingId?: string;
  setting?: Setting;
}

export interface Transcript {
  id: string;
  name?: string;
  audio_file_path: string;
  audio_file_name: string;
  created?: Date;
  updated?: Date;
  diarize?: boolean;
  diarized_transcript?: string;
  model?: string;
  peaks?: string;
  processed?: boolean;
  rttm?: string;
  summary?: string;
  transcript?: string;
  userId: string;
  owner: User;
}

export interface Model {
  id: string;
  model_name?: string;
  english_model?: boolean;
  model_path?: string;
  quantized_level?: string;
}

export interface Setting {
  id: string;
  selected_model?: Model;
  selected_template?: Template;
  diarize?: boolean;
  processors?: number;
  threads?: number;
  modelId?: string;
  templateId?: string;
}

export interface Template {
  id: string;
  name?: string;
  prompt?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export interface WordTimestamp {
  text: string;
  timestamps: {
    from: number;
    to: number;
  };
  offsets: {
    from: number;
    to: number;
  };
}

export interface SpeakerSegment {
  startTime: number;
  duration: number;
  speaker: string;
}

export interface TranscriptSegment {
  text: string;
  timestamps: {
    from: number | null;
    to: number | null;
  };
  speaker: string | null;
}

export interface CustomRequest extends Request {
  hexName?: string;
}
