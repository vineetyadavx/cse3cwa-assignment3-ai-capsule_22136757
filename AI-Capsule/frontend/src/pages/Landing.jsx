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
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>AI Capsule</h1>
      <p>Save, review and improve your AI prompts in one private, secure place.</p>
      <p>Backend status: <strong>{health}</strong></p>
      <a href={`${API_BASE}/login`}>
        <button style={{ padding: '10px 20px', fontSize: 16, cursor: 'pointer' }}>
          Log in with GitHub
        </button>
      </a>
    </div>
  );
}

export default Landing;