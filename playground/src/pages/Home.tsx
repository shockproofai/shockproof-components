import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  return (
    <div className="home-container">
      <h1>Shockproof Components Playground</h1>
      <p className="subtitle">Interactive testing environment</p>
      
      <div className="cards-grid">
        <Link to="/auth-test" className="test-card">
          <div className="card-icon">🔐</div>
          <h2>Auth Component</h2>
          <p>Test authentication</p>
        </Link>

        <Link to="/chat-test" className="test-card">
          <div className="card-icon">💬</div>
          <h2>Chatbot Component</h2>
          <p>Full-page chat</p>
        </Link>
      </div>
    </div>
  );
}
