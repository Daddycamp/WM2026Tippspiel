import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off } from "firebase/database";

/* ── Firebase Config ── */
const firebaseApp = initializeApp({
  apiKey: "AIzaSyDb9mNxK_OKALiWmXc86Bz_DV13yW5eWrE",
  authDomain: "wm-tippspiel-1985a.firebaseapp.com",
  databaseURL: "https://wm-tippspiel-1985a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wm-tippspiel-1985a",
  storageBucket: "wm-tippspiel-1985a.firebasestorage.app",
  messagingSenderId: "240916167247",
  appId: "1:240916167247:web:3e80343e8fc24ad853483a",
});
const db = getDatabase(firebaseApp);
const dbRef = ref(db, "tippspiel2");

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 400);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ── Teams ── */
const TEAMS = {
  MEX: { n: "Mexiko", f: "🇲🇽" }, ZAF: { n: "Südafrika", f: "🇿🇦" },
  KOR: { n: "Südkorea", f: "🇰🇷" }, CZE: { n: "Tschechien", f: "🇨🇿" },
  CAN: { n: "Kanada", f: "🇨🇦" }, SUI: { n: "Schweiz", f: "🇨🇭" },
  QAT: { n: "Katar", f: "🇶🇦" }, BIH: { n: "Bosnien-H.", f: "🇧🇦" },
  BRA: { n: "Brasilien", f: "🇧🇷" }, MAR: { n: "Marokko", f: "🇲🇦" },
  SCO: { n: "Schottland", f: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }, HAI: { n: "Haiti", f: "🇭🇹" },
  USA: { n: "USA", f: "🇺🇸" }, AUS: { n: "Australien", f: "🇦🇺" },
  PAR: { n: "Paraguay", f: "🇵🇾" }, TUR: { n: "Türkei", f: "🇹🇷" },
  GER: { n: "Deutschland", f: "🇩🇪" }, ECU: { n: "Ecuador", f: "🇪🇨" },
  CIV: { n: "Elfenbeinküste", f: "🇨🇮" }, CUR: { n: "Curaçao", f: "🇨🇼" },
  NED: { n: "Niederlande", f: "🇳🇱" }, JPN: { n: "Japan", f: "🇯🇵" },
  SWE: { n: "Schweden", f: "🇸🇪" }, TUN: { n: "Tunesien", f: "🇹🇳" },
  BEL: { n: "Belgien", f: "🇧🇪" }, IRN: { n: "Iran", f: "🇮🇷" },
  EGY: { n: "Ägypten", f: "🇪🇬" }, NZL: { n: "Neuseeland", f: "🇳🇿" },
  ESP: { n: "Spanien", f: "🇪🇸" }, URU: { n: "Uruguay", f: "🇺🇾" },
  KSA: { n: "Saudi-Arabien", f: "🇸🇦" }, CPV: { n: "Kap Verde", f: "🇨🇻" },
  FRA: { n: "Frankreich", f: "🇫🇷" }, SEN: { n: "Senegal", f: "🇸🇳" },
  IRQ: { n: "Irak", f: "🇮🇶" }, NOR: { n: "Norwegen", f: "🇳🇴" },
  ARG: { n: "Argentinien", f: "🇦🇷" }, ALG: { n: "Algerien", f: "🇩🇿" },
  AUT: { n: "Österreich", f: "🇦🇹" }, JOR: { n: "Jordanien", f: "🇯🇴" },
  POR: { n: "Portugal", f: "🇵🇹" }, COL: { n: "Kolumbien", f: "🇨🇴" },
  UZB: { n: "Usbekistan", f: "🇺🇿" }, COD: { n: "DR Kongo", f: "🇨🇩" },
  ENG: { n: "England", f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, CRO: { n: "Kroatien", f: "🇭🇷" },
  GHA: { n: "Ghana", f: "🇬🇭" }, PAN: { n: "Panama", f: "🇵🇦" },
};
const TEAM_KEYS = Object.keys(TEAMS);

/* ── Groups ── */
const GROUPS = [
  { name: "A", teams: ["MEX", "KOR", "ZAF", "CZE"] },
  { name: "B", teams: ["CAN", "SUI", "QAT", "BIH"] },
  { name: "C", teams: ["BRA", "MAR", "SCO", "HAI"] },
  { name: "D", teams: ["USA", "AUS", "PAR", "TUR"] },
  { name: "E", teams: ["GER", "ECU", "CIV", "CUR"] },
  { name: "F", teams: ["NED", "JPN", "SWE", "TUN"] },
  { name: "G", teams: ["BEL", "IRN", "EGY", "NZL"] },
  { name: "H", teams: ["ESP", "URU", "KSA", "CPV"] },
  { name: "I", teams: ["FRA", "SEN", "IRQ", "NOR"] },
  { name: "J", teams: ["ARG", "ALG", "AUT", "JOR"] },
  { name: "K", teams: ["POR", "COL", "UZB", "COD"] },
  { name: "L", teams: ["ENG", "CRO", "GHA", "PAN"] },
];

/* ── Matches ── */
const MATCHES = [
  { id: "A1", g: "A", h: "MEX", a: "ZAF", d: "11.06.", dl: "2026-06-11", r: [2, 0] },
  { id: "A2", g: "A", h: "KOR", a: "CZE", d: "12.06.", dl: "2026-06-12", r: [2, 1] },
  { id: "A3", g: "A", h: "CZE", a: "ZAF", d: "18.06.", dl: "2026-06-18", r: [1, 1] },
  { id: "A4", g: "A", h: "MEX", a: "KOR", d: "19.06.", dl: "2026-06-19", r: [1, 0] },
  { id: "A5", g: "A", h: "CZE", a: "MEX", d: "25.06.", dl: "2026-06-25", r: [0, 3] },
  { id: "A6", g: "A", h: "ZAF", a: "KOR", d: "25.06.", dl: "2026-06-25", r: [1, 0] },
  { id: "B1", g: "B", h: "CAN", a: "BIH", d: "12.06.", dl: "2026-06-12", r: [1, 1] },
  { id: "B2", g: "B", h: "QAT", a: "SUI", d: "13.06.", dl: "2026-06-13", r: [1, 1] },
  { id: "B3", g: "B", h: "SUI", a: "BIH", d: "18.06.", dl: "2026-06-18", r: [4, 1] },
  { id: "B4", g: "B", h: "CAN", a: "QAT", d: "18.06.", dl: "2026-06-18", r: [6, 0] },
  { id: "B5", g: "B", h: "SUI", a: "CAN", d: "24.06.", dl: "2026-06-24", r: [3, 1] },
  { id: "B6", g: "B", h: "BIH", a: "QAT", d: "24.06.", dl: "2026-06-24", r: [3, 1] },
  { id: "C1", g: "C", h: "BRA", a: "MAR", d: "13.06.", dl: "2026-06-13", r: [1, 1] },
  { id: "C2", g: "C", h: "HAI", a: "SCO", d: "14.06.", dl: "2026-06-14", r: [0, 1] },
  { id: "C3", g: "C", h: "BRA", a: "HAI", d: "19.06.", dl: "2026-06-19", r: [3, 0] },
  { id: "C4", g: "C", h: "SCO", a: "MAR", d: "19.06.", dl: "2026-06-19", r: [0, 1] },
  { id: "C5", g: "C", h: "SCO", a: "BRA", d: "24.06.", dl: "2026-06-24", r: [0, 3] },
  { id: "C6", g: "C", h: "MAR", a: "HAI", d: "24.06.", dl: "2026-06-24", r: [4, 2] },
  { id: "D1", g: "D", h: "USA", a: "PAR", d: "13.06.", dl: "2026-06-13", r: [4, 1] },
  { id: "D2", g: "D", h: "AUS", a: "TUR", d: "14.06.", dl: "2026-06-14", r: [2, 0] },
  { id: "D3", g: "D", h: "USA", a: "AUS", d: "19.06.", dl: "2026-06-19", r: [2, 0] },
  { id: "D4", g: "D", h: "TUR", a: "PAR", d: "20.06.", dl: "2026-06-20", r: [0, 1] },
  { id: "D5", g: "D", h: "TUR", a: "USA", d: "26.06.", dl: "2026-06-26", r: [3, 2] },
  { id: "D6", g: "D", h: "PAR", a: "AUS", d: "26.06.", dl: "2026-06-26", r: [0, 0] },
  { id: "E1", g: "E", h: "GER", a: "CUR", d: "14.06.", dl: "2026-06-14", r: [7, 1] },
  { id: "E2", g: "E", h: "CIV", a: "ECU", d: "15.06.", dl: "2026-06-15", r: [1, 0] },
  { id: "E3", g: "E", h: "GER", a: "CIV", d: "20.06.", dl: "2026-06-20", r: [2, 1] },
  { id: "E4", g: "E", h: "ECU", a: "CUR", d: "21.06.", dl: "2026-06-21", r: [0, 0] },
  { id: "E5", g: "E", h: "CUR", a: "CIV", d: "25.06.", dl: "2026-06-25", r: [0, 2] },
  { id: "E6", g: "E", h: "ECU", a: "GER", d: "25.06.", dl: "2026-06-25", r: [2, 1] },
  { id: "F1", g: "F", h: "NED", a: "JPN", d: "14.06.", dl: "2026-06-14", r: [2, 2] },
  { id: "F2", g: "F", h: "SWE", a: "TUN", d: "15.06.", dl: "2026-06-15", r: [5, 1] },
  { id: "F3", g: "F", h: "NED", a: "SWE", d: "20.06.", dl: "2026-06-20", r: [5, 1] },
  { id: "F4", g: "F", h: "TUN", a: "JPN", d: "21.06.", dl: "2026-06-21", r: [0, 4] },
  { id: "F5", g: "F", h: "TUN", a: "NED", d: "26.06.", dl: "2026-06-26", r: [1, 3] },
  { id: "F6", g: "F", h: "JPN", a: "SWE", d: "26.06.", dl: "2026-06-26", r: [1, 1] },
  { id: "G1", g: "G", h: "BEL", a: "EGY", d: "15.06.", dl: "2026-06-15", r: [1, 1] },
  { id: "G2", g: "G", h: "IRN", a: "NZL", d: "16.06.", dl: "2026-06-16", r: [2, 2] },
  { id: "G3", g: "G", h: "BEL", a: "IRN", d: "21.06.", dl: "2026-06-21", r: [0, 0] },
  { id: "G4", g: "G", h: "NZL", a: "EGY", d: "22.06.", dl: "2026-06-22", r: [1, 3] },
  { id: "G5", g: "G", h: "NZL", a: "BEL", d: "27.06.", dl: "2026-06-27", r: [1, 5] },
  { id: "G6", g: "G", h: "EGY", a: "IRN", d: "27.06.", dl: "2026-06-27", r: [1, 1] },
  { id: "H1", g: "H", h: "ESP", a: "CPV", d: "15.06.", dl: "2026-06-15", r: [0, 0] },
  { id: "H2", g: "H", h: "KSA", a: "URU", d: "15.06.", dl: "2026-06-15", r: [1, 1] },
  { id: "H3", g: "H", h: "URU", a: "CPV", d: "21.06.", dl: "2026-06-21", r: [2, 2] },
  { id: "H4", g: "H", h: "ESP", a: "KSA", d: "21.06.", dl: "2026-06-21", r: [4, 0] },
  { id: "H5", g: "H", h: "CPV", a: "KSA", d: "27.06.", dl: "2026-06-27", r: null },
  { id: "H6", g: "H", h: "URU", a: "ESP", d: "27.06.", dl: "2026-06-27", r: [0, 1] },
  { id: "I1", g: "I", h: "FRA", a: "SEN", d: "16.06.", dl: "2026-06-16", r: [3, 1] },
  { id: "I2", g: "I", h: "IRQ", a: "NOR", d: "16.06.", dl: "2026-06-16", r: [1, 4] },
  { id: "I3", g: "I", h: "NOR", a: "SEN", d: "22.06.", dl: "2026-06-22", r: [3, 2] },
  { id: "I4", g: "I", h: "FRA", a: "IRQ", d: "22.06.", dl: "2026-06-22", r: [3, 0] },
  { id: "I5", g: "I", h: "NOR", a: "FRA", d: "26.06.", dl: "2026-06-26", r: [1, 4] },
  { id: "I6", g: "I", h: "SEN", a: "IRQ", d: "26.06.", dl: "2026-06-26", r: [5, 0] },
  { id: "J1", g: "J", h: "ARG", a: "ALG", d: "17.06.", dl: "2026-06-17", r: [3, 0] },
  { id: "J2", g: "J", h: "AUT", a: "JOR", d: "17.06.", dl: "2026-06-17", r: [3, 1] },
  { id: "J3", g: "J", h: "ARG", a: "AUT", d: "22.06.", dl: "2026-06-22", r: [2, 0] },
  { id: "J4", g: "J", h: "JOR", a: "ALG", d: "23.06.", dl: "2026-06-23", r: [1, 2] },
  { id: "J5", g: "J", h: "ALG", a: "AUT", d: "28.06.", dl: "2026-06-28", r: null },
  { id: "J6", g: "J", h: "JOR", a: "ARG", d: "28.06.", dl: "2026-06-28", r: null },
  { id: "K1", g: "K", h: "POR", a: "COD", d: "17.06.", dl: "2026-06-17", r: [1, 1] },
  { id: "K2", g: "K", h: "UZB", a: "COL", d: "18.06.", dl: "2026-06-18", r: [1, 3] },
  { id: "K3", g: "K", h: "POR", a: "UZB", d: "23.06.", dl: "2026-06-23", r: [5, 0] },
  { id: "K4", g: "K", h: "COL", a: "COD", d: "24.06.", dl: "2026-06-24", r: [1, 0] },
  { id: "K5", g: "K", h: "COL", a: "POR", d: "28.06.", dl: "2026-06-28", r: [0, 0] },
  { id: "K6", g: "K", h: "COD", a: "UZB", d: "28.06.", dl: "2026-06-28", r: [3, 1] },
  { id: "L1", g: "L", h: "ENG", a: "CRO", d: "17.06.", dl: "2026-06-17", r: [4, 2] },
  { id: "L2", g: "L", h: "GHA", a: "PAN", d: "17.06.", dl: "2026-06-17", r: [1, 0] },
  { id: "L3", g: "L", h: "ENG", a: "GHA", d: "23.06.", dl: "2026-06-23", r: [0, 0] },
  { id: "L4", g: "L", h: "PAN", a: "CRO", d: "23.06.", dl: "2026-06-23", r: [0, 1] },
  { id: "L5", g: "L", h: "PAN", a: "ENG", d: "27.06.", dl: "2026-06-27", r: [0, 2] },
  { id: "L6", g: "L", h: "CRO", a: "GHA", d: "27.06.", dl: "2026-06-27", r: [2, 1] },
  /* ── Round of 32 ── */
  { id: "R01", g: "R32", h: "ZAF", a: "CAN", d: "28.06.", dl: "2026-06-28", r: null, label: "2A vs 2B" },
  { id: "R02", g: "R32", h: "BRA", a: "JPN", d: "29.06.", dl: "2026-06-29", r: null, label: "1C vs 2F" },
  { id: "R03", g: "R32", h: "GER", a: "PAR", d: "29.06.", dl: "2026-06-29", r: null, label: "1E vs 3D" },
  { id: "R04", g: "R32", h: "NED", a: "MAR", d: "30.06.", dl: "2026-06-30", r: null, label: "1F vs 2C" },
  { id: "R05", g: "R32", h: "CIV", a: "NOR", d: "30.06.", dl: "2026-06-30", r: null, label: "2E vs 2I" },
  { id: "R06", g: "R32", h: "FRA", a: "SWE", d: "30.06.", dl: "2026-06-30", r: null, label: "1I vs 3F" },
  { id: "R07", g: "R32", h: "MEX", a: "ECU", d: "01.07.", dl: "2026-07-01", r: null, label: "1A vs 3E" },
  { id: "R08", g: "R32", h: "USA", a: "BIH", d: "01.07.", dl: "2026-07-01", r: null, label: "1D vs 3B" },
  { id: "R09", g: "R32", h: "BEL", a: "SEN", d: "01.07.", dl: "2026-07-01", r: null, label: "1G vs 3I" },
  { id: "R10", g: "R32", h: "AUS", a: "EGY", d: "02.07.", dl: "2026-07-02", r: null, label: "2D vs 2G" },
  { id: "R11", g: "R32", h: "ARG", a: "CPV", d: "02.07.", dl: "2026-07-02", r: null, label: "1J vs 2H" },
  { id: "R12", g: "R32", h: "ESP", a: "AUT", d: "02.07.", dl: "2026-07-02", r: null, label: "1H vs 2J" },
  { id: "R13", g: "R32", h: "SUI", a: "ALG", d: "03.07.", dl: "2026-07-03", r: null, label: "2B vs 3J" },
  { id: "R14", g: "R32", h: "ENG", a: "COD", d: "03.07.", dl: "2026-07-03", r: null, label: "1L vs 3K" },
  { id: "R15", g: "R32", h: "COL", a: "GHA", d: "03.07.", dl: "2026-07-03", r: null, label: "1K vs 3L" },
  { id: "R16", g: "R32", h: "POR", a: "CRO", d: "03.07.", dl: "2026-07-03", r: null, label: "2K vs 2L" },
  /* ── Round of 16 ── */
  { id: "S01", g: "R16", h: "", a: "", d: "05.07.", dl: "2026-07-05", r: null, label: "S. ZAF/CAN vs S. NED/MAR" },
  { id: "S02", g: "R16", h: "", a: "", d: "05.07.", dl: "2026-07-05", r: null, label: "S. BRA/JPN vs S. CIV/NOR" },
  { id: "S03", g: "R16", h: "", a: "", d: "06.07.", dl: "2026-07-06", r: null, label: "S. GER/PAR vs S. FRA/SWE" },
  { id: "S04", g: "R16", h: "", a: "", d: "06.07.", dl: "2026-07-06", r: null, label: "S. MEX/ECU vs S. ENG/COD" },
  { id: "S05", g: "R16", h: "", a: "", d: "07.07.", dl: "2026-07-07", r: null, label: "S. USA/BIH vs S. BEL/SEN" },
  { id: "S06", g: "R16", h: "", a: "", d: "07.07.", dl: "2026-07-07", r: null, label: "S. AUS/EGY vs S. ARG/CPV" },
  { id: "S07", g: "R16", h: "", a: "", d: "08.07.", dl: "2026-07-08", r: null, label: "S. ESP/AUT vs S. SUI/ALG" },
  { id: "S08", g: "R16", h: "", a: "", d: "08.07.", dl: "2026-07-08", r: null, label: "S. COL/GHA vs S. POR/CRO" },
  /* ── Quarter-finals ── */
  { id: "Q01", g: "QF", h: "", a: "", d: "11.07.", dl: "2026-07-11", r: null, label: "VF 1" },
  { id: "Q02", g: "QF", h: "", a: "", d: "11.07.", dl: "2026-07-11", r: null, label: "VF 2" },
  { id: "Q03", g: "QF", h: "", a: "", d: "12.07.", dl: "2026-07-12", r: null, label: "VF 3" },
  { id: "Q04", g: "QF", h: "", a: "", d: "12.07.", dl: "2026-07-12", r: null, label: "VF 4" },
  /* ── Semi-finals ── */
  { id: "H01", g: "SF", h: "", a: "", d: "15.07.", dl: "2026-07-15", r: null, label: "HF 1" },
  { id: "H02", g: "SF", h: "", a: "", d: "16.07.", dl: "2026-07-16", r: null, label: "HF 2" },
  /* ── 3rd place & Final ── */
  { id: "P01", g: "FIN", h: "", a: "", d: "18.07.", dl: "2026-07-18", r: null, label: "Spiel um Platz 3" },
  { id: "F01", g: "FIN", h: "", a: "", d: "19.07.", dl: "2026-07-19", r: null, label: "FINALE" },
];

const MAX_JOKERS = 3;
const BONUS = { champion: 10, boot: 8, group: 5 };
const COLORS = ["#c084e0", "#e06050", "#50b8e0", "#6dd468", "#c8a84e", "#e09050", "#50e0b0", "#e07098"];
const STORE_KEY = "wm26tip7";
const STORE_RESULTS = "wm26res";
const MATCH_DAYS = [...new Set(MATCHES.map(m => m.dl))].sort();
const KO_PHASES = [
  { key: "R32", label: "Achtelfinale", count: 16 },
  { key: "R16", label: "Achtelfinale", count: 8 },
  { key: "QF", label: "Viertelfinale", count: 4 },
  { key: "SF", label: "Halbfinale", count: 2 },
  { key: "FIN", label: "Finale", count: 2 },
];
const GROUP_IDS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ALL_PHASES = [...GROUP_IDS, "R32", "R16", "QF", "SF", "FIN"];

function matchDisplayName(m, side) {
  const key = side === "h" ? m.h : m.a;
  if (key && TEAMS[key]) return { name: TEAMS[key].n, flag: TEAMS[key].f };
  return { name: m.label || "TBD", flag: "🏳️" };
}

/* ── Bracket progression: winner of match X goes to match Y ── */
const BRACKET = {
  // R32 winners → R16 (confirmed pairings from FIFA bracket)
  R01: { to: "S01", side: "h" }, R04: { to: "S01", side: "a" }, // ZAF/CAN vs NED/MAR
  R02: { to: "S02", side: "h" }, R05: { to: "S02", side: "a" }, // BRA/JPN vs CIV/NOR
  R03: { to: "S03", side: "h" }, R06: { to: "S03", side: "a" }, // GER/PAR vs FRA/SWE
  R07: { to: "S04", side: "h" }, R14: { to: "S04", side: "a" }, // MEX/ECU vs ENG/COD
  R08: { to: "S05", side: "h" }, R09: { to: "S05", side: "a" }, // USA/BIH vs BEL/SEN
  R10: { to: "S06", side: "h" }, R11: { to: "S06", side: "a" }, // AUS/EGY vs ARG/CPV
  R12: { to: "S07", side: "h" }, R13: { to: "S07", side: "a" }, // ESP/AUT vs SUI/ALG
  R15: { to: "S08", side: "h" }, R16: { to: "S08", side: "a" }, // COL/GHA vs POR/CRO
  // R16 winners → QF
  S01: { to: "Q01", side: "h" }, S02: { to: "Q01", side: "a" },
  S03: { to: "Q02", side: "h" }, S04: { to: "Q02", side: "a" },
  S05: { to: "Q03", side: "h" }, S06: { to: "Q03", side: "a" },
  S07: { to: "Q04", side: "h" }, S08: { to: "Q04", side: "a" },
  // QF winners → SF
  Q01: { to: "H01", side: "h" }, Q02: { to: "H01", side: "a" },
  Q03: { to: "H02", side: "h" }, Q04: { to: "H02", side: "a" },
  // SF winners → Final, SF losers → 3rd place
  H01: { to: "F01", side: "h", loseTo: "P01", loseSide: "h" },
  H02: { to: "F01", side: "a", loseTo: "P01", loseSide: "a" },
};

function getWinner(m) {
  if (!m.r || !m.h || !m.a) return null;
  if (m.r[0] > m.r[1]) return m.h;
  if (m.r[1] > m.r[0]) return m.a;
  // Draw in knockout = needs extra time/penalties, check if penalty result stored
  // For now treat draws as unresolved
  return null;
}

function progressBracket() {
  Object.entries(BRACKET).forEach(function(entry) {
    var sourceId = entry[0];
    var target = entry[1];
    var sourceMatch = MATCHES.find(function(m) { return m.id === sourceId; });
    if (!sourceMatch || !sourceMatch.r) return;
    var winner = getWinner(sourceMatch);
    if (winner) {
      var targetMatch = MATCHES.find(function(m) { return m.id === target.to; });
      if (targetMatch) targetMatch[target.side] = winner;
    }
    // Handle losers for semi-finals → 3rd place
    if (target.loseTo && sourceMatch.r) {
      var loser = winner === sourceMatch.h ? sourceMatch.a : sourceMatch.h;
      if (loser) {
        var loserMatch = MATCHES.find(function(m) { return m.id === target.loseTo; });
        if (loserMatch) loserMatch[target.loseSide] = loser;
      }
    }
  });
}

function missingTips(player) {
  let count = 0;
  MATCHES.forEach(m => {
    // Only count tippable matches (teams known or group stage)
    const tippable = (m.h && m.a && TEAMS[m.h] && TEAMS[m.a]) || GROUP_IDS.includes(m.g);
    if (!tippable) return;
    const t = (player.tips || {})[m.id];
    if (!t || t.h == null || t.a == null) count++;
  });
  return count;
}

/* Openfootball team name mapping */
const NAME_MAP = {
  "Mexico":"MEX","South Africa":"ZAF","South Korea":"KOR","Korea Republic":"KOR",
  "Czech Republic":"CZE","Czechia":"CZE","Canada":"CAN","Switzerland":"SUI",
  "Qatar":"QAT","Bosnia and Herzegovina":"BIH","Bosnia-Herzegovina":"BIH",
  "Brazil":"BRA","Morocco":"MAR","Scotland":"SCO","Haiti":"HAI",
  "United States":"USA","USA":"USA","Australia":"AUS","Paraguay":"PAR",
  "Turkey":"TUR","Germany":"GER","Ecuador":"ECU",
  "Ivory Coast":"CIV","Curacao":"CUR","Netherlands":"NED","Japan":"JPN",
  "Sweden":"SWE","Tunisia":"TUN","Belgium":"BEL","Iran":"IRN","IR Iran":"IRN",
  "Egypt":"EGY","New Zealand":"NZL","Spain":"ESP","Uruguay":"URU",
  "Saudi Arabia":"KSA","Cape Verde":"CPV","Cabo Verde":"CPV",
  "France":"FRA","Senegal":"SEN","Iraq":"IRQ","Norway":"NOR",
  "Argentina":"ARG","Algeria":"ALG","Austria":"AUT","Jordan":"JOR",
  "Portugal":"POR","Colombia":"COL","Uzbekistan":"UZB",
  "DR Congo":"COD","Congo DR":"COD",
  "England":"ENG","Croatia":"CRO","Ghana":"GHA","Panama":"PAN",
};

const RESULTS_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

async function fetchLiveResults() {
  try {
    const r = await fetch(RESULTS_URL);
    if (!r.ok) return null;
    const data = await r.json();
    const results = {};
    (data.matches || []).forEach(m => {
      if (!m.score || !m.score.ft) return;
      const t1 = NAME_MAP[m.team1];
      const t2 = NAME_MAP[m.team2];
      if (!t1 || !t2) return;
      const match = MATCHES.find(x => x.h === t1 && x.a === t2);
      if (match) results[match.id] = m.score.ft;
    });
    return results;
  } catch (e) { return null; }
}

const DEFAULT_DATA = {
  players: [
    { id: "amelie", name: "Amélie", color: "#c084e0", tips: {}, jokers: {}, tt: { champion: "", boot: "", best: "" } },
    { id: "raffi", name: "Raffi", color: "#e06050", tips: {}, jokers: {}, tt: { champion: "", boot: "", best: "" } },
    { id: "stefan", name: "Stefan", color: "#50b8e0", tips: {}, jokers: {}, tt: { champion: "", boot: "", best: "" } },
    { id: "marika", name: "Marika", color: "#6dd468", tips: {}, jokers: {}, tt: { champion: "", boot: "", best: "" } },
  ],
  aid: "stefan"
};

/* ── Helpers ── */
function pts(th, ta, rh, ra) {
  if (th == null || ta == null || rh == null || ra == null) return null;
  if (th === rh && ta === ra) return 4;
  const d = th - ta, e = rh - ra;
  if (d === e && d !== 0) return 3;
  if ((d > 0 && e > 0) || (d < 0 && e < 0) || (d === 0 && e === 0)) return 2;
  return 0;
}

function ptsLabel(p) {
  if (p === 4) return { text: "Exakt!", color: "#16a34a" };
  if (p === 3) return { text: "Diff.", color: "#2563eb" };
  if (p === 2) return { text: "Tend.", color: "#d97706" };
  if (p === 0) return { text: "Falsch", color: "#dc2626" };
  return { text: "", color: "#555" };
}

function locked(dl) { return new Date() >= new Date(dl + "T16:00:00Z"); } /* 18:00 CET */
function mkId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function playerStats(p) {
  let tot = 0, ex = 0, di = 0, te = 0, wr = 0, ev = 0;
  MATCHES.forEach(m => {
    const t = (p.tips || {})[m.id];
    if (!t || t.h == null || t.a == null || !m.r) return;
    ev++;
    const b = pts(t.h, t.a, m.r[0], m.r[1]);
    tot += (p.jokers || {})[m.id] ? b * 2 : b;
    if (b === 4) ex++; else if (b === 3) di++; else if (b === 2) te++; else wr++;
  });
  return { tot, ex, di, te, wr, ev };
}

function standings(groupName) {
  const gt = GROUPS.find(g => g.name === groupName).teams;
  const gm = MATCHES.filter(m => m.g === groupName && m.r);
  const tb = {};
  gt.forEach(t => { tb[t] = { w: 0, d: 0, l: 0, gf: 0, ga: 0, p: 0, mp: 0 }; });
  gm.forEach(m => {
    tb[m.h].gf += m.r[0]; tb[m.h].ga += m.r[1]; tb[m.h].mp++;
    tb[m.a].gf += m.r[1]; tb[m.a].ga += m.r[0]; tb[m.a].mp++;
    if (m.r[0] > m.r[1]) { tb[m.h].w++; tb[m.h].p += 3; tb[m.a].l++; }
    else if (m.r[0] < m.r[1]) { tb[m.a].w++; tb[m.a].p += 3; tb[m.h].l++; }
    else { tb[m.h].d++; tb[m.a].d++; tb[m.h].p++; tb[m.a].p++; }
  });
  return gt
    .map(t => ({ key: t, ...tb[t], gd: tb[t].gf - tb[t].ga }))
    .sort((a, b) => b.p - a.p || b.gd - a.gd || b.gf - a.gf);
}

/* ── Main App ── */
export default function App() {
  const screenW = useWidth();
  const wide = screenW >= 768;
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("tippen");
  const [grp, setGrp] = useState("E");
  const [newName, setNewName] = useState("");
  const [cmpId, setCmpId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [delId, setDelId] = useState(null);
  const [connected, setConnected] = useState(false);

  const [liveResults, setLiveResults] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const skipSync = useRef(false);

  useEffect(() => {
    function applyResults(results) {
      Object.entries(results).forEach(function(entry) {
        var m = MATCHES.find(function(x) { return x.id === entry[0]; });
        if (m && entry[1]) m.r = entry[1];
      });
    }
    async function loadResults() {
      try {
        var cached = localStorage.getItem(STORE_RESULTS);
        if (cached) {
          var parsed = JSON.parse(cached);
          if (parsed.results) { applyResults(parsed.results); setLiveResults(parsed.results); }
          if (parsed.ts) setLastUpdate(new Date(parsed.ts));
          progressBracket();
        }
      } catch (e) {}
      var fresh = await fetchLiveResults();
      if (fresh && Object.keys(fresh).length > 0) {
        applyResults(fresh);
        progressBracket();
        setLiveResults(fresh);
        var now = new Date();
        setLastUpdate(now);
        try { localStorage.setItem(STORE_RESULTS, JSON.stringify({ results: fresh, ts: now.toISOString() })); } catch (e) {}
      }
    }
    loadResults();
  }, []);

  /* ── Firebase real-time listener ── */
  useEffect(() => {
    // Load local cache first for instant display
    try {
      const cached = localStorage.getItem(STORE_KEY);
      if (cached) setData(JSON.parse(cached));
    } catch (e) {}

    // Subscribe to Firebase - updates arrive automatically
    const unsub = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val && val.players) {
        skipSync.current = true;
        // Keep local aid (each device picks their own player)
        const localAid = localStorage.getItem("wm26aid");
        setData({ ...val, aid: localAid || val.aid || "stefan" });
        try { localStorage.setItem(STORE_KEY, JSON.stringify(val)); } catch (e) {}
        setConnected(true);
        // Reset skip flag after React processes the state update
        setTimeout(() => { skipSync.current = false; }, 100);
      } else if (!data) {
        // No data in Firebase yet — push defaults
        const def = JSON.parse(JSON.stringify(DEFAULT_DATA));
        set(dbRef, def);
        setData(def);
      }
      setConnected(true);
    }, (error) => {
      setConnected(false);
      // If Firebase fails, use local data or defaults
      if (!data) {
        try {
          const cached = localStorage.getItem(STORE_KEY);
          if (cached) { setData(JSON.parse(cached)); return; }
        } catch (e) {}
        setData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
      }
    });

    return () => off(dbRef);
  }, []);

  const save = useCallback((d) => {
    setData(d);
    // Save active player choice locally (per device)
    try {
      localStorage.setItem("wm26aid", d.aid);
      localStorage.setItem(STORE_KEY, JSON.stringify(d));
    } catch (e) {}
    // Push to Firebase (unless this save was triggered by Firebase listener)
    if (!skipSync.current) {
      set(dbRef, { players: d.players, aid: d.aid }).catch(() => {});
    }
  }, []);

  const act = useMemo(() => {
    if (!data) return null;
    return data.players.find(p => p.id === data.aid) || null;
  }, [data]);

  const ranks = useMemo(() => {
    if (!data) return [];
    return data.players
      .map(p => ({ ...p, ...playerStats(p) }))
      .sort((a, b) => b.tot - a.tot);
  }, [data]);

  const bestPerDay = useMemo(() => {
    if (!data) return {};
    const result = {};
    MATCH_DAYS.forEach(dl => {
      const dm = MATCHES.filter(m => m.dl === dl && m.r);
      if (!dm.length) return;
      let best = null, bestPts = -1;
      data.players.forEach(p => {
        let dp = 0;
        dm.forEach(m => {
          const t = (p.tips || {})[m.id];
          if (!t || t.h == null || t.a == null) return;
          let pt = pts(t.h, t.a, m.r[0], m.r[1]);
          if ((p.jokers || {})[m.id]) pt = pt * 2;
          dp += pt;
        });
        if (dp > bestPts) { bestPts = dp; best = p; }
      });
      if (best && bestPts > 0) result[dl] = { name: best.name, color: best.color, pts: bestPts };
    });
    return result;
  }, [data]);

  /* ── Actions ── */
  const addPlayer = () => {
    if (!newName.trim() || !data) return;
    const p = {
      id: mkId(), name: newName.trim(),
      color: COLORS[data.players.length % COLORS.length],
      tips: {}, jokers: {}, tt: { champion: "", boot: "", best: "" }
    };
    save({ ...data, players: [...data.players, p], aid: data.aid || p.id });
    setNewName(""); setShowAdd(false);
  };

  const removePlayer = (id) => {
    const pl = data.players.filter(p => p.id !== id);
    save({ ...data, players: pl, aid: data.aid === id ? (pl.length > 0 ? pl[0].id : null) : data.aid });
    setDelId(null);
  };

  const setTip = (mid, side, val) => {
    if (!act) return;
    const m = MATCHES.find(x => x.id === mid);
    if (m && locked(m.dl)) return;
    const v = val === "" ? null : Math.max(0, Math.min(99, parseInt(val) || 0));
    const up = data.players.map(p => {
      if (p.id !== act.id) return p;
      const prev = (p.tips || {})[mid] || { h: null, a: null };
      return { ...p, tips: { ...p.tips, [mid]: { ...prev, [side]: v } } };
    });
    save({ ...data, players: up });
  };

  const toggleJoker = (mid) => {
    if (!act) return;
    const m = MATCHES.find(x => x.id === mid);
    if (m && locked(m.dl)) return;
    const jk = act.jokers || {};
    const used = Object.keys(jk).filter(k => jk[k] && k !== mid).length;
    const cur = jk[mid] || false;
    if (!cur && used >= MAX_JOKERS) return;
    const up = data.players.map(p =>
      p.id !== act.id ? p : { ...p, jokers: { ...p.jokers, [mid]: !cur } }
    );
    save({ ...data, players: up });
  };

  const setTT = (field, val) => {
    if (!act) return;
    const up = data.players.map(p =>
      p.id !== act.id ? p : { ...p, tt: { ...p.tt, [field]: val } }
    );
    save({ ...data, players: up });
  };

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f1c30", color: "#c8a84e" }}>
      Laden...
    </div>
  );

  const groupMatches = MATCHES.filter(m => m.g === grp);
  const jokersUsed = act ? Object.keys(act.jokers || {}).filter(k => (act.jokers || {})[k]).length : 0;
  const S = {
    card: { background: "#1a2d48", borderRadius: wide ? 12 : 10, padding: wide ? "14px 18px" : "10px 12px", marginBottom: wide ? 10 : 8 },
    pill: { fontSize: wide ? 12 : 10, fontWeight: 700, padding: wide ? "3px 10px" : "2px 7px", borderRadius: 4 },
    input: { width: wide ? 48 : 38, height: wide ? 42 : 34, textAlign: "center", fontSize: wide ? 20 : 16, fontWeight: 800, border: "2px solid #253550", borderRadius: 6, background: "#0f1c30", color: "#c8a84e", outline: "none" },
    inputLocked: { width: wide ? 48 : 38, height: wide ? 42 : 34, textAlign: "center", fontSize: wide ? 20 : 16, fontWeight: 800, border: "2px solid #253550", borderRadius: 6, background: "#0f1c30", color: "#556677", outline: "none", opacity: 0.45 },
  };

  const tabBtn = (key) => ({
    flex: 1, padding: wide ? "10px 0" : "7px 0", fontSize: wide ? 13 : 10, fontWeight: 700, border: "none", cursor: "pointer",
    background: tab === key ? "#c8a84e" : "transparent", color: tab === key ? "#0b1525" : "#6688aa",
  });

  const renderMatch = (m) => {
    const tip = (act && act.tips && act.tips[m.id]) || { h: null, a: null };
    const lk = locked(m.dl);
    const jk = act && (act.jokers || {})[m.id];
    const homeInfo = matchDisplayName(m, "h");
    const awayInfo = matchDisplayName(m, "a");
    const isTbd = !m.h || !m.a || !TEAMS[m.h] || !TEAMS[m.a];
    const hasTip = tip.h != null && tip.a != null;
    const needsTip = !isTbd && !hasTip && !lk;
    let p = m.r ? pts(tip.h, tip.a, m.r[0], m.r[1]) : null;
    const basePts = p;
    if (p != null && jk) p = p * 2;
    const label = basePts != null ? ptsLabel(basePts) : null;

    const isFinished = m.r != null;

    return (
      <div key={m.id} style={{
        ...S.card,
        border: jk ? "1px solid #c8a84e44" : needsTip ? "1px solid #e0605066" : "1px solid transparent",
        background: isFinished ? "#1a2d4888" : needsTip ? "#1a2d48" : S.card.background,
        opacity: isTbd ? 0.5 : isFinished ? 0.65 : 1,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: "#4a6585" }}>{m.d}</span>
            {m.label && <span style={{ fontSize: 9, color: "#7a93b0", fontWeight: 600 }}>{m.label}</span>}
            {lk && <span style={{ ...S.pill, background: "#dc262622", color: "#dc2626" }}>🔒</span>}
            {needsTip && <span style={{ ...S.pill, background: "#e0605033", color: "#e06050" }}>Tipp fehlt!</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {m.r && <span style={{ ...S.pill, background: "#1a3050", color: "#fff" }}>Erg: {m.r[0]}:{m.r[1]}</span>}
            {!m.r && !lk && (
              <button onClick={() => toggleJoker(m.id)} disabled={!jk && jokersUsed >= MAX_JOKERS}
                style={{ ...S.pill, background: jk ? "#c8a84e" : "#1a2d48", color: jk ? "#0b1525" : "#6688aa", border: "none", cursor: "pointer", opacity: (!jk && jokersUsed >= MAX_JOKERS) ? 0.35 : 1 }}>
                🃏{jk ? " ✓" : ""}
              </button>
            )}
            {jk && lk && <span style={{ ...S.pill, background: "#c8a84e33", color: "#c8a84e" }}>🃏x2</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{homeInfo.name}</span>
            <span style={{ fontSize: 17 }}>{homeInfo.flag}</span>
          </div>
          <input type="number" min="0" max="99" value={tip.h != null ? tip.h : ""} onChange={e => setTip(m.id, "h", e.target.value)} disabled={lk || isTbd} style={lk || isTbd ? S.inputLocked : S.input} />
          <span style={{ color: "#3a5070", fontWeight: 800, fontSize: 12 }}>:</span>
          <input type="number" min="0" max="99" value={tip.a != null ? tip.a : ""} onChange={e => setTip(m.id, "a", e.target.value)} disabled={lk || isTbd} style={lk || isTbd ? S.inputLocked : S.input} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 17 }}>{awayInfo.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{awayInfo.name}</span>
          </div>
        </div>
        {label && (
          <div style={{ marginTop: 4, textAlign: "center" }}>
            <span style={{ ...S.pill, color: label.color, background: label.color + "18" }}>
              {label.text} +{p} Pkt{jk ? " (🃏x2)" : ""}
            </span>
          </div>
        )}
        {data.players.length > 1 && m.r && (
          <div style={{ textAlign: "center", marginTop: 3 }}>
            <button onClick={() => setCmpId(cmpId === m.id ? null : m.id)}
              style={{ fontSize: 9, color: "#5577aa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              {cmpId === m.id ? "Ausblenden" : "Tipps vergleichen"}
            </button>
          </div>
        )}
        {cmpId === m.id && (
          <div style={{ marginTop: 5, padding: "5px 7px", background: "#0f1c30", borderRadius: 6 }}>
            {data.players.map(pl => {
              const t2 = (pl.tips || {})[m.id];
              const hasTip = t2 && t2.h != null && t2.a != null;
              let pp = hasTip && m.r ? pts(t2.h, t2.a, m.r[0], m.r[1]) : null;
              const rawPp = pp;
              if (pp != null && (pl.jokers || {})[m.id]) pp = pp * 2;
              return (
                <div key={pl.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0", borderBottom: "1px solid #152238" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 8, background: pl.color, fontSize: 8, fontWeight: 800, color: "#0b1525", display: "flex", alignItems: "center", justifyContent: "center" }}>{pl.name[0]}</div>
                  <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{pl.name}</span>
                  {hasTip
                    ? <span style={{ fontSize: 11, fontWeight: 800, color: "#c8a84e" }}>{t2.h}:{t2.a}</span>
                    : <span style={{ fontSize: 10, color: "#3a5070" }}>-:-</span>
                  }
                  {pp != null && <span style={{ ...S.pill, color: ptsLabel(rawPp).color, background: ptsLabel(rawPp).color + "18" }}>+{pp}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: "#142236", minHeight: "100vh", color: "#ddd8cc", maxWidth: wide ? 960 : 520, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1a3352,#132035)", padding: wide ? "18px 24px 12px" : "14px 12px 8px", borderBottom: "2px solid #c8a84e", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 4px 20px #00000066" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: wide ? 18 : 14, fontWeight: 800, color: "#c8a84e", letterSpacing: 0.5, lineHeight: 1.3 }}>FIFA Fußballweltmeisterschaft</div>
            <div style={{ display: "flex", alignItems: "center", gap: wide ? 8 : 6, marginTop: 2 }}>
              <span style={{ fontSize: wide ? 28 : 22, fontWeight: 900, color: "#fff" }}>2026</span>
              <span style={{ fontSize: wide ? 22 : 18 }}>🇺🇸</span>
              <span style={{ fontSize: wide ? 22 : 18 }}>🇨🇦</span>
              <span style={{ fontSize: wide ? 22 : 18 }}>🇲🇽</span>
              <span style={{ fontSize: wide ? 16 : 13, color: "#7a93b0", fontWeight: 600 }}>Tippspiel</span>
              {connected && <span style={{ fontSize: 9, color: "#16a34a", marginLeft: 4 }}>● Live</span>}
              {!connected && <span style={{ fontSize: 9, color: "#d97706", marginLeft: 4 }}>● Offline</span>}
            </div>
            {lastUpdate && (
              <div style={{ fontSize: 8, color: "#4a6585" }}>
                Ergebnisse: {lastUpdate.toLocaleDateString("de-DE")}
                <button onClick={async () => {
                  var fresh = await fetchLiveResults();
                  if (fresh && Object.keys(fresh).length > 0) {
                    Object.entries(fresh).forEach(function(e) { var m = MATCHES.find(function(x) { return x.id === e[0]; }); if (m && e[1]) m.r = e[1]; });
                    setLiveResults(fresh); var now = new Date(); setLastUpdate(now);
                    try { localStorage.setItem(STORE_RESULTS, JSON.stringify({ results: fresh, ts: now.toISOString() })); } catch (ex) {}
                  }
                }} style={{ marginLeft: 6, fontSize: 8, color: "#50b8e0", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Aktualisieren
                </button>
              </div>
            )}
          </div>
          {act && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: act.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#0b1525" }}>{act.name[0]}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#8899aa" }}>{act.name}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#c8a84e" }}>{playerStats(act).tot} Pkt</div>
              </div>
            </div>
          )}
        </div>

        {data.players.length > 1 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 6, overflowX: "auto", paddingBottom: 2 }}>
            {data.players.map(p => {
              const miss = missingTips(p);
              return (
                <button key={p.id} onClick={() => save({ ...data, aid: p.id })} style={{
                  padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", position: "relative",
                  border: data.aid === p.id ? "2px solid " + p.color : "2px solid transparent",
                  background: data.aid === p.id ? p.color + "22" : "#1a2d48",
                  color: data.aid === p.id ? p.color : "#556677",
                }}>
                  {p.name}
                  {miss > 0 && (
                    <span style={{ position: "absolute", top: -5, right: -5, background: "#e06050", color: "#fff", fontSize: 8, fontWeight: 800, borderRadius: 6, padding: "1px 4px", minWidth: 14, textAlign: "center" }}>{miss}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1px solid #253550" }}>
          {[["tippen", "⚽ Tippen"], ["ranking", "🏆 Ranking"], ["stats", "📊 Stats"], ["turnier", "🎯 Turnier"], ["spieler", "👥 Spieler"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={tabBtn(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: wide ? "0 24px 80px" : "0 10px 80px" }}>

        {/* ═══ TIPPEN ═══ */}
        {tab === "tippen" && act && (
          <div>
            {/* Phase selector: Groups */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4, margin: "10px 0 4px" }}>
              {GROUPS.map(g => {
                const gms = MATCHES.filter(m => m.g === g.name);
                const done = gms.filter(m => { const t = (act.tips || {})[m.id]; return t && t.h != null && t.a != null; }).length;
                const total = gms.length;
                const allDone = done === total;
                const hasMissing = done < total;
                return (
                  <button key={g.name} onClick={() => setGrp(g.name)} style={{
                    padding: "6px 0", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", position: "relative",
                    background: grp === g.name ? "#c8a84e" : "#1a2d48", color: grp === g.name ? "#0b1525" : "#6688aa",
                  }}>
                    {g.name}
                    {allDone && <span style={{ position: "absolute", top: -4, right: -2, fontSize: 8, color: "#16a34a" }}>✓</span>}
                    {hasMissing && !allDone && <span style={{ position: "absolute", top: -5, right: -4, background: "#e06050", color: "#fff", fontSize: 7, borderRadius: 4, padding: "0 3px", fontWeight: 800 }}>{total - done}</span>}
                  </button>
                );
              })}
            </div>
            {/* Phase selector: Knockout */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, marginBottom: 10 }}>
              {[
                { key: "R32", label: "32er" },
                { key: "R16", label: "AF" },
                { key: "QF", label: "VF" },
                { key: "SF", label: "HF" },
                { key: "FIN", label: "Finale" },
              ].map(ph => {
                const phMatches = MATCHES.filter(m => m.g === ph.key);
                const tippable = phMatches.filter(m => m.h && m.a && TEAMS[m.h] && TEAMS[m.a]);
                const tipped = tippable.filter(m => { const t = (act.tips || {})[m.id]; return t && t.h != null && t.a != null; }).length;
                const miss = tippable.length - tipped;
                return (
                  <button key={ph.key} onClick={() => setGrp(ph.key)} style={{
                    padding: "5px 0", borderRadius: 6, fontSize: wide ? 11 : 10, fontWeight: 700, border: "none", cursor: "pointer", position: "relative",
                    background: grp === ph.key ? "#c8a84e" : "#1a2d48", color: grp === ph.key ? "#0b1525" : "#6688aa",
                  }}>
                    {ph.label}
                    {miss > 0 && <span style={{ position: "absolute", top: -5, right: -4, background: "#e06050", color: "#fff", fontSize: 7, borderRadius: 4, padding: "0 3px", fontWeight: 800 }}>{miss}</span>}
                    {tippable.length > 0 && miss === 0 && <span style={{ position: "absolute", top: -4, right: -2, fontSize: 8, color: "#16a34a" }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Group Table - only for group phases */}
            {GROUP_IDS.includes(grp) && (
            <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? 20 : 0, alignItems: "start" }}>
              <div>
                <div style={{ ...S.card, padding: wide ? 14 : 8 }}>
                  <div style={{ fontSize: wide ? 13 : 10, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>GRUPPE {grp}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "22px 1fr 28px 28px 28px 28px 28px 28px 32px", fontSize: wide ? 10 : 8, color: "#4a6585", fontWeight: 700, paddingBottom: 4, borderBottom: "1px solid #253550" }}>
                    <span></span><span>Team</span>
                    <span style={{ textAlign: "center" }}>Sp</span><span style={{ textAlign: "center" }}>S</span>
                    <span style={{ textAlign: "center" }}>U</span><span style={{ textAlign: "center" }}>N</span>
                    <span style={{ textAlign: "center" }}>T+</span><span style={{ textAlign: "center" }}>T-</span>
                    <span style={{ textAlign: "center", color: "#c8a84e" }}>Pkt</span>
                  </div>
                  {standings(grp).map((s, i) => (
                    <div key={s.key} style={{ display: "grid", gridTemplateColumns: "22px 1fr 28px 28px 28px 28px 28px 28px 32px", padding: wide ? "7px 0" : "5px 0", borderBottom: "1px solid #1a2d4622", alignItems: "center" }}>
                      <span style={{ fontSize: wide ? 20 : 16 }}>{TEAMS[s.key].f}</span>
                      <span style={{ fontSize: wide ? 14 : 11, fontWeight: 700, color: i < 2 ? "#e8e4dc" : "#8899aa" }}>{TEAMS[s.key].n}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 13 : 11, color: "#6688aa" }}>{s.mp}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 13 : 11, color: "#16a34a" }}>{s.w}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 13 : 11, color: "#d97706" }}>{s.d}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 13 : 11, color: "#dc2626" }}>{s.l}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 13 : 11, color: "#8899aa" }}>{s.gf}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 13 : 11, color: "#8899aa" }}>{s.ga}</span>
                      <span style={{ textAlign: "center", fontSize: wide ? 16 : 13, fontWeight: 800, color: "#c8a84e" }}>{s.p}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: wide ? 12 : 10, color: "#6688aa", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>🃏 Joker: {jokersUsed}/{MAX_JOKERS}</span><span>= doppelte Punkte</span>
                </div>
              </div>
              <div>
                {groupMatches.map(renderMatch)}
              </div>
            </div>
            )}

            {/* KO Rounds */}
            {!GROUP_IDS.includes(grp) && (
              <div>
                <div style={{ ...S.card, padding: wide ? 14 : 10, textAlign: "center" }}>
                  <div style={{ fontSize: wide ? 16 : 13, fontWeight: 800, color: "#c8a84e", marginBottom: 4 }}>
                    {grp === "R32" ? "Runde der letzten 32" : grp === "R16" ? "Achtelfinale" : grp === "QF" ? "Viertelfinale" : grp === "SF" ? "Halbfinale" : "Finale"}
                  </div>
                  <div style={{ fontSize: 10, color: "#6688aa" }}>
                    {MATCHES.filter(m => m.g === grp && m.h && m.a && TEAMS[m.h]).length === 0
                      ? "Teams werden nach der Gruppenphase eingetragen"
                      : "Tipps abgeben, solange Spiele nicht gesperrt sind"
                    }
                  </div>
                </div>
                <div style={{ fontSize: wide ? 12 : 10, color: "#6688aa", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>🃏 Joker: {jokersUsed}/{MAX_JOKERS}</span><span>= doppelte Punkte</span>
                </div>
                {MATCHES.filter(m => m.g === grp).map(renderMatch)}
              </div>
            )}
          </div>
        )}
        {tab === "tippen" && !act && (
          <div style={{ ...S.card, textAlign: "center", marginTop: 14, color: "#6688aa" }}>
            Wähle einen Spieler oben aus.
          </div>
        )}

        {/* ═══ RANKING ═══ */}
        {tab === "ranking" && (
          <div>
            <div style={{ marginTop: 12, marginBottom: 6, fontSize: wide ? 14 : 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1 }}>RANGLISTE</div>
            <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? 10 : 0 }}>
            {ranks.map((p, i) => (
              <div key={p.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 8, border: i === 0 && p.tot > 0 ? "1px solid #c8a84e44" : "1px solid transparent" }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: i === 0 ? "#c8a84e" : i === 1 ? "#aab8cc" : i === 2 ? "#b87333" : "#556677", minWidth: 22, textAlign: "center" }}>{i + 1}.</div>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#0b1525" }}>{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "#6688aa" }}>{p.ev} Spiele - {p.ex}x exakt</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#c8a84e" }}>{p.tot}</div>
                  {i > 0 && ranks[0].tot - p.tot > 0 && <div style={{ fontSize: 9, color: "#dc2626" }}>-{ranks[0].tot - p.tot}</div>}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* ═══ STATS ═══ */}
        {tab === "stats" && (
          <div>
            <div style={{ marginTop: 12, fontSize: wide ? 14 : 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>STATISTIKEN</div>
            <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? 10 : 0 }}>
            {ranks.map(p => {
              const avg = p.ev > 0 ? (p.tot / p.ev).toFixed(1) : "-";
              const rate = p.ev > 0 ? Math.round(((p.ex + p.di + p.te) / p.ev) * 100) + "%" : "-";
              const tipped = Object.values(p.tips || {}).filter(t => t.h != null && t.a != null).length;
              return (
                <div key={p.id} style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: p.color, fontSize: 10, fontWeight: 800, color: "#0b1525", display: "flex", alignItems: "center", justifyContent: "center" }}>{p.name[0]}</div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
                    {[
                      { l: "Punkte", v: p.tot, c: "#c8a84e" },
                      { l: "Exakt", v: p.ex, c: "#16a34a" },
                      { l: "Tipps", v: tipped + "/" + MATCHES.length, c: "#8899aa" },
                      { l: "Trefferq.", v: rate, c: "#50b8e0" },
                    ].map(x => (
                      <div key={x.l} style={{ background: "#0f1c30", borderRadius: 5, padding: "5px 3px", textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: x.c }}>{x.v}</div>
                        <div style={{ fontSize: 7, color: "#556677" }}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>

            <div style={{ marginTop: 14, fontSize: wide ? 14 : 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>BESTER DES TAGES</div>
            {MATCH_DAYS.filter(dl => bestPerDay[dl]).map(dl => {
              const b = bestPerDay[dl];
              return (
                <div key={dl} style={{ ...S.card, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#4a6585", minWidth: 38 }}>{dl.slice(8)}.{dl.slice(5, 7)}.</span>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: b.color, fontSize: 8, fontWeight: 800, color: "#0b1525", display: "flex", alignItems: "center", justifyContent: "center" }}>{b.name[0]}</div>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{b.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#c8a84e" }}>{b.pts} Pkt ⭐</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ TURNIER ═══ */}
        {tab === "turnier" && act && (
          <div>
            <div style={{ marginTop: 12, fontSize: 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TURNIERTIPPS - {act.name}</div>
            {[
              { key: "champion", icon: "🏆", label: "Weltmeister (+" + BONUS.champion + ")", type: "team" },
              { key: "boot", icon: "👟", label: "Torschützenkönig (+" + BONUS.boot + ")", type: "text" },
              { key: "best", icon: "⭐", label: "Bestes Gruppenteam (+" + BONUS.group + ")", type: "team" },
            ].map(x => (
              <div key={x.key} style={S.card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{x.icon} {x.label}</div>
                {x.type === "team" ? (
                  <select value={(act.tt || {})[x.key] || ""} onChange={e => setTT(x.key, e.target.value)}
                    style={{ width: "100%", padding: "7px 8px", background: "#0f1c30", color: "#c8a84e", border: "1px solid #253550", borderRadius: 6, fontSize: 12 }}>
                    <option value="">Auswählen</option>
                    {TEAM_KEYS.map(k => (
                      <option key={k} value={k}>{TEAMS[k].f} {TEAMS[k].n}</option>
                    ))}
                  </select>
                ) : (
                  <input value={(act.tt || {})[x.key] || ""} onChange={e => setTT(x.key, e.target.value)} placeholder="Spielername..."
                    style={{ width: "100%", padding: "7px 8px", background: "#0f1c30", color: "#c8a84e", border: "1px solid #253550", borderRadius: 6, fontSize: 12, boxSizing: "border-box" }} />
                )}
              </div>
            ))}

            {data.players.length > 1 && (
              <div>
                <div style={{ marginTop: 14, fontSize: 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>ALLE TURNIERTIPPS</div>
                <div style={S.card}>
                  {data.players.map(p => (
                    <div key={p.id} style={{ padding: "6px 0", borderBottom: "1px solid #1a2d46" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 7, background: p.color, fontSize: 7, fontWeight: 800, color: "#0b1525", display: "flex", alignItems: "center", justifyContent: "center" }}>{p.name[0]}</div>
                        <span style={{ fontWeight: 700, fontSize: 11 }}>{p.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, fontSize: 10, color: "#8899aa" }}>
                        <span>🏆 {(p.tt || {}).champion && TEAMS[(p.tt || {}).champion] ? TEAMS[(p.tt || {}).champion].n : "-"}</span>
                        <span>👟 {(p.tt || {}).boot || "-"}</span>
                        <span>⭐ {(p.tt || {}).best && TEAMS[(p.tt || {}).best] ? TEAMS[(p.tt || {}).best].n : "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SPIELER ═══ */}
        {tab === "spieler" && (
          <div>
            <div style={{ marginTop: 12, fontSize: 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SPIELER</div>

            {!showAdd && (
              <button onClick={() => setShowAdd(true)}
                style={{ ...S.card, width: "100%", textAlign: "center", cursor: "pointer", border: "1px dashed #253550", color: "#6688aa", fontSize: 12, fontWeight: 700, background: "transparent" }}>
                + Spieler hinzufügen
              </button>
            )}
            {showAdd && (
              <div style={{ ...S.card, display: "flex", gap: 6 }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name..." maxLength={20}
                  onKeyDown={e => { if (e.key === "Enter") addPlayer(); }}
                  style={{ flex: 1, padding: "7px 8px", background: "#0f1c30", color: "#c8a84e", border: "1px solid #253550", borderRadius: 6, fontSize: 12, outline: "none" }} />
                <button onClick={addPlayer} style={{ padding: "7px 12px", background: "#c8a84e", color: "#0b1525", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>OK</button>
                <button onClick={() => { setShowAdd(false); setNewName(""); }} style={{ padding: "7px 8px", background: "#2a4060", color: "#8899aa", border: "none", borderRadius: 6, cursor: "pointer" }}>X</button>
              </div>
            )}

            {data.players.map(p => {
              const s = playerStats(p);
              const tipped = Object.values(p.tips || {}).filter(t => t.h != null && t.a != null).length;
              return (
                <div key={p.id} style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 15, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#0b1525" }}>{p.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 9, color: "#6688aa" }}>{tipped}/{MATCHES.length} getippt - {s.tot} Pkt</div>
                    </div>
                    {delId === p.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => removePlayer(p.id)} style={{ padding: "4px 8px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Ja</button>
                        <button onClick={() => setDelId(null)} style={{ padding: "4px 8px", background: "#2a4060", color: "#8899aa", border: "none", borderRadius: 4, fontSize: 10, cursor: "pointer" }}>Nein</button>
                      </div>
                    ) : (
                      <button onClick={() => setDelId(p.id)} style={{ padding: "5px 8px", background: "#dc262622", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>X</button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Sync Status */}
            <div style={{ marginTop: 20, fontSize: 11, color: "#c8a84e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SYNCHRONISIERUNG</div>
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: connected ? "#16a34a" : "#d97706" }}></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: connected ? "#16a34a" : "#d97706" }}>{connected ? "Live verbunden" : "Offline"}</span>
              </div>
              <div style={{ fontSize: 11, color: "#8899aa", lineHeight: 1.6 }}>
                {connected
                  ? "Alle Tipps werden automatisch in Echtzeit synchronisiert. Wenn ein Mitspieler tippt, siehst du es sofort."
                  : "Keine Verbindung zu Firebase. Tipps werden lokal gespeichert und beim nächsten Verbindungsaufbau synchronisiert."
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
