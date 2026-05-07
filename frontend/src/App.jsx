import { useState, useRef, useEffect } from "react";

// ── Cursor-following aurora ───────────────────────────────────────────────────
function AuroraCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const mouse = { x: W * 0.5, y: H * 0.5 };
    const orbs = [
      { cx: W*0.5, cy: H*0.5, lag:0.04,  offX:-0.25, offY:-0.2,  r:0.42, color:"124,111,255", opacity:0.16 },
      { cx: W*0.5, cy: H*0.5, lag:0.025, offX:0.22,  offY:0.18,  r:0.38, color:"255,107,157", opacity:0.13 },
      { cx: W*0.5, cy: H*0.5, lag:0.015, offX:-0.1,  offY:0.3,   r:0.32, color:"6,214,160",   opacity:0.10 },
      { cx: W*0.5, cy: H*0.5, lag:0.032, offX:0.3,   offY:-0.25, r:0.28, color:"255,209,102", opacity:0.09 },
    ];
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const onMove = (e) => { const ev = e.touches?e.touches[0]:e; mouse.x=ev.clientX; mouse.y=ev.clientY; };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive:true });
    let frame;
    const draw = () => {
      ctx.clearRect(0,0,W,H); ctx.fillStyle="#050508"; ctx.fillRect(0,0,W,H);
      orbs.forEach(o => {
        o.cx += (mouse.x+o.offX*W - o.cx)*o.lag;
        o.cy += (mouse.y+o.offY*H - o.cy)*o.lag;
        const px=Math.max(0,Math.min(W,o.cx)), py=Math.max(0,Math.min(H,o.cy));
        const r=o.r*Math.min(W,H), g=ctx.createRadialGradient(px,py,0,px,py,r);
        g.addColorStop(0,`rgba(${o.color},${o.opacity})`);
        g.addColorStop(0.45,`rgba(${o.color},${o.opacity*0.4})`);
        g.addColorStop(1,`rgba(${o.color},0)`);
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });
      frame=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMove); window.removeEventListener("touchmove",onMove); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

const Grain = () => (
  <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
    opacity:0.5 }} />
);

const Tag = ({ children, color="#7c6fff" }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20,
    border:`1px solid ${color}44`, background:`${color}12`, color, fontSize:11,
    fontFamily:"var(--font-mono)", letterSpacing:"0.06em", fontWeight:500 }}>{children}</span>
);

const GlassCard = ({ children, style={}, glow=null }) => (
  <div style={{ background:"rgba(255,255,255,0.035)", backdropFilter:"blur(20px)",
    border:"1px solid rgba(255,255,255,0.08)", borderRadius:20,
    boxShadow:glow?`0 0 40px ${glow}1a, inset 0 1px 0 rgba(255,255,255,0.06)`:"inset 0 1px 0 rgba(255,255,255,0.06)",
    ...style }}>{children}</div>
);

// ── Upload zone ───────────────────────────────────────────────────────────────
const ACCEPTED_EXTS = [".pdf",".docx",".pptx",".txt"];
const ACCEPTED_MIME = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain";

