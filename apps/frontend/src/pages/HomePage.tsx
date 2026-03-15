import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type QuizPack = {
  id: string;
  title: string;
  questions: number;
  category: string;
  difficulty: 'Лёгкий' | 'Средний' | 'Сложный';
};

const quizPacks: QuizPack[] = [
  {
    id: 'general',
    title: 'Общий кругозор',
    questions: 20,
    category: 'Классика',
    difficulty: 'Лёгкий'
  },
  {
    id: 'cinema',
    title: 'Кино и сериалы',
    questions: 15,
    category: 'Поп-культура',
    difficulty: 'Средний'
  },
  {
    id: 'science',
    title: 'Наука без скуки',
    questions: 12,
    category: 'Образование',
    difficulty: 'Сложный'
  }
];

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const categories = useMemo(
    () => ['Все', ...new Set(quizPacks.map((pack) => pack.category))],
    []
  );

  const visiblePacks =
    selectedCategory === 'Все'
      ? quizPacks
      : quizPacks.filter((pack) => pack.category === selectedCategory);

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Собери игру за 30 секунд</h2>
      <p style={{ maxWidth: 680, color: '#4a5568' }}>
        Выбирайте набор вопросов, создавайте комнату и зовите друзей по коду. Никакой регистрации —
        только ник и азарт.
      </p>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              border: '1px solid #cbd5e0',
              borderRadius: 999,
              padding: '8px 14px',
              background: selectedCategory === category ? '#2b6cb0' : '#fff',
              color: selectedCategory === category ? '#fff' : '#2d3748',
              cursor: 'pointer'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}
      >
        {visiblePacks.map((pack) => (
          <article
            key={pack.id}
            style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}
          >
            <h3 style={{ marginTop: 0 }}>{pack.title}</h3>
            <p style={{ margin: '8px 0', color: '#4a5568' }}>{pack.category}</p>
            <p style={{ margin: '8px 0' }}>Вопросов: {pack.questions}</p>
            <p style={{ marginBottom: 14 }}>Сложность: {pack.difficulty}</p>
            <Link to="/lobby" style={{ color: '#2b6cb0', fontWeight: 600 }}>
              Создать комнату →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
