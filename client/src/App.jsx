import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('chargement...');

  useEffect(() => {
    fetch('http://localhost:3001/api/ping')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('erreur de connexion au serveur'));
  }, []);

  return <h1>{message}</h1>;
}

export default App;