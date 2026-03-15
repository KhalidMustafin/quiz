import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const nickSuggestions = ['Капитан', 'Мозгобой', 'Эрудит', 'Квизи'];

function randomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function LobbyPage() {
  const [roomCode] = useState(() => randomCode());
  const [nickname, setNickname] = useState('');
  const [members, setMembers] = useState<string[]>(['Хост: Alice']);

  const canJoin = nickname.trim().length >= 3;

  const subtitle = useMemo(() => {
    if (!nickname) {
      return 'Введите ник, чтобы присоединиться к комнате.';
    }

    return canJoin ? 'Готово! Можно входить в игру.' : 'Ник должен быть минимум из 3 символов.';
  }, [nickname, canJoin]);

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canJoin) {
      return;
    }

    const nextNickname = nickname.trim();

    if (!members.includes(nextNickname)) {
      setMembers((previous) => [...previous, nextNickname]);
    }

    setNickname('');
  };

  return (
    <section style={{ marginTop: 24, display: 'grid', gap: 16 }}>
      <h2>Лобби комнаты</h2>
      <article style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <p style={{ margin: 0 }}>Код комнаты:</p>
        <p style={{ margin: '8px 0', fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>{roomCode}</p>
        <p style={{ color: '#4a5568' }}>Поделитесь кодом с друзьями, чтобы они присоединились.</p>
      </article>

      <form onSubmit={handleJoin} style={{ display: 'grid', gap: 10, maxWidth: 360 }}>
        <label htmlFor="nickname">Ваш ник</label>
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder={nickSuggestions[Math.floor(Math.random() * nickSuggestions.length)]}
          style={{ border: '1px solid #cbd5e0', borderRadius: 8, padding: '10px 12px' }}
        />
        <small style={{ color: canJoin ? '#2f855a' : '#c53030' }}>{subtitle}</small>
        <button
          type="submit"
          disabled={!canJoin}
          style={{
            width: 'fit-content',
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: canJoin ? '#2b6cb0' : '#a0aec0',
            color: '#fff',
            cursor: canJoin ? 'pointer' : 'not-allowed'
          }}
        >
          Присоединиться
        </button>
      </form>

      <article style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Игроки ({members.length})</h3>
        <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
          {members.map((member) => (
            <li key={member}>{member}</li>
          ))}
        </ul>
      </article>

      <Link to="/session" style={{ color: '#2b6cb0', fontWeight: 600 }}>
        Начать демо-сессию →
      </Link>
    </section>
  );
}
