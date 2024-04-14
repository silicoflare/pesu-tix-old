import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const dark = atomWithStorage("tix-dark", true);