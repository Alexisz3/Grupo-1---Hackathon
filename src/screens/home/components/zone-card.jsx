export function ZoneCard({capsule, onOpen}) {
  return <button type="button" className="zone-card" onClick={onOpen} aria-label={capsule.title + ' ' + capsule.subtitle}>
    <img src={'/art/' + capsule.image + '.webp'} width="380" height="356" alt="" />
    <strong>{capsule.title}</strong>
    <span>{capsule.subtitle}</span>
  </button>;
}
