const Semilla = (() => {
  const words = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez'];
  function extract(input) {
    const normalized = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const s = normalized.replace(/\b(cero|uno|una|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/g, word =>
      word === 'un' || word === 'una' ? '1' : String(words.indexOf(word)));
    const map = {};
    if (/\b(no|menos|quite|perdi|resto)\b/.test(s)) return map;
    const patterns = [
      /(?:al principio (?:habia )?|tenia |habia |empiezo con |empece con |comence con )(\d+)\b/,
      /(?:llegaron |llego |agrego |agregue |agregamos |me dieron |recibi |sumo |sumaron |sume |mas |anadi )(\d+)\b/,
      /(?:ahora (?:hay |tengo )?|en total (?:hay |son )?|tengo |quedan |son |da |igual a )(\d+)\b/
    ];
    patterns.forEach((pattern,i) => { const m = s.match(pattern); if (m) map[i] = Number(m[1]); });
    const equation = s.match(/\b(\d+)\s*(?:\+|mas)\s*(\d+)\s*(?:=|son|es|da)\s*(\d+)\b/);
    if (equation) equation.slice(1).forEach((v,i) => { map[i] = Number(v); });
    return map;
  }
  return {extract};
})();
export const {extract} = Semilla;