function UploadZone({ onFileReady, onTextExtracted }) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [notice, setNotice] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setNotice(null);
    const ok = ACCEPTED_EXTS.some(ext => f.name.toLowerCase().endsWith(ext));
    if (!ok) { setNotice({ msg:"Unsupported file. Use PDF, DOCX, PPTX, or TXT." }); return; }
    setFile(f); onFileReady(f);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {[["📄","PDF","#ff6b9d"],["📝","DOCX","#7c6fff"],["📊","PPTX","#06d6a0"],["📃","TXT","#ffd166"]].map(([icon,label,color])=>(
          <div key={label} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20, background:`${color}12`, border:`1px solid ${color}28`, color, fontSize:12, fontWeight:600 }}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
      <div onClick={()=>inputRef.current.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
        style={{ border:`2px dashed ${drag?"#7c6fff":notice?"#ff6b9d":file?"#06d6a0":"rgba(255,255,255,0.1)"}`,
          borderRadius:16, padding:"26px 20px", textAlign:"center", cursor:"pointer",
          background:drag?"rgba(124,111,255,0.06)":file?"rgba(6,214,160,0.04)":"rgba(255,255,255,0.02)", transition:"all 0.2s" }}>
        <input ref={inputRef} type="file" accept={ACCEPTED_MIME} style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
        <div style={{fontSize:30, marginBottom:7}}>{file?"✅":"📂"}</div>
        <div style={{color:file?"#06d6a0":"rgba(255,255,255,0.65)", fontSize:14, fontWeight:600}}>
          {file?`✓ ${file.name}`:"Drop your file here or click to browse"}
        </div>
        <div style={{color:"rgba(255,255,255,0.28)", fontSize:12, marginTop:4}}>Supports PDF, DOCX, PPTX, TXT</div>
      </div>
      {notice && <div style={{padding:"12px 15px",borderRadius:12,fontSize:13,background:"rgba(255,107,157,0.08)",border:"1px solid rgba(255,107,157,0.25)",color:"#ff6b9d"}}>⚠️ {notice.msg}</div>}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
        <span style={{color:"rgba(255,255,255,0.2)",fontSize:12,fontFamily:"var(--font-mono)"}}>or paste text</span>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
      </div>
      <div style={{position:"relative"}}>
        <textarea value={text} onChange={e=>{setText(e.target.value);setCharCount(e.target.value.length);setFile(null);}}
          placeholder="Paste your lecture notes, transcript, or any text here..."
          style={{width:"100%",minHeight:130,padding:"15px",background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:13,color:"var(--text)",
            fontFamily:"var(--font-display)",fontSize:14,lineHeight:1.6,resize:"vertical",outline:"none",
            transition:"border-color 0.2s",boxSizing:"border-box"}}
          onFocus={e=>e.target.style.borderColor="rgba(124,111,255,0.45)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"} />
        <div style={{position:"absolute",bottom:9,right:12,fontSize:11,color:"rgba(255,255,255,0.18)",fontFamily:"var(--font-mono)"}}>{charCount.toLocaleString()} chars</div>
      </div>
      {!file && (
        <button onClick={()=>text.trim()&&onTextExtracted(text.trim())} disabled={!text.trim()}
          style={{padding:"13px 26px",borderRadius:13,
            background:text.trim()?"linear-gradient(135deg,#7c6fff,#ff6b9d)":"rgba(255,255,255,0.05)",
            color:text.trim()?"#fff":"rgba(255,255,255,0.2)",border:"none",
            cursor:text.trim()?"pointer":"not-allowed",fontFamily:"var(--font-display)",
            fontWeight:700,fontSize:15,boxShadow:text.trim()?"0 4px 22px rgba(124,111,255,0.35)":"none",transition:"all 0.2s"}}>
          Generate Study Pack ✦
        </button>
      )}
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingState({ tab }) {
  const msgs = ({
    summary:["Distilling key concepts...","Finding the signal...","Building your summary..."],
    flashcards:["Creating memory anchors...","Crafting flip cards...","Building your deck..."],
    quiz:["Writing tricky questions...","Setting the challenge...","Loading quiz..."],
    practice:["Crafting open questions...","Building practice set...","Almost ready..."],
    notes:["Structuring your notes...","Formatting lecture content...","Almost done..."],
  })[tab]||["Generating..."];
  const [idx,setIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%msgs.length),2000);return()=>clearInterval(t);},[msgs.length]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"72px 24px",gap:18}}>
      <div style={{position:"relative",width:50,height:50}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.04)"}}/>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#7c6fff",animation:"spin 0.9s linear infinite"}}/>
        <div style={{position:"absolute",inset:7,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#ff6b9d",animation:"spin 1.4s linear infinite reverse"}}/>
      </div>
      <div style={{color:"rgba(255,255,255,0.38)",fontSize:13,fontFamily:"var(--font-mono)"}}>{msgs[idx]}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
function SummaryView({ data }) {
  if (!data) return null;
  const lines = Array.isArray(data) ? data : data.split("\n").filter(l=>l.trim());
  const bullets = lines.filter(l=>/^[-•*]\s/.test(l));
  const prose = lines.filter(l=>!/^[-•*]\s/.test(l));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:11}}>
      {prose.map((line,i)=><p key={i} style={{color:"rgba(255,255,255,0.78)",lineHeight:1.75,fontSize:15}}>{line}</p>)}
      {(bullets.length>0?bullets:lines).map((b,i)=>(
        <div key={i} style={{display:"flex",gap:11,alignItems:"flex-start"}}>
          <span style={{color:"#7c6fff",fontSize:15,lineHeight:1.5,flexShrink:0}}>◆</span>
          <span style={{color:"rgba(255,255,255,0.73)",lineHeight:1.65,fontSize:15}}>{b.replace(/^[-•*]\s/,"")}</span>
        </div>
      ))}
    </div>
  );
}

