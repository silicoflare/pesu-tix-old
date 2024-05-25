import { Moment } from "moment";

export type Role = "student" | "admin" | "club";

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
    campus: "RR" | "EC";
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
    registrations?: Registration[];
    participation: "SOLO" | "TEAM";
    maxTeamMembers: number;
    password: string;
};

export type Registration = {
    id: string;
    eventID: string;
    regType: "SOLO" | "TEAM";
    teamName?: string;
    students: any[];
}