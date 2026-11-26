import {Avatar} from '../Workshop.jsx';

// Lo que dice un personaje: avatar, nombre y texto. Los textos largos van en letra más chica
export function BuddyBubble({buddy, text}) {
  return <div className={'speech-bubble' + (text.length > 60 ? ' long' : '')}>
    <Avatar buddy={buddy} />
    <div><strong>{buddy.name}</strong><h1>{text}</h1></div>
  </div>;
}
