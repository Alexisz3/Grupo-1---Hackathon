export function JudgeButtons({buddyName, onJudge}) {
  return <div className="judge">
    <h2>¿{buddyName} respondió bien?</h2>
    <div className="places">
      <button type="button" className="place" onClick={() => onJudge(true)}><span aria-hidden="true">✅</span>Está bien</button>
      <button type="button" className="place" onClick={() => onJudge(false)}><span aria-hidden="true">❌</span>Se equivocó</button>
    </div>
  </div>;
}
