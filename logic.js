const Semilla = (() => {
  const words = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez'];
  function extract(input) {
    const normalized = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const s = normalized.replace(/\b(cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/g, w => String(words.indexOf(w)));
    const map = {};
    if (/\b(no|menos|quite|perdi|resto)\b/.test(s)) return map;
    const patterns = [
      /(?:al principio (?:habia )?|tenia |habia |empiezo con |empece con |comence con )(\d+)\b/,
      /(?:llegaron |agrego |agregue |me dieron |recibi |sumo |mas |añadi |anadi )(\d+)\b/,
      /(?:ahora (?:hay |tengo )?|en total (?:hay |son )?|tengo |quedan |son |da |igual a )(\d+)\b/
    ];
    patterns.forEach((pattern,i) => { const m = s.match(pattern); if (m) map[i] = Number(m[1]); });
    const equation = s.match(/\b(\d+)\s*(?:\+|mas)\s*(\d+)\s*(?:=|son|es|da)\s*(\d+)\b/);
    if (equation) equation.slice(1).forEach((v,i) => { map[i] = Number(v); });
    return map;
  }
  return {extract};
})();
if (typeof module !== 'undefined') module.exports = Semilla;
