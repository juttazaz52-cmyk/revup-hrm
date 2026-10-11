const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});const g=await b.newPage();await g.setViewport({width:1366,height:850});
const U='http://localhost:3100',errs=[],log=(...a)=>console.log(...a);g.on('pageerror',e=>errs.push('JS '+e));g.on('response',r=>{if(r.status()>=500)errs.push(r.status()+' '+r.url())});
const s=async n=>g.screenshot({path:'screenshots/'+n+'.png',fullPage:true});const nav=f=>Promise.all([g.waitForNavigation(),f()]);
const login=async(u,pw)=>{await g.goto(U+'/logout');await g.type('[name=username]',u);await g.type('[name=password]',pw);await nav(()=>g.click('button'));log('login',u,'->',g.url())};
const status=async path=>(await g.goto(U+path)).status();const txt=()=>g.evaluate(()=>document.body.innerText);
const leave=async(type,a,z,reason,half)=>{await g.goto(U+'/requests');await g.select('[name=leave_type_id]',String(type));await g.$eval('[name=start_date]',(e,v)=>e.value=v,a);await g.$eval('[name=end_date]',(e,v)=>e.value=v,z);if(half)await g.click('[name=half_day]');await g.type('[name=reason]',reason);await nav(()=>g.click('form[action="/requests/leave"] button'))};
const decide=async(name,dec,comment)=>{const ok=await g.evaluate((n,d,c)=>{const tr=[...document.querySelectorAll('tr')].find(t=>t.innerText.includes(n)&&t.querySelector('form[action^="/approvals/"]'));if(!tr)return false;tr.querySelector('[name=comment]').value=c;tr.querySelector(`button[value=${d}]`).click();return true},name,dec,comment);if(ok)await g.waitForNavigation();return ok};
await g.goto(U+'/login');await s('01-login');
// EMPLOYEE
await login('ali','Agent@2026');await s('20-employee-portal');
await leave(1,'2026-10-13','2026-10-14','Family wedding');await leave(4,'2026-10-15','2026-10-15','Personal work');
await leave(1,'2026-10-13','2026-10-13','dup');log('overlap blocked:',(await txt()).includes('overlapping'));
await g.$eval('[name=date]',e=>e.value='2026-10-10');await g.type('[name=hours]','3');await g.type('form[action="/requests/overtime"] [name=reason]','Campaign backlog');await nav(()=>g.click('form[action="/requests/overtime"] button'));
await s('21-employee-requests-pending');
log('employee /payroll',await status('/payroll'),'/employees',await status('/employees'),'/approvals',await status('/approvals'),'own payslip',await status('/payslips/1'),'other payslip',await status('/payslips/3'));
await login('hira','Agent@2026');await leave(2,'2026-10-16','2026-10-16','Fever',true);
// TEAM LEAD
await login('bilal','Lead@2026');await s('22-teamlead-portal');await g.goto(U+'/approvals');await s('23-teamlead-approvals');
log('TL inbox has Ali x3?',(await txt()).split('Ali Raza').length-1);
await decide('Hira Malik','reject','Please submit medical certificate');while(await decide('Ali Raza','approve','OK from team side'));
await g.goto(U+'/employees');const t=await txt();log('TL team view has Sana?',t.includes('Sana Khan'),'has Hira?',t.includes('Hira Malik'));await s('24-teamlead-team');
log('TL /employees/2 (not team)',await status('/employees/2'),'/employees/1',await status('/employees/1'),'/payroll',await status('/payroll'),'/hiring',await status('/hiring'));
await g.goto(U+'/attendance?date=2026-10-09');log('TL attendance rows:',await g.$$eval('select[name^=s_]',x=>x.length));await s('25-teamlead-attendance');
// HR MANAGER
await login('manager','Manager@2026');await g.goto(U+'/approvals');await s('26-hr-approvals');while(await decide('Ali Raza','approve','Approved by HR'));
log('manager /payroll',await status('/payroll'));
// verify attendance
await g.goto(U+'/attendance/grid?month=2026-10');await s('15-attendance-grid');
// EMPLOYEE sees result
await login('ali','Agent@2026');await g.goto(U+'/requests');await s('27-employee-requests-decided');log('ali approved count:',((await txt()).match(/Approved\b/g)||[]).length);
await login('hira','Agent@2026');await g.goto(U+'/requests');log('hira sees rejection comment:',(await txt()).includes('medical certificate'));
// ADMIN
await login('admin','RevUp@2026');await g.goto(U+'/payroll');await g.$eval('[name=month]',e=>e.value='2026-10');await nav(()=>g.click('form button'));await s('10-payroll-run');
const pid=await g.evaluate(()=>{const tr=[...document.querySelectorAll('tr')].find(t=>t.innerText.includes('Ali Raza'));return tr.querySelector('a[href^="/payslips/"]').getAttribute('href')});await g.goto(U+pid);await s('11-payslip-ali');log('ali payslip:',(await txt()).match(/Unpaid absence.*\n?.*|Overtime.*/g));
await g.goto(U+'/employees/5');await g.type('form[action="/employees/5/login"] [name=username]','usman');await g.type('form[action="/employees/5/login"] [name=password]','Agent@2026');await nav(()=>g.click('form[action="/employees/5/login"] button'));await g.goto(U+'/employees/1');await s('28-admin-employee-profile');
await g.goto(U+'/');await s('02-dashboard');await g.goto(U+'/settings');await s('12-settings');await g.goto(U+'/approvals');await s('29-admin-approvals');
for(const [n,pth] of [['03-employees','/employees'],['05-hiring','/hiring'],['07-training','/training'],['09-payroll','/payroll'],['14-attendance-daily','/attendance?date=2026-10-09']]){await g.goto(U+pth);await s(n)}
await login('usman','Agent@2026');log('usman portal ok:',(await txt()).includes('Welcome, Usman'));
log('errors',errs);await b.close()})();
