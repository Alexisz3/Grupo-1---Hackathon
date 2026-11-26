const plain = word => word.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, '');

export const textWords = text => text.split(/\s+/).filter(word => plain(word));

// Marca cada palabra del texto como leída si aparece en orden en lo que dijo el niño.
// Tolera hasta 3 palabras de más entre una y otra (muletillas, repeticiones).
export function matchWords(text, spoken) {
  const heard = spoken.split(/\s+/).map(plain).filter(Boolean);
  let next = 0;
  return textWords(text).map(word => {
    const found = heard.slice(next, next + 4).indexOf(plain(word));
    if (found >= 0) next += found + 1;
    return {word, ok:found >= 0};
  });
}
