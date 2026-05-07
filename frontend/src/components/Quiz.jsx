import { useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz({ data }) {
  const [answers, setAnswers] = useState({});

  if (!data || data.length === 0) return <p style={{ color: "var(--text-muted)" }}>No quiz questions available.</p>;

  const answered = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(
    ([qi, ai]) => Number(ai) === data[Number(qi)].correct
  ).length;

  const pick = (qi, ai) => {
    if (answers[qi] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qi]: ai }));
  };

  return (
    <div>
      <h3 className="section-title">Multiple Choice Quiz</h3>

      {answered === data.length && (
        <div className="quiz-score" style={{ marginBottom: "1.5rem" }}>
          <p className="score-label">FINAL SCORE</p>
          <p>
            <span className="score-num">{correct}</span>
            <span className="score-total"> / {data.length}</span>
          </p>
        </div>
      )}

      <div className="quiz">
        {data.map((q, qi) => {
          const userAns = answers[qi];
          const isAnswered = userAns !== undefined;

          return (
            <div key={qi} className={`quiz-q ${isAnswered ? "answered" : ""}`}>
              <div className="q-header">
                <span className="q-num">Q{qi + 1}</span>
                <p className="q-text">{q.question}</p>
              </div>
              <div className="options">
                {q.options.map((opt, ai) => {
                  let cls = "option";
                  if (isAnswered) {
                    if (ai === q.correct) cls += " correct";
                    else if (ai === userAns) cls += " wrong";
                  }
                  return (
                    <button
                      key={ai}
                      className={cls}
                      onClick={() => pick(qi, ai)}
                      disabled={isAnswered}
                    >
                      <span className="opt-letter">{LETTERS[ai]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div className="explanation">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