// ── Flashcards ────────────────────────────────────────────────────────────────
function FlashcardsView({ cards }) {
  const [idx,setIdx]=useState(0);
  const [flipped,setFlipped]=useState(false);
  if (!cards||!cards.length) return null;
  const card=cards[idx];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center"}}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.28)",fontFamily:"var(--font-mono)"}}>{idx+1} / {cards.length}</div>
      <div onClick={()=>setFlipped(f=>!f)} style={{width:"100%",minHeight:180,cursor:"pointer",perspective:1000}}>
        <div style={{position:"relative",width:"100%",minHeight:180,transformStyle:"preserve-3d",transition:"transform 0.5s",transform:flipped?"rotateY(180deg)":"none"}}>
          <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",background:"rgba(124,111,255,0.08)",border:"1px solid rgba(124,111,255,0.2)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,gap:10}}>
            <div style={{fontSize:11,color:"rgba(124,111,255,0.6)",fontFamily:"var(--font-mono)",letterSpacing:"0.1em"}}>QUESTION</div>
            <p style={{fontSize:16,fontWeight:600,textAlign:"center",lineHeight:1.6,color:"rgba(255,255,255,0.88)"}}>{card.question}</p>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:6}}>tap to reveal</div>
          </div>
          <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",background:"rgba(6,214,160,0.07)",border:"1px solid rgba(6,214,160,0.2)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,gap:10}}>
            <div style={{fontSize:11,color:"rgba(6,214,160,0.6)",fontFamily:"var(--font-mono)",letterSpacing:"0.1em"}}>ANSWER</div>
            <p style={{fontSize:15,textAlign:"center",lineHeight:1.65,color:"rgba(255,255,255,0.82)"}}>{card.answer}</p>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{setIdx(i=>Math.max(0,i-1));setFlipped(false);}} disabled={idx===0}
          style={{padding:"8px 18px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",cursor:idx===0?"not-allowed":"pointer",fontFamily:"var(--font-display)",fontWeight:600,fontSize:13}}>← Prev</button>
        <button onClick={()=>setFlipped(f=>!f)}
          style={{padding:"8px 18px",borderRadius:9,background:"rgba(124,111,255,0.12)",border:"1px solid rgba(124,111,255,0.2)",color:"#c4bdff",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600,fontSize:13}}>Flip</button>
        <button onClick={()=>{setIdx(i=>Math.min(cards.length-1,i+1));setFlipped(false);}} disabled={idx===cards.length-1}
          style={{padding:"8px 18px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",cursor:idx===cards.length-1?"not-allowed":"pointer",fontFamily:"var(--font-display)",fontWeight:600,fontSize:13}}>Next →</button>
      </div>
    </div>
  );
}

