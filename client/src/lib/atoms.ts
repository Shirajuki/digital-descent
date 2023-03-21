import { atom } from "jotai";
import PhaserEngine from "./engine";

export const lobbyIdAtom = atom("");
export const engineAtom = atom<PhaserEngine | null>(null);
