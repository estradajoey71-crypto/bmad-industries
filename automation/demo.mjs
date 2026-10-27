// Synthetic demonstration only. No network or customer files.
export const sample = [
  {id:'INV-104',date:'2026-10-01',customer:'Sample Studio',amount:'$120.00'},
  {id:'INV-105',date:'2026-10-02',customer:'Example Workshop',amount:'85.50'},
  {id:'INV-104',date:'2026-10-01',customer:'Sample Studio',amount:'$125.00'},
  {id:'INV-106',date:'2026-10-03',customer:'Demo Supplies',amount:'1,200.00'},
  {id:'INV-107',date:'2026-10-04',customer:'Sample Studio',amount:'unknown'},
  {id:'',date:'2026-10-05',customer:'Example Workshop',amount:'42.00'}
];
export function clean(rows) {
  const kept = new Map(), exceptions=[];
  rows.forEach((r,i)=>{
    const raw=String(r.amount).trim().replace(/^\$/, '').replace(/,/g,'');
    const match=raw.match(/^(\d{1,10})(?:\.(\d{1,2}))?$/);
    const cents=match ? Number(match[1])*100+Number((match[2]||'').padEnd(2,'0')) : null;
    const reason=!String(r.id||'').trim() ? 'Missing invoice ID' : cents===null ? 'Invalid amount' : null;
    if(reason) {exceptions.push({row:i+1,id:r.id,reason});return;}
    if(kept.has(r.id)) exceptions.push({row:kept.get(r.id).row,id:r.id,reason:'Duplicate ID; later sample row kept'});
    kept.set(r.id,{...r,amount:(cents/100).toFixed(2),cents,row:i+1});
  });
  const records=[...kept.values()];
  return {records,exceptions,totalCents:records.reduce((s,r)=>s+r.cents,0)};
}
export function csv(headers, rows) {
  const escape=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  return [headers,...rows.map(r=>headers.map(h=>r[h]))].map(r=>r.map(escape).join(',')).join('\r\n')+'\r\n';
}
