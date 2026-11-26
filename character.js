// Capture the child's strokes alongside the editable canvas.
const sketchLines=[];
let worker=null, characterImage=null;
const ink=document.querySelector('canvas');
const createButton=document.getElementById('generate');
const progress=document.getElementById('artStatus');
const preview=document.getElementById('artPreview');
function cancelCharacter(){
  worker?.terminate();worker=null;characterImage=null;
  preview.hidden=true;progress.textContent='';createButton.disabled=!sketchLines.length;
}
function resetCharacter(){sketchLines.length=0;cancelCharacter();}
$('species').addEventListener('change',cancelCharacter);
ink.addEventListener('pointerdown',e=>{
  if(!e.isPrimary)return;
  sketchLines.push([point(e)]);cancelCharacter();
  for(const b of $('avatars').children)b.setAttribute('aria-pressed','false');
});
ink.addEventListener('pointermove',e=>{
  if(!dragging||!e.isPrimary||!sketchLines.length)return;
  const line=sketchLines.at(-1), last=line.at(-1), p=point(e);
  if(Math.hypot(p[0]-last[0],p[1]-last[1])>=4)line.push(p);
});
$('species').onchange=cancelCharacter;
function composeCharacter(segments){
  const strokes=sketchLines.flatMap(line=>line.map(([x,y],i)=>[...(line[i-1]||[x-.1,y]),x,y]));
  const all=strokes.concat(segments);
  const xs=all.flatMap(s=>[s[0],s[2]]), ys=all.flatMap(s=>[s[1],s[3]]);
  const minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY;
  const output=document.createElement('canvas');output.width=output.height=256;
  const c=output.getContext('2d'),scale=216/Math.max(w,h,1);
  c.fillStyle='#fff3ce';c.fillRect(0,0,256,256);
  c.translate((256-w*scale)/2,(256-h*scale)/2);c.scale(scale,scale);c.translate(-minX,-minY);
  c.lineCap='round';c.lineWidth=3/scale;
  for(const [color,lines] of [['#285546',strokes],['#9b4c2b',segments]]){
    c.strokeStyle=color;c.beginPath();
    for(const [x,y,nx,ny] of lines){c.moveTo(x,y);c.lineTo(nx,ny);}c.stroke();
  }
  return output.toDataURL();
}
createButton.onclick=()=>{
  if(!sketchLines.length)return;
  const failed=()=>{worker?.terminate();worker=null;createButton.disabled=false;progress.textContent='Prueba otra vez con una línea más. También puedes empezar con tu dibujo.';};
  try{
    createButton.disabled=true;progress.textContent='Tu compañero está tomando forma…';
    worker=new Worker('art/generate.js');
    worker.onerror=failed;
    worker.onmessage=({data})=>{
      if(data.failed){failed();return;}
      preview.src=composeCharacter(data.segments);preview.hidden=false;
      characterImage=preview.src;progress.textContent='Así quedó tu compañero. Puedes empezar la cápsula o generar otra versión.';
      worker.terminate();worker=null;createButton.disabled=false;
    };
    worker.postMessage({lines:sketchLines,animal:$('species').value});
  }catch{failed();}
};
