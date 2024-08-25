import { JsonValue } from '@prisma/client/runtime/library';
import { Moment } from 'moment';

export type Role = 'student' | 'admin' | 'club';

export type StudentInfo = {
  prn: string;
  srn: string;
  name: string;
  phone?: string;
  email?: string;
  program: string;
  branch: string;
  semester: number;
  section: string;
  campus: string;
  cycle: string;
};

export type ClubInfo = {
  username: string;
  name: string;
  campus: 'RR' | 'EC';
  avatar: string;
  password?: string;
  links?: JsonValue;
};

export type AdminInfo = {
  username: string;
  name: string;
};

export type Event = {
  id?: string;
  name: string;
  description: string;
  imageURL: string;
  type: string;
  date: string;
  creatorID: string;
  public: boolean;
  extraQuestions: JsonValue;
  registrations?: Registration[];
  participation: 'SOLO' | 'TEAM';
  maxTeamMembers: number;
  password: string;
};

export type Registration = {
  id: string;
  eventID: string;
  regType: 'SOLO' | 'TEAM';
  teamName: string | null;
  maxTeamMembers: number;
  ownerID: string | null;
  students: any[];
};