// ── Quiz (new questions on retry) ────────────────────────────────────────────
function QuizView({ questions: initialQs, onRetry }) {
  const [questions, setQuestions] = useState(initialQs);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Shuffle helper
  const shuffle = (arr) => [...arr].sort(()=>Math.random()-0.5);

  const handleRetry = () => {
    // Shuffle question order AND shuffle options within each question → feels like new quiz
    const reshuffled = shuffle(questions).map(q => ({
      ...q,
      options: q.options ? shuffle(q.options) : q.options,
    }));
    setQuestions(reshuffled);
    setAnswers({});
    setSubmitted(false);
  };

  if (!questions||!questions.length) return null;
  const score = submitted ? questions.filter((q,i)=>answers[i]===(q.correct_answer||q.answer)).length : null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {submitted && (
        <GlassCard glow="#7c6fff" style={{padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",fontFamily:"var(--font-mono)"}}>SCORE</div>
              <div style={{fontSize:28,fontWeight:800,color:"#7c6fff"}}>{score}/{questions.length}</div>
            </div>
            <div style={{fontSize:36}}>{score>=questions.length*0.7?"🏆":score>=questions.length*0.5?"👏":"📚"}</div>
          </div>
          <div style={{marginTop:10,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
            <div style={{height:"100%",width:`${(score/questions.length)*100}%`,background:"linear-gradient(90deg,#7c6fff,#06d6a0)",borderRadius:2,transition:"width 0.6s"}}/>
          </div>
        </GlassCard>
      )}
      {questions.map((q,qi)=>{
        const opts=q.options||[];
        const correct=q.correct_answer||q.answer;
        const chosen=answers[qi];
        return (
          <GlassCard key={qi} style={{padding:"16px 18px"}}>
            <div style={{display:"flex",gap:9,alignItems:"flex-start",marginBottom:11}}>
              <span style={{flexShrink:0,width:23,height:23,borderRadius:6,background:"rgba(124,111,255,0.18)",color:"#7c6fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:"var(--font-mono)"}}>{qi+1}</span>
              <p style={{fontSize:14,fontWeight:600,lineHeight:1.55}}>{q.question}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,paddingLeft:32}}>
              {opts.map((opt,oi)=>{
                let bg="rgba(255,255,255,0.04)",border="rgba(255,255,255,0.07)",color="rgba(255,255,255,0.68)";
                if(submitted){
                  if(opt===correct){bg="rgba(6,214,160,0.12)";border="#06d6a0";color="#06d6a0";}
                  else if(opt===chosen){bg="rgba(255,107,157,0.1)";border="#ff6b9d";color="#ff6b9d";}
                }else if(chosen===opt){bg="rgba(124,111,255,0.14)";border="#7c6fff";color="#c4bdff";}
                return <div key={oi} onClick={()=>!submitted&&setAnswers(a=>({...a,[qi]:opt}))}
                  style={{padding:"8px 12px",borderRadius:8,background:bg,border:`1px solid ${border}`,color,cursor:submitted?"default":"pointer",fontSize:14,transition:"all 0.15s"}}>{opt}</div>;
              })}
            </div>
            {submitted&&q.explanation&&(
              <div style={{marginTop:10,paddingLeft:32,fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:10}}>
                💡 {q.explanation}
              </div>
            )}
          </GlassCard>
        );
      })}
      {!submitted
        ? <button onClick={()=>setSubmitted(true)} style={{padding:"12px",borderRadius:11,background:"linear-gradient(135deg,#7c6fff,#ff6b9d)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:15,boxShadow:"0 4px 20px rgba(124,111,255,0.28)"}}>Submit Quiz ✦</button>
        : <button onClick={handleRetry} style={{padding:"12px",borderRadius:11,background:"rgba(124,111,255,0.1)",color:"#c4bdff",border:"1px solid rgba(124,111,255,0.2)",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600,fontSize:14}}>🔀 Retry with Shuffled Questions</button>
      }
    </div>
  );
}

// ── Practice (labeled short/long with beautiful answers) ─────────────────────
function PracticeView({ questions }) {
  const [shown, setShown] = useState({});
  if (!questions||!questions.length) return null;

  // Classify: short if sample_answer < 100 chars, else long
  const classify = (q) => {
    const ans = typeof q==="object" ? (q.sample_answer||q.answer||"") : "";
    return ans.length < 120 ? "short" : "long";
  };

  const shortQs = questions.filter(q=>classify(q)==="short");
  const longQs  = questions.filter(q=>classify(q)==="long");

  const renderQ = (q, i, globalIdx) => {
    const text = typeof q==="string" ? q : q.question;
    const answer = typeof q==="object" ? (q.sample_answer||q.answer||null) : null;
    const isLong = classify(q)==="long";
    const color = isLong ? "#7c6fff" : "#06d6a0";
    return (
      <GlassCard key={globalIdx} style={{padding:"16px 18px"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{color,fontFamily:"var(--font-mono)",fontSize:11,flexShrink:0,paddingTop:3,
            background:`${color}14`,border:`1px solid ${color}30`,borderRadius:6,padding:"2px 7px",fontWeight:700}}>
            Q{i+1}
          </span>
          <div style={{flex:1}}>
            <p style={{color:"rgba(255,255,255,0.88)",fontSize:15,lineHeight:1.65,fontWeight:500}}>{text}</p>
            {answer && (
              <>
                <button onClick={()=>setShown(s=>({...s,[globalIdx]:!s[globalIdx]}))}
                  style={{marginTop:10,padding:"5px 13px",borderRadius:7,background:`${color}10`,
                    border:`1px solid ${color}28`,color,cursor:"pointer",fontSize:12,
                    fontFamily:"var(--font-display)",fontWeight:600,transition:"all 0.15s"}}>
                  {shown[globalIdx]?"▲ Hide Answer":"▼ Show Answer"}
                </button>
                {shown[globalIdx] && (
                  <div style={{marginTop:11,padding:"13px 15px",borderRadius:10,
                    background:`${color}08`,border:`1px solid ${color}18`}}>
                    <div style={{fontSize:11,color:`${color}99`,fontFamily:"var(--font-mono)",marginBottom:6,letterSpacing:"0.06em"}}>SAMPLE ANSWER</div>
                    <p style={{color:"rgba(255,255,255,0.72)",fontSize:14,lineHeight:1.75}}>{answer}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {shortQs.length>0 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{height:1,flex:1,background:"rgba(6,214,160,0.15)"}}/>
            <span style={{fontSize:12,color:"#06d6a0",fontFamily:"var(--font-mono)",fontWeight:700,letterSpacing:"0.08em"}}>SHORT QUESTIONS</span>
            <div style={{height:1,flex:1,background:"rgba(6,214,160,0.15)"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {shortQs.map((q,i)=>renderQ(q,i,i))}
          </div>
        </div>
      )}
      {longQs.length>0 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{height:1,flex:1,background:"rgba(124,111,255,0.15)"}}/>
            <span style={{fontSize:12,color:"#7c6fff",fontFamily:"var(--font-mono)",fontWeight:700,letterSpacing:"0.08em"}}>LONG QUESTIONS</span>
            <div style={{height:1,flex:1,background:"rgba(124,111,255,0.15)"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {longQs.map((q,i)=>renderQ(q,i,shortQs.length+i))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notes (beautiful formatted + PDF download) ───────────────────────────────
function NotesView({ notes }) {
  if (!notes) return null;

  // Normalize: could be string or array
  const rawText = Array.isArray(notes) ? notes.join("\n\n") : (notes || "");

  const handleDownloadPDF = () => {
    // Use jsPDF loaded from CDN via window
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:"mm", format:"a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 18;
    const maxW = pageW - margin * 2;
    let y = 20;

    const lines = rawText.split("\n");
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (!line.trim()) { y += 4; return; }

      if (/^## /.test(line)) {
        y += 3;
        doc.setFontSize(14); doc.setFont("helvetica","bold");
        doc.setTextColor(124,111,255);
        const wrapped = doc.splitTextToSize(line.replace(/^## /,""), maxW);
        doc.text(wrapped, margin, y); y += wrapped.length * 7 + 3;
      } else if (/^# /.test(line)) {
        y += 4;
        doc.setFontSize(17); doc.setFont("helvetica","bold");
        doc.setTextColor(200,190,255);
        const wrapped = doc.splitTextToSize(line.replace(/^# /,""), maxW);
        doc.text(wrapped, margin, y); y += wrapped.length * 9 + 4;
      } else if (/^[-•*] /.test(line)) {
        doc.setFontSize(11); doc.setFont("helvetica","normal");
        doc.setTextColor(180,180,200);
        const txt = "• " + line.replace(/^[-•*] /,"").replace(/\*\*/g,"");
        const wrapped = doc.splitTextToSize(txt, maxW - 4);
        doc.text(wrapped, margin + 4, y); y += wrapped.length * 5.5 + 1;
      } else {
        doc.setFontSize(11); doc.setFont("helvetica","normal");
        doc.setTextColor(210,210,220);
        const clean = line.replace(/\*\*/g,"");
        const wrapped = doc.splitTextToSize(clean, maxW);
        doc.text(wrapped, margin, y); y += wrapped.length * 5.5 + 2;
      }
    });
    doc.save("lecture-notes.pdf");
  };

  const renderLine = (line, i) => {
    if (!line.trim()) return <div key={i} style={{height:8}}/>;
    if (/^# /.test(line)) {
      return <div key={i} style={{fontSize:21,fontWeight:800,color:"#c4bdff",marginTop:22,marginBottom:6,lineHeight:1.3,borderBottom:"1px solid rgba(124,111,255,0.2)",paddingBottom:6}}>{line.replace(/^# /,"")}</div>;
    }
    if (/^## /.test(line)) {
      return <div key={i} style={{fontSize:16,fontWeight:700,color:"#a8d8ea",marginTop:16,marginBottom:4,lineHeight:1.4}}>{line.replace(/^## /,"")}</div>;
    }
    if (/^### /.test(line)) {
      return <div key={i} style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.85)",marginTop:10,marginBottom:3}}>{line.replace(/^### /,"")}</div>;
    }
    if (/^[-•*] /.test(line)||/^\d+\. /.test(line)) {
      const isNum = /^\d+\. /.test(line);
      const txt = line.replace(/^[-•*] /,"").replace(/^\d+\. /,"");
      const parts = txt.split(/(\*\*[^*]+\*\*)/);
      return (
        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:4,paddingLeft:4}}>
          <span style={{color:"#7c6fff",flexShrink:0,fontSize:13,lineHeight:1.8,marginTop:1}}>{isNum?"›":"◆"}</span>
          <span style={{color:"rgba(255,255,255,0.78)",fontSize:14,lineHeight:1.75}}>
            {parts.map((p,j)=>p.startsWith("**")?<strong key={j} style={{color:"rgba(255,255,255,0.95)",fontWeight:700}}>{p.replace(/\*\*/g,"")}</strong>:<span key={j}>{p}</span>)}
          </span>
        </div>
      );
    }
    // Normal paragraph — handle inline bold
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    if (parts.length > 1) {
      return <p key={i} style={{color:"rgba(255,255,255,0.72)",fontSize:14,lineHeight:1.8,marginBottom:3}}>
        {parts.map((p,j)=>p.startsWith("**")?<strong key={j} style={{color:"rgba(255,255,255,0.92)",fontWeight:700}}>{p.replace(/\*\*/g,"")}</strong>:<span key={j}>{p}</span>)}
      </p>;
    }
    return <p key={i} style={{color:"rgba(255,255,255,0.72)",fontSize:14,lineHeight:1.8,marginBottom:3}}>{line}</p>;
  };

  // Load jsPDF dynamically if not already present
  useEffect(() => {
    if (!window.jspdf) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
          <button onClick={handleDownloadPDF}
            style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,
              background:"rgba(6,214,160,0.1)",border:"1px solid rgba(6,214,160,0.25)",color:"#06d6a0",
              cursor:"pointer",fontSize:13,fontFamily:"var(--font-display)",fontWeight:700}}>
            ⬇ Download PDF
          </button>
        </div>
        <div style={{padding:"20px 22px",background:"rgba(255,255,255,0.02)",borderRadius:14,border:"1px solid rgba(255,255,255,0.05)"}}>
          {rawText.split("\n").map((line,i)=>renderLine(line,i))}
        </div>
      </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = [
  { id:"summary",    label:"Summary",    icon:"◎", color:"#7c6fff" },
  { id:"notes",      label:"Notes",      icon:"✎", color:"#06d6a0" },
  { id:"flashcards", label:"Flashcards", icon:"⟁", color:"#ff6b9d" },
  { id:"quiz",       label:"Quiz",       icon:"◉", color:"#ffd166" },
  { id:"practice",   label:"Practice",   icon:"◈", color:"#a8d8ea" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState("upload");

  const handleGenerate = async (textOrFile, isFile=false) => {
    setLoading(true);
    setStep("results");
    setResults(null);
    try {
      const form = new FormData();
      if (isFile) form.append("file", textOrFile);
      else form.append("text", textOrFile);
      const res = await fetch("http://localhost:5000/generate", { method:"POST", body:form });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ error:"Could not connect to the backend. Make sure it's running on port 5000." });
    } finally {
      setLoading(false);
    }
  };

  const currentTab = TABS.find(t=>t.id===activeTab);

  return (
    <>
      <AuroraCanvas />
      <Grain />
      <div style={{position:"relative",zIndex:2,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <header style={{padding:"17px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.05)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:10,background:"rgba(5,5,8,0.6)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:33,height:33,borderRadius:9,background:"linear-gradient(135deg,#7c6fff,#ff6b9d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧠</div>
            <div>
              <div style={{fontWeight:800,fontSize:16,letterSpacing:"-0.03em"}}>StudyAI</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.26)",fontFamily:"var(--font-mono)"}}>groq · llama 3.3</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Tag color="#06d6a0">● Free</Tag>
            {step==="results" && <button onClick={()=>{setStep("upload");setResults(null);}} style={{padding:"6px 13px",borderRadius:7,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontFamily:"var(--font-display)",fontSize:13,fontWeight:600}}>← New</button>}
          </div>
        </header>

        <main style={{flex:1,padding:"38px 18px",maxWidth:820,margin:"0 auto",width:"100%"}}>
          {step==="upload" && (
            <div style={{animation:"fadeUp 0.5s ease"}}>
              <div style={{textAlign:"center",marginBottom:40}}>
                <div style={{marginBottom:13}}><Tag color="#7c6fff">✦ AI Study Assistant</Tag></div>
                <h1 style={{fontSize:"clamp(1.85rem,5.5vw,3.2rem)",fontWeight:800,letterSpacing:"-0.04em",lineHeight:1.1,marginBottom:13,background:"linear-gradient(135deg,#f0eff8 30%,rgba(124,111,255,0.85) 65%,#ff6b9d)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                  Turn lectures into<br/>knowledge that sticks
                </h1>
                <p style={{color:"rgba(255,255,255,0.36)",fontSize:15,lineHeight:1.65,maxWidth:420,margin:"0 auto"}}>
                  Upload PDF, DOCX, PPTX or paste text. Get summaries, notes, flashcards, quizzes, and practice questions instantly.
                </p>
              </div>
              <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:32}}>
                {[["◎","Summaries","#7c6fff"],["✎","Smart Notes","#06d6a0"],["⟁","Flashcards","#ff6b9d"],["◉","MCQ Quiz","#ffd166"],["◈","Practice Q's","#a8d8ea"]].map(([icon,label,color])=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:20,background:`${color}0d`,border:`1px solid ${color}20`,color,fontSize:13,fontWeight:600}}><span>{icon}</span><span>{label}</span></div>
                ))}
              </div>
              <GlassCard glow="#7c6fff" style={{padding:24}}>
                <UploadZone onFileReady={f=>handleGenerate(f,true)} onTextExtracted={t=>handleGenerate(t,false)} />
              </GlassCard>
            </div>
          )}

          {step==="results" && (
            <div style={{animation:"fadeUp 0.4s ease"}}>
              <div style={{display:"flex",gap:3,marginBottom:20,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:13,padding:4,overflowX:"auto"}}>
                {TABS.map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                    style={{flex:1,minWidth:80,padding:"9px 4px",borderRadius:9,
                      background:activeTab===tab.id?`${tab.color}16`:"transparent",
                      border:`1px solid ${activeTab===tab.id?tab.color+"26":"transparent"}`,
                      color:activeTab===tab.id?tab.color:"rgba(255,255,255,0.3)",
                      cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:13,
                      transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                    <span>{tab.icon}</span><span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <GlassCard glow={currentTab?.color} style={{padding:"20px 20px",minHeight:260}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                  <Tag color={currentTab?.color}>{currentTab?.icon} {currentTab?.label}</Tag>
                </div>
                {loading ? <LoadingState tab={activeTab} />
                  : results?.error ? <div style={{textAlign:"center",color:"#ff6b9d",padding:"38px 0",fontSize:14}}>⚠ {results.error}</div>
                  : results ? (
                    <>
                      {activeTab==="summary"    && <SummaryView data={results.summary} />}
                      {activeTab==="notes"      && <NotesView notes={results.notes} />}
                      {activeTab==="flashcards" && <FlashcardsView cards={results.flashcards} />}
                      {activeTab==="quiz"       && <QuizView questions={results.quiz||results.mcqs} />}
                      {activeTab==="practice"   && <PracticeView questions={results.practice||results.practice_questions||results.similar_questions} />}
                    </>
                  ) : null}
              </GlassCard>
            </div>
          )}
        </main>

        <footer style={{padding:"13px 26px",textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.12)",fontSize:12,fontFamily:"var(--font-mono)"}}>
          studyai · groq llama 3.3 70b · free forever
        </footer>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(13px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  );
}
