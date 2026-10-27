import {sample,clean,csv} from './demo.mjs';
const $=s=>document.querySelector(s);
function download(name,text,type='text/plain') { const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000); }
if($('#run-demo')) {
  $('#demo-input').textContent=csv(['id','date','customer','amount'],sample);
  $('#run-demo').addEventListener('click',()=>{
    const result=clean(sample);
    $('#demo-output').textContent=csv(['id','date','customer','amount'],result.records);
    $('#demo-exceptions').textContent=result.exceptions.map(x=>`Row ${x.row}: ${x.reason}`).join('\n');
    $('#demo-status').textContent=`${sample.length} input rows → ${result.records.length} retained rows. ${result.exceptions.length} exceptions recorded. Sample total: $${(result.totalCents/100).toFixed(2)}.`;
    $('#download-demo').disabled=false;$('#download-exceptions').disabled=false;
  });
  $('#download-demo').addEventListener('click',()=>download('synthetic-cleaned.csv',csv(['id','date','customer','amount'],clean(sample).records),'text/csv'));
  $('#download-exceptions').addEventListener('click',()=>download('synthetic-exceptions.csv',csv(['row','id','reason'],clean(sample).exceptions),'text/csv'));
}
if($('#brief')) {
  const f=$('#brief');
  const brief=()=>{
    const v=Object.fromEntries(new FormData(f));
    return `Automation inquiry — ${v.package}\n\nName / business: ${v.business}\nReply email: ${v.email}\nState and country: ${v.location}\nCurrent manual task: ${v.task}\nExpected output: ${v.output}\nInput format and approximate size: ${v.files}\nComputer / operating system: ${v.os}\nRequested deadline: ${v.deadline||'Flexible'}\n\nPlease check scope and confirm a fixed price and delivery date before payment. I will provide a synthetic or anonymized sample.\n`;
  };
  f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity()) return;$('#brief-text').value=brief();$('#email-brief').href=`mailto:estradajoey71@gmail.com?subject=${encodeURIComponent('Automation inquiry')}&body=${encodeURIComponent(brief())}`;$('#brief-result').hidden=false;$('#brief-result').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#download-brief').addEventListener('click',()=>download('automation-brief.txt',$('#brief-text').value));
}
