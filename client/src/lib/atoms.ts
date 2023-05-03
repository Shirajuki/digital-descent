import { atom } from "jotai";
import PhaserEngine from "./engine";
import { ChatType } from "./types";

export const roomIdAtom = atom("");
export const engineAtom = atom<PhaserEngine | null>(null);
export const chatAtom = atom<ChatType[]>([]);
export const cursorAtom = atom<any>({});
export const selectsAtom = atom<any>({});
