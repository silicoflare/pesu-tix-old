import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const dark = atomWithStorage("tix-dark", true);
export const clubID = atom<string | undefined>(undefined);

export const clubCreds = atom<{ username?: string; password?: string }>({});