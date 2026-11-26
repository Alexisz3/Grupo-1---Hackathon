// Página izquierda del cuento: la ilustración de la IA o, mientras no hay, el dibujo del niño
export function PageArt({drawing, picture, scene}) {
  const painted = picture && picture !== 'none';
  return <figure className="page-art" data-painting={!picture}>
    <img className={painted ? 'painted' : ''} src={painted ? picture : drawing} alt={painted ? 'Ilustración de la página' : 'Tu dibujo'} />
    {!painted && <figcaption><span aria-hidden="true">{scene.join(' ')}</span>{picture ? 'Tu dibujo' : 'Pintando la página…'}</figcaption>}
  </figure>;
}
