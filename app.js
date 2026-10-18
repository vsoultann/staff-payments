'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- i18n ---------- */
const T={en:{dash:'Dashboard',emp:'Employees',pay:'Payroll',tix:'Tickets',set:'Settings',slip:'Payslips',payroll:'Total monthly payroll',head:'Headcount',pend:'Open tickets',run:'Payroll run',upc:'Upcoming leave-salary eligibility',signout:'Sign out',service:'Service',leavebal:'Leave balance',leaveok:'Leave salary',grat:'Gratuity today',new:'New',add:'Add employee',save:'Save',cancel:'Cancel',search:'Search…',net:'Net',name:'Name',join:'Joining',pos:'Position',wd:'Work days',wps:'WPS salary',allow:'Allowances',petrol:'Petrol',ls:'Leave salary',leaveDays:'Leave days',eos:'End of service',ded:'Deductions',reason:'Deduction reason',total:'Total',export:'Export CSV',print:'Print / PDF',draft:'Draft',checked:'Checked',approved:'Approved',paid:'Paid',title:'Title',desc:'Description',type:'Type',priority:'Priority',status:'Status',comments:'Comments',post:'Post',lang:'Language',theme:'Dark mode',rules:'Rule thresholds',audit:'Audit log',reset:'Reset demo data',years:'y',months:'m',eligFrom:'Eligible from',yes:'Eligible',no:'Not eligible',login:'Sign in as',enter:'Enter',prepared:'Prepared by',checkedBy:'Checked by',mgr:'Manager'},
ar:{dash:'لوحة التحكم',emp:'الموظفون',pay:'الرواتب',tix:'التذاكر',set:'الإعدادات',slip:'قسائم الراتب',payroll:'إجمالي الرواتب الشهرية',head:'عدد الموظفين',pend:'تذاكر مفتوحة',run:'مسير الرواتب',upc:'استحقاق بدل الإجازة القادم',signout:'خروج',service:'مدة الخدمة',leavebal:'رصيد الإجازة',leaveok:'بدل الإجازة',grat:'مكافأة نهاية الخدمة',new:'جديد',add:'إضافة موظف',save:'حفظ',cancel:'إلغاء',search:'بحث…',net:'الصافي',name:'الاسم',join:'تاريخ الالتحاق',pos:'المسمى',wd:'أيام العمل',wps:'الراتب الأساسي',allow:'البدلات',petrol:'البنزين',ls:'بدل الإجازة',leaveDays:'أيام الإجازة',eos:'نهاية الخدمة',ded:'الخصومات',reason:'سبب الخصم',total:'الإجمالي',export:'تصدير CSV',print:'طباعة / PDF',draft:'مسودة',checked:'تمت المراجعة',approved:'معتمد',paid:'مدفوع',title:'العنوان',desc:'الوصف',type:'النوع',priority:'الأولوية',status:'الحالة',comments:'التعليقات',post:'نشر',lang:'اللغة',theme:'الوضع الداكن',rules:'حدود القواعد',audit:'سجل التدقيق',reset:'إعادة البيانات',years:'سنة',months:'شهر',eligFrom:'مستحق من',yes:'مستحق',no:'غير مستحق',login:'الدخول كـ',enter:'دخول',prepared:'أعدّه',checkedBy:'راجعه',mgr:'المدير'}};
const L=()=>S.ui.lang,t=k=>T[L()][k]||T.en[k]||k;
/* ---------- state ---------- */
const SEED=[[1,'Abdulla Khalifa AlKaabi',null,'Chairman',null,8000,1000,1],[2,'Ali Khalifa AlKaabi',null,'Vice Chairman',null,10000,0,1],[3,'Seyf Eddine Belhammadi','2013-07-02','Manager',5000,10000,500],[4,'Darin Younes Hamad','2015-07-20','Customer Services',3000,500,0],[5,'Fahad Awad Al Ali','2023-08-20','Accountant',4000,0,400],[6,'Mohammed Ekramul Hoque Nur','2003-02-01','Public Relations Officer',2500,0,500],[7,'Moamen Magdy Keshtta','2024-02-05','Civil Engineer',4000,1000,500],[9,'Ahcene Ourad','2021-02-01','Building Architect',5000,5000,500],[10,'Musthafa','2021-04-26','Office Boy',1600,0,0],[11,'Almayasa Abdulla Alkaabi','2025-10-13','ICT Operation Technician',6000,0,0],[12,'Mohammed Osman Ali','2025-12-03','Civil Engineer',4000,4000,500],[13,'Seloua Kebaili','2026-04-26','Building Architect',3000,0,0],[14,'Amna AlKaabi','2026-06-23','Archives Clerk',6000,0,0]];
const fresh=()=>({v:1,emps:SEED.map(([si,n,j,p,w,a,pt,ex])=>({id:si,si,name:n,join:j,pos:p,wps:w,allow:a,petrol:pt,exec:!!ex,status:'active',leaveUsed:0,email:'',phone:''})),runs:{},tix:[],audit:[],cfg:{leaveMonths:10,gratMonths:12,accrualMonths:6,asOf:''},ui:{lang:'en',theme:'light'},user:null});
let S;try{S=JSON.parse(localStorage.getItem('sp.v1'))||fresh()}catch{S=fresh()}
const save=()=>{try{localStorage.setItem('sp.v1',JSON.stringify(S))}catch{}};
const log=(what,from,to)=>{S.audit.unshift({at:new Date().toISOString(),who:S.user?.name||'-',what,from,to});S.audit.length=Math.min(S.audit.length,200)};
/* ---------- business rules ---------- */
const today=()=>S.cfg.asOf?new Date(S.cfg.asOf+'T00:00:00'):new Date(new Date().toDateString());
const D=s=>new Date(s+'T00:00:00'),iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};
const addM=(s,n)=>{const d=D(s),day=d.getDate();d.setMonth(d.getMonth()+n);if(d.getDate()!==day)d.setDate(0);return d};
const monthsBetween=(a,b)=>{let m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();if(b.getDate()<a.getDate())m--;return Math.max(0,m)};
const fmtD=d=>d.toLocaleDateString(L()==='ar'?'ar-AE':'en-GB',{day:'2-digit',month:'short',year:'numeric'});
const aed=n=>'AED '+(+n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const dim=k=>{const[y,m]=k.split('-').map(Number);return new Date(y,m,0).getDate()};
const monthEnd=k=>{const[y,m]=k.split('-').map(Number);return new Date(y,m,0)};
function elig(e,ref=today()){
  if(e.exec||!e.join)return{exec:true,months:0,leave:false,grat:false,bal:0,gratAmt:0,from:null};
  const m=monthsBetween(D(e.join),ref),from=addM(e.join,S.cfg.leaveMonths);
  const ya=Math.floor(m/12);let acc=0;if(m>=12)acc=ya*30+Math.floor((m%12)*2.5);else if(m>=S.cfg.accrualMonths)acc=m*2;
  const bal=Math.max(0,acc-(e.leaveUsed||0));
  const gratOk=m>=S.cfg.gratMonths&&e.status==='terminated';
  return{months:m,leave:m>=S.cfg.leaveMonths,from,bal,grat:gratOk,gratAmt:gratuity(e,m),exec:false,gratMonths:m>=S.cfg.gratMonths};
}
function gratuity(e,m){if(!e.wps||m<S.cfg.gratMonths)return 0;const yrs=m/12,d=Math.min(yrs,5)*21+Math.max(0,yrs-5)*30;return Math.min(e.wps/30*d,e.wps*24)}
const svc=m=>`${Math.floor(m/12)} ${t('years')} ${m%12} ${t('months')}`;
const num=v=>{const x=+v;return isFinite(x)&&x>=0&&Math.round(x*100)===x*100};
function validEmp(f,id){const er={};
  if(!/^[\p{L} ]{2,80}$/u.test(f.name.trim()))er.name='Letters/spaces only, 2–80 chars';
  else if(S.emps.some(e=>e.id!==id&&e.name.toLowerCase()===f.name.trim().toLowerCase()))er.name='Duplicate name';
  if(!f.exec){const w=+f.wps;if(!(w>0&&w<=100000))er.wps='Required, 1–100,000';
    if(!f.join)er.join='Required';else if(D(f.join)>new Date()||D(f.join)<D('1990-01-01'))er.join='Between 1990 and today'}
  if(!num(f.allow))er.allow='≥ 0, max 2 decimals';if(!num(f.petrol))er.petrol='≥ 0, max 2 decimals';return er}
/* payroll */
const runOf=k=>S.runs[k]||(S.runs[k]={status:'draft',by:{},lines:{}});
function line(k,e){const r=runOf(k);return r.lines[e.id]||(r.lines[e.id]={wd:dim(k),leaveDays:0,ded:0,reason:''})}
function calc(k,e){const l=line(k,e),d=dim(k),er={};
  const basic=e.exec||!e.wps?0:e.wps*l.wd/d,el=elig(e,monthEnd(k));
  let ls=0,eos=0;
  if(l.leaveDays>0){if(!el.leave)er.leaveDays=`${t('eligFrom')} ${el.from?fmtD(el.from):'-'}`;else if(l.leaveDays>el.bal)er.leaveDays=`Max ${el.bal}`;else ls=(e.wps/30)*l.leaveDays}
  if(e.status==='terminated'&&el.gratMonths)eos=el.gratAmt;
  if(!Number.isInteger(+l.wd)||l.wd<0||l.wd>d)er.wd=`0–${d}`;
  if(e.join&&D(e.join)>monthEnd(k)&&(ls||eos))er.leaveDays='Before joining';
  const gross=basic+e.allow+e.petrol+ls+eos;
  if(!num(l.ded))er.ded='≥ 0, 2 decimals';else if(l.ded>gross)er.ded='Exceeds gross';else if(l.ded>0&&!l.reason.trim())er.reason='Reason required';
  const net=gross-(er.ded?0:+l.ded||0);return{l,basic,ls,eos,net,er}}
const ROLES={admin:'Admin',accounts:'Accounts',checker:'Checker',manager:'Manager',employee:'Employee'};
const FLOW=['draft','checked','approved','paid'],STEPROLE={checked:['checker','admin'],approved:['manager','admin'],paid:['accounts','admin']};
/* ---------- tickets ---------- */
const TT=[['leave','Leave request','manager'],['leavesal','Leave salary request','accounts'],['advance','Salary advance','accounts'],['correction','Salary correction','accounts'],['eos','End of service / resignation','manager'],['doc','Document request','accounts'],['petrol','Petrol/allowance claim','accounts'],['it','IT/office issue','admin'],['other','Other','admin']];
const TS=['open','progress','waiting','approved','rejected','closed'],TSC={open:'--ac',progress:'--warn',waiting:'--tx2',approved:'--ok',rejected:'--bad',closed:'--tx2'};
const TSL={open:'Open',progress:'In progress',waiting:'Waiting on employee',approved:'Approved',rejected:'Rejected',closed:'Closed'};
/* ---------- ui helpers ---------- */
function toast(m,bad){const d=document.createElement('div');d.className='toast glass';if(bad)d.style.color='var(--bad)';d.textContent=m;$('#toasts').append(d);setTimeout(()=>{d.className='toast glass out';setTimeout(()=>d.remove(),260)},2600)}
function roll(el,txt){ // only changed characters animate
  const old=el.dataset.v||'';if(old===txt&&el.firstChild)return;el.dataset.v=txt;el.classList.add('num');
  const a=[...txt],b=[...old];el.innerHTML=a.map((c,i)=>{const j=i-a.length+b.length;return`<i${b[j]!==c&&old?' class="ch"':''}>${c===' '?'&nbsp;':esc(c)}</i>`}).join('')}
const N=(v,id)=>`<span class="rn" data-v="" data-t="${esc(v)}"></span>`;
const rolls=r=>$$('.rn',r).forEach(e=>roll(e,e.dataset.t));
const pill=(txt,c)=>`<span class="pill" style="--c:var(${c})">${esc(txt)}</span>`;
const go=h=>{location.hash=h};
function sheet(html){const bg=document.createElement('div');bg.className='sheetbg';bg.innerHTML=`<div class="sheet glass in">${html}</div>`;bg.onclick=e=>{if(e.target===bg)close()};const close=()=>{bg.firstChild.className='sheet glass out';setTimeout(()=>bg.remove(),240)};document.body.append(bg);bg.close=close;return bg}
function ferr(inp,msg){inp.classList.add('err');let m=inp.nextElementSibling;if(!m||!m.classList.contains('errm')){m=document.createElement('div');m.className='errm';inp.after(m)}m.textContent=msg}
const fclear=r=>{$$('.err',r).forEach(e=>e.classList.remove('err'));$$('.errm',r).forEach(e=>e.remove())};
/* ---------- shell ---------- */
const NAV=[['dash','◉'],['emp','👥'],['pay','💳'],['tix','🎫'],['set','⚙︎']];
const navFor=()=>S.user.role==='employee'?[['slip','🧾'],['tix','🎫']]:NAV;
function applyUI(){document.documentElement.dataset.theme=S.ui.theme;document.documentElement.lang=L();document.documentElement.dir=L()==='ar'?'rtl':'ltr'}
function login(){applyUI();$('#app').innerHTML=`<div class="login"><div class="card in"><div class="lock">🔒</div><h2 style="margin:8px 0">Al Hosn Engineering Consultants</h2><p class="mut">Abu Dhabi Branch — Staff Payments</p>
<label>${t('login')}</label><select id="role">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
<div id="empsel" hidden><label>${t('emp')}</label><select id="who">${S.emps.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select></div>
<p style="margin-top:16px"><button class="btn" id="go">${t('enter')}</button></p><p class="mut" style="font-size:12px;margin-top:12px">Demo build — data is stored in this browser only.</p></div></div>`;
 $('#role').onchange=e=>$('#empsel').hidden=e.target.value!=='employee';
 $('#go').onclick=()=>{const r=$('#role').value;S.user={role:r,name:r==='checker'?'Amna AlKaabi':r==='employee'?S.emps.find(e=>e.id==$('#who').value).name:ROLES[r],emp:r==='employee'?+$('#who').value:null};save();boot()}}
function boot(){if(!S.user)return login();applyUI();
 const items=navFor();
 $('#app').innerHTML=`<div class="shell"><aside class="side glass"><h1>AL HOSN<small>Staff Payments</small></h1><div id="sn">${items.map(([k,i])=>`<button class="nav" data-k="${k}"><span>${i} ${t(k)}</span></button>`).join('')}</div><div style="flex:1"></div><div class="mut" style="padding:0 10px;font-size:12px">${esc(S.user.name)}</div><button class="nav" id="so"><span>${t('signout')}</span></button></aside>
 <main><div class="top glass" id="top"><h2 id="ttl"></h2><span class="sp"></span><button class="btn g" id="lg">${L()==='en'?'عربي':'EN'}</button></div><div id="view"></div></main></div>
 <nav class="tabbar glass">${items.map(([k,i])=>`<button class="nav" data-k="${k}"><span>${i}<br>${t(k)}</span></button>`).join('')}</nav>`;
 $$('.nav[data-k]').forEach(b=>b.onclick=()=>go(b.dataset.k));
 $('#so').onclick=()=>{S.user=null;save();login()};
 $('#lg').onclick=()=>{S.ui.lang=L()==='en'?'ar':'en';save();boot()};
 addEventListener('scroll',()=>$('#top')?.classList.toggle('sm',scrollY>40),{passive:true});
 route(true)}
let cur='';
function route(first){if(!S.user)return;const items=navFor(),h=(location.hash.slice(1)||items[0][0]).split('/'),k=h[0];
 const key=items.find(x=>x[0]===k)?k:items[0][0];
 $$('.nav[data-k]').forEach(b=>{b.classList.toggle('on',b.dataset.k===key);$$('.ind',b).forEach(x=>x.remove());if(b.dataset.k===key&&b.closest('.side'))b.insertAdjacentHTML('afterbegin','<i class="ind in"></i>')});
 $('#ttl').textContent=t(key);const v=$('#view');
 const draw=()=>{v.innerHTML='<div class="in" id="pg"></div>';$('#pg').innerHTML=({dash,emp,pay,tix,set,slip})[key](h[1]);rolls(v);bind(key,h[1]);cur=key};
 if(first||cur===key){draw();return}
 v.firstChild&&(v.firstChild.className='out');setTimeout(draw,160)}
addEventListener('hashchange',()=>route());
/* ---------- screens ---------- */
function stat(l,v){return`<div class="card stat"><small>${l}</small><b>${v}</b></div>`}
function dash(){const k=iso(today()).slice(0,7),tot=S.emps.filter(e=>e.status!=='terminated').reduce((s,e)=>s+calc(k,e).net,0);
 const up=S.emps.map(e=>({e,el:elig(e)})).filter(x=>!x.el.exec&&!x.el.leave).sort((a,b)=>a.el.from-b.el.from);
 const open=S.tix.filter(x=>!['closed','rejected','approved'].includes(x.status)).length,r=S.runs[k];
 const hist=[...Array(6)].map((_,i)=>{const d=new Date(today().getFullYear(),today().getMonth()-5+i,1);const kk=iso(d).slice(0,7);return[kk,S.emps.reduce((s,e)=>s+calc(kk,e).net,0)]});const mx=Math.max(...hist.map(h=>h[1]),1);
 return`<div class="grid">${stat(t('payroll'),`<span class="rn" data-t="${aed(tot)}"></span>`)}${stat(t('head'),`<span class="rn" data-t="${S.emps.length}"></span>`)}${stat(t('pend'),`<span class="rn" data-t="${open}"></span>`)}${stat(t('run')+' '+k,pill(t(r?.status||'draft'),'--ac'))}</div>
 <div class="card"><b>6-month payroll</b><div class="chart" style="margin-top:10px">${hist.map(h=>`<i title="${h[0]}: ${aed(h[1])}" style="height:${h[1]/mx*100}%"></i>`).join('')}</div></div>
 <div class="card"><b>${t('upc')}</b>${up.length?up.map(x=>`<div class="row" onclick="go('emp/${x.e.id}')"><span class="av">${esc(x.e.name[0])}</span><div style="flex:1">${esc(x.e.name)}<br><small class="mut">${esc(x.e.pos)}</small></div>${pill(fmtD(x.el.from),'--warn')}</div>`).join(''):'<p class="mut">—</p>'}</div>`}
function emp(id){if(id)return empDetail(+id);
 return`<div class="card"><div style="display:flex;gap:10px"><input id="q" placeholder="${t('search')}"><button class="btn" id="add">${t('add')}</button></div><div id="el" style="margin-top:8px">${empList('')}</div></div>`}
function empList(q){return S.emps.filter(e=>(e.name+e.pos).toLowerCase().includes(q.toLowerCase())).map(e=>{const el=elig(e);return`<div class="row" onclick="go('emp/${e.id}')"><span class="av">${esc(e.name[0])}</span><div style="flex:1;min-width:0">${esc(e.name)}<br><small class="mut">#${e.si} · ${esc(e.pos)}</small></div>${e.status!=='active'?pill(e.status,'--warn'):''}<span class="hm mut">${e.exec?'NIL':aed(e.wps)}</span>${el.exec?pill('Exec','--ac'):pill(el.leave?t('yes'):t('no'),el.leave?'--ok':'--warn')}</div>`}).join('')}
function empDetail(id){const e=S.emps.find(x=>x.id===id);if(!e)return'<p>Not found</p>';const el=elig(e);
 const hist=Object.keys(S.runs).sort().reverse().filter(k=>S.runs[k].lines[e.id]).map(k=>`<div class="row" style="cursor:default"><span style="flex:1">${k}</span><b>${aed(calc(k,e).net)}</b></div>`).join('');
 return`<p><button class="btn g" onclick="go('emp')">← ${t('emp')}</button></p><div class="card"><div style="display:flex;gap:12px;align-items:center"><span class="av">${esc(e.name[0])}</span><div style="flex:1"><b>${esc(e.name)}</b><br><span class="mut">#${e.si} · ${esc(e.pos)}</span></div><button class="btn g" id="edit">Edit</button></div></div>
 <div class="card"><div class="elig">${el.exec?'<div>Executive — WPS, leave salary and gratuity checks skipped</div>':`
 <div><small class="mut">${t('service')}</small><br><b>${svc(el.months)}</b></div><div><small class="mut">${t('leavebal')}</small><br><b>${el.bal} d</b></div>
 <div><small class="mut">${t('leaveok')}</small><br>${el.leave?pill('✓ '+t('yes'),'--ok'):pill('✗ '+t('eligFrom')+' '+fmtD(el.from),'--warn')}</div>
 <div><small class="mut">${t('grat')}</small><br>${el.grat?pill('✓','--ok'):pill('✗ (status≠terminated or <12m)','--tx2')}<br><b>${aed(el.gratAmt)}</b></div>`}</div></div>
 <div class="card"><b>History</b>${hist||'<p class="mut">—</p>'}</div>`}
function empForm(e){const f=e||{name:'',join:'',pos:'',wps:'',allow:0,petrol:0,exec:false,status:'active'};
 const s=sheet(`<h3>${e?'Edit':t('add')}</h3><form id="ef"><label>${t('name')}</label><input name="name" value="${esc(f.name)}"><label>${t('pos')}</label><input name="pos" value="${esc(f.pos)}">
 <label>${t('join')}</label><input type="date" name="join" value="${f.join||''}"><label>${t('wps')}</label><input name="wps" inputmode="decimal" value="${f.wps??''}"><label>${t('allow')}</label><input name="allow" value="${f.allow}"><label>${t('petrol')}</label><input name="petrol" value="${f.petrol}">
 <label>${t('status')}</label><select name="status">${['active','on leave','terminated'].map(x=>`<option ${f.status===x?'selected':''}>${x}</option>`).join('')}</select>
 <label><input type="checkbox" name="exec" ${f.exec?'checked':''} style="width:auto;min-height:0"> Executive (no WPS)</label>
 <p style="margin-top:14px;display:flex;gap:8px"><button class="btn" type="submit">${t('save')}</button><button type="button" class="btn g" id="cx">${t('cancel')}</button></p></form>`);
 $('#cx',s).onclick=s.close;$('#ef',s).onsubmit=ev=>{ev.preventDefault();const fm=ev.target,g=n=>fm[n].value,x={name:g('name'),pos:g('pos').trim(),join:g('join')||null,wps:g('wps')===''?null:+g('wps'),allow:+g('allow'),petrol:+g('petrol'),status:g('status'),exec:fm.exec.checked};
  fclear(fm);const er=validEmp({...x,allow:g('allow'),petrol:g('petrol')},e?.id);if(Object.keys(er).length){Object.entries(er).forEach(([k,m])=>ferr(fm[k],m));return}
  if(e){log('Employee '+e.name,JSON.stringify({wps:e.wps,status:e.status}),JSON.stringify({wps:x.wps,status:x.status}));Object.assign(e,x,{name:x.name.trim()})}
  else{const si=Math.max(...S.emps.map(q=>q.si))+1;S.emps.push({id:si,si,leaveUsed:0,email:'',phone:'',...x,name:x.name.trim()});log('Added employee '+x.name,'','')}
  save();s.close();toast('Saved');route(true)}}
function pay(){const k=window.PM||iso(today()).slice(0,7),r=runOf(k),ro=r.status!=='draft',canEdit=!ro&&['admin','accounts'].includes(S.user.role),idx=FLOW.indexOf(r.status),nx=FLOW[idx+1];
 const rows=S.emps.filter(e=>!(e.join&&D(e.join)>monthEnd(k))).map(e=>{const c=calc(k,e),l=c.l,i=(f,v,ty='')=>`<input data-e="${e.id}" data-f="${f}" value="${esc(v)}" ${canEdit&&!(f==='ded'||f==='reason')||canEdit?'':'disabled'} inputmode="decimal" class="${c.er[f]?'err':''}" title="${esc(c.er[f]||'')}">`;
  return`<tr data-r="${e.id}"><td>${e.si}</td><td>${esc(e.name)}</td><td class="hm">${e.join||'NIL'}</td><td class="hm">${esc(e.pos)}</td><td>${i('wd',l.wd)}</td><td>${e.exec?'NIL':e.wps}</td><td>${e.allow}</td><td>${e.petrol}</td>
  <td>${e.exec?'—':i('leaveDays',l.leaveDays)}<small class="mut"> =${aed(c.ls)}</small></td><td>${aed(c.eos)}</td><td>${i('ded',l.ded)}${i('reason',l.reason)}</td><td><b class="rn" data-t="${aed(c.net)}"></b></td></tr>`}).join('');
 const tot=S.emps.reduce((s,e)=>s+calc(k,e).net,0);
 return`<div class="card" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center"><input type="month" id="pm" value="${k}" style="width:auto">${pill(t(r.status),'--ac')}<span style="flex:1"></span>
 ${nx&&STEPROLE[nx].includes(S.user.role)?`<button class="btn" id="adv">→ ${t(nx)}</button>`:nx?`<button class="btn" disabled title="Requires: ${STEPROLE[nx].join(' / ')}">→ ${t(nx)}</button>`:''}<button class="btn g" id="csv">${t('export')}</button><button class="btn g" onclick="print()">${t('print')}</button></div>
 <div class="card tbl"><table><thead><tr><th>SI</th><th>${t('name')}</th><th class="hm">${t('join')}</th><th class="hm">${t('pos')}</th><th>${t('wd')}</th><th>${t('wps')}</th><th>${t('allow')}</th><th>${t('petrol')}</th><th>${t('leaveDays')} / ${t('ls')}</th><th>${t('eos')}</th><th>${t('ded')} / ${t('reason')}</th><th>${t('net')}</th></tr></thead><tbody>${rows}</tbody>
 <tfoot><tr><td colspan="11">${t('total')}</td><td><b class="rn" id="tot" data-t="${aed(tot)}"></b></td></tr></tfoot></table>
 <p class="mut" style="margin-top:14px">${t('prepared')}: ACCOUNTS ${r.by.prepared?'✓':''} &nbsp;|&nbsp; ${t('checkedBy')}: Amna AlKaabi ${r.by.checked?'✓ '+r.by.checked:''} &nbsp;|&nbsp; ${t('mgr')}: ${r.by.approved?'✓ '+r.by.approved:'__________'}</p></div>
 ${ro?'<p class="mut">Approved/paid runs are read-only — raise a Salary correction ticket for adjustments.</p>':''}`}
function slip(){const e=S.emps.find(x=>x.id===S.user.emp);if(!e)return'';const ks=Object.keys(S.runs).filter(k=>['approved','paid'].includes(S.runs[k].status)).sort().reverse();
 return ks.length?ks.map(k=>{const c=calc(k,e);return`<div class="card"><b>${k}</b><div class="row" style="cursor:default"><span style="flex:1">Basic (${c.l.wd}d)</span>${aed(c.basic)}</div><div class="row" style="cursor:default"><span style="flex:1">${t('allow')} + ${t('petrol')}</span>${aed(e.allow+e.petrol)}</div><div class="row" style="cursor:default"><span style="flex:1">${t('ls')} / ${t('eos')}</span>${aed(c.ls+c.eos)}</div><div class="row" style="cursor:default"><span style="flex:1">${t('ded')}</span>−${aed(c.l.ded)}</div><div class="row" style="cursor:default"><b style="flex:1">${t('net')}</b><b>${aed(c.net)}</b></div><button class="btn g noprint" onclick="print()">${t('print')}</button></div>`}).join(''):'<div class="card mut">No approved payslips yet.</div>'}
function tix(id){if(id)return tixDetail(+id);
 const mine=S.tix.filter(x=>S.user.role!=='employee'||x.by===S.user.name);
 return`<div class="card" style="display:flex;gap:10px;flex-wrap:wrap"><input id="tq" placeholder="${t('search')}" style="flex:1"><button class="btn" id="nt">+ ${t('new')}</button></div>
 <div class="kan">${TS.map(s=>`<div><b>${TSL[s]}</b> <small class="mut">${mine.filter(x=>x.status===s).length}</small>${mine.filter(x=>x.status===s).map(tk=>`<div class="tk in" onclick="go('tix/${tk.id}')"><b>TKT-${String(tk.id).padStart(4,'0')}</b> ${over(tk)?pill('Overdue','--bad'):''}<br>${esc(tk.title)}<br><small class="mut">${esc(tk.emp)} · ${tk.pri}</small></div>`).join('')}</div>`).join('')}</div>`}
const over=tk=>tk.due&&!['approved','rejected','closed'].includes(tk.status)&&D(tk.due)<today();
function tixDetail(id){const tk=S.tix.find(x=>x.id===id);if(!tk)return'';const staff=S.user.role!=='employee';
 return`<p><button class="btn g" onclick="go('tix')">← ${t('tix')}</button></p><div class="card"><b>TKT-${String(tk.id).padStart(4,'0')}</b> ${pill(TSL[tk.status],TSC[tk.status])}<h3 style="margin:6px 0">${esc(tk.title)}</h3><p>${esc(tk.desc)}</p><p class="mut">${TT.find(x=>x[0]===tk.type)[1]} · ${esc(tk.emp)} · ${tk.pri} · → ${ROLES[tk.assign]}</p>
 ${staff?`<label>${t('status')}</label><select id="st">${TS.map(s=>`<option value="${s}" ${s===tk.status?'selected':''}>${TSL[s]}</option>`).join('')}</select>`:''}</div>
 <div class="card"><b>${t('comments')}</b>${tk.log.map(c=>`<div class="row in" style="cursor:default"><div><small class="mut">${esc(c.who)} · ${new Date(c.at).toLocaleString()}</small><br>${esc(c.text)}</div></div>`).join('')}<div style="display:flex;gap:8px;margin-top:10px"><input id="cm"><button class="btn" id="cp">${t('post')}</button></div></div>`}
function ntForm(){const emps=S.user.role==='employee'?S.emps.filter(e=>e.id===S.user.emp):S.emps;
 const s=sheet(`<h3>${t('new')}</h3><form id="nf"><label>${t('type')}</label><select name="type">${TT.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select><label>${t('emp')}</label><select name="emp">${emps.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select>
 <label>${t('title')}</label><input name="title"><label>${t('desc')}</label><textarea name="desc" rows="3"></textarea><label>${t('priority')}</label><select name="pri">${['low','normal','high','urgent'].map(x=>`<option ${x==='normal'?'selected':''}>${x}</option>`).join('')}</select>
 <p style="margin-top:14px;display:flex;gap:8px"><button class="btn" type="submit">${t('save')}</button><button type="button" class="btn g" id="cx">${t('cancel')}</button></p></form>`);
 $('#cx',s).onclick=s.close;$('#nf',s).onsubmit=ev=>{ev.preventDefault();const f=ev.target;fclear(f);const e=S.emps.find(x=>x.id==f.emp.value),el=elig(e);
  if(f.title.value.trim().length<3)return ferr(f.title,'Title required (3+ chars)');
  if(f.type.value==='leavesal'){if(e.exec)return ferr(f.type,'Executives are not eligible');if(!el.leave)return ferr(f.type,`${t('eligFrom')} ${fmtD(el.from)}`)}
  if(f.type.value==='eos'&&!el.gratMonths&&!e.exec)ferr(f.type,'Note: gratuity not payable before 12 months');
  const ty=TT.find(x=>x[0]===f.type.value),id=Math.max(0,...S.tix.map(x=>x.id))+1,due=new Date(today());due.setDate(due.getDate()+5);
  S.tix.push({id,type:ty[0],title:f.title.value.trim(),desc:f.desc.value,emp:e.name,empId:e.id,by:S.user.name,assign:ty[2],pri:f.pri.value,status:'open',due:iso(due),log:[{who:S.user.name,at:new Date().toISOString(),text:'Ticket created'}]});log('Ticket '+id,'','created');save();s.close();toast('Ticket created');route(true)}}
function set(){const c=S.cfg;return`<div class="card"><b>${t('lang')}</b><div class="seg" style="margin:8px 0;display:flex"><button class="${L()==='en'?'on':''}" data-l="en">English</button><button class="${L()==='ar'?'on':''}" data-l="ar">العربية</button></div>
 <div class="row" style="cursor:default"><span style="flex:1">${t('theme')}</span><button class="sw ${S.ui.theme==='dark'?'on':''}" id="dk" role="switch" aria-checked="${S.ui.theme==='dark'}" aria-label="${t('theme')}"></button></div></div>
 <div class="card"><b>${t('rules')}</b><label>Leave-salary threshold (months)</label><input data-c="leaveMonths" value="${c.leaveMonths}"><label>Gratuity threshold (months)</label><input data-c="gratMonths" value="${c.gratMonths}"><label>Leave accrual starts (months)</label><input data-c="accrualMonths" value="${c.accrualMonths}"><label>Evaluate as of (blank = today)</label><input type="date" data-c="asOf" value="${c.asOf}"></div>
 <div class="card"><b>${t('audit')}</b>${S.audit.slice(0,30).map(a=>`<div class="row" style="cursor:default"><div><small class="mut">${new Date(a.at).toLocaleString()} · ${esc(a.who)}</small><br>${esc(a.what)} ${a.from?esc(a.from)+' → '+esc(a.to):esc(a.to)}</div></div>`).join('')||'<p class="mut">—</p>'}</div>
 <button class="btn r" id="rs">${t('reset')}</button>`}
/* ---------- bindings ---------- */
function updRow(k,id){const e=S.emps.find(x=>x.id==id),c=calc(k,e),tr=$(`tr[data-r="${id}"]`);
 $$('input',tr).forEach(i=>{const er=c.er[i.dataset.f];i.classList.toggle('err',!!er);i.title=er||''});
 const rn=$('.rn',tr);rn.dataset.t=aed(c.net);roll(rn,rn.dataset.t);$('small',tr)&&($('small',tr).textContent=' ='+aed(c.ls));
 const tot=$('#tot');tot.dataset.t=aed(S.emps.reduce((s,e)=>s+calc(k,e).net,0));roll(tot,tot.dataset.t)}
function bind(key,arg){
 if(key==='emp'){if($('#q'))$('#q').oninput=e=>{$('#el').innerHTML=empList(e.target.value)};$('#add')&&($('#add').onclick=()=>empForm());$('#edit')&&($('#edit').onclick=()=>empForm(S.emps.find(e=>e.id==arg)))}
 if(key==='pay'){const k=$('#pm').value;$('#pm').onchange=e=>{if(e.target.value){window.PM=e.target.value;route(true)}};
  $$('input[data-e]').forEach(i=>i.oninput=()=>{const e=S.emps.find(x=>x.id==i.dataset.e),l=line(k,e),f=i.dataset.f;l[f]=f==='reason'?i.value:(i.value===''?0:+i.value);if(f!=='reason'&&isNaN(l[f]))l[f]=-1;save();updRow(k,e.id)});
  $('#adv')&&($('#adv').onclick=()=>{const r=runOf(k);if(r.status==='draft'){const bad=S.emps.filter(e=>Object.keys(calc(k,e).er).length);if(bad.length)return toast('Fix errors first: '+bad.map(e=>e.name).join(', '),1);r.by.prepared=S.user.name}
   const nx=FLOW[FLOW.indexOf(r.status)+1];r.by[nx]=S.user.name;log('Payroll '+k,r.status,nx);r.status=nx;save();toast('Payroll '+nx);route(true)});
  $('#csv').onclick=()=>{const rows=[['SI','Name','Joining','Position','Work days','WPS','Allowances','Petrol','Leave salary','End of service','Deductions','Net']].concat(S.emps.map(e=>{const c=calc(k,e);return[e.si,e.name,e.join||'NIL',e.pos,c.l.wd,e.wps??'NIL',e.allow,e.petrol,c.ls.toFixed(2),c.eos.toFixed(2),c.l.ded,c.net.toFixed(2)]}));
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv'}));a.download=`payroll-${k}.csv`;a.click()}}
 if(key==='tix'){$('#nt')&&($('#nt').onclick=ntForm);
  $('#tq')&&($('#tq').oninput=e=>$$('.tk').forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
  $('#st')&&($('#st').onchange=e=>{const tk=S.tix.find(x=>x.id==arg);log('Ticket '+tk.id,tk.status,e.target.value);tk.status=e.target.value;tk.log.push({who:S.user.name,at:new Date().toISOString(),text:'Status → '+TSL[tk.status]});
   if(tk.status==='approved'&&['leavesal','correction','eos'].includes(tk.type)){const k=iso(today()).slice(0,7),r=runOf(k);if(r.status==='draft'){const l=line(k,S.emps.find(x=>x.id===tk.empId));if(tk.type==='leavesal'){l.leaveDays=Math.max(l.leaveDays,1)}toast('Added to draft payroll '+k)}}
   save();route(true)});
  $('#cp')&&($('#cp').onclick=()=>{const v=$('#cm').value.trim();if(!v)return;S.tix.find(x=>x.id==arg).log.push({who:S.user.name,at:new Date().toISOString(),text:v});save();route(true)})}
 if(key==='set'){$$('[data-l]').forEach(b=>b.onclick=()=>{S.ui.lang=b.dataset.l;save();boot()});$('#dk').onclick=()=>{S.ui.theme=S.ui.theme==='dark'?'light':'dark';save();applyUI();$('#dk').classList.toggle('on');$('#dk').setAttribute('aria-checked',S.ui.theme==='dark')};
  $$('[data-c]').forEach(i=>i.onchange=()=>{const k=i.dataset.c,v=k==='asOf'?i.value:+i.value;if(k!=='asOf'&&!(v>=0&&v<=120))return ferr(i,'0–120');S.cfg[k]=v;log('Setting '+k,'',v);save();toast('Saved')});
  $('#rs').onclick=()=>{if(confirm('Reset all demo data?')){const u=S.user,ui=S.ui;S=fresh();S.user=u;S.ui=ui;save();route(true)}}}}
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
boot();
