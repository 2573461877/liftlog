import { uid, clone, initialState, localDate, totals, lastExercise, createSession, finishSession, weekDays, weeklyStats, restRemaining, parseBackup, backupJSON, historyCSV, num, ENERGY_METHOD, INTENSITIES, sessionMilliseconds, togglePause, progress, estimateEnergy } from './domain.js';
import { openStore, loadState, saveState } from './storage.js';
import { EXERCISES, BODY_PARTS, EQUIPMENT, filterExercises } from './exercise-library.js';
import { LOAD_MODES, SET_KINDS, partsOf, completedParts, setComplete, hasCompleted, freshSet, recentExercise, exerciseDraft, templateExercise, sessionToTemplate, generateSegments, exerciseTrend } from './domain.js';

let libraryContext=null, libraryFilters={query:'',part:'',equipment:''};
const PLAN_GROUPS=['胸','背','腿','肩','手臂','核心','臀','小腿','上肢','下肢','全身','自定义'];

const root = document.querySelector('#app');
const modal = document.querySelector('#modal');
const paths = {
  home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  train: '<path d="M6 5v14M3 8v8M18 5v14M21 8v8M6 12h12"/>',
  plans: '<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M8 2v4M16 2v4M8 11h8M8 16h5"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
  settings: '<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  down: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  up: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  shield: '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  chart: '<path d="M4 3v18h17M8 16v-5M13 16V7M18 16v-8"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  wifi: '<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.train}</svg>`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
const fmt = n => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(n || 0);
const dateLabel = t => new Date(t).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
const duration = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
let state, view = location.hash.slice(1) || 'home', saveQueue = Promise.resolve(), saveError = false, readOnly = false, pendingSaves = 0;
let toastTimeout, confirmResolve, pendingUpdate, installPrompt, wakeLock, audioContext, selectedHistory = null;
let historyFilter = '全部', historyQuery = '', historyMonth = '', templateDraft, pendingBackup;
let orderDraft = [], historyManage = false, historySelection = new Set(), historyEditing = false;
let workoutDraft=null, workoutContext=null, trendName='', trendMode='weight';
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('liftlog-changes') : null;
let offlineReady = false;

function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 3200); }
function updateSaveLabel() { document.querySelectorAll('[data-save-label]').forEach(el => { el.textContent = saveError ? '保存失败 · 请立即导出备份' : pendingSaves ? '正在保存…' : '已自动保存到本机'; el.classList.toggle('error', saveError); }); if(saveError&&!document.querySelector('#save-alert'))document.querySelector('main')?.insertAdjacentHTML('afterbegin','<div id="save-alert" class="notice warning" role="alert">记录尚未成功保存。请到设置中导出完整备份，勿关闭本页。</div>'); if(!saveError)document.querySelector('#save-alert')?.remove(); }
function persist() {
  if (readOnly) return Promise.resolve(false);
  state.updatedAt = Date.now(); const snapshot = clone(state); pendingSaves++; updateSaveLabel();
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    try { await saveState(snapshot); saveError = false; channel?.postMessage({ saved: true }); return true; }
    catch (error) { saveError = true; toast('本机存储失败，请立即导出备份，避免丢失记录'); console.error('Local save failed', error); return false; }
    finally { pendingSaves--; updateSaveLabel(); }
  });
  return saveQueue;
}
function nav(target) { view = target; selectedHistory = null; historyEditing = false; location.hash = target; render(); window.scrollTo(0, 0); }
function badge(group) { return `<span class="muscle-badge group-${['胸','背','腿','肩'].indexOf(group)}">${esc(group || '练')}</span>`; }
function heading(kicker, title, subtitle = '', action = '') { return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1>${subtitle ? `<p class="subtle">${subtitle}</p>` : ''}</div>${action}</div>`; }
function empty(title, text, button = '') { return `<div class="empty-state"><div class="empty-icon">${icon('train')}</div><h3>${title}</h3><p>${text}</p>${button}</div>`; }
const button = (action, label, ic = '', cls = 'button', attrs = '') => `<button class="${cls}" data-action="${action}" ${attrs}>${ic ? icon(ic) : ''}<span>${label}</span></button>`;
function render() {
  if (!['home','train','plans','history','settings'].includes(view)) view = 'home';
  const links = [['home','概览'],['train','训练'],['plans','计划'],['history','历史'],['settings','设置']];
  root.innerHTML = `<div class="app-layout"><aside class="sidebar"><a href="#home" class="brand" aria-label="练记首页"><img src="./icons/icon.svg" alt=""><div>练记<span>LIFTLOG</span></div></a><p class="sidebar-label">你的训练空间</p><nav aria-label="主导航">${links.map(([v,n]) => `<button data-action="nav" data-view="${v}" class="nav-item ${view === v ? 'active' : ''}" ${view === v ? 'aria-current="page"' : ''}>${icon(v)}<span>${n}</span>${v === 'train' && state.active ? '<i class="active-dot"></i>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="privacy-mark">${icon('shield')}<div>只属于你的记录<small>本地保存 · 无追踪</small></div></div><span class="version">LIFTLOG / 01</span></div></aside><div class="workspace"><header class="topbar"><div class="mobile-brand"><img src="./icons/icon.svg" alt="">练记</div><span class="desktop-date">${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span><div class="status-pill ${navigator.onLine ? '' : 'offline'}"><span class="status-dot"></span>${navigator.onLine ? '本地优先' : '离线模式'}<span class="status-divider">/</span>${offlineReady ? '离线已就绪' : '数据不上传'}</div></header><main id="main" tabindex="-1">${readOnly ? '<div class="notice warning">另一个练记页面正在编辑。本页只读；请关闭另一个页面，再刷新本页。</div>' : ''}${saveError ? '<div class="notice warning">记录暂未成功保存，请到设置中导出备份，勿关闭本页。</div>' : ''}${pendingUpdate ? `<div class="notice update-notice"><span>有新版本可用${state.active ? '，建议结束当前训练后更新' : ''}。</span>${button('update','保存并更新','', 'text-button')}</div>` : ''}${({home: homeView, train: trainView, plans: plansView, history: historyView, settings: settingsView})[view]()}</main><footer class="desktop-footer"><span>每一组，都算数。</span><span data-save-label>${saveError ? '保存失败 · 请立即导出备份' : '已自动保存到本机'}</span></footer></div><nav class="bottom-nav" aria-label="手机导航">${links.map(([v,n]) => `<button data-action="nav" data-view="${v}" class="${view === v ? 'active' : ''}" ${view === v ? 'aria-current="page"' : ''}>${icon(v)}<span>${n}</span>${v === 'train' && state.active ? '<i class="active-dot"></i>' : ''}</button>`).join('')}</nav></div>`;
  if(view==='history'&&!selectedHistory)document.querySelector('.page-heading').insertAdjacentHTML('afterend',`<div class="trend-entry">${button('exercise-trend','查看动作重量趋势','chart','button secondary')}<p class="subtle">按动作和重量类型查看曲线与逐组记录</p></div>`);
  if(readOnly)root.querySelectorAll('[data-field],[data-setting],#session-note').forEach(el=>el.disabled=true);
  document.documentElement.classList.toggle('training-page',view==='train'&&Boolean(state.active));
  updateSaveLabel();
  updateTimers();
}
function homeView() {
  const w = weeklyStats(state.history); const suggested = state.templates[state.history.length % Math.max(1, state.templates.length)];
  const recent = [...state.history].sort((a,b) => b.finishedAt - a.finishedAt).slice(0, 3);
  const today = localDate(); const daysDone = new Set(w.sessions.map(s => localDate(s.startedAt)));
  return `${heading('YOUR TRAINING JOURNAL', '每一组，都算数。', '保持节奏，记录属于你的进步。')}
    <section class="hero"><div class="hero-content"><span class="hero-label"><span class="status-dot"></span>${state.active ? '训练正在进行' : 'READY WHEN YOU ARE'}</span><h2>${state.active ? esc(state.active.name) : '今天，也向前一步。'}</h2><p>${state.active ? `已完成 ${totals(state.active).sets} 组 · 记录会自动保存` : '不必每次都突破极限。<br>把每一次认真，留在这里。'}</p>${state.active ? button('resume','继续训练','arrow','button lime') : suggested ? button('start',`开始${esc(suggested.name)}`,'arrow','button lime',`data-id="${suggested.id}"`) : button('new-template','创建第一个计划','plus','button lime')}<span class="hero-caption">${state.active ? '随时离开，回来接着练' : '四分化计划已准备好，也可以按你的习惯调整'}</span></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="art-disc">${icon('train')}</div><span class="art-label">ONE MORE<br>GOOD SET.</span><i class="spark spark-one">+</i><i class="spark spark-two">+</i></div></section>
    <div class="stats-grid"><article class="stat-card"><div class="stat-label">本周训练${icon('train')}</div><div class="stat-value">${w.sessions.length}<span>/ ${state.settings.weeklyGoal} 次</span></div><div class="mini-progress"><i style="width:${Math.min(100, w.sessions.length / state.settings.weeklyGoal * 100)}%"></i></div></article><article class="stat-card"><div class="stat-label">完成组数${icon('check')}</div><div class="stat-value">${w.sets}<span>组</span></div><p>每一组，都是积累</p></article><article class="stat-card"><div class="stat-label">本周容量${icon('chart')}</div><div class="stat-value">${fmt(w.volume)}<span>kg</span></div><p>已完成组的重量 × 次数</p></article><article class="stat-card"><div class="stat-label">训练时长${icon('clock')}</div><div class="stat-value">${w.minutes}<span>分钟</span></div><p>包含组间休息时间</p></article></div>
    <div class="home-columns"><section class="panel weekly-panel"><div class="section-heading"><h2>本周节奏</h2><span class="subtle">目标 ${state.settings.weeklyGoal} 次 / 周</span></div><div class="week-grid">${w.days.map((d,i) => `<div class="week-day ${d === today ? 'today' : ''} ${daysDone.has(d) ? 'trained' : ''}"><span>${['一','二','三','四','五','六','日'][i]}</span><div>${daysDone.has(d) ? icon('check') : Number(d.slice(-2))}</div>${d === today ? '<small>今天</small>' : '<small>&nbsp;</small>'}</div>`).join('')}</div><div class="week-note">${icon('bolt')}<span>${w.sessions.length ? `本周已完成 ${w.sessions.length} 次训练，保持你自己的节奏。` : '从一次训练开始，把计划变成习惯。'}</span></div></section><section class="panel recent-panel"><div class="section-heading"><h2>最近训练</h2>${button('nav','全部记录','arrow','text-button','data-view="history"')}</div>${recent.length ? recent.map(h => historyRow(h, true)).join('') : `<div class="recent-empty">${icon('history')}<p>你的第一条记录，<br>从今天的训练开始。</p></div>`}</section></div>
    <section class="plan-section"><div class="section-heading"><h2>我的训练计划</h2>${button('nav','管理计划','arrow','text-button','data-view="plans"')}</div><div class="plan-grid">${state.templates.slice(0,4).map(t => planCard(t, true)).join('') || '<p class="subtle">暂无计划，可以在计划页添加。</p>'}</div></section>`;
}
function planCard(t, compact = false) {
  return `<article class="plan-card"><div class="plan-top">${badge(t.group)}${compact ? '<span class="plan-overline">STRENGTH</span>' : button('edit-template','编辑','edit','icon-button',`data-id="${t.id}" aria-label="编辑${esc(t.name)}"`)}</div><h3>${esc(t.name)}</h3><p>${t.exercises.length} 个动作 <span>·</span> ${t.exercises.reduce((s,e) => s + e.sets, 0)} 组</p>${compact ? '' : `<div class="exercise-preview">${t.exercises.map(e => `<span>${esc(e.name)}<small>${e.sets} × ${e.reps}</small></span>`).join('')}</div><p class="plan-note">${esc(t.note)}</p>`}<div class="plan-bottom">${button('start','开始训练','arrow','text-button',`data-id="${t.id}"`)}${compact ? '' : `<div>${button('duplicate-template','','copy','icon-button',`data-id="${t.id}" aria-label="复制${esc(t.name)}"`)}${button('delete-template','','trash','icon-button muted',`data-id="${t.id}" aria-label="删除${esc(t.name)}"`)}</div>`}</div></article>`;
}
function plansView() { return `${heading('MAKE IT YOURS','你的计划，你的节奏。','预设四分化，支持自由修改动作、组数和目标次数。',button('new-template','新建计划','plus','button primary'))}<div class="plan-grid full">${state.templates.map(t => planCard(t)).join('')}</div>${state.templates.length ? '' : empty('从一个计划开始','创建你熟悉的训练动作，下一次就能直接开练。',button('new-template','新建计划','plus','button primary'))}<div class="notice">预设仅作为记录模板，不是个性化训练处方。重量默认为 0 kg，请按你的实际负重填写。</div>`; }
function trainView() {
  if (!state.active) return `${heading('LET’S GET STARTED','准备好，开始训练。','选择今天的计划，记录会在每次操作后自动保存。')}<div class="plan-grid full">${state.templates.map(t => planCard(t, true)).join('')}</div>${button('free-session','自由训练','plus','button secondary wide-gap')}<div class="notice">自由训练可以临时添加动作；计划训练会自动带入同名动作最近一次完成组的数据。</div>`;
  const s = state.active; const stat = totals(s); const all = s.exercises.reduce((n,e) => n + e.sets.length, 0);
  return `${heading('SESSION IN PROGRESS',esc(s.name),'专注当前这一组。完成后点一下右侧勾选。',button('finish','完成训练','check','button primary'))}${restCard(s)}<div class="session-summary"><div>${icon('clock')}<span data-elapsed>${duration(Math.floor(sessionMilliseconds(s)/1000))}</span></div><div><strong data-total-sets>${stat.sets}</strong> / ${all} 组</div><div><strong data-total-volume>${fmt(stat.volume)}</strong> kg 容量</div><span class="autosave" data-save-label>已自动保存到本机</span></div>${sessionDashboard(s)}<div class="session-exercises">${s.exercises.map((e,i) => exerciseCard(e,i)).join('')}</div><div class="session-bottom">${button('add-exercise','添加动作','plus','button secondary')}<p class="builder-hint">容量仅统计负重组；自重和辅助重量不计入。子组可分别完成，全部完成才计为一个完整组。</p><label class="field session-note">训练备注<textarea id="session-note" rows="2" maxlength="2000" placeholder="今天的状态、动作感受，或下次想调整的地方…">${esc(s.note)}</textarea></label><div class="session-end">${button('discard','放弃训练','trash','button secondary danger-outline')}${button('finish','完成训练','check','button primary')}</div></div>`;
}
function restCard(s) {
  return `<div class="rest-dock"><section aria-label="组间休息计时" class="rest-bar ${s.rest ? 'running' : ''}"><div class="rest-leading">${icon('clock')}<div><span data-rest-label>组间休息</span><strong data-rest-time>${s.rest ? duration(restRemaining(s.rest)) : duration(state.settings.restSeconds)}</strong></div><small data-rest-caption>${s.rest ? '呼吸，准备下一组' : '完成一组后自动开始'}</small></div><div class="rest-actions">${button('rest-minus','−15s','','chip-button',!s.rest ? 'disabled' : '')}${button('rest-plus','+15s','','chip-button',!s.rest ? 'disabled' : '')}${button(s.rest ? 'rest-stop' : 'rest-start',s.rest ? '结束' : '开始','','button small')}</div></section></div>`;
}
function exerciseCard(e, i) {
  const prev=recentExercise(state.history,e.name), mode=e.mode||'weight';
  return `<article class="exercise-card" data-exercise="${e.id}"><div class="exercise-heading"><span class="exercise-index">${String(i+1).padStart(2,'0')}</span><div><h2>${esc(e.name)}</h2><p>${prev?`上次 ${prev.sets.length} 组 · ${loadText(prev.sets[0],prev.mode)}`:'首次记录 · 按实际情况设置'}</p></div>${button('remove-exercise','','trash','icon-button muted',`data-id="${e.id}" aria-label="移除${esc(e.name)}"`)}</div><div class="exercise-tools"><span class="load-badge">${LOAD_MODES[mode]}</span><div>${button('exercise-trend','历史','chart','text-button',`data-name="${esc(e.name)}" data-mode="${mode}"`)}${button('edit-workout','组设置','edit','text-button',`data-id="${e.id}"`)}${moveButtons('session-move',i,state.active.exercises.length)}</div></div><div class="set-table"><div class="set-head"><span>组</span><span>${mode==='assisted'?'辅助 kg':mode==='bodyweight'?'自重':'重量 kg'}</span><span>次数</span><span>完成</span><span></span></div>${e.sets.map((s,j)=>trainingSet(e,s,j)).join('')}</div>${button('add-set','添加一组','plus','add-set',`data-id="${e.id}"`)}</article>`;
}
function historyRow(h, compact = false) { const t = totals(h); return `<button class="history-row ${compact ? 'compact' : ''}" data-action="history-detail" data-id="${h.id}">${badge(h.group)}<span class="history-main"><strong>${esc(h.name)}</strong><small>${dateLabel(h.startedAt)}${compact ? '' : ` · ${new Date(h.startedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`} · ${t.sets} 组</small></span><span class="history-volume">${fmt(t.volume)}<small>kg</small></span>${icon('arrow')}</button>`; }
function historyView() {
  if (selectedHistory) return historyDetail();
  const groups = ['全部', ...new Set(state.history.map(h=>h.group))];
  if (!groups.includes(historyFilter)) historyFilter='全部';
  const months=[...new Set(state.history.map(h=>localDate(h.startedAt).slice(0,7)))].sort().reverse();
  if (!months.includes(historyMonth)) historyMonth='';
  const filtered = state.history.filter(h => (historyFilter==='全部'||h.group===historyFilter) && (!historyMonth || localDate(h.startedAt).startsWith(historyMonth)) && `${h.name} ${h.exercises.map(e=>e.name).join(' ')}`.toLowerCase().includes(historyQuery.toLowerCase())).sort((a,b)=>b.startedAt-a.startedAt);
  const max = Math.max(1,...state.history.map(h=>totals(h).volume));
  const chartData = [...state.history].sort((a,b)=>a.startedAt-b.startedAt).slice(-8);
  return `${heading('PROGRESS, NOT PERFECTION','看见你的积累。',`共 ${state.history.length} 次训练 · ${state.history.reduce((n,h)=>n+totals(h).sets,0)} 个完成组`,button('export-csv','导出 CSV','down','button secondary'))}${state.history.length ? `<section class="panel chart-panel"><div class="section-heading"><h2>最近训练容量</h2><span class="subtle">重量 × 次数 · kg</span></div><div class="bar-chart" role="img" aria-label="最近${chartData.length}次训练容量柱状图">${chartData.map(h=>`<div class="chart-column"><strong>${fmt(totals(h).volume)}</strong><div class="bar-track"><div class="bar" style="height:${Math.max(3,totals(h).volume/max*100)}%"></div></div><small>${new Date(h.startedAt).getMonth()+1}/${new Date(h.startedAt).getDate()}</small><span>${esc(h.group)}</span></div>`).join('')}</div><p class="chart-note">不同动作或器械的容量不宜直接比较；容量为 0 也可能是正常的自重训练。</p></section>` : ''}<div class="history-tools"><div class="filter-chips">${groups.map(g=>button('filter',esc(g),'',`filter-chip ${g===historyFilter?'selected':''}`,`data-group="${esc(g)}"`)).join('')}</div><div class="history-inputs"><input id="history-search" type="search" placeholder="搜索动作或训练" aria-label="搜索训练记录" value="${esc(historyQuery)}"><select id="history-month" aria-label="筛选月份"><option value="">全部月份</option>${months.map(m=>`<option value="${m}" ${m===historyMonth?'selected':''}>${m.slice(0,4)}年${Number(m.slice(5))}月</option>`).join('')}</select></div></div>${historyManagement(filtered)}<div class="panel history-list">${filtered.length ? filtered.map(h=>`<div class="history-list-item">${historyManage?`<label class="history-select"><input type="checkbox" data-history-id="${h.id}" aria-label="选择${esc(h.name)} ${dateLabel(h.startedAt)}" ${historySelection.has(h.id)?'checked':''}></label>`:'' }${historyRow(h)}${historyManage?'':button('delete-history','','trash','icon-button danger',`data-id="${h.id}" aria-label="删除${esc(h.name)} ${dateLabel(h.startedAt)}"`)}</div>`).join('') : empty(state.history.length?'没有找到匹配记录':'第一条训练记录，留给今天。',state.history.length?'换个关键词或月份试试看。':'完成训练后，动作、重量和次数会出现在这里。',state.history.length?'':button('nav','开始训练','arrow','button primary','data-view="train"'))}</div>`;
}
function historyDetail() {
  const h = state.history.find(h=>h.id===selectedHistory); if(!h) {selectedHistory=null; return historyView();}
  const t=totals(h);
  return `${button('history-back','返回历史','back','text-button back-button')}${heading(dateLabel(h.startedAt),esc(h.name),`${t.sets} 个完整组 · ${fmt(t.volume)} kg · ${Math.round(sessionMilliseconds(h)/60000)} 分钟`,button('repeat','再练一次','train','button primary',`data-id="${h.id}"`))}${energyCard(h,false)}
    <div class="history-edit-toolbar">${button('history-to-plan','保存为训练计划','plans','button primary')}${button('edit-history',historyEditing?'完成编辑':'删减动作／组数','edit','button secondary')}<p class="subtle">计划仅保留完成部分；删减历史会同步更新动作趋势与最近重量。</p></div>
    <div class="detail-exercises">${h.exercises.map(e=>`<section class="panel detail-card"><div class="section-heading"><div><h2>${esc(e.name)}</h2><span class="load-badge">${LOAD_MODES[e.mode||'weight']}</span></div>${historyEditing?button('trim-exercise','移除动作','trash','text-button danger',`data-id="${e.id}"`):button('exercise-trend','重量趋势','chart','text-button',`data-name="${esc(e.name)}" data-mode="${e.mode||'weight'}"`)}</div>${e.sets.map((s,i)=>`<div class="history-set-block"><div class="detail-set"><span>第 ${i+1} 组${s.kind&&s.kind!=='normal'?` · ${SET_KINDS[s.kind]}`:''}</span>${s.segments?'':`<strong>${loadText(s,e.mode)}</strong><span>${s.done?icon('check'):'未完成'}</span>`}${historyEditing?button('trim-set','','close','icon-button danger',`data-ex="${e.id}" data-id="${s.id}" aria-label="删除历史${esc(e.name)}第${i+1}组"`):''}</div>${s.segments?s.segments.map((p,j)=>`<div class="detail-set subgroup-detail ${p.done?'':'incomplete'}"><span>子组 ${j+1}</span><strong>${loadText(p,e.mode)}</strong><span>${p.done?icon('check'):'未完成'}</span></div>`).join(''):''}</div>`).join('')}</section>`).join('')}</div>
    ${h.note?`<section class="panel note-panel"><h2>训练备注</h2><p>${esc(h.note)}</p></section>`:''}<div class="history-delete">${button('delete-history','删除这条记录','trash','text-button danger',`data-id="${h.id}"`)}</div>`;
}
function settingsView() {
  const s=state.settings;
return `${heading('YOUR SPACE, YOUR RULES','按你的习惯来。','简单设置，让记录更顺手。')}<div class="settings-grid">${profilePanel()}<section class="panel settings-panel"><h2>${icon('settings')}训练偏好</h2><label class="setting-row"><span><strong>每周训练目标</strong><small>用来显示本周进度</small></span><select data-setting="weeklyGoal" aria-label="每周训练目标">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${s.weeklyGoal===n?'selected':''}>${n} 次</option>`).join('')}</select></label><label class="setting-row"><span><strong>默认组间休息</strong><small>训练中可临时增减 15 秒</small></span><select data-setting="restSeconds" aria-label="默认组间休息">${[...new Set([30,45,60,90,120,150,180,240,300,s.restSeconds])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${s.restSeconds===n?'selected':''}>${n} 秒</option>`).join('')}</select></label>${settingToggle('autoRest','自动开始休息','勾选完成一组后启动倒计时',s.autoRest)}${settingToggle('sound','前台提示音','仅在页面运行且浏览器允许时播放',s.sound)}${settingToggle('keepAwake','训练时保持亮屏','需要浏览器支持；切到后台会失效',s.keepAwake)}<p class="setting-footnote">计时按结束时间恢复，不依赖后台持续运行。锁屏后不保证准时响铃；请勿将此功能当作系统闹钟。</p></section><section class="panel settings-panel"><h2>${icon('shield')}数据与备份</h2><div class="data-summary"><strong>${state.history.length}<small>次训练</small></strong><strong>${state.templates.length}<small>个计划</small></strong><strong>本机<small>存储位置</small></strong></div><p class="subtle">训练记录保存在当前设备的浏览器中，不上传 GitHub、不自动同步到其他设备。清理网站数据或换手机前，请先备份。</p><div class="backup-status">${icon('clock')}<span>${s.lastBackupAt ? `上次导出 ${new Date(s.lastBackupAt).toLocaleString('zh-CN')}` : '尚未导出备份 · 建议每周备份一次'}</span></div><div class="backup-actions">${button('export-json','导出完整备份','down','button primary')}${button('import-json','恢复备份','up','button secondary')}${button('export-csv','导出历史 CSV','chart','button secondary')}</div>${button('persist-storage','申请持久化存储','shield','text-button wide-gap')}<p class="setting-footnote">持久化申请是否批准由浏览器决定，不能替代备份。导出的文件请保存到你选定的位置（如 iCloud Drive 或电脑 E 盘）。</p></section><section class="panel settings-panel install-panel"><h2>${icon('plus')}添加到 iPhone 主屏幕</h2><ol><li>用 <strong>Safari</strong> 打开本站。</li><li>点“分享”，选择“添加到主屏幕”。</li><li>如有“作为网页 App 打开”选项，请打开。</li><li>打开图标，联网等待“离线已就绪”，再测试断网使用。</li></ol>${installPrompt ? button('install','安装练记','plus','button primary') : ''}<p class="setting-footnote">建议固定使用主屏幕入口与同一网址，避免在不同浏览器或不同站点之间分散记录。</p></section><section class="panel settings-panel about-panel"><div class="about-brand"><img src="./icons/icon.svg" alt=""><div><h2>练记 LiftLog</h2><p>每一组，都算数。</p></div></div><p class="subtle">v1.3.0 · 无广告 · 无第三方追踪<br>离线优先，关注训练本身。</p><p class="setting-footnote">重量统一为 kg；自重、辅助重量请在组设置中选择。单侧动作的重量与次数口径请始终保持一致。</p>${button('check-update','检查应用更新','','text-button')}</section></div>`;
}
function settingToggle(key, title, desc, checked) { return `<label class="setting-row"><span><strong>${title}</strong><small>${desc}</small></span><input class="switch" type="checkbox" data-setting="${key}" aria-label="${title}" ${checked?'checked':''}></label>`; }
function showModal(title, body, cls='') { modal.className=cls; modal.innerHTML=`<div class="modal-heading"><h2 id="modal-title">${title}</h2>${button('close-modal','','close','icon-button','aria-label="关闭对话框"')}</div>${body}`; if(!modal.open) modal.showModal(); }
function ask(title, text, label='确认', danger=false) { return new Promise(resolve=>{confirmResolve=resolve;showModal(title,`<p class="confirm-text">${esc(text)}</p><div class="modal-actions">${button('close-modal','取消','','button secondary')}${button('confirm',label,'',`button ${danger?'danger-fill':'primary'}`)}</div>`,'confirm-modal');}); }
function templateModal(template) { templateDraft=clone(template || {id:uid(),name:'',group:'自定义',note:'',exercises:[{id:uid(),name:'',sets:4,reps:10,weight:0}]}); showTemplateForm(); }
function builderCard(e,i,length) {
  return `<div class="builder-row" data-index="${i}">
    <div class="builder-order"><span>动作 ${i+1}</span><div>
      ${button('library-template','动作库','','text-button',`type="button" data-index="${i}" aria-label="从动作库选择动作${i+1}"`)}
      ${moveButtons('builder-move',i,length)}
      ${button('builder-remove','','close','icon-button',`type="button" data-index="${i}" aria-label="删除动作${i+1}"`)}
    </div></div>
    <label class="field builder-name">动作名称<input name="exercise-${i}" aria-label="动作${i+1}名称" required maxlength="120" value="${esc(e.name)}" placeholder="手动填写，或从动作库选择"></label>
    <div class="builder-fields">
      <label class="field">组数<input name="sets-${i}" aria-label="动作${i+1}组数" type="number" inputmode="numeric" min="1" max="50" required value="${e.sets}"></label>
      <label class="field">每组次数<input name="reps-${i}" aria-label="动作${i+1}次数" type="number" inputmode="numeric" min="1" max="999" required value="${e.reps}"></label>
      <label class="field">${e.mode==='assisted'?'辅助重量':'重量'} (kg)<input name="weight-${i}" aria-label="动作${i+1}重量" type="number" inputmode="decimal" min="0" max="2000" step="any" required value="${e.weight}" ${e.mode==='bodyweight'?'disabled':''}></label>
    </div><div class="builder-detail-tools"><span>${LOAD_MODES[e.mode||'weight']} · ${e.setPlan?'已设置逐组参数':'统一初始重量'}</span>${button('builder-details','逐组 / 特殊组设置','edit','text-button',`type="button" data-index="${i}"`)}</div>
  </div>`;
}
function showTemplateForm() {
  const t=templateDraft, groups=[...new Set([...PLAN_GROUPS,t.group])];
  showModal(state.templates.some(p=>p.id===t.id)?'编辑训练计划':'新建训练计划',`<form id="template-form">
    <div class="form-two"><label class="field">计划名称<input name="name" required maxlength="120" value="${esc(t.name)}" placeholder="例如：胸部力量"></label><label class="field">训练分类<select name="group">${groups.map(g=>`<option ${g===t.group?'selected':''}>${esc(g)}</option>`).join('')}</select></label></div>
    <label class="field">备注<input name="note" maxlength="500" value="${esc(t.note)}" placeholder="计划说明（选填）"></label>
    <p class="builder-hint">动作名称单独一行；快捷调整次数 / 重量会统一应用到各组。不同组使用不同参数时，请打开“逐组 / 特殊组设置”。</p>
    <div id="builder-rows">${t.exercises.map((e,i)=>builderCard(e,i,t.exercises.length)).join('')}</div>
    <div class="builder-add-actions">${button('builder-add','增加动作','plus','button secondary','type="button"')}${button('library-template-add','从动作库添加','plans','button secondary','type="button"')}</div>
    <p class="builder-hint">新动作默认 4 组；同名动作带入最近已完成记录。逐组设置支持自重、辅助重量及递增递减子组。初值不是训练处方。</p>
    <div class="modal-actions"><button type="button" class="button secondary" data-action="close-modal">取消</button><button type="submit" class="button primary">保存计划</button></div>
  </form>`,'template-modal');
  document.querySelector('#template-form').addEventListener('submit',async e=>{e.preventDefault(); if(readOnly) return; readDraft(); if(!templateDraft.name.trim() || !templateDraft.exercises.length || templateDraft.exercises.some(e=>!e.name.trim())) {toast('请填写计划名称和至少一个动作');return;} const i=state.templates.findIndex(t=>t.id===templateDraft.id); if(i<0) state.templates.push(clone(templateDraft));else state.templates[i]=clone(templateDraft);await persist();modal.close();render();toast('计划已保存');});
}
function readDraft() {
  const form=document.querySelector('#template-form'); if(!form)return;
  const f=new FormData(form);templateDraft.name=String(f.get('name')||'').trim();templateDraft.group=String(f.get('group'));templateDraft.note=String(f.get('note')||'');
  templateDraft.exercises=templateDraft.exercises.map((e,i)=>{
    const name=String(f.get(`exercise-${i}`)||'').trim(), sets=Math.round(num(f.get(`sets-${i}`),1,50)), reps=Math.round(num(f.get(`reps-${i}`),1,999)), weight=num(f.get(`weight-${i}`),0,2000);
    if(name!==e.name && recentExercise(state.history,name,state.active))return {...templateExercise(exerciseDraft(name,state.history,state.active)),id:e.id};
    const next={...e,name,sets,reps,weight};
    if(e.setPlan)next.setPlan=Array.from({length:sets},(_,j)=>{const s=clone(e.setPlan[j]||e.setPlan.at(-1));if(reps!==e.reps)partsOf(s).forEach(p=>p.reps=reps);if(weight!==e.weight)partsOf(s).forEach(p=>p.weight=e.mode==='bodyweight'?0:weight);s.weight=partsOf(s)[0].weight;s.reps=partsOf(s)[0].reps;return s;});
    return next;
  });
}
async function startTemplate(t) { if(state.active) {toast('你还有一场进行中的训练，请先完成或放弃');nav('train');return;} state.active=createSession(t,state.history,Date.now(),state.settings.profile);await persist();nav('train');await syncWake(); }
function addExerciseModal(draft=null) {
  if(!state.active)return;
  workoutDraft=draft?.sets instanceof Array?clone(draft):exerciseDraft(draft?.name||'',state.history,state.active);
  workoutContext={type:'add',position:draft?.position??state.active.exercises.length};
  showWorkoutEditor();
}
function openLibrary(context) {
  libraryContext=context;
  libraryFilters={query:'',part:'',equipment:''};
  showModal('选择训练动作',`<div class="library-toolbar">
    ${button('library-back','返回编辑','','text-button')}
    <span>${EXERCISES.length} 个动作 · 离线可用</span>
  </div>
  <label class="field library-search">搜索动作<input id="library-search" type="search" autocomplete="off" maxlength="120" placeholder="名称、英文或别名，如：卧推 / RDL"></label>
  <div class="library-filters">
    <label class="field">训练部位<select id="library-part" aria-label="训练部位"><option value="">全部部位</option>${Object.entries(BODY_PARTS).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select></label>
    <label class="field">主要器材<select id="library-equipment" aria-label="主要器材"><option value="">全部器材</option>${Object.entries(EQUIPMENT).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select></label>
  </div>
  <div class="library-result-bar"><span id="library-count" role="status" aria-live="polite"></span>${button('library-reset','清除筛选','','text-button')}</div>
  <div id="library-results" class="library-results" role="region" aria-label="动作检索结果" tabindex="0"></div>
  `,'library-modal');
  modal.scrollTop=0;
  renderLibraryResults();
}
function renderLibraryResults() {
  const results=[...filterExercises(libraryFilters),...personalLibrary().filter(e=>(!libraryFilters.part)&&(!libraryFilters.equipment||libraryFilters.equipment===e.equipment)&&e.name.toLowerCase().includes(libraryFilters.query.trim().toLowerCase()))];
  document.querySelector('#library-count').textContent=`找到 ${results.length} / ${EXERCISES.length+personalLibrary().length} 个动作`;
  document.querySelector('#library-results').innerHTML=results.length?results.map(e=>`<button type="button" class="library-item" data-action="library-select" data-id="${e.id}" aria-label="选择${esc(e.name)}"><span class="library-item-main"><strong>${esc(e.name)}</strong><small class="library-english">${esc(e.english)}</small><span class="library-tags"><span class="library-equipment-tag">${esc(EQUIPMENT[e.equipment])}</span><span>${esc(e.primary.join('、'))}</span><span class="library-level">${esc(e.level)}</span></span>${e.secondary.length?`<small class="library-muscles">辅助：${esc(e.secondary.join('、'))}</small>`:''}<small class="library-last">${libraryLast(e.name)}</small></span><span class="library-select-mark" aria-hidden="true">＋</span></button>`).join(''):`<div class="library-empty"><strong>没有匹配的动作</strong><p>试试其他部位、器材或关键词，也可以返回手动填写。</p>${button('library-manual','返回并手动输入','','button secondary')}</div>`;
  document.querySelector('#library-results').scrollTop=0;
}
function returnFromLibrary(exercise=null,manualName=null) {
  const context=libraryContext;
  if(!context)return;
  libraryContext=null;
  if(context.type==='session') {
    const name=exercise?.name??manualName;
    const draft=name!=null&&name!==context.draft.name?exerciseDraft(name,state.history,state.active,exercise?.equipment==='bodyweight'?'bodyweight':'weight'):context.draft;
    addExerciseModal({...draft,position:context.position});
    requestAnimationFrame(()=>document.querySelector('#add-exercise-form [name="name"]')?.focus({preventScroll:true}));
    return;
  }
  let index=context.index;
  if(exercise || manualName!==null) {
    if(index==null) {
      index=templateDraft.exercises.findIndex(e=>!e.name.trim());
      if(index<0) {
        if(templateDraft.exercises.length>=50){showTemplateForm();toast('每个计划最多 50 个动作');return;}
        index=templateDraft.exercises.length;
        templateDraft.exercises.push({id:uid(),name:'',sets:4,reps:10,weight:0});
      }
    }
    const name=exercise?.name??manualName, id=templateDraft.exercises[index].id;
    templateDraft.exercises[index]={...templateExercise(exerciseDraft(name,state.history,state.active,exercise?.equipment==='bodyweight'?'bodyweight':'weight')),id};
  }
  showTemplateForm();
  requestAnimationFrame(()=>{
    modal.scrollTop=context.scrollTop;
    if(index!=null)document.querySelector(`[name="exercise-${index}"]`)?.focus({preventScroll:true});
    if(context.index==null && index!=null)document.querySelector(`.builder-row[data-index="${index}"]`)?.scrollIntoView({block:'nearest'});
  });
}
function handleLibraryAction(action,el) {
  if(action==='library-template'||action==='library-template-add') {
    readDraft();
    if(action==='library-template-add' && templateDraft.exercises.length>=50 && !templateDraft.exercises.some(e=>!e.name.trim())){toast('每个计划最多 50 个动作');return true;}
    openLibrary({type:'template',index:action==='library-template'?Number(el.dataset.index):null,scrollTop:modal.scrollTop});return true;
  }
  if(action==='library-session') {
    readWorkoutEditor();openLibrary({type:'session',draft:clone(workoutDraft),position:workoutContext.position});return true;
  }
  if(action==='library-back'){returnFromLibrary();return true;}
  if(action==='library-manual'){returnFromLibrary(null,libraryFilters.query.trim());return true;}
  if(action==='library-select'){const e=[...EXERCISES,...personalLibrary()].find(e=>e.id===el.dataset.id);if(e)returnFromLibrary(e);return true;}
  if(action==='library-reset') {
    libraryFilters={query:'',part:'',equipment:''};
    for(const id of ['library-search','library-part','library-equipment'])document.getElementById(id).value='';
    renderLibraryResults();return true;
  }
  return false;
}
modal.addEventListener('cancel',event=>{if(libraryContext){event.preventDefault();returnFromLibrary();}});
document.addEventListener('input',event=>{if(event.target.id==='library-search'&&libraryContext){libraryFilters.query=event.target.value;renderLibraryResults();}});
document.addEventListener('change',event=>{
  if(!libraryContext)return;
  if(event.target.id==='library-part')libraryFilters.part=event.target.value;
  else if(event.target.id==='library-equipment')libraryFilters.equipment=event.target.value;
  else return;
  renderLibraryResults();
});
function download(content, filename, type) { const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000); }
async function exportBackup() { state.settings.lastBackupAt=Date.now();await persist();download(backupJSON(state),`liftlog-backup-${localDate()}.json`,'application/json');if(view==='settings')render();toast('已生成备份，请确认文件已保存'); }
async function syncWake() { try {if(state?.active&&state.settings.keepAwake&&document.visibilityState==='visible'&&'wakeLock'in navigator){if(!wakeLock||wakeLock.released)wakeLock=await navigator.wakeLock.request('screen');}else if(wakeLock){await wakeLock.release();wakeLock=null;}}catch{ /* optional, never blocks recording */ } }
function primeAudio(){if(!state.settings.sound)return;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});}catch{}}
function beep(){if(!audioContext||audioContext.state!=='running'||!state.settings.sound||document.visibilityState!=='visible')return;const o=audioContext.createOscillator();const g=audioContext.createGain();o.type='sine';o.frequency.value=660;g.gain.setValueAtTime(.07,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.45);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.45);}
function updateTimers(){
  if(!state?.active)return;
  const s=state.active, now=s.pausedAt??Date.now();
  document.querySelectorAll('[data-elapsed]').forEach(el=>el.textContent=duration(Math.floor(sessionMilliseconds(s)/1000)));
  const energy=estimateEnergy(s);
  document.querySelectorAll('[data-energy-active]').forEach(el=>el.textContent=energy?fmt(energy.active):'—');
  document.querySelectorAll('[data-energy-total]').forEach(el=>el.textContent=energy?fmt(energy.total):'—');
  const r=s.rest;
  document.querySelectorAll('[data-rest-label]').forEach(el=>el.textContent=s.pausedAt!=null?'训练已暂停':r&&restRemaining(r,now)===0?'休息结束':'组间休息');
  document.querySelectorAll('[data-rest-time]').forEach(el=>el.textContent=duration(r?restRemaining(r,now):state.settings.restSeconds));
  if(s.pausedAt!=null){document.querySelectorAll('[data-rest-caption]').forEach(el=>el.textContent='训练已暂停');return;}
  if(r&&restRemaining(r,now)===0){document.querySelectorAll('[data-rest-caption]').forEach(el=>el.textContent='休息结束，准备下一组');if(!r.notified){r.notified=true;if(!readOnly)persist();beep();toast('休息结束，准备下一组');}}
}
const findExercise=id=>state.active?.exercises.find(e=>e.id===id);
document.addEventListener('click',async event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;
  const readActions=['nav','close-modal','confirm','history-detail','history-back','filter','export-json','export-csv','check-update','update','install','exercise-trend'];
  if(readOnly&&!readActions.includes(a)){toast('本页只读，请关闭其他练记页面后刷新');return;}
  try {
    if(a==='nav'){nav(el.dataset.view);return;}
    if(a==='close-modal'){if(libraryContext)returnFromLibrary();else modal.close();return;}
    if(handleLibraryAction(a,el))return;
    if(a==='confirm'){const r=confirmResolve;confirmResolve=null;r?.(true);modal.close();return;}
    if(a==='start'){const t=state.templates.find(t=>t.id===id);if(t)await startTemplate(t);return;}
    if(a==='resume'){nav('train');return;}
    if(a==='free-session'){await startTemplate({id:'',name:'自由训练',group:'自定义',exercises:[]});addExerciseModal();return;}
    if(a==='new-template'){if(state.templates.length>=100){toast('最多支持 100 个计划');return;}templateModal();return;}
    if(a==='edit-template'){templateModal(state.templates.find(t=>t.id===id));return;}
    if(a==='builder-move'){readDraft();moveItem(templateDraft.exercises,Number(el.dataset.index),Number(el.dataset.direction));showTemplateForm();return;}
    if(a==='builder-add'){readDraft();if(templateDraft.exercises.length>=50){toast('每个计划最多 50 个动作');return;}templateDraft.exercises.push({id:uid(),name:'',sets:4,reps:10,weight:0});showTemplateForm();return;}
    if(a==='builder-remove'){readDraft();templateDraft.exercises.splice(Number(el.dataset.index),1);showTemplateForm();return;}
    if(a==='duplicate-template'){const t=clone(state.templates.find(t=>t.id===id));t.id=uid();t.name=t.name.slice(0,110)+' · 副本';t.exercises.forEach(e=>e.id=uid());templateModal(t);return;}
    if(a==='delete-template'){if(await ask('删除这个计划？','只删除计划，不会删除已经保存的训练历史。','删除计划',true)){state.templates=state.templates.filter(t=>t.id!==id);await persist();render();}return;}
    if(await handleNewAction(a,el))return;
    if(await handleWorkoutAction(a,el))return;
    if(a==='add-exercise'){if(state.active.exercises.length>=50){toast('每场训练最多 50 个动作');return;}addExerciseModal();return;}
    if(a==='remove-exercise'){const e=findExercise(id);if(e&&await ask('移除这个动作？',`${e.name} 的本次组数记录也会移除。`,'移除',true)){state.active.exercises=state.active.exercises.filter(e=>e.id!==id);await persist();render();}return;}
    if(a==='add-set'){const e=findExercise(id);if(e.sets.length>=50){toast('每个动作最多 50 组');return;}e.sets.push(freshSet(e.sets.at(-1),e.mode));await persist();render();return;}
    if(a==='remove-set'){const e=findExercise(el.dataset.ex);const s=e.sets.find(s=>s.id===id);if(s.done&&!await ask('删除已完成组？','这会同时移除这一组的重量与次数记录。','删除',true))return;e.sets=e.sets.filter(s=>s.id!==id);if(state.active.rest?.sourceSetId===id)state.active.rest=null;await persist();render();return;}
    if(a==='toggle-set'){const s=findExercise(el.dataset.ex)?.sets.find(s=>s.id===id);if(!s)return;const was=setComplete(s);if(el.dataset.segment!=null){const p=s.segments[Number(el.dataset.segment)];p.done=!p.done;}else{const done=!setComplete(s);partsOf(s).forEach(p=>p.done=done);}s.done=setComplete(s);if(s.done&&!was){primeAudio();if(state.settings.autoRest)state.active.rest={endAt:(state.active.pausedAt??Date.now())+state.settings.restSeconds*1000,total:state.settings.restSeconds,sourceSetId:id,notified:false};}else if(!s.done&&state.active.rest?.sourceSetId===id)state.active.rest=null;await persist();render();return;}
    if(a==='rest-start'){primeAudio();state.active.rest={endAt:(state.active.pausedAt??Date.now())+state.settings.restSeconds*1000,total:state.settings.restSeconds,notified:false};await persist();render();return;}
    if(a==='rest-stop'){state.active.rest=null;await persist();render();return;}
    if(a==='rest-plus'||a==='rest-minus'){const r=state.active.rest;if(r){r.endAt=Math.max(state.active.pausedAt??Date.now(),r.endAt+(a==='rest-plus'?15000:-15000));r.notified=false;await persist();updateTimers();}return;}
    if(a==='finish'){const count=totals(state.active).sets;if(!state.active.exercises.some(hasCompleted)){toast('至少完成一组或一个子组后才能保存训练');return;}if(await ask('完成今天的训练？',`将保存 ${count} 个完整组及已完成子组。未完成部分保留，但不计入重量趋势或容量。`,'完成训练')){const done=finishSession(state.active);state.history.push(done);state.active=null;await persist();await syncWake();view='history';location.hash='history';selectedHistory=done.id;historyEditing=false;render();window.scrollTo(0,0);toast('训练已保存，动作库历史重量已更新。');}return;}
    if(a==='discard'){if(await ask('放弃本次训练？','本次尚未结束的训练将被删除，已保存的历史不受影响。','放弃训练',true)){state.active=null;await persist();await syncWake();nav('home');}return;}
    if(a==='history-detail'){view='history';location.hash='history';selectedHistory=id;historyEditing=false;render();window.scrollTo(0,0);return;}
    if(a==='history-back'){selectedHistory=null;historyEditing=false;render();return;}
    if(a==='filter'){historyFilter=el.dataset.group;historySelection.clear();render();return;}
    if(a==='delete-history'){if(await ask('删除这条训练记录？','删除后无法直接撤销。建议先在设置中导出备份。','删除记录',true)){state.history=state.history.filter(h=>h.id!==id);await persist();selectedHistory=null;historySelection.delete(id);historyEditing=false;render();}return;}
    if(a==='repeat'){const h=state.history.find(h=>h.id===id);await startTemplate({...sessionToTemplate(h),id:h.templateId});return;}
    if(a==='export-json'){await exportBackup();return;}
    if(a==='export-csv'){download(historyCSV(state.history),`liftlog-history-${localDate()}.csv`,'text/csv;charset=utf-8');toast('已生成历史 CSV');return;}
    if(a==='import-json'){document.querySelector('#import-file').click();return;}
    if(a==='persist-storage'){const granted=await navigator.storage?.persist?.();toast(granted?'持久化存储已获准，仍请定期备份':'浏览器未批准持久化；添加到主屏幕并定期备份');return;}
    if(a==='check-update'){const r=await navigator.serviceWorker?.getRegistration();if(!r){toast('离线缓存尚未启用，请通过 HTTPS 或本机地址访问');return;}await r.update();toast(r.waiting?'新版本已准备好':'更新检查完成；有新版本时将显示提示');return;}
    if(a==='update'){if(!pendingUpdate)return;if(state.active&&!await ask('训练中更新应用？','记录会先保存，然后刷新页面。建议训练结束后更新。','保存并更新'))return;if(!await persist())return;pendingUpdate.postMessage({type:'SKIP_WAITING'});return;}
    if(a==='install'&&installPrompt){await installPrompt.prompt();installPrompt=null;render();return;}
  }catch(error){console.error(error);toast(error.message||'操作未完成，请重试');}
});
// A displayed zero is a starting value, not a digit the user must erase.
function restoreEmptyZero(el) {
  if(!(el instanceof HTMLInputElement)||el.dataset.replaceZero!=='true'||el.value!=='')return;
  el.value='0';
  el.dispatchEvent(new Event('input',{bubbles:true}));
}
document.addEventListener('focusin',event=>{
  const el=event.target;
  if(readOnly||!(el instanceof HTMLInputElement)||el.type!=='number'||el.disabled||el.readOnly)return;
  if(el.value!==''&&Number(el.value)===0&&Number(el.min||0)<=0){el.dataset.replaceZero='true';el.value='';}
});
// Capture change before the existing field-validation handler restores saved values.
document.addEventListener('change',event=>restoreEmptyZero(event.target),true);
document.addEventListener('focusout',event=>{restoreEmptyZero(event.target);if(event.target instanceof HTMLInputElement)delete event.target.dataset.replaceZero;});
document.addEventListener('keydown',event=>{if(event.key==='Enter')restoreEmptyZero(event.target);},true);
// Safari gesture events are non-standard; CSS/viewport remain the primary controls.
const preventTouchZoom=event=>{if(event.cancelable)event.preventDefault();};
for(const type of ['gesturestart','gesturechange'])document.addEventListener(type,preventTouchZoom,{passive:false});
for(const type of ['touchstart','touchmove'])document.addEventListener(type,event=>{if(event.touches.length>1)preventTouchZoom(event);},{passive:false});
document.addEventListener('input',event=>{
  if(readOnly)return;const el=event.target;
  if(el.dataset.field){const group=findExercise(el.dataset.ex)?.sets.find(s=>s.id===el.dataset.setid);const s=el.dataset.segment!=null?group?.segments[Number(el.dataset.segment)]:group;if(!s)return;const val=Number(el.value);if(el.value===''||!Number.isFinite(val)||val<0||(el.dataset.field==='reps'&&(val<1||!Number.isInteger(val))))return;s[el.dataset.field]=num(val,el.dataset.field==='weight'?0:1,el.dataset.field==='weight'?2000:999);if(group.segments){group.weight=group.segments[0].weight;group.reps=group.segments[0].reps;}persist();const t=totals(state.active);document.querySelectorAll('[data-total-volume]').forEach(e=>e.textContent=fmt(t.volume));}
  if(el.id==='session-note'){state.active.note=el.value;persist();}
});
document.addEventListener('change',async event=>{const el=event.target;if(el.dataset.historyId){if(readOnly)return;if(el.checked)historySelection.add(el.dataset.historyId);else historySelection.delete(el.dataset.historyId);render();return;}if(el.id==='history-search'){historyQuery=el.value;historySelection.clear();render();return;}if(el.id==='history-month'){historyMonth=el.value;historySelection.clear();render();return;}if(readOnly)return;if(el.dataset.setting){state.settings[el.dataset.setting]=el.type==='checkbox'?el.checked:Number(el.value);await persist();await syncWake();return;}if(el.dataset.field){const group=findExercise(el.dataset.ex)?.sets.find(s=>s.id===el.dataset.setid);const s=el.dataset.segment!=null?group?.segments[Number(el.dataset.segment)]:group;if(s)el.value=s[el.dataset.field];}});
document.querySelector('#import-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file||readOnly)return;try{if(file.size>15*1024*1024)throw new Error('备份文件超过 15MB，请检查文件');pendingBackup=parseBackup(await file.text());if(await ask('用备份恢复记录？',`包含 ${pendingBackup.history.length} 次训练、${pendingBackup.templates.length} 个计划。将替换本机现有数据；请先导出当前备份。`,'恢复并替换')){state=pendingBackup;historySelection.clear();historyManage=false;historyEditing=false;selectedHistory=null;await persist();await syncWake();render();toast('备份已恢复');}pendingBackup=null;}catch(error){toast(`无法导入：${error.message}`);}});
modal.addEventListener('close',()=>{const r=confirmResolve;confirmResolve=null;r?.(false);});
window.addEventListener('hashchange',()=>{const v=location.hash.slice(1)||'home';if(v!==view){view=v;selectedHistory=null;render();}});
window.addEventListener('online',()=>{render();});window.addEventListener('offline',()=>{render();});
window.addEventListener('beforeunload',e=>{if(pendingSaves||saveError){e.preventDefault();e.returnValue='';}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(view==='settings')render();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){updateTimers();syncWake();}});
channel?.addEventListener('message',async()=>{if(readOnly){state=await loadState();render();}});
async function setupOffline(){if(!('serviceWorker'in navigator)||!isSecureContext)return;try{const reg=await navigator.serviceWorker.register('./sw.js');if(reg.waiting){pendingUpdate=reg.waiting;render();}reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){pendingUpdate=worker;render();}});});await navigator.serviceWorker.ready;offlineReady=true;render();let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(pendingUpdate&&!refreshing){refreshing=true;location.reload();}});}catch(error){console.warn('Offline cache unavailable',error);toast('离线缓存暂未就绪，请联网后重新打开');}}
async function boot(){try{await openStore();if(navigator.locks){await new Promise(resolve=>{navigator.locks.request('liftlog-writer',{ifAvailable:true},async lock=>{readOnly=!lock;resolve();if(lock)await new Promise(()=>{});}).catch(()=>resolve());});}const saved=await loadState();state=saved?parseBackup(saved):initialState();if(saved?.active?.rest&&state.active){const r=saved.active.rest;if(Number.isFinite(r.endAt)&&Number.isFinite(r.total))state.active.rest=clone(r);}if(!saved&&!readOnly)await persist();render();setupOffline();syncWake();setInterval(updateTimers,1000);}catch(error){console.error(error);root.innerHTML=`<div class="fatal"><h1>暂时无法打开本地记录</h1><p>请确认没有禁用网站存储，并使用 Safari 的普通浏览模式。为保护现有记录，应用不会自动清空数据。</p><p>${esc(error.message)}</p><button id="retry" class="button primary">重新尝试</button></div>`;document.querySelector('#retry').onclick=()=>location.reload();}}
function moveItem(items, index, direction) {
  const target=index+direction;
  if(index<0||target<0||index>=items.length||target>=items.length)return;
  [items[index],items[target]]=[items[target],items[index]];
}
function moveButtons(action,index,length) {
  return `<button type="button" class="order-button" data-action="${action}" data-index="${index}" data-direction="-1" aria-label="上移动作${index+1}" ${index===0?'disabled':''}>↑</button><button type="button" class="order-button" data-action="${action}" data-index="${index}" data-direction="1" aria-label="下移动作${index+1}" ${index===length-1?'disabled':''}>↓</button>`;
}
function showOrderModal() {
  showModal('调整动作顺序',`<p class="subtle">使用箭头调整先后顺序；重量、次数和完成状态会一起保留。</p><ol class="order-list">${orderDraft.map((id,i)=>`<li><span class="order-number">${i+1}</span><strong>${esc(findExercise(id)?.name)}</strong><div>${moveButtons('order-move',i,orderDraft.length)}</div></li>`).join('')}</ol><div class="modal-actions">${button('close-modal','取消','','button secondary')}${button('order-save','保存顺序','','button primary')}</div>`);
}
function sessionDashboard(s) {
  const p=progress(s);
  return `<section class="session-dashboard"><div class="progress-card"><div class="progress-top"><div><span class="eyebrow">本次训练进度</span><strong>${p.percent}<small>%</small></strong></div><span>${p.done} / ${p.total} 组</span></div><div class="training-progress" role="progressbar" aria-label="整体训练进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-valuetext="已完成 ${p.done} 组，共 ${p.total} 组"><i style="width:${p.percent}%"></i></div><div class="training-tools">${button('pause-session',s.pausedAt!=null?'继续计时':'暂停训练','clock','text-button')}${button('reorder-exercises','调整顺序','plans','text-button',s.exercises.length<2?'disabled':'')}</div>${s.pausedAt!=null?'<p class="pause-notice" role="status">训练已暂停 · 时长、休息和能耗计时已冻结</p>':''}</div>${energyCard(s,true)}</section>`;
}
function energyCard(s, live) {
  const energy=estimateEnergy(s), p=s.energyProfile;
  const missing=!p?'请先填写年龄、体重和训练强度。':p.age<19||p.age>59?'当前模型适用于 19–59 岁，暂不生成此年龄的能耗估算。':'此记录没有可用的能耗参数。';
  return `<section class="energy-card ${live?'':'energy-history'}"><div class="energy-heading"><span>${icon('bolt')}活动消耗 · 估算</span>${live?button('edit-profile',p?'调整参数':'设置参数','','text-button','data-current="true"'):''}</div><div class="energy-number"><strong ${live?'data-energy-active':''}>${energy?fmt(energy.active):'—'}</strong><span>kcal</span></div><p>${energy?`含静息总消耗约 <b ${live?'data-energy-total':''}>${fmt(energy.total)}</b> kcal · ${p.met} MET`:(live?missing:p?'年龄超出此估算模型范围':'旧记录未留存参数，不回填估算')}</p><small>${energy?`${fmt(p.weightKg)} kg · ${p.age} 岁 · ${live?'普通组间休息计入，长时间离开请暂停':'使用本次训练留存的参数'}`:'仅供训练趋势参考，不是实际测量'}</small></section>`;
}
function profilePanel() {
  const p=state.settings.profile;
  return `<section class="panel settings-panel profile-panel"><h2>${icon('bolt')}身体参数与能耗</h2><p class="profile-summary">${p?`${p.age} 岁 · ${fmt(p.weightKg)} kg · ${p.met} MET`:'尚未设置身体参数'}</p><p class="subtle">参数仅保存在本机。每场训练单独留存，后续修改不会改写旧记录。</p>${button('edit-profile',p?'修改身体参数':'设置身体参数','edit','button secondary wide-gap')}<details class="energy-method"><summary>计算依据与适用范围</summary><p>采用 2024 Adult Compendium：常规多动作力量训练（02054）3.5 MET；高强度举铁（02050）6 MET。默认建议选常规，不因重量大就自动切换高强度。</p><p>总消耗 ≈ MET × 体重 kg × 训练小时；活动消耗 ≈ (MET − 1) × 体重 kg × 训练小时。普通组间休息包含在整段粗估中，手动暂停时间排除。长休息较多时可能高估。</p><p>年龄用于检查 19–59 岁适用范围；标准 MET 公式没有年龄、性别或身高系数，不添加缺乏依据的修正。没有读取心率，也未额外加算所谓“后燃”。不要据此精确补吃热量。</p><p><a href="https://pacompendium.com/" target="_blank" rel="noopener noreferrer">2024 体力活动汇编与 MET 定义 ↗</a><br><a href="https://pacompendium.com/conditioning-exercise/" target="_blank" rel="noopener noreferrer">力量训练的活动分类 ↗</a></p></details></section>`;
}
function profileModal(useCurrent=false) {
  const p=(useCurrent&&state.active?.energyProfile)||state.settings.profile;
  showModal('身体参数与训练强度',`<form id="profile-form"><div class="form-two"><label class="field">年龄（岁）<input name="age" type="number" inputmode="numeric" min="1" max="120" step="1" required value="${p?.age??''}" placeholder="填写周岁"></label><label class="field">体重（kg）<input name="weight" type="number" inputmode="decimal" min="20" max="350" step="0.1" required value="${p?.weightKg??''}" placeholder="注意单位 kg"></label></div><label class="field">训练强度<select name="met">${INTENSITIES.map(i=>`<option value="${i.met}" ${(p?.met??3.5)===i.met?'selected':''}>${i.label}（${i.met} MET）</option>`).join('')}</select></label><p class="subtle">此粗估模型适用于 19–59 岁。年龄用于判断适用范围，体重、强度和时长参与计算。参数只保存在当前设备。</p>${state.active?`<label class="apply-current"><input type="checkbox" name="current" ${useCurrent||!state.active.energyProfile?'checked':''}>同时用于当前训练（按本次全部时长重算）</label>`:''}<div class="modal-actions">${button('close-modal','取消','','button secondary','type="button"')}<button type="submit" class="button primary">保存参数</button></div></form>`);
  document.querySelector('#profile-form').onsubmit=async event=>{
    event.preventDefault();if(readOnly)return;
    const f=new FormData(event.currentTarget), p={age:Number(f.get('age')),weightKg:Number(f.get('weight')),met:Number(f.get('met'))};
    if(!Number.isInteger(p.age)||p.age<1||p.age>120||!Number.isFinite(p.weightKg)||p.weightKg<20||p.weightKg>350||!INTENSITIES.some(i=>i.met===p.met)){toast('请检查年龄、体重与强度');return;}
    state.settings.profile=p;
    if(state.active&&f.get('current'))state.active.energyProfile={...p,method:ENERGY_METHOD};
    const saved=await persist();modal.close();render();if(saved)toast('参数已保存；已结束的历史记录保持不变');
  };
}
function historyManagement(filtered) {
  if(!state.history.length)return '';
  return `<div class="history-management">${button('manage-history',historyManage?'退出管理':'管理记录','edit','text-button')}${historyManage?`<span>已选择 ${historySelection.size} 条</span>${button('select-visible-history','选择筛选结果','','text-button',filtered.length?'':'disabled')}${button('delete-selected-history','删除所选','trash','button danger-fill small',historySelection.size?'':'disabled')}`:`<span>显示 ${filtered.length} 条 · 点击垃圾桶删除</span>`}</div>`;
}
async function handleNewAction(action,el) {
  if(action==='edit-profile'){profileModal(el.dataset.current==='true');return true;}
  if(action==='pause-session'){togglePause(state.active);await persist();render();return true;}
  if(action==='reorder-exercises'){orderDraft=state.active.exercises.map(e=>e.id);showOrderModal();return true;}
  if(action==='order-move'){moveItem(orderDraft,Number(el.dataset.index),Number(el.dataset.direction));showOrderModal();return true;}
  if(action==='order-save'){state.active.exercises=orderDraft.map(findExercise);await persist();modal.close();render();toast('本次动作顺序已保存；计划模板不变');return true;}
  if(action==='manage-history'){historyManage=!historyManage;historySelection.clear();render();return true;}
  if(action==='select-visible-history'){document.querySelectorAll('[data-history-id]').forEach(input=>historySelection.add(input.dataset.historyId));render();return true;}
  if(action==='delete-selected-history'){
    const ids=new Set(historySelection);
    if(ids.size&&await ask(`删除选中的 ${ids.size} 条训练？`,'删除后无法直接撤销。请先导出备份；未选中的记录与当前训练不受影响。','删除所选',true)){
      state.history=state.history.filter(h=>!ids.has(h.id));historySelection.clear();await persist();render();
    }return true;
  }
  if(action==='edit-history'){historyEditing=!historyEditing;render();return true;}
  if(action==='trim-set'||action==='trim-exercise'){
    const original=state.history.find(h=>h.id===selectedHistory);if(!original)return true;
    const next=clone(original);
    if(action==='trim-exercise')next.exercises=next.exercises.filter(e=>e.id!==el.dataset.id);
    else {const ex=next.exercises.find(e=>e.id===el.dataset.ex);if(!ex)return true;ex.sets=ex.sets.filter(s=>s.id!==el.dataset.id);next.exercises=next.exercises.filter(e=>e.sets.length);}
    const removeWhole=!next.exercises.some(hasCompleted);
    const message=removeWhole?'删减后没有已完成组，整条训练记录也将删除。此操作无法直接撤销，建议先导出备份。':'只删除此历史记录中的对应内容，不影响计划和当前训练。此操作无法直接撤销。';
    if(await ask(removeWhole?'删除最后的完成组？':'删减这条历史记录？',message,removeWhole?'删除整条记录':'确认删减',true)){
      if(removeWhole){state.history=state.history.filter(h=>h.id!==original.id);historySelection.delete(original.id);selectedHistory=null;historyEditing=false;}
      else state.history[state.history.findIndex(h=>h.id===original.id)]=next;
      await persist();render();
    }return true;
  }
  return false;
}
function personalLibrary() {
  const known=new Set(EXERCISES.map(e=>e.name)), names=[...new Set([...state.history.flatMap(h=>h.exercises),...(state.active?.exercises||[])].filter(hasCompleted).map(e=>e.name.trim()))].filter(n=>!known.has(n));
  return names.map((name,i)=>({id:`personal-${i}`,name,english:'我的已完成动作',equipment:recentExercise(state.history,name,state.active)?.mode==='bodyweight'?'bodyweight':'other',primary:[],secondary:[],parts:[],level:'个人记录'}));
}
function loadText(s,mode='weight') { return `${mode==='bodyweight'?'自重':`${mode==='assisted'?'辅助 ':''}${fmt(s.weight)} kg`} × ${s.reps} 次`; }
function libraryLast(name) {
  const e=recentExercise(state.history,name,state.active);if(!e)return '尚无记录 · 默认 4 组，可自由修改';
  const parts=e.sets.flatMap(completedParts), weights=parts.map(p=>p.weight);
  const current=state.active?.exercises.some(e=>e.name.trim()===name&&hasCompleted(e));
  return `${current?'本次已完成':'最近完成'} ${e.sets.length} 组 · ${e.mode==='bodyweight'?'自重':`${e.mode==='assisted'?'辅助 ':''}${fmt(Math.min(...weights))}${Math.min(...weights)!==Math.max(...weights)?`–${fmt(Math.max(...weights))}`:''} kg`} · 添加时带入逐组数据`;
}
function trainingSet(e,s,index) {
  const row=(p,sub=null)=>{
    const label=`${e.name}第${index+1}组${sub!=null?`子组${sub+1}`:''}`, extra=sub!=null?`data-segment="${sub}"`:'';
    return `<div class="set-row ${p.done?'done':''}" data-set="${s.id}"><span class="set-index">${index+1}${sub!=null?'.'+(sub+1):''}</span>${e.mode==='bodyweight'?'<span class="bodyweight-value">自重</span>':`<input aria-label="${esc(label)}重量" inputmode="decimal" type="number" min="0" max="2000" step="any" value="${p.weight}" data-field="weight" data-ex="${e.id}" data-setid="${s.id}" ${extra}>`}<input aria-label="${esc(label)}次数" inputmode="numeric" type="number" min="1" max="999" value="${p.reps}" data-field="reps" data-ex="${e.id}" data-setid="${s.id}" ${extra}><button class="set-check" data-action="toggle-set" data-ex="${e.id}" data-id="${s.id}" ${extra} aria-label="${p.done?'取消完成':'完成'}${esc(label)}" aria-pressed="${p.done}">${icon('check')}</button>${sub==null?button('remove-set','','close','remove-set',`data-ex="${e.id}" data-id="${s.id}" aria-label="删除${esc(label)}"`):'<span></span>'}</div>`;
  };
  if(!s.segments)return row(s);
  return `<section class="complex-set"><div class="complex-heading"><span>第 ${index+1} 组 · ${SET_KINDS[s.kind]}</span><div>${button('toggle-set',setComplete(s)?'取消整组':'完成整组','','text-button',`data-ex="${e.id}" data-id="${s.id}"`)}${button('remove-set','','close','icon-button muted',`data-ex="${e.id}" data-id="${s.id}" aria-label="删除${esc(e.name)}第${index+1}组"`)}</div></div>${s.segments.map((p,i)=>row(p,i)).join('')}</section>`;
}
function readWorkoutEditor() {
  const form=modal.querySelector('form[data-workout-editor]');if(!form)return;
  workoutDraft.name=form.elements.name.value.trim();
  if(form.elements.position)workoutContext.position=Number(form.elements.position.value);
  form.querySelectorAll('[data-draft-field]').forEach(el=>{
    const s=workoutDraft.sets[Number(el.dataset.groupIndex)];
    const p=el.dataset.partIndex!=null?s.segments[Number(el.dataset.partIndex)]:s;
    p[el.dataset.draftField]=num(el.value,el.dataset.draftField==='reps'?1:0,el.dataset.draftField==='reps'?999:2000);
    if(el.dataset.draftField==='reps')p.reps=Math.round(p.reps);
  });
  workoutDraft.sets.forEach(s=>{if(s.segments){s.weight=s.segments[0].weight;s.reps=s.segments[0].reps;s.done=setComplete(s);}});
}
function editorSet(s,i) {
  const input=(p,j=null)=>`<div class="editor-part"><span>${j==null?'参数':`子组 ${j+1}`}</span><label class="field">${workoutDraft.mode==='assisted'?'辅助重量':'重量'} (kg)<input data-draft-field="weight" data-group-index="${i}" ${j==null?'':`data-part-index="${j}"`} aria-label="第${i+1}组${j==null?'':`子组${j+1}`}重量" type="number" inputmode="decimal" step="any" min="0" max="2000" required value="${workoutDraft.mode==='bodyweight'?0:p.weight}" ${workoutDraft.mode==='bodyweight'?'disabled':''}></label><label class="field">次数<input data-draft-field="reps" data-group-index="${i}" ${j==null?'':`data-part-index="${j}"`} aria-label="第${i+1}组${j==null?'':`子组${j+1}`}次数" type="number" inputmode="numeric" min="1" max="999" required value="${p.reps}"></label></div>`;
  return `<section class="editor-set"><div class="editor-set-heading"><strong>第 ${i+1} 组</strong><select data-kind-index="${i}" aria-label="第${i+1}组类型">${Object.entries(SET_KINDS).map(([v,n])=>`<option value="${v}" ${(s.kind||'normal')===v?'selected':''}>${n}</option>`).join('')}</select>${button('draft-remove-set','','close','icon-button',`type="button" data-index="${i}" aria-label="移除第${i+1}组" ${workoutDraft.sets.length<=1?'disabled':''}`)}</div>${s.segments?`<div class="segment-generator"><label class="field">基数 kg<input data-base="${i}" type="number" min="0" max="2000" step="any" value="${s.weight}"></label><label class="field">${s.kind==='descending'?'递减':s.kind==='ascending'?'递增':'变化'} kg<input data-step="${i}" type="number" min="0" max="2000" step="any" value="${s.segments.length>1?Math.abs(s.segments[1].weight-s.weight):5}"></label><label class="field">子组数<input data-count="${i}" type="number" min="1" max="8" value="${s.segments.length}"></label>${button('draft-generate','生成子组','','button secondary',`type="button" data-index="${i}"`)}</div><p class="builder-hint">可按基数与变化值生成，也可在下方逐项自定义；重新生成会清除本组完成状态。</p>${s.segments.map((p,j)=>input(p,j)).join('')}`:input(s)}${completedParts(s).length?'<small class="completed-hint">含已完成记录，修改会更新本次记录</small>':''}</section>`;
}
function refreshWorkoutFields() {
  const form=modal.querySelector('form[data-workout-editor]');if(!form)return;
  const d=workoutDraft;form.elements.mode.value=d.mode||'weight';form.elements.sets.value=d.sets.length;
  form.elements.reps.value=d.sets[0]?.reps||10;form.elements.weight.value=d.sets[0]?.weight||0;form.elements.weight.disabled=d.mode==='bodyweight';
  form.querySelector('.draft-history-hint').textContent=libraryLast(d.name);
  form.querySelector('.editor-sets').innerHTML=d.sets.map(editorSet).join('');
}
function showWorkoutEditor() {
  const d=workoutDraft, c=workoutContext, adding=c.type==='add';
  showModal(adding?'添加训练动作':'逐组与重量设置',`<form id="${adding?'add-exercise-form':'workout-editor-form'}" data-workout-editor>
    <label class="field">动作名称<input name="name" maxlength="120" required value="${esc(d.name)}" placeholder="完整名称匹配最近记录" ${c.type==='session'?'readonly':''}></label>
    ${adding?button('library-session','从动作库选择','plans','button secondary library-entry','type="button"'):''}
    <p class="draft-history-hint">${libraryLast(d.name)}</p>
    <label class="field">重量类型<select name="mode" id="workout-mode">${Object.entries(LOAD_MODES).map(([v,n])=>`<option value="${v}" ${(d.mode||'weight')===v?'selected':''}>${n}</option>`).join('')}</select></label>
    <p class="builder-hint">自重只记录次数；辅助重量越小不代表表现越差。自重、辅助重量不计入负重容量。</p>
    <div class="editor-bulk"><label class="field">组数<input name="sets" aria-label="动作组数" type="number" min="1" max="50" value="${d.sets.length}"></label><label class="field">统一次数<input name="reps" type="number" min="1" max="999" value="${d.sets[0]?.reps||10}"></label><label class="field">统一重量 kg<input name="weight" type="number" min="0" max="2000" step="any" value="${d.sets[0]?.weight||0}" ${d.mode==='bodyweight'?'disabled':''}></label></div>
    ${button('draft-apply','应用为统一普通组','','button secondary','type="button"')}<p class="builder-hint">组数修改立即生效；“应用”会覆盖逐组参数和完成状态。下方可分别编辑每组。</p>
    <div class="editor-sets">${d.sets.map(editorSet).join('')}</div>${button('draft-add-set','增加一组','plus','button secondary','type="button"')}
    ${adding?`<label class="field insert-position">插入位置<select name="position" aria-label="插入位置"><option value="${state.active.exercises.length}" ${c.position===state.active.exercises.length?'selected':''}>放在最后</option>${state.active.exercises.map((e,i)=>`<option value="${i}" ${c.position===i?'selected':''}>放在 ${i+1}. ${esc(e.name)} 之前</option>`).join('')}</select></label>`:''}
    <div class="modal-actions">${button('draft-cancel','取消','','button secondary','type="button"')}<button type="submit" class="button primary">${adding?'添加动作':'保存设置'}</button></div></form>`,'workout-modal');
  modal.querySelector('form').onsubmit=async event=>{
    event.preventDefault();if(readOnly)return;readWorkoutEditor();if(!workoutDraft.name)return;
    if(c.type==='template'){templateDraft.exercises[c.index]={...templateExercise(workoutDraft),id:templateDraft.exercises[c.index].id};showTemplateForm();return;}
    if(!state.active)return;
    if(adding){if(state.active.exercises.length>=50){toast('每场训练最多 50 个动作');return;}state.active.exercises.splice(c.position,0,clone(workoutDraft));}
    else {const i=state.active.exercises.findIndex(e=>e.id===workoutDraft.id);if(i<0)return;state.active.exercises[i]=clone(workoutDraft);}
    if(state.active.rest&&!state.active.exercises.some(e=>e.sets.some(s=>s.id===state.active.rest.sourceSetId&&setComplete(s))))state.active.rest=null;
    await persist();modal.close();render();
  };
}
async function handleWorkoutAction(a,el) {
  if(a==='session-move'){const index=Number(el.dataset.index), id=state.active.exercises[index]?.id;moveItem(state.active.exercises,index,Number(el.dataset.direction));await persist();render();document.querySelector(`[data-exercise="${id}"]`)?.scrollIntoView({block:'start',behavior:'smooth'});return true;}
  if(a==='edit-workout'){workoutDraft=clone(findExercise(el.dataset.id));workoutContext={type:'session'};showWorkoutEditor();return true;}
  if(a==='builder-details'){readDraft();const index=Number(el.dataset.index), e=templateDraft.exercises[index];workoutDraft={id:e.id,name:e.name,mode:e.mode||'weight',sets:(e.setPlan||Array.from({length:e.sets},()=>({weight:e.weight,reps:e.reps}))).map(s=>freshSet(s,e.mode))};workoutContext={type:'template',index};showWorkoutEditor();return true;}
  if(a==='draft-cancel'){if(workoutContext.type==='template')showTemplateForm();else modal.close();return true;}
  if(a==='draft-add-set'){readWorkoutEditor();if(workoutDraft.sets.length>=50){toast('每个动作最多 50 组');return true;}workoutDraft.sets.push(freshSet(workoutDraft.sets.at(-1),workoutDraft.mode));showWorkoutEditor();return true;}
  if(a==='draft-remove-set'){readWorkoutEditor();const i=Number(el.dataset.index);if(completedParts(workoutDraft.sets[i]).length&&!confirm('此组包含已完成记录，仍要从编辑草稿中移除吗？'))return true;workoutDraft.sets.splice(i,1);showWorkoutEditor();return true;}
  if(a==='draft-apply'){readWorkoutEditor();const f=modal.querySelector('form').elements;if(workoutDraft.sets.some(s=>completedParts(s).length)&&!confirm('统一应用会清除这些组的完成状态，继续吗？'))return true;workoutDraft.sets=Array.from({length:Math.round(num(f.sets.value,1,50))},()=>freshSet({weight:num(f.weight.value,0,2000),reps:Math.round(num(f.reps.value,1,999))},workoutDraft.mode));showWorkoutEditor();return true;}
  if(a==='draft-generate'){readWorkoutEditor();const i=Number(el.dataset.index), s=workoutDraft.sets[i];if(completedParts(s).length&&!confirm('重新生成会清除本组完成状态，继续吗？'))return true;s.segments=generateSegments(s.kind,workoutDraft.mode==='bodyweight'?0:num(modal.querySelector(`[data-base="${i}"]`).value,0,2000),workoutDraft.mode==='bodyweight'?0:num(modal.querySelector(`[data-step="${i}"]`).value,0,2000),Number(modal.querySelector(`[data-count="${i}"]`).value),s.reps);s.weight=s.segments[0].weight;s.done=false;showWorkoutEditor();return true;}
  if(a==='exercise-trend'){showExerciseTrend(el.dataset.name,el.dataset.mode);return true;}
  if(a==='history-to-plan'){showHistoryPlanModal();return true;}
  return false;
}
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.id==='trend-name'){showExerciseTrend(el.value);return;}
  if(el.id==='trend-mode'){showExerciseTrend(trendName,el.value);return;}
  if(readOnly||!el.closest('form[data-workout-editor]'))return;
  const previousName=workoutDraft?.name;
  readWorkoutEditor();
  if(el.name==='name'&&workoutContext.type!=='session'&&workoutDraft.name!==previousName){
    const name=workoutDraft.name, catalog=EXERCISES.find(e=>e.name===name);
    workoutDraft=exerciseDraft(name,state.history,state.active,catalog?.equipment==='bodyweight'?'bodyweight':'weight');refreshWorkoutFields();
    if(recentExercise(state.history,name,state.active))toast('已带入同名动作最近完成的逐组数据');
  } else if(el.name==='mode') {
    if(workoutDraft.sets.some(s=>completedParts(s).length)&&!confirm('改变重量类型会清除本动作的完成状态，继续吗？')){el.value=workoutDraft.mode||'weight';return;}
    workoutDraft.mode=el.value;workoutDraft.sets=workoutDraft.sets.map(s=>freshSet(s,el.value));showWorkoutEditor();
  } else if(el.name==='sets') {
    const count=Math.round(num(el.value,1,50));if(workoutDraft.sets.slice(count).some(s=>completedParts(s).length)&&!confirm('减少组数会移除已完成组，继续吗？')){el.value=workoutDraft.sets.length;return;}
    workoutDraft.sets=Array.from({length:count},(_,i)=>workoutDraft.sets[i]||freshSet(workoutDraft.sets.at(-1),workoutDraft.mode));refreshWorkoutFields();
  } else if(el.dataset.kindIndex!=null) {
    const s=workoutDraft.sets[Number(el.dataset.kindIndex)];if(completedParts(s).length&&!confirm('改变组类型会清除本组完成状态，继续吗？')){el.value=s.kind||'normal';return;}
    s.kind=el.value;s.done=false;if(s.kind==='normal')delete s.segments;else s.segments=generateSegments(s.kind,s.weight,workoutDraft.mode==='bodyweight'?0:5,3,s.reps);showWorkoutEditor();
  }
});
function showHistoryPlanModal() {
  const h=state.history.find(h=>h.id===selectedHistory);if(!h)return;
  showModal('将这次训练保存为计划',`<form id="history-plan-form"><p class="subtle">保留动作顺序、已完成组 / 子组、重量、次数与重量类型。未完成部分不会加入计划。</p><label class="field">保存方式<select name="target" aria-label="计划保存方式"><option value="">新建训练计划</option>${state.templates.map(t=>`<option value="${esc(t.id)}">覆盖：${esc(t.name)}</option>`).join('')}</select></label><label class="field">新计划名称<input name="name" required maxlength="120" value="${esc(h.name)}"></label><p class="builder-hint">覆盖会保留目标计划的名称和分类，只替换动作与备注；历史记录不变。</p><div class="modal-actions">${button('close-modal','取消','','button secondary','type="button"')}<button class="button primary" type="submit">保存计划</button></div></form>`);
  const form=modal.querySelector('form');form.elements.target.onchange=()=>{form.elements.name.disabled=Boolean(form.elements.target.value);};
  form.onsubmit=async event=>{
    event.preventDefault();if(readOnly)return;const id=form.elements.target.value, name=form.elements.name.value.trim();const draft=sessionToTemplate(h);
    if(id){const index=state.templates.findIndex(t=>t.id===id);if(index<0)return;const old=state.templates[index];if(!await ask('覆盖这个训练计划？',`将替换“${old.name}”的动作与备注。已有历史不会改变。`,'确认覆盖',true))return;state.templates[index]={...draft,id:old.id,name:old.name,group:old.group};}
    else {if(state.templates.length>=100){toast('最多支持 100 个计划');return;}if(!name)return;state.templates.push({...draft,name});}
    const saved=await persist();modal.close();render();if(saved)toast(id?'计划已覆盖，历史记录未改变':'已保存为新的训练计划');
  };
}
function trendChart(points,bodyweight) {
  const values=points.map(p=>bodyweight?p.reps:p.average), max=Math.max(1,...values), min=Math.min(0,...values), width=Math.max(240,Math.min(560,window.innerWidth-90)),height=220;
  const x=i=>points.length===1?width/2:52+i*(width-78)/(points.length-1), y=v=>height-36-(v-min)/(max-min)*(height-62);
  return `<svg class="weight-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="最近${points.length}次${bodyweight?'完成次数':'平均重量'}趋势"><title>${esc(trendName)}训练趋势</title>${[0,.5,1].map(t=>{const v=max*t;return `<path d="M52 ${y(v)}H${width-20}" class="chart-grid"/><text x="44" y="${y(v)+4}" text-anchor="end">${fmt(v)}</text>`;}).join('')}<polyline points="${points.map((p,i)=>`${x(i)},${y(values[i])}`).join(' ')}" class="trend-line"/>${points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(values[i])}" r="4" class="trend-point"><title>${localDate(p.date)} · ${fmt(values[i])}${bodyweight?' 次':' kg'}</title></circle>`).join('')}<text x="52" y="211">${localDate(points[0].date).slice(5)}</text><text x="${width-20}" y="211" text-anchor="end">${localDate(points.at(-1).date).slice(5)}</text></svg>`;
}
function showExerciseTrend(name,mode) {
  const names=[...new Set(state.history.flatMap(h=>h.exercises.filter(hasCompleted).map(e=>e.name.trim())))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  trendName=name??(names.includes(trendName)?trendName:names[0])??'';
  const modes=[...new Set(state.history.flatMap(h=>h.exercises.filter(e=>e.name.trim()===trendName&&hasCompleted(e)).map(e=>e.mode||'weight')))];
  trendMode=modes.includes(mode)?mode:modes[0]||'weight';
  const points=exerciseTrend(state.history,trendName,trendMode).slice(-30), bodyweight=trendMode==='bodyweight';
  showModal('动作训练趋势',`<div class="form-two"><label class="field">已完成动作<select id="trend-name">${[...new Set([...names,trendName])].filter(Boolean).map(n=>`<option ${n===trendName?'selected':''}>${esc(n)}</option>`).join('')||'<option>暂无已完成动作</option>'}</select></label><label class="field">重量类型<select id="trend-mode">${(modes.length?modes:['weight']).map(m=>`<option value="${m}" ${m===trendMode?'selected':''}>${LOAD_MODES[m]}</option>`).join('')}</select></label></div>
    <p class="trend-method">${bodyweight?'自重动作显示每次训练的已完成总次数，不将体重虚构为负重。':`仅计算已完成部分：每组等权平均；有子组时先取该组已完成子组的平均重量，再对各组求平均。${trendMode==='assisted'?'这里是辅助重量，减少辅助通常意味着难度增加。':''}`}</p>
    ${points.length?`<section class="trend-chart-panel"><div class="section-heading"><span>${bodyweight?'最近完成次数':'最近平均重量'}</span><strong>${fmt(bodyweight?points.at(-1).reps:points.at(-1).average)} ${bodyweight?'次':'kg'}</strong></div>${trendChart(points,bodyweight)}<p class="builder-hint">最近 ${points.length} 次记录（最多 30 次）· 仅比较同名、同重量类型动作；器械、单侧 / 双侧口径需保持一致。</p></section><div class="trend-records">${[...points].reverse().map(p=>`<details class="trend-record"><summary><span>${dateLabel(p.date)}<small>${esc(p.name)} · ${p.sets} 组含已完成部分</small></span><strong>${fmt(bodyweight?p.reps:p.average)} ${bodyweight?'次':'kg'}</strong></summary>${p.details.map((s,i)=>`<div class="trend-set-detail"><span>第 ${i+1} 组 · ${SET_KINDS[s.kind||'normal']}</span><strong>${completedParts(s).map(part=>loadText(part,trendMode)).join(' → ')}</strong></div>`).join('')}</details>`).join('')}</div>`:empty('还没有这个动作的完成记录','完成并保存训练后，这里会显示重量趋势和逐组明细。')}`,'trend-modal');
}
boot();
