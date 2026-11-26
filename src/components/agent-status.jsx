import {RotateCcw} from 'lucide-react';
import {Avatar} from '../Workshop.jsx';

// Espera o error de una respuesta de la IA, con el personaje que la está pensando
export function AgentStatus({buddy, text, error, onRetry}) {
  return <div className="agent-status" role="status">
    <Avatar buddy={buddy} className={error ? '' : 'thinking'} />
    <p>{error || text}</p>
    {error && onRetry && <button type="button" className="primary" onClick={onRetry}><RotateCcw size={20} /> Intentar otra vez</button>}
  </div>;
}
