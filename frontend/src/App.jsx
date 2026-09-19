import { ShieldCheck, Link, MessageSquare, AlertTriangle } from "lucide-react";
import "./App.css";

function App() {
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
            <button className="tab active">
              <MessageSquare size={18} />
              Message
            </button>

            <button className="tab">
              <Link size={18} />
              URL
            </button>
          </div>

          <textarea
            placeholder="Paste a suspicious message here..."
            rows="6"
          />

          <div className="scanner-footer">
            <span>🔒 Your message stays private</span>
            <button className="analyze-btn">
              <ShieldCheck size={18} />
              Analyze Message
            </button>
          </div>
        </div>

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
    </div>
  );
}

export default App;