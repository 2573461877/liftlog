export const VERSION = 4;
export const LOAD_MODES = {weight:'负重', bodyweight:'自重', assisted:'辅助重量'};
export const SET_KINDS = {normal:'普通组', ascending:'递增组', descending:'递减组', custom:'自定义子组'};
export const ENERGY_METHOD = 'compendium-2024-v1';
export const INTENSITIES = [{met:3.5, code:'02054', label:'常规力量 · 多动作、8–15 次'}, {met:6, code:'02050', label:'高强度力量 · 高强度举铁'}];
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const clone = value => JSON.parse(JSON.stringify(value));
export const localDate = (value = Date.now()) => { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const num = (value, min, max) => { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min; };
const exercise = (name, sets = 4, reps = 10) => ({ id: uid(), name, sets, reps, weight: 0 });
export function initialState() {
  return {
    version: VERSION, updatedAt: Date.now(), active: null, history: [],
    settings: { restSeconds: 90, weeklyGoal: 4, sound: true, autoRest: true, keepAwake: false, lastBackupAt: null, profile: null, defaultSetsUpdated: true },
    templates: [
      { id: uid(), name: '胸部训练', group: '胸', note: '推的力量，从扎实的每一组开始', exercises: [exercise('杠铃卧推', 4, 8), exercise('上斜哑铃卧推', 4, 10), exercise('绳索夹胸', 4, 12), exercise('绳索下压', 4, 12)] },
      { id: uid(), name: '背部训练', group: '背', note: '控制离心，感受背部发力', exercises: [exercise('高位下拉', 4, 10), exercise('坐姿划船', 4, 10), exercise('单臂哑铃划船', 4, 10), exercise('哑铃弯举', 4, 12)] },
      { id: uid(), name: '腿部训练', group: '腿', note: '稳住动作，让进步有迹可循', exercises: [exercise('杠铃深蹲', 4, 8), exercise('罗马尼亚硬拉', 4, 10), exercise('腿举', 4, 12), exercise('坐姿腿弯举', 4, 12)] },
      { id: uid(), name: '肩部训练', group: '肩', note: '专注动作质量，不急于加重量', exercises: [exercise('哑铃推举', 4, 8), exercise('哑铃侧平举', 4, 12), exercise('反向飞鸟', 4, 12), exercise('绳索面拉', 4, 12)] }
    ]
  };
}
// Upgrade recognizable built-in plans once; never reset later edits or sessions.
export function upgradeDefaultSets(state) {
  if(state.settings.defaultSetsUpdated)return false;
  const presets=initialState().templates;
  for(const plan of state.templates){
    const preset=presets.find(p=>p.name===plan.name&&p.group===plan.group);
    if(!preset||plan.exercises.length!==preset.exercises.length||!preset.exercises.every(e=>plan.exercises.filter(p=>p.name===e.name).length===1))continue;
    for(const e of plan.exercises){
      if(e.setPlan){
        const last=e.setPlan.at(-1)||{weight:e.weight,reps:e.reps};
        e.setPlan=Array.from({length:4},(_,i)=>clone(e.setPlan[i]||last));
      }
      e.sets=4;
    }
  }
  state.settings.defaultSetsUpdated=true;
  return true;
}
export function totals(session) {
  const exercises=session?.exercises || [];
  const sets=exercises.flatMap(e=>e.sets).filter(setComplete);
  const reps=exercises.reduce((n,e)=>n+e.sets.flatMap(completedParts).reduce((r,s)=>r+s.reps,0),0);
  // Assistance is not lifted load, and body mass is deliberately not estimated.
  const volume=exercises.reduce((n,e)=>n+e.sets.filter(s=>setMode(s,e.mode)==='weight').flatMap(completedParts).reduce((v,s)=>v+s.weight*s.reps,0),0);
  return {sets:sets.length,reps,volume};
}
export const partsOf = s => s.segments?.length ? s.segments : [s];
export const completedParts = s => partsOf(s).filter(p=>p.done);
export const setComplete = s => partsOf(s).every(p=>p.done);
export const hasCompleted = e => e.sets.some(s=>completedParts(s).length);
export const setMode = (s, fallback='weight') => s.mode || fallback || 'weight';
export const exerciseModes = e => [...new Set((e.sets instanceof Array?e.sets:e.setPlan||[{}]).map(s=>setMode(s,e.mode)))];
export function freshSet(s={weight:0,reps:10}, mode='weight') {
  mode=setMode(s,mode);
  return {id:uid(),...(s.mode?{mode:s.mode}:{}),weight:mode==='bodyweight'?0:s.weight,reps:s.reps,done:false,
    ...(s.kind && s.kind!=='normal'?{kind:s.kind,segments:partsOf(s).map(p=>({weight:mode==='bodyweight'?0:p.weight,reps:p.reps,done:false}))}:{})};
}
export function completedExercise(e) {
  const sets=e.sets.filter(s=>completedParts(s).length).map(s=>{
    const parts=completedParts(s), first=parts[0];
    return {...s,weight:first.weight,reps:first.reps,done:true,...(s.segments?{segments:parts.map(p=>({...p,done:true}))}:{})};
  });
  return {...e,sets};
}
export function lastExercise(history, name) {
  for (const h of [...history].sort((a, b) => b.finishedAt - a.finishedAt)) {
    const e = h.exercises.find(e => e.name.trim() === name.trim() && hasCompleted(e));
    if (e) return e;
  }
  return null;
}
// Latest exact-name record, including completed work in the ongoing session.
export function recentExercise(history, name, active=null) {
  const current=active?.exercises.find(e=>e.name.trim()===name.trim()&&hasCompleted(e));
  const found=current||lastExercise(history,name);
  return found?completedExercise(found):null;
}
export function exerciseDraft(name='', history=[], active=null, mode='weight') {
  const prev=recentExercise(history,name,active);
  const actualMode=prev?(prev.mode||'weight'):mode;
  return {id:uid(),name,mode:actualMode,sets:prev?prev.sets.map(s=>freshSet(s,actualMode)):Array.from({length:4},()=>freshSet({weight:0,reps:10},actualMode))};
}
export function templateExercise(e) {
  const sets=e.sets.map(s=>freshSet(s,e.mode||'weight'));
  return {id:uid(),name:e.name,mode:e.mode||'weight',sets:sets.length,reps:sets[0]?.reps||10,weight:sets[0]?.weight||0,setPlan:sets.map(({id,done,...s})=>s)};
}
export function sessionToTemplate(session) {
  const exercises=session.exercises.filter(hasCompleted).map(e=>templateExercise(completedExercise(e)));
  if(!exercises.length)throw new Error('没有已完成的动作可保存为计划');
  return {id:uid(),name:session.name,group:session.group,note:session.note.slice(0,500),exercises};
}
export function generateSegments(kind,base,step,count,reps) {
  return Array.from({length:Math.round(num(count,1,8))},(_,i)=>({weight:Math.round(num(base+(kind==='descending'?-1:1)*step*i,0,2000)*100)/100,reps,done:false}));
}
export function toggleSetKind(set, requested, mode='weight') {
  if(!['ascending','descending'].includes(requested))throw new Error('无效的组类型');
  mode=setMode(set,mode);
  const first=partsOf(set)[0], kind=set.kind===requested?'normal':requested;
  const result={...set,kind,weight:mode==='bodyweight'?0:first.weight,reps:first.reps,done:false};
  if(kind==='normal')delete result.segments;
  else {
    const step=mode==='bodyweight'?0:set.segments?.length>1?Math.abs(set.segments[1].weight-first.weight):5;
    result.segments=generateSegments(kind,result.weight,step,set.segments?.length||3,result.reps);
  }
  return result;
}
// Modes belong to groups; legacy exercise modes remain the fallback.
export function toggleSetMode(set, requested, fallback='weight') {
  if(!['bodyweight','assisted'].includes(requested))throw new Error('无效的重量类型');
  const result=clone(set);result.mode=setMode(set,fallback)===requested?'weight':requested;
  if(result.mode==='bodyweight'){result.weight=0;partsOf(result).forEach(p=>p.weight=0);}
  return result;
}
function syncSetValues(s) {
  if(s.segments){s.weight=s.segments[0].weight;s.reps=s.segments[0].reps;s.done=setComplete(s);}
}
function assignGroupValue(s,field,value,unfinishedOnly=false,baseline=s) {
  const originals=partsOf(baseline).map(p=>p[field]), delta=value-originals[0];
  partsOf(s).forEach((p,i)=>{if(!unfinishedOnly||!p.done)p[field]=field==='weight'?Math.round(num(originals[i]+delta,0,2000)*100)/100:value;});
  syncSetValues(s);
}
export function applyBulkValue(e,field,value,unfinishedOnly=false,baseline=null) {
  if(!['weight','reps'].includes(field))throw new Error('无效的组字段');
  value=field==='reps'?Math.round(num(value,1,999)):num(value,0,2000);
  e.sets.forEach((s,i)=>{if(field!=='weight'||setMode(s,e.mode)!=='bodyweight')assignGroupValue(s,field,value,unfinishedOnly,baseline?.sets[i]||s);});
}
// Update the edited value and only later unfinished work, never another exercise.
// Keep ramp offsets; kilograms do not propagate between load and assistance.
export function updateFollowingSets(e,index,partIndex,field,value,baseline=null) {
  const source=e.sets[index];if(!source||!['weight','reps'].includes(field))return;
  const mode=setMode(source,e.mode);if(field==='weight'&&mode==='bodyweight')return;
  const parts=partsOf(source),at=partIndex??0,target=parts[at];if(!target)return;
  value=field==='reps'?Math.round(num(value,1,999)):num(value,0,2000);
  const originals=partsOf(baseline?.sets[index]||source).map(p=>p[field]), delta=value-originals[at];target[field]=value;
  parts.slice(at+1).forEach((p,j)=>{if(!p.done)p[field]=field==='weight'?Math.round(num(originals[at+j+1]+delta,0,2000)*100)/100:value;});
  syncSetValues(source);
  e.sets.slice(index+1).forEach((s,j)=>{if(field!=='weight'||setMode(s,e.mode)===mode)assignGroupValue(s,field,value,true,baseline?.sets[index+j+1]||s);});
}
export function exerciseTrend(history,name,mode='weight') {
  return [...history].sort((a,b)=>a.finishedAt-b.finishedAt).flatMap(h=>{
    const exercises=h.exercises.filter(e=>e.name.trim()===name.trim());
    const sets=exercises.flatMap(e=>e.sets.filter(s=>setMode(s,e.mode)===mode)).filter(s=>completedParts(s).length);
    if(!sets.length)return [];
    const parts=sets.flatMap(completedParts);
    // One equally weighted contribution per group; complex groups first average their completed subgroups.
    const average=sets.reduce((n,s)=>{const p=completedParts(s);return n+p.reduce((v,x)=>v+x.weight,0)/p.length;},0)/sets.length;
    return [{id:h.id,date:h.finishedAt,name:h.name,average,sets:sets.length,reps:parts.reduce((n,p)=>n+p.reps,0),details:sets,mode}];
  });
}
export function createSession(template, history = [], now = Date.now(), profile = null) {
  return { id: uid(), templateId: template.id, name: template.name, group: template.group, startedAt: now, finishedAt: null, note: '', rest: null,
    pausedMs: 0, pausedAt: null, energyProfile: profile ? {...clone(profile), method: ENERGY_METHOD} : null,
    exercises: template.exercises.map(e => { const prev = lastExercise(history, e.name);
      const recent=prev?completedExercise(prev):null;
      const mode=e.mode||recent?.mode||'weight';
      const setPlan=e.setPlan||Array.from({length:e.sets},()=>({weight:e.weight,reps:e.reps}));
      return { id: uid(), name: e.name, ...(e.mode||recent?.mode?{mode}:{}), sets:setPlan.map((s,i)=>{
        const previous=recent?.sets[i], currentMode=setMode(s,mode);
        return freshSet(previous&&setMode(previous,recent.mode)===currentMode?{...previous,...(s.mode?{mode:s.mode}:{})}:s,currentMode);
      }) };
    })
  };
}
export function finishSession(active, now = Date.now()) {
  if (!active || !active.exercises.some(hasCompleted)) throw new Error('请至少完成一组或一个子组再保存训练');
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
export function energySummary(session, now = Date.now()) {
  const estimate=estimateEnergy(session,now), manual=session?.manualEnergy;
  return {kcal:manual?manual.kcal:(estimate?.active??null),type:manual?.type||'active',manual:Boolean(manual),estimate};
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
  if (!data || ![1, 2, 3, VERSION].includes(data.version) || !Array.isArray(data.templates) || !Array.isArray(data.history)) throw new Error('不是受支持的练记备份文件');
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
  const mode = e => {if(e.mode==null)return {};if(!Object.hasOwn(LOAD_MODES,e.mode))throw new Error('备份重量类型无效');return {mode:e.mode};};
  const set = (s,planned=false) => {
    const base={...(planned?{}:{id:id(s.id)}),weight:number(s.weight,0,2000),reps:number(s.reps,1,999,true),...mode(s),...(planned?{}:{done:bool(s.done)})};
    if(s.kind!=null&&!Object.hasOwn(SET_KINDS,s.kind))throw new Error('备份组类型无效');
    if(s.kind&&s.kind!=='normal') {
      const segments=list(s.segments,8).map(p=>({weight:number(p.weight,0,2000),reps:number(p.reps,1,999,true),done:planned?false:bool(p.done)}));
      if(!segments.length)throw new Error('复合组至少包含一个子组');
      Object.assign(base,{kind:s.kind,segments,weight:segments[0].weight,reps:segments[0].reps,...(planned?{}:{done:segments.every(p=>p.done)})});
    } else if(s.segments!=null)throw new Error('普通组不能包含子组');
    return base;
  };
  const templates = list(data.templates, 100).map(t => ({ id: id(t.id), name: text(t.name), group: text(t.group, 20), note: text(t.note || '', 500),
    exercises: list(t.exercises, 50).map(e => {
      const result={id:id(e.id),name:text(e.name),sets:number(e.sets,1,50,true),reps:number(e.reps,1,999,true),weight:number(e.weight,0,2000),...mode(e)};
      if(e.setPlan!=null){result.setPlan=list(e.setPlan,50).map(s=>set(s,true));if(result.setPlan.length!==e.sets)throw new Error('计划组数与逐组设置不一致');}
      return result;
    }) }));
  const session = (s, active = false) => {
    const startedAt = number(s.startedAt, 1, 8640000000000000); const finishedAt = active ? null : number(s.finishedAt, startedAt, 8640000000000000);
    const pausedMs = number(s.pausedMs ?? 0, 0, (finishedAt ?? 8640000000000000) - startedAt);
    const pausedAt = active && s.pausedAt != null ? number(s.pausedAt, startedAt + pausedMs, 8640000000000000) : null;
    const result = { id: id(s.id), templateId: text(s.templateId || '', 100), name: text(s.name), group: text(s.group, 20), startedAt, finishedAt, note: text(s.note || '', 2000), rest: null,
      pausedMs, pausedAt, energyProfile:profile(s.energyProfile, true),
      exercises: list(s.exercises, 50).map(e => ({ id: id(e.id), name: text(e.name),...mode(e), sets: list(e.sets, 50).map(s=>set(s)) })) };
    if(s.manualEnergy!=null){
      if(!['active','total'].includes(s.manualEnergy.type))throw new Error('手动热量类型无效');
      result.manualEnergy={type:s.manualEnergy.type,kcal:number(s.manualEnergy.kcal,0,100000)};
    }
    if (!active && !result.exercises.some(hasCompleted)) throw new Error('历史记录没有已完成组');
    return result;
  };
  const settings = data.settings || {};
  return { version: VERSION, updatedAt: Date.now(), templates, history: list(data.history, 10000).map(s => session(s)), active: data.active ? session(data.active, true) : null,
    settings: { restSeconds: number(settings.restSeconds ?? 90, 15, 600, true), weeklyGoal: number(settings.weeklyGoal ?? 4, 1, 7, true), sound: bool(settings.sound ?? true), autoRest: bool(settings.autoRest ?? true), keepAwake: bool(settings.keepAwake ?? false), lastBackupAt: settings.lastBackupAt ? number(settings.lastBackupAt, 1, 8640000000000000) : null, profile:profile(settings.profile), defaultSetsUpdated:bool(settings.defaultSetsUpdated??false) } };
}
export function backupJSON(state) { return JSON.stringify({ app: 'LiftLog', version: VERSION, exportedAt: new Date().toISOString(), data: state }, null, 2); }
export function historyCSV(history) {
  const cell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
  const rows = [['日期', '训练', '动作', '组序号', '子组序号', '重量类型', '组类型', '重量(kg)', '次数', '容量(kg)', '备注']];
  [...history].sort((a, b) => b.startedAt - a.startedAt).forEach(h => h.exercises.forEach(e => e.sets.forEach((s, i) => { const mode=setMode(s,e.mode);partsOf(s).forEach((p,j)=>{if(p.done)rows.push([localDate(h.startedAt), h.name, e.name, i+1,s.segments?j+1:'',LOAD_MODES[mode],SET_KINDS[s.kind||'normal'],p.weight,p.reps,mode==='weight'?p.weight*p.reps:0,h.note]);}); })));
  return '\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n');
}
