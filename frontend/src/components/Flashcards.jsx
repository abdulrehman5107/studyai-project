import { useState } from "react";

export default function Flashcards({ data }) {
  const [flipped, setFlipped] = useState({});
  const [cards, setCards] = useState(data || []);

  if (!cards || cards.length === 0) return <p style={{ color: "var(--text-muted)" }}>No flashcards available.</p>;

  const toggle = (i) => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));

  const shuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setFlipped({});
  };

  const flippedCount = Object.values(flipped).filter(Boolean).length;

  return (
    <div>
      <h3 className="section-title">Flashcards</h3>
      <div className="fc-controls">
        <span className="fc-counter">
          {flippedCount} / {cards.length} reviewed
        </span>
        <button className="btn-shuffle" onClick={shuffle}>⇄ Shuffle</button>
      </div>
      <div className="flashcards-grid">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`flashcard ${flipped[i] ? "flipped" : ""}`}
            onClick={() => toggle(i)}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <span className="card-label">Question</span>
                <p className="card-text">{card.question}</p>
                <span className="card-hint">tap to reveal →</span>
              </div>
              <div className="flashcard-back">
                <span className="card-label">Answer</span>
                <p className="card-text">{card.answer}</p>
                <span className="card-hint">tap to flip back</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
