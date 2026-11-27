import {ChildCard} from './components/child-card.jsx';
import {NewChildForm} from './components/new-child-form.jsx';

// «¿Quién va a jugar?»: los niños de este dispositivo y crear uno nuevo
export default function ProfilesScreen({school}) {
  return <main className="zones profiles">
    <h1>¿Quién va a jugar?</h1>
    {school.phase === 'loading' ? <p className="zones-banner">Abriendo el aula…</p> : <>
      {school.children.length > 0 && <ul className="children-grid">
        {school.children.map(child => <ChildCard key={child.id} child={child} onPick={() => school.enter(child)} />)}
      </ul>}
      <NewChildForm form={school.form} first={school.children.length === 0} />
    </>}
    {school.saveError && <p className="save-error" role="alert">{school.saveError}</p>}
  </main>;
}
