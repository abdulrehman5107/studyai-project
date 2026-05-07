export default function Summary({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "var(--text-muted)" }}>No summary available.</p>;

  return (
    <div>
      <h3 className="section-title">Key Points</h3>
      <div className="summary-list">
        {data.map((point, i) => (
          <div className="summary-item" key={i}>
            <span className="summary-num">{i + 1}</span>
            <p className="summary-text">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
