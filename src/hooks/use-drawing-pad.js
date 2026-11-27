import {useRef, useState} from 'react';

export const padColors = ['#1f1f2e', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#26c6da', '#8d6e63', '#9e9e9e'];

// Lienzo del dibujo inicial del cuento: trazos con color, grosor, borrador y deshacer
export function useDrawingPad() {
  const element = useRef(null);
  const strokes = useRef([]);
  const active = useRef(null);
  const [color, setColor] = useState(padColors[3]);
  const [size, setSize] = useState(10);
  const [erasing, setErasing] = useState(false);
  const [count, setCount] = useState(0);

  // El lienzo se monta y desmonta con la página: al aparecer se pinta de blanco con los trazos que haya
  const canvas = node => { element.current = node; if (node) paint(); };

  function line(ctx, stroke, from) {
    ctx.strokeStyle = stroke.erase ? '#fff' : stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(...stroke.points[Math.max(from - 1, 0)]);
    stroke.points.slice(from).forEach(point => ctx.lineTo(...point));
    ctx.stroke();
  }

  function paint() {
    const ctx = element.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, element.current.width, element.current.height);
    strokes.current.forEach(stroke => line(ctx, stroke, 0));
  }

  function point(event) {
    const box = element.current.getBoundingClientRect();
    return [(event.clientX - box.left) * element.current.width / box.width, (event.clientY - box.top) * element.current.height / box.height];
  }

  function down(event) {
    if (!event.isPrimary || event.button !== 0 || active.current) return;
    element.current.setPointerCapture(event.pointerId);
    const xy = point(event);
    active.current = {pointerId:event.pointerId, color, size:erasing ? size * 2.5 : size, erase:erasing, points:[xy, [xy[0] + .1, xy[1]]]};
    strokes.current.push(active.current);
    line(element.current.getContext('2d'), active.current, 0);
  }

  function move(event) {
    if (active.current?.pointerId !== event.pointerId) return;
    active.current.points.push(point(event));
    line(element.current.getContext('2d'), active.current, active.current.points.length - 1);
  }

  function up(event) {
    if (active.current?.pointerId !== event.pointerId) return;
    active.current = null;
    setCount(strokes.current.length);
  }

  function undo() {
    strokes.current.pop();
    paint();
    setCount(strokes.current.length);
  }

  function clear() {
    strokes.current = [];
    paint();
    setCount(0);
  }

  return {canvas, color, setColor:value => { setColor(value); setErasing(false); }, size, setSize, erasing, setErasing, empty:count === 0,
    undo, clear, image:() => element.current.toDataURL('image/png'),
    handlers:{onPointerDown:down, onPointerMove:move, onPointerUp:up, onPointerCancel:up, onLostPointerCapture:up}};
}
