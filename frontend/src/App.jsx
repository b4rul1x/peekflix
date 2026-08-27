import { useEffect, useState } from "react";

function App() {
  const [username, setUsername] = useState('гість');

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    if (tg.initDataUnsafe?.user) {
      setUsername(tg.initDataUnsafe.user.first_name);
    }
  }, [])

  return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎬 Peekflix</h1>
      <p>Привіт, {username}!</p>
    </div>
  );
}

export default App;