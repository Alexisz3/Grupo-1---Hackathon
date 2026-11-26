const $ = id => document.getElementById(id);
const labels = ['Al principio','Llegaron','En total'];
const lessons = [[3,2,5],[4,2,6]];
const questions = ['¿Cuántas semillas había al principio?', '¿Cuántas semillas llegaron después?', '¿Cuántas hay si las juntas?'];
let avatar, drawing, dragging, stage, mapped, nameText, pending = false;
const canvas = document.querySelector('canvas'), pen = canvas.getContext('2d');
function button(parent,text,action) {
  const b = document.createElement('button'); b.textContent = text; b.onclick = action; parent.append(b); return b;
}
for (const [icon,name] of [['🐥','Pollito'],['🐢','Tortuga'],['🐰','Conejo']]) {
  const b = button($('avatars'),icon+' '+name,() => {
    avatar = icon; clearDrawing();
    for (const item of $('avatars').children) item.setAttribute('aria-pressed',String(item === b));
  });
}
function clearDrawing(){pen.clearRect(0,0,canvas.width,canvas.height);drawing=false;}
$('avatars').firstChild.click();
function point(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];}
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);dragging=true;drawing=true;pen.strokeStyle='#285546';pen.lineWidth=5;pen.lineCap='round';pen.beginPath();const [x,y]=point(e);pen.moveTo(x-.1,y);pen.lineTo(x,y);pen.stroke();};
canvas.onpointermove=e=>{if(dragging){pen.lineTo(...point(e));pen.stroke();}};
canvas.onpointerup=canvas.onpointercancel=()=>{dragging=false;};
$('erase').onclick=clearDrawing;
$('start').onclick=()=>{
  nameText=$('name').value.trim() || 'Pipo';$('buddyName').textContent=nameText;
  $('face').textContent=avatar;
  if(drawing){const img=new Image();img.src=canvas.toDataURL();img.alt='Tu personaje dibujado';$('face').replaceChildren(img);}
  $('setup').hidden=true;$('lesson').hidden=false;stage=0;begin();
};
function begin(){
  selectedStep=null;
  mapped=[null,null,null];const [a,b]=lessons[stage];
  $('stage').textContent=stage?'RETO NUEVO · 2 DE 2':'CÁPSULA · 1 DE 2';
  $('prompt').textContent='En mi huerto había '+a+' semillas y llegaron '+b+' más. ¿Me enseñas cómo encontrar el total?';
  $('garden').textContent='Al principio: '+'🌱'.repeat(a)+' ('+a+')   ·   Llegaron: '+'🌱'.repeat(b)+' ('+b+')';
  $('answer').value='';$('feedback').textContent='';$('cards').replaceChildren();
  for(const phrase of ['Tenía '+a,'Llegaron '+b,...[a+b-1,a+b,a+b+1].map(n=>'En total hay '+n)]){
    button($('cards'),phrase,()=>{$('answer').value+=($('answer').value?'. ':'')+phrase;});
  }
  render();$('answer').focus();
}
let selectedStep = null;
function guide(i) {
  if (pending) return;
  selectedStep=i;
  $('feedback').textContent=questions[i];
  render();
  $('answer').focus();
}
function render(){
  $('map').replaceChildren();
  mapped.forEach((v,i)=>{
    const status=v===null?'Por explicar':v===lessons[stage][i]?'Entendido':'Revisemos';
    const node=button($('map'),labels[i]+' · '+(v===null?'':v+' · ')+status,()=>guide(i));
    node.setAttribute('aria-pressed',String(selectedStep===i));
  });
  if(selectedStep!==null){
    const step=selectedStep;
    button($('map'),'Dame una pista',()=>{
      const hints=['Cuenta solo las plantas que ya estaban en el huerto.','Señala solo las plantas que llegaron después.','Cuenta los dos grupos juntos, una planta a la vez.'];
      $('feedback').textContent=hints[step]+' '+questions[step];
    });
  }
  const complete=mapped.every((v,i)=>v===lessons[stage][i]);
  $('next').hidden=!complete;$('next').textContent=stage?'Terminar cápsula':'Probar otro caso →';
}
$('fix').onclick=()=>{
  $('feedback').textContent='Elige en el mapa la parte que quieres explicar otra vez.';
  $('map').querySelector('button').focus();
};
$('send').onclick=async()=>{
  const input=$('answer').value.trim();if(!input||pending){$('answer').focus();return;}
  pending=true;$('send').disabled=$('fix').disabled=true;$('next').hidden=true;
  try{
    let parts=Semilla.extract(input);
    if(location.protocol.startsWith('http')){
      try{const res=await fetch('/api/map',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input}),signal:AbortSignal.timeout(6500)});
        if(res.ok) parts=(await res.json()).parts;
      }catch{/* Continue with the local interpreter. */}
    }
    const gap=mapped.findIndex((v,i)=>v!==lessons[stage][i]);
    if(!Object.keys(parts).length && gap>=0 && /^(?:\d+|cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)$/i.test(input)) {
      const target=selectedStep??(mapped.every(v=>v===null)?2:gap);parts[target]=Semilla.extract("son "+input)[2];
    }
    Object.entries(parts).forEach(([i,v])=>{if(['0','1','2'].includes(i)&&Number.isInteger(v))mapped[i]=v;});
    const missing=mapped.findIndex((v,i)=>v!==lessons[stage][i]);
    selectedStep=missing<0?null:missing;
    $('feedback').textContent=missing<0?'¡Ya lo entendí! Puedo seguir los tres pasos.':(mapped[missing]===null?'Me falta una pista. ':'Revisemos ese paso. ')+questions[missing];
    $('answer').value='';render();
  }finally{pending=false;$('send').disabled=$('fix').disabled=false;}
};
$('next').onclick=()=>{
  if(stage===0){stage=1;begin();return;}
  $('lesson').hidden=true;
  $('done').hidden=false;
  $('result').textContent='Le enseñaste a '+nameText+' a juntar dos grupos: 3 + 2 = 5 y 4 + 2 = 6.';
  const heading=$('done').querySelector('h2');
  heading.tabIndex=-1;
  heading.focus();
};
$('listen').hidden=!('speechSynthesis' in window);
$('listen').onclick=()=>{speechSynthesis.cancel();const msg=new SpeechSynthesisUtterance($('prompt').textContent+' '+$('feedback').textContent);msg.lang='es';speechSynthesis.speak(msg);};
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(Recognition&&window.isSecureContext){$('speak').hidden=false;$('speak').onclick=()=>{const r=new Recognition();r.lang='es';r.onresult=e=>{$('answer').value=e.results[0][0].transcript;};r.onerror=()=>{$('feedback').textContent='Puedes escribir o usar las tarjetas.';};r.start();};}
$('again').onclick=()=>location.reload();
