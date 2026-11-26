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
function clearDrawing(){pen.clearRect(0,0,canvas.width,canvas.height);drawing=false;if(typeof resetCharacter==='function')resetCharacter();}
$('avatars').firstChild.click();
function point(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];}
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);dragging=true;drawing=true;pen.strokeStyle='#285546';pen.lineWidth=5;pen.lineCap='round';pen.beginPath();const [x,y]=point(e);pen.moveTo(x-.1,y);pen.lineTo(x,y);pen.stroke();};
canvas.onpointermove=e=>{if(dragging){pen.lineTo(...point(e));pen.stroke();}};
canvas.onpointerup=canvas.onpointercancel=()=>{dragging=false;};
$('erase').onclick=clearDrawing;
$('start').onclick=()=>{
  nameText=$('name').value.trim() || 'Pipo';$('buddyName').textContent=nameText;
  $('face').textContent=avatar;
  if(drawing){const img=new Image();img.src=characterImage||canvas.toDataURL();img.alt='Tu personaje dibujado';$('face').replaceChildren(img);}
  if(worker){worker.terminate();worker=null;}
  $('setup').hidden=true;$('lesson').hidden=false;stage=0;begin();
};
function begin(){
  selectedStep=null;
  mapped=[null,null,null];const [a,b]=lessons[stage];
  $('stage').textContent=stage?'RETO NUEVO · 2 DE 2':'CÁPSULA · 1 DE 2';
  $('prompt').textContent='En mi huerto había '+a+' semillas y llegaron '+b+' más. ¿Me enseñas cómo encontrar el total?';
  $('garden').textContent='Al principio: '+'🌱'.repeat(a)+' ('+a+')   ·   Llegaron: '+'🌱'.repeat(b)+' ('+b+')';
  $('answer').value='';$('feedback').textContent='Cuéntame qué pasó en el huerto. Iré dibujando lo que me enseñes.';$('cards').replaceChildren();
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
function mapSentence(value,step){
  if(value===null)return ['¿Cuántas había?','¿Cuántas llegaron?','¿Cuántas hay ahora?'][step];
  const seeds=value===1?'semilla':'semillas';
  return ['Había '+value+' '+seeds,(value===1?'Llegó ':'Llegaron ')+value+' '+seeds,'Ahora hay '+value+' '+seeds][step];
}
function render(){
  $('map').replaceChildren();
  $('counting').hidden=true;
  $('hint').hidden=selectedStep===null;
  $('readMap').hidden=!('speechSynthesis' in window);
  mapped.forEach((v,i)=>{
    const status=v===null?'Falta contar':v===lessons[stage][i]?'✓ Entendido':'↻ Cuenta otra vez';
    const node=button($('map'),'',()=>guide(i));
    const title=document.createElement('strong'), picture=document.createElement('span'), caption=document.createElement('span'), badge=document.createElement('small');
    title.textContent=['Primero','Después','Juntos'][i];
    picture.className='seedPicture';picture.setAttribute('aria-hidden','true');
    picture.textContent=v===null?'?':v>0&&v<=10?'🌱'.repeat(v):String(v);
    caption.textContent=mapSentence(v,i);badge.textContent=status;
    node.append(title,picture,caption,badge);
    node.setAttribute('aria-pressed',String(selectedStep===i));
  });
  const complete=mapped.every((v,i)=>v===lessons[stage][i]);
  $('next').hidden=!complete;$('next').textContent=stage?'Terminar cápsula':'Probar otro caso →';
}
$('readMap').onclick=()=>{
  speechSynthesis.cancel();
  const message=new SpeechSynthesisUtterance([...$('map').children].map(node=>node.innerText).join('. ')+'. '+$('feedback').textContent);
  message.lang='es';speechSynthesis.speak(message);
};
$('hint').onclick=()=>{
  if(selectedStep===null)return;
  const amount=lessons[stage][selectedStep];
  let counted=0;
  $('counting').hidden=false;$('seeds').replaceChildren();
  $('countHelp').textContent=['Toca cada semilla que había al principio.','Toca cada semilla que llegó después.','Toca todas las semillas de los dos grupos.'][selectedStep];
  $('countResult').textContent='';
  for(let i=0;i<amount;i++){
    const seed=button($('seeds'),'🌱',()=>{
      if(seed.getAttribute('aria-pressed')==='true')return;
      seed.setAttribute('aria-pressed','true');seed.textContent=String(++counted);
      $('countResult').textContent=counted===amount?'Contaste '+counted+'. ¿Cómo se lo explicarías a '+nameText+'?':'Llevas '+counted+'.';
    });
    seed.setAttribute('aria-label','Semilla '+(i+1));seed.setAttribute('aria-pressed','false');
  }
};
$('send').onclick=async()=>{
  const input=$('answer').value.trim();if(!input||pending){$('answer').focus();return;}
  pending=true;$('send').disabled=true;$('next').hidden=true;
  try{
    let parts=Semilla.extract(input);
    if(location.protocol.startsWith('http')){
      try{const res=await fetch('/api/map',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input}),signal:AbortSignal.timeout(6500)});
        if(res.ok) parts=(await res.json()).parts;
      }catch{/* Continue with the local interpreter. */}
    }
    const gap=mapped.findIndex((v,i)=>v!==lessons[stage][i]);
    if(!Object.keys(parts).length && (gap>=0||selectedStep!==null) && /^(?:\d+|cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)$/i.test(input)) {
      const target=selectedStep??(mapped.every(v=>v===null)?2:gap);parts[target]=Semilla.extract("son "+input)[2];
    }
    Object.entries(parts).forEach(([i,v])=>{if(['0','1','2'].includes(i)&&Number.isInteger(v))mapped[i]=v;});
    const missing=mapped.findIndex((v,i)=>v!==lessons[stage][i]);
    selectedStep=missing<0?null:missing;
    $('feedback').textContent=missing<0?'¡Ya lo entendí! Puedo seguir los tres pasos.':(mapped[missing]===null?'Me falta una pista. ':'Revisemos ese paso. ')+questions[missing];
    $('answer').value='';render();$('mapTitle').focus();
  }finally{pending=false;$('send').disabled=false;}
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
