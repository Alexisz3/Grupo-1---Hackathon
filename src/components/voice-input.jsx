import {Mic, Send} from 'lucide-react';

// Campo para escribir o dictar; el estado vive en useDictation
export function VoiceInput({id, label, dictation, submitLabel, busy, onSubmit}) {
  return <form className="voice-input" onSubmit={event => { event.preventDefault(); if (dictation.text.trim()) onSubmit(dictation.text.trim()); }}>
    <label htmlFor={id}>{label}</label>
    <div>
      <input id={id} value={dictation.text} onChange={event => dictation.setText(event.target.value)} maxLength={200} disabled={busy} autoComplete="off" />
      {dictation.supported && <button type="button" className="control" data-active={dictation.listening} onClick={dictation.toggle} disabled={busy}
        aria-label={dictation.listening ? 'Parar el micrófono' : 'Hablar'}><Mic size={20} />{dictation.listening ? 'Parar' : 'Hablar'}</button>}
      <button type="submit" className="primary" disabled={busy || !dictation.text.trim()}><Send size={19} />{submitLabel}</button>
    </div>
  </form>;
}
