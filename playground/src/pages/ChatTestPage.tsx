import { Auth, Chatbot } from '@shockproofai/shockproof-components';
import { app } from '../firebase';
import './ChatTestPage.css';

export function ChatTestPage() {
  return (
    <Auth firebaseApp={app} autoSignInAnonymously={true} enableGoogle={false} enableEmailLink={false}>
      <div className="chat-test-page">
        <Chatbot 
          firebaseApp={app}
          showTimingInfo={true}
          enableDynamicQuestions={true}
        />
      </div>
    </Auth>
  );
}
