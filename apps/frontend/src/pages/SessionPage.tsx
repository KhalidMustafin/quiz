import { useMemo, useState } from 'react';

type Question = {
  id: number;
  prompt: string;
  options: string[];
  answer: number;
};

const questions: Question[] = [
  {
    id: 1,
    prompt: 'Какая планета находится ближе всего к Солнцу?',
    options: ['Марс', 'Венера', 'Меркурий', 'Юпитер'],
    answer: 2
  },
  {
    id: 2,
    prompt: 'Кто написал роман «Мастер и Маргарита»?',
    options: ['Булгаков', 'Достоевский', 'Толстой', 'Набоков'],
    answer: 0
  },
  {
    id: 3,
    prompt: 'Сколько континентов на Земле?',
    options: ['5', '6', '7', '8'],
    answer: 2
  }
];

export function SessionPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentQuestion];

  const progress = useMemo(() => {
    if (isFinished) {
      return 100;
    }

    return Math.round((currentQuestion / questions.length) * 100);
  }, [currentQuestion, isFinished]);

  const handleAnswer = () => {
    if (selectedOption === null) {
      return;
    }

    const isCorrect = selectedOption === question.answer;

    if (isCorrect) {
      setScore((value) => value + 1);
    }

    const isLastQuestion = currentQuestion === questions.length - 1;

    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestion((value) => value + 1);
    setSelectedOption(null);
  };

  if (isFinished) {
    return (
      <section style={{ marginTop: 24 }}>
        <h2>Игра завершена 🎉</h2>
        <p>
          Ваш результат: {score} / {questions.length}
        </p>
        <p style={{ color: '#4a5568' }}>Попробуйте ещё раз и побейте собственный рекорд.</p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 24, maxWidth: 680 }}>
      <h2>Игровая сессия</h2>
      <p style={{ color: '#4a5568' }}>
        Вопрос {currentQuestion + 1} из {questions.length}
      </p>
      <div style={{ height: 8, width: '100%', background: '#edf2f7', borderRadius: 99 }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#2b6cb0',
            borderRadius: 99,
            transition: 'width 0.2s ease'
          }}
        />
      </div>

      <article style={{ marginTop: 18, border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>{question.prompt}</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;

            return (
              <button
                key={option}
                onClick={() => setSelectedOption(index)}
                style={{
                  textAlign: 'left',
                  border: isSelected ? '1px solid #2b6cb0' : '1px solid #cbd5e0',
                  background: isSelected ? '#ebf8ff' : '#fff',
                  borderRadius: 8,
                  padding: '10px 12px',
                  cursor: 'pointer'
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAnswer}
          disabled={selectedOption === null}
          style={{
            marginTop: 14,
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            background: selectedOption === null ? '#a0aec0' : '#2b6cb0',
            color: '#fff',
            cursor: selectedOption === null ? 'not-allowed' : 'pointer'
          }}
        >
          Ответить
        </button>
      </article>
    </section>
  );
}
