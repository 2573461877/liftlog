export const VERSION = 2;
export const ENERGY_METHOD = 'compendium-2024-v1';
export const INTENSITIES = [{met:3.5, code:'02054', label:'常规力量 · 多动作、8–15 次'}, {met:6, code:'02050', label:'高强度力量 · 高强度举铁'}];
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const clone = value => JSON.parse(JSON.stringify(value));
export const localDate = (value = Date.now()) => { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const num = (value, min, max) => { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min; };
const exercise = (name, sets = 3, reps = 10) => ({ id: uid(), name, sets, reps, weight: 0 });
export function initialState() {
  return {
    version: VERSION, updatedAt: Date.now(), active: null, history: [],
    settings: { restSeconds: 90, weeklyGoal: 4, sound: true, autoRest: true, keepAwake: false, lastBackupAt: null, profile: null },
    templates: [
      { id: uid(), name: '胸部训练', group: '胸', note: '推的力量，从扎实的每一组开始', exercises: [exercise('杠铃卧推', 4, 8), exercise('上斜哑铃卧推', 3, 10), exercise('绳索夹胸', 3, 12), exercise('绳索下压', 3, 12)] },
      { id: uid(), name: '背部训练', group: '背', note: '控制离心，感受背部发力', exercises: [exercise('高位下拉', 4, 10), exercise('坐姿划船', 3, 10), exercise('单臂哑铃划船', 3, 10), exercise('哑铃弯举', 3, 12)] },
      { id: uid(), name: '腿部训练', group: '腿', note: '稳住动作，让进步有迹可循', exercises: [exercise('杠铃深蹲', 4, 8), exercise('罗马尼亚硬拉', 3, 10), exercise('腿举', 3, 12), exercise('坐姿腿弯举', 3, 12)] },
      { id: uid(), name: '肩部训练', group: '肩', note: '专注动作质量，不急于加重量', exercises: [exercise('哑铃推举', 4, 8), exercise('哑铃侧平举', 3, 12), exercise('反向飞鸟', 3, 12), exercise('绳索面拉', 3, 12)] }
    ]
  };
}
export function totals(session) {
  const sets = session?.exercises?.flatMap(e => e.sets).filter(s => s.done) || [];
  return { sets: sets.length, reps: sets.reduce((n, s) => n + s.reps, 0), volume: sets.reduce((n, s) => n + s.weight * s.reps, 0) };
}
export function lastExercise(history, name) {
  for (const h of [...history].sort((a, b) => b.finishedAt - a.finishedAt)) {
    const e = h.exercises.find(e => e.name === name && e.sets.some(s => s.done));
    if (e) return e;
  }
  return null;
}
export function createSession(template, history = [], now = Date.now(), profile = null) {
  return { id: uid(), templateId: template.id, name: template.name, group: template.group, startedAt: now, finishedAt: null, note: '', rest: null,
    pausedMs: 0, pausedAt: null, energyProfile: profile ? {...clone(profile), method: ENERGY_METHOD} : null,
    exercises: template.exercises.map(e => { const prev = lastExercise(history, e.name); const done = prev?.sets.filter(s => s.done) || [];
      return { id: uid(), name: e.name, sets: Array.from({ length: e.sets }, (_, i) => ({ id: uid(), weight: done[i]?.weight ?? e.weight, reps: done[i]?.reps ?? e.reps, done: false })) };
    })
  };
}
export function finishSession(active, now = Date.now()) {
  if (!active || !totals(active).sets) throw new Error('请至少完成一组再保存训练');
  const finishedAt = Math.max(now, active.startedAt);
  return { ...clone(active), finishedAt, rest: null, pausedAt: null, pausedMs: finishedAt - active.startedAt - sessionMilliseconds(active, finishedAt) };
}
export function sessionMilliseconds(session, now = Date.now()) {
  const end = session.finishedAt ?? now;
  return Math.max(0, (session.pausedAt == null ? end : Math.min(end, session.pausedAt)) - session.startedAt - (session.pausedMs || 0));
}
export function togglePause(session, now = Date.now()) {
  if (session.finishedAt) return;
  if (session.pausedAt == null) session.pausedAt = Math.max(session.startedAt, now);
  else {
    const gap = Math.max(0, now - session.pausedAt);
    session.pausedMs = (session.pausedMs || 0) + gap;
    if (session.rest) session.rest.endAt += gap;
    session.pausedAt = null;
  }
}
export function progress(session) {
  const total = session?.exercises.reduce((n,e) => n + e.sets.length, 0) || 0;
  const done = totals(session).sets;
  return {done, total, percent: total ? (done === total ? 100 : Math.min(99, Math.round(done / total * 100))) : 0};
}
export function estimateEnergy(session, now = Date.now()) {
  const p = session?.energyProfile;
  if (!p || p.method !== ENERGY_METHOD || p.age < 19 || p.age > 59 || !Number.isFinite(p.weightKg) || p.weightKg <= 0 || !INTENSITIES.some(i => i.met === p.met)) return null;
  const hours = sessionMilliseconds(session, now) / 3600000;
  // Standard MET convention: 1 MET ≈ 1 kcal/kg/hour. Net excludes 1 MET of rest.
  return {active:Math.round((p.met - 1) * p.weightKg * hours), total:Math.round(p.met * p.weightKg * hours), minutes:hours * 60};
}
export function weekDays(now = Date.now()) {
  const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => { const day = new Date(d); day.setDate(day.getDate() + i); return localDate(day); });
}
export function weeklyStats(history, now = Date.now()) {
  const days = weekDays(now); const sessions = history.filter(s => days.includes(localDate(s.startedAt)));
  return { days, sessions, sets: sessions.reduce((n, s) => n + totals(s).sets, 0), volume: sessions.reduce((n, s) => n + totals(s).volume, 0), minutes: Math.round(sessions.reduce((n, s) => n + sessionMilliseconds(s), 0) / 60000) };
}
export function restRemaining(rest, now = Date.now()) { return rest ? Math.max(0, Math.ceil((rest.endAt - now) / 1000)) : 0; }
export function parseBackup(value) {
  const source = typeof value === 'string' ? JSON.parse(value) : value;
  const data = source?.app === 'LiftLog' ? source.data : source;
  if (!data || ![1, VERSION].includes(data.version) || !Array.isArray(data.templates) || !Array.isArray(data.history)) throw new Error('不是受支持的练记备份文件');
  const text = (v, n = 120) => { if (typeof v !== 'string' || v.length > n) throw new Error('备份文本字段无效'); return v; };
  const number = (v, min, max, integer = false) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || (integer && !Number.isInteger(v))) throw new Error('备份数值字段无效'); return v; };
  const list = (v, max) => { if (!Array.isArray(v) || v.length > max) throw new Error('备份列表无效或过大'); return v; };
  const bool = v => { if (typeof v !== 'boolean') throw new Error('备份状态字段无效'); return v; };
  const profile = (p, snapshot = false) => {
    if (p == null) return null;
    if (!INTENSITIES.some(i => i.met === p.met) || (snapshot && p.method !== ENERGY_METHOD)) throw new Error('备份能耗计算参数无效');
    return {age:number(p.age, 1, 120, true), weightKg:number(p.weightKg, 20, 350), met:p.met, ...(snapshot ? {method:ENERGY_METHOD} : {})};
  };
  const ids = new Set();
  const id = v => { const s = text(v, 100); if (!s || ids.has(s)) throw new Error('备份包含重复或空的记录标识'); ids.add(s); return s; };
  const templates = list(data.templates, 100).map(t => ({ id: id(t.id), name: text(t.name), group: text(t.group, 20), note: text(t.note || '', 500),
    exercises: list(t.exercises, 50).map(e => ({ id: id(e.id), name: text(e.name), sets: number(e.sets, 1, 30, true), reps: number(e.reps, 1, 999, true), weight: number(e.weight, 0, 2000) })) }));
  const session = (s, active = false) => {
    const startedAt = number(s.startedAt, 1, 8640000000000000); const finishedAt = active ? null : number(s.finishedAt, startedAt, 8640000000000000);
    const pausedMs = number(s.pausedMs ?? 0, 0, (finishedAt ?? 8640000000000000) - startedAt);
    const pausedAt = active && s.pausedAt != null ? number(s.pausedAt, startedAt + pausedMs, 8640000000000000) : null;
    const result = { id: id(s.id), templateId: text(s.templateId || '', 100), name: text(s.name), group: text(s.group, 20), startedAt, finishedAt, note: text(s.note || '', 2000), rest: null,
      pausedMs, pausedAt, energyProfile:profile(s.energyProfile, true),
      exercises: list(s.exercises, 50).map(e => ({ id: id(e.id), name: text(e.name), sets: list(e.sets, 50).map(s => ({ id: id(s.id), weight: number(s.weight, 0, 2000), reps: number(s.reps, 1, 999, true), done: bool(s.done) })) })) };
    if (!active && !totals(result).sets) throw new Error('历史记录没有已完成组');
    return result;
  };
  const settings = data.settings || {};
  return { version: VERSION, updatedAt: Date.now(), templates, history: list(data.history, 10000).map(s => session(s)), active: data.active ? session(data.active, true) : null,
    settings: { restSeconds: number(settings.restSeconds ?? 90, 15, 600, true), weeklyGoal: number(settings.weeklyGoal ?? 4, 1, 7, true), sound: bool(settings.sound ?? true), autoRest: bool(settings.autoRest ?? true), keepAwake: bool(settings.keepAwake ?? false), lastBackupAt: settings.lastBackupAt ? number(settings.lastBackupAt, 1, 8640000000000000) : null, profile:profile(settings.profile) } };
}
export function backupJSON(state) { return JSON.stringify({ app: 'LiftLog', version: VERSION, exportedAt: new Date().toISOString(), data: state }, null, 2); }
export function historyCSV(history) {
  const cell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
  const rows = [['日期', '训练', '动作', '组序号', '重量(kg)', '次数', '容量(kg)', '备注']];
  [...history].sort((a, b) => b.startedAt - a.startedAt).forEach(h => h.exercises.forEach(e => e.sets.forEach((s, i) => { if (s.done) rows.push([localDate(h.startedAt), h.name, e.name, i + 1, s.weight, s.reps, s.weight * s.reps, h.note]); })));
  return '\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n');
}
