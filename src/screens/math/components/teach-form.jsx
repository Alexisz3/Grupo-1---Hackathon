import {VoiceInput} from '../../../components/voice-input.jsx';

export function TeachForm({dictation, onTeach}) {
  return <div className="teach-form">
    <VoiceInput id="explicacion" label="Explícale con tus palabras por qué es así" dictation={dictation} submitLabel="Enseñarle" onSubmit={onTeach} />
    <button type="button" className="control" onClick={() => onTeach('')}>Seguir sin explicar</button>
  </div>;
}
