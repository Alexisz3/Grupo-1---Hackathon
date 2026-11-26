async function post(path, body) {
  const result = await fetch(path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if (!result.ok) throw new Error((await result.json().catch(() => ({}))).error || 'No pude conectar con la IA');
  return result;
}

export const aiService = {
  nextPage: async story => (await post('/api/story', story)).json(),
  character: async (image, hint) => (await post('/api/character', {image, hint})).json(),
  describe: async (image, request) => (await (await post('/api/look', {image, request})).json()).look,
  // storyId y number guardan la ilustración en la base local
  picture: async (prompt, drawing, seed, storyId, number) => URL.createObjectURL(await (await post('/api/picture', {prompt, drawing, seed, storyId, number})).blob()),
  speak: async (text, voice) => (await post('/api/speak', {text, voice})).arrayBuffer(),
  mathProblem: async (hero, level) => (await post('/api/math/problem', {hero, level})).json(),
  mathTeach: async (hero, problem, explanation) => (await (await post('/api/math/teach', {hero, problem, explanation})).json()).reply,
  visit: async (character, question, turns) => (await post('/api/history', {character, question, turns})).json()
};
