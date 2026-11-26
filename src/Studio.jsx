import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ChevronLeft, Eraser, RotateCcw, Sparkles} from 'lucide-react';
import {Avatar} from './Workshop.jsx';

const characters = [['🐥','Pollito'], ['🐢','Tortuga'], ['🐰','Conejo']];
const colors = [['#23554f','Verde'], ['#8c4fb2','Morado'], ['#b45437','Terracota']];

function compose(canvas, lines, segments) {
  const output = document.createElement('canvas');
  output.width = output.height = 256;
  const ctx = output.getContext('2d');
  ctx.fillStyle = '#fff4d9';
  ctx.fillRect(0,0,256,256);
  const points = lines.flat().concat(segments.flatMap(([x,y,nx,ny]) => [[x,y],[nx,ny]]));
  const bounds = points.reduce(([left,top,right,bottom],[x,y]) =>
    [Math.min(left,x),Math.min(top,y),Math.max(right,x),Math.max(bottom,y)], [Infinity,Infinity,-Infinity,-Infinity]);
  const [left,top,right,bottom] = bounds;
  const scale = 210 / Math.max(right-left,bottom-top,1);
  ctx.translate((256-(right-left)*scale)/2,(256-(bottom-top)*scale)/2);
  ctx.scale(scale,scale);
  ctx.translate(-left,-top);
  ctx.drawImage(canvas,0,0);
  ctx.strokeStyle = '#ba713d';
  ctx.lineWidth = 3 / scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const [x,y,nx,ny] of segments) { ctx.moveTo(x,y); ctx.lineTo(nx,ny); }
  ctx.stroke();
  return output.toDataURL('image/png');
}

export default function Studio({buddy, onSave, onBack}) {
  const [name,setName] = useState(buddy.name);
  const [icon,setIcon] = useState(buddy.icon);
  const [image,setImage] = useState(buddy.image);
  const [color,setColor] = useState(colors[0][0]);
  const [species,setSpecies] = useState('cat');
  const [drawing,setDrawing] = useState(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const canvas = useRef(null);
  const heading = useRef(null);
  const lines = useRef([]);
  const pointer = useRef(null);
  const worker = useRef(null);

  useEffect(() => {
    heading.current?.focus();
    return () => worker.current?.terminate();
  }, []);

  function point(event) {
    const {left,top,width,height} = canvas.current.getBoundingClientRect();
    return [(event.clientX-left)*canvas.current.width/width,(event.clientY-top)*canvas.current.height/height];
  }

  function trace(event) {
    if (pointer.current !== event.pointerId) return;
    const xy = point(event);
    const line = lines.current.at(-1);
    const last = line.at(-1);
    if (Math.hypot(xy[0]-last[0],xy[1]-last[1]) < 2) return;
    const ctx = canvas.current.getContext('2d');
    ctx.lineTo(...xy);
    ctx.stroke();
    line.push(xy);
  }

  function begin(event) {
    if (busy || !event.isPrimary || pointer.current !== null) return;
    pointer.current = event.pointerId;
    canvas.current.setPointerCapture(event.pointerId);
    const xy = point(event);
    lines.current.push([xy]);
    const ctx = canvas.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xy[0]-.1,xy[1]);
    ctx.lineTo(...xy);
    ctx.stroke();
    setDrawing(true);
    setImage(null);
    setMessage('');
  }

  function reset() {
    const board = canvas.current;
    board.getContext('2d').clearRect(0,0,board.width,board.height);
    lines.current = [];
    setDrawing(false);
    setImage(null);
    setMessage('');
  }

  function generate() {
    if (!drawing || busy) return;
    setBusy(true);
    setMessage('Estoy completando tu dibujo…');
    function finish(nextImage) {
      worker.current?.terminate();
      worker.current = null;
      setBusy(false);
      setImage(nextImage);
      setMessage(nextImage ? '¡Listo! Puedes guardarlo o probar otra versión.' : 'Prueba con unos trazos más. También puedes guardar tu dibujo.');
    }
    try {
      const job = new Worker('/art/generate.js');
      worker.current = job;
      job.onerror = () => finish(null);
      job.onmessage = ({data}) => {
        if (data.failed) { finish(null); return; }
        try { finish(compose(canvas.current,lines.current,data.segments)); }
        catch { finish(null); }
      };
      job.postMessage({animal:species,lines:lines.current});
    } catch { finish(null); }
  }

  return <main className="studio">
    <button className="control" type="button" onClick={onBack}><ChevronLeft size={20} /> Volver</button>
    <section className="workshop-panel studio-panel">
      <div className="studio-head">
        <Avatar buddy={{icon,image}} />
        <div><h1 tabIndex={-1} ref={heading}>Mi personaje</h1><p>Elige uno o dibuja el tuyo.</p></div>
      </div>
      <div className="studio-grid">
        <div>
          <label htmlFor="buddyName">Nombre</label>
          <input id="buddyName" value={name} onChange={event => setName(event.target.value)} maxLength={24} />
          <div className="characters" role="group" aria-label="Personajes">
            {characters.map(([emoji,label]) => <button className="control" type="button" key={emoji}
              aria-pressed={!drawing && !image && icon === emoji} disabled={busy}
              onClick={() => {reset();setIcon(emoji);}}>
              <span aria-hidden="true">{emoji}</span>{label}
            </button>)}
          </div>
          {image && <img className="generated" src={image} alt="Personaje creado con tu dibujo" />}
        </div>
        <div className="draw-area">
          <div className="draw-controls">
            <label>Voy a dibujar un <select value={species} disabled={busy} onChange={event => setSpecies(event.target.value)}>
              <option value="cat">gato</option><option value="rabbit">conejo</option><option value="bird">pájaro</option>
            </select></label>
            <div className="swatches" role="group" aria-label="Colores del pincel">
              {colors.map(([value,label]) => <button key={value} type="button" aria-label={label} aria-pressed={color === value}
                onClick={() => setColor(value)} style={{'--swatch':value}} />)}
            </div>
          </div>
          <canvas ref={canvas} width={380} height={200} aria-label="Espacio para dibujar a tu personaje"
            onPointerDown={begin} onPointerMove={trace} onLostPointerCapture={() => {pointer.current = null;}} />
          <div className="draw-controls">
            <button className="control" type="button" disabled={busy || !drawing} onClick={reset}><Eraser size={19} /> Borrar</button>
            <button className="control" type="button" disabled={busy || !drawing} onClick={generate}>
              {image ? <RotateCcw size={19} /> : <Sparkles size={19} />}{image ? 'Otra versión' : 'Completar con IA'}
            </button>
          </div>
          <p className="feedback" role="status">{message}</p>
        </div>
      </div>
      <button className="primary" type="button" disabled={busy}
        onClick={() => onSave({name:name.trim() || 'Pipo', icon, image:image || (drawing ? canvas.current.toDataURL('image/png') : null)})}>
        Usar mi personaje <ArrowRight size={22} />
      </button>
    </section>
  </main>;
}
