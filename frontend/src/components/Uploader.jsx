import { useState, useRef } from "react";

export default function Uploader({ onProcess, error }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      alert("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    setFile(f);
    setText("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = () => {
    const fd = new FormData();
    if (file) {
      fd.append("file", file);
    } else if (text.trim()) {
      fd.append("text", text.trim());
    } else {
      alert("Please upload a file or paste some text.");
      return;
    }
    onProcess(fd);
  };

  const canSubmit = file || text.trim().length > 50;

  return (
    <div className="uploader">
      <div
        className={`upload-zone ${dragging ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <span className="upload-icon">◈</span>
        <h2 className="upload-title">Drop your lecture here</h2>
        <p className="upload-sub">or click to browse your files</p>
        <div className="upload-types">
          {["PDF", "DOCX", "TXT"].map((t) => (
            <span key={t} className="type-pill">{t}</span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: "none" }}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
      </div>

      {file && (
        <div className="selected-file">
          <span>◈</span>
          <span>{file.name}</span>
          <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
            {(file.size / 1024).toFixed(1)} KB
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {!file && (
        <>
          <div className="divider">or paste text directly</div>
          <textarea
            className="paste-area"
            placeholder="Paste your lecture notes, textbook excerpt, or any study material here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </>
      )}

      {error && <div className="error-msg">⚠ {error}</div>}

      <button className="btn-process" onClick={handleSubmit} disabled={!canSubmit}>
        Generate Study Materials →
      </button>
    </div>
  );
}
