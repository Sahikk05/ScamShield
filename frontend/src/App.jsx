import React, { useEffect, useState } from "react";
import { ShieldCheck, Link, MessageSquare, AlertTriangle } from "lucide-react";
import "./App.css";

function App() {
const [message, setMessage] = useState("");
const [mode, setMode] = useState("message");
const [result, setResult] = useState(null);
const [history, setHistory] = useState([]);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

useEffect(() => {
  const savedHistory = JSON.parse(localStorage.getItem("scamShieldHistory")) || [];
  setHistory(savedHistory);
}, []);

const saveToHistory = (data, input, scanMode) => {
  const newScan = {
    id: Date.now(),
    input,
    mode: scanMode,
    score: data.score,
    category: data.category,
    scamType: data.scamType,
    timestamp: new Date().toLocaleString(),
  };

  const updatedHistory = [newScan, ...history].slice(0, 10);

  setHistory(updatedHistory);
  localStorage.setItem("scamShieldHistory", JSON.stringify(updatedHistory));
};

const analyzeURL = async () => {
  try {
    setError("");
    setLoading(true);

    const response = await fetch("https://scamshield-api-rc48.onrender.com/analyze-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    });

const data = await response.json();

if (!response.ok || data.error) {
  console.error("AI URL analysis error:", data.error);
  setError("Unable to analyze the URL. Please try again.");
  setLoading(false);
  return;
}

setResult(data);
saveToHistory(data, message, "url");
setLoading(false);
  } catch (error) {
    console.error("Backend URL analysis error:", error);
    setError("Unable to connect to ScamShield AI. Please try again.");
    setLoading(false);
  }
};
const analyzeMessage = async () => {
  try {
    setError("");
setLoading(true);

    const response = await fetch("https://scamshield-api-rc48.onrender.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    });

const data = await response.json();

if (!response.ok || data.error) {
  console.error("AI analysis error:", data.error);
  setError("Unable to analyze the message. Please try again.");
  setLoading(false);
  return;
}

setResult(data);
saveToHistory(data, message, "message");
setLoading(false);
} catch (error) {
    console.error("Backend connection error:", error);
    setError("Unable to connect to ScamShield AI. Please try again.");
    setLoading(false);
  }
};
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <ShieldCheck size={28} />
          <span>ScamShield</span>
          <small>AI</small>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Protection Active
        </div>
      </header>

      <main className="hero">
        <div className="hero-badge">
          <ShieldCheck size={16} />
          AI-Powered Scam Detection
        </div>

        <h1>
          Detect scams
          <br />
          <span>before they detect you.</span>
        </h1>

        <p className="subtitle">
          Analyze suspicious messages and links to identify scam patterns,
          understand the warning signs, and stay protected.
        </p>

        <div className="scanner">
          <div className="scanner-tabs">
            <button
  className={`tab ${mode === "message" ? "active" : ""}`}
  onClick={() => setMode("message")}
>
  <MessageSquare size={18} />
  Message
</button>

<button
  className={`tab ${mode === "url" ? "active" : ""}`}
  onClick={() => setMode("url")}
>
  <Link size={18} />
  URL
</button>
          </div>

<textarea
  placeholder={
    mode === "message"
      ? "Paste a suspicious message here..."
      : "Paste a suspicious URL here..."
  }
  rows="6"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

          <div className="scanner-footer">
            <span>🔒 Your message stays private</span>
            <button
  className="analyze-btn"
  onClick={mode === "message" ? analyzeMessage : analyzeURL}
  disabled={!message.trim()}
>
<ShieldCheck size={18} />
{loading
  ? "Analyzing..."
  : mode === "message"
  ? "Analyze Message"
  : "Analyze URL"}
</button>
          </div>
                </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="features">
          <div className="feature">
            <ShieldCheck size={22} />
            <div>
              <strong>Risk Detection</strong>
              <p>Identify suspicious patterns</p>
            </div>
          </div>

          <div className="feature">
            <AlertTriangle size={22} />
            <div>
              <strong>Explainable Results</strong>
              <p>Understand why it's risky</p>
            </div>
          </div>

          <div className="feature">
            <Link size={22} />
            <div>
              <strong>URL Analysis</strong>
              <p>Check suspicious links</p>
            </div>
          </div>
        </div>
      </main>
              {result && (
          <div className="result-card">
            <div className="result-header">
              <div>
                <span className="result-label">ANALYSIS COMPLETE</span>
                <h2>{result.category}</h2>
                <p className="scam-type">
  {result.scamType.charAt(0).toUpperCase() + result.scamType.slice(1)}
</p>

                {mode === "url" && result.domain && (
  <p className="scanned-domain">
    🌐 {result.domain}
  </p>
)}
              </div>

              <div className="risk-score">
  <strong>{result.score}%</strong>
  <span>Risk Score</span>
  <small>{result.redFlags.length} indicators detected</small>
</div>
            </div>

            <div className="result-section">
              <h3>🚩 Red Flags Detected</h3>

              {result.redFlags.length > 0 ? (
                <ul>
                  {result.redFlags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              ) : (
                <p>No major warning signs detected.</p>
              )}
            </div>

            <div className="result-section">
  <h3>🧠 Scam Tactics</h3>

  <div className="tactics-list">
    {result.scamTactics?.map((tactic, index) => (
      <span className="tactic-tag" key={index}>
        {tactic}
      </span>
    ))}
  </div>
</div>
            
            <div className="result-section">
  <h3>💡 Why This Was Flagged</h3>
  <p>{result.explanation}</p>
</div>

            <div className="recommendation">
  <strong>🛡️ Recommended Action</strong>

  <p>
    {mode === "message"
      ? "Do not click suspicious links or share OTPs, passwords, PINs, or banking information."
      : "Do not open this link. Verify the website domain independently before entering any personal or financial information."
    }
  </p>
</div>
          </div>
        )}
              {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
  <h2>🕘 Recent Scans</h2>

  <button
    className="clear-history-btn"
    onClick={() => {
      localStorage.removeItem("scamShieldHistory");
      setHistory([]);
    }}
  >
    Clear History
  </button>
</div>

          <div className="history-list">
            {history.map((scan) => (
              <div className="history-item" key={scan.id}>
                <div>
                  <strong>
                    {scan.category} — {scan.scamType}
                  </strong>

                  <p>
                    {scan.mode === "url"
                      ? scan.input
                      : scan.input.length > 80
                      ? scan.input.slice(0, 80) + "..."
                      : scan.input}
                  </p>

                  <small>{scan.timestamp}</small>
                </div>

                <span className="history-score">
                  {scan.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;