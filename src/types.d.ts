import { Moment } from "moment";

export type Role = "student" | "admin" | "club";

export type StudentInfo = {
    name: string;
    prn: string;
    srn: string;
    phone: string;
    email: string;
    program: string;
    branch_short_code: string;
    branch: string;
    semester: number;
    section: string;
    campus_code: string;
    campus: string;
    class: string;
    cycle: string;
    department: string;
    institute_name: string;
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
    type: "hackathon" | "seminar" | "workshop" | "performance" | "screening" | "CTF" | "talk" | "treasure-hunt";
    date: string;
    creatorID: string;
    // createdAt: Date;
    // updatedAt: Date;
};