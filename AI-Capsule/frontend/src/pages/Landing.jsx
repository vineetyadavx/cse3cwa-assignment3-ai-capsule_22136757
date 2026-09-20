import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';

function Landing() {
  const [health, setHealth] = useState('checking...');

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(() => setHealth('unreachable'));
  }, []);

  return (
    <div className="landing">
      <h1>AI Capsule</h1>
      <p>Save, review and improve your AI prompts in one private, secure place.</p>
      <div className="status-badge">
        <span className="status-dot"></span>
        Backend status: {health}
      </div>
      <div>
        <a href={`${API_BASE}/login`}>
          <button className="btn-primary">Log in with GitHub</button>
        </a>
      </div>
    </div>
  );
}

export default Landing;