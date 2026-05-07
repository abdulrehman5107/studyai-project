import { useState } from "react";

export default function ShortQuestions({ data }) {
  const [open, setOpen] = useState({});

  if (!data || data.length === 0) return <p style={{ color: "var(--text-muted)" }}>No practice questions available.</p>;

  const toggle = (i) => setOpen((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div>
      <h3 className="section-title">Practice Questions</h3>
      <div className="sq-list">
        {data.map((q, i) => (
          <div key={i} className={`sq-item ${open[i] ? "open" : ""}`}>
            <div className="sq-q" onClick={() => toggle(i)}>
              <span className="sq-num">Q{i + 1}</span>
              <p className="sq-text">{q.question}</p>
              <span className="sq-chevron">▾</span>
            </div>
            {open[i] && (
              <div className="sq-answer">{q.sample_answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
