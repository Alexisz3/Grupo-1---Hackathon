import {Volume2} from 'lucide-react';

export function ChatTurn({character, turn, onReplay}) {
  return <li className="chat-turn">
    <p className="child-question">{turn.question}</p>
    <div className="character-reply">
      <span aria-hidden="true">{character.emoji}</span>
      <p>{turn.reply}</p>
      <button type="button" className="control" onClick={() => onReplay(turn.reply)} aria-label="Escuchar otra vez"><Volume2 size={18} /></button>
    </div>
  </li>;
}
