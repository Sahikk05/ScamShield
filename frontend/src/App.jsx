import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Link,
  MessageSquare,
  AlertTriangle,
  LayoutDashboard,
  ScanLine,
  History,
  Info,
  Lock,
  ArrowRight,
  Clock3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Activity,
  Zap,
} from "lucide-react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("message");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("home");

  useEffect(() => {
    const savedHistory =
      JSON.parse(localStorage.getItem("scamShieldHistory")) || [];
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
    localStorage.setItem(
      "scamShieldHistory",
      JSON.stringify(updatedHistory)
    );
  };

  const analyzeURL = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(
        "https://scamshield-api-rc48.onrender.com/analyze-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: message,
          }),
        }
      );

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
      setError(
        "⏳ AI service is waking up. The first scan may take a few seconds. Please try again shortly."
      );
      setLoading(false);
    }
  };

  const analyzeMessage = async () => {
  try {
    setError("");
    setLoading(true);
    setResult(null);

    const response = await fetch(
      "https://scamshield-api-rc48.onrender.com/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
        }),
      }
    );

    const rawResponse = await response.text();

    console.log("Message analysis status:", response.status);
    console.log("Message analysis response:", rawResponse);

    let data;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      console.error("Backend returned non-JSON response:", rawResponse);
      setError(
        "The AI service returned an unexpected response. Please try again."
      );
      setLoading(false);
      return;
    }

    if (!response.ok || data.error) {
      console.error("AI analysis error:", data.error || data);
      setError(
        data.error ||
          `Unable to analyze the message. Server returned ${response.status}.`
      );
      setLoading(false);
      return;
    }

    setResult(data);
    saveToHistory(data, message, "message");
    setLoading(false);
  } catch (error) {
    console.error("Backend connection error:", error);

    setError(
      "⏳ AI service is waking up. The first scan may take a few seconds. Please try again shortly."
    );

    setLoading(false);
  }
};

  const analyzeCombined = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(
        "https://scamshield-api-rc48.onrender.com/analyze-combined",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("AI combined analysis error:", data.error);
        setError(
          "Unable to analyze the message and URL. Please try again."
        );
        setLoading(false);
        return;
      }

      setResult(data);
      saveToHistory(data, message, "combined");
      setLoading(false);
    } catch (error) {
      console.error("Backend connection error:", error);
      setError(
        "⏳ AI service is waking up. The first scan may take a few seconds. Please try again shortly."
      );
      setLoading(false);
    }
  };

  const runAnalysis = () => {
    if (mode === "message") {
      analyzeMessage();
    } else if (mode === "url") {
      analyzeURL();
    } else {
      analyzeCombined();
    }
  };

  const goToScan = (selectedMode = mode) => {
    setMode(selectedMode);
    setActivePage("scan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearHistory = () => {
    localStorage.removeItem("scamShieldHistory");
    setHistory([]);
  };

  const getModeLabel = (scanMode) => {
    if (scanMode === "url") return "URL";
    if (scanMode === "combined") return "Message + URL";
    return "Message";
  };

  const getRiskClass = (score) => {
    if (score >= 70) return "risk-high";
    if (score >= 40) return "risk-medium";
    return "risk-low";
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return "High Risk";
    if (score >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const renderScanner = () => (
    <section className="scanner-workspace">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">AI SECURITY SCANNER</span>
          <h2>Analyze suspicious content</h2>
          <p>
            Paste a message, URL, or both. ScamShield will identify
            suspicious patterns and explain the risk.
          </p>
        </div>

        <div className="workspace-status">
          <span />
          AI engine ready
        </div>
      </div>

      <div className="scanner-tabs">
        <button
          className={`scanner-tab ${
            mode === "message" ? "active" : ""
          }`}
          onClick={() => setMode("message")}
        >
          <MessageSquare size={18} />
          <span>
            <strong>Message</strong>
            <small>Analyze text</small>
          </span>
        </button>

        <button
          className={`scanner-tab ${mode === "url" ? "active" : ""}`}
          onClick={() => setMode("url")}
        >
          <Link size={18} />
          <span>
            <strong>URL</strong>
            <small>Check a link</small>
          </span>
        </button>

        <button
          className={`scanner-tab ${
            mode === "combined" ? "active" : ""
          }`}
          onClick={() => setMode("combined")}
        >
          <ShieldCheck size={18} />
          <span>
            <strong>Message + URL</strong>
            <small>Context analysis</small>
          </span>
        </button>
      </div>

      <div className="input-panel">
        <div className="input-topline">
          <div className="input-mode">
            {mode === "message" && <MessageSquare size={17} />}
            {mode === "url" && <Link size={17} />}
            {mode === "combined" && <ShieldCheck size={17} />}
            <span>
              {mode === "message"
                ? "Suspicious message"
                : mode === "url"
                ? "Suspicious URL"
                : "Message + URL"}
            </span>
          </div>

          <span className="character-note">
            {message.length} characters
          </span>
        </div>

        <textarea
          placeholder={
            mode === "message"
              ? "Paste a suspicious message here..."
              : mode === "url"
              ? "Paste a suspicious URL here..."
              : "Paste the suspicious message and URL here..."
          }
          rows="8"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError("");
          }}
        />

        <div className="scanner-footer">
          <div className="privacy-note">
            <Lock size={15} />
            Your input is processed securely
          </div>

          <button
            className="analyze-btn"
            onClick={runAnalysis}
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <>
                <span className="button-spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                {mode === "message"
                  ? "Analyze Message"
                  : mode === "url"
                  ? "Analyze URL"
                  : "Analyze Message + URL"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
    </section>
  );

  const renderResult = () => {
    if (!result) return null;

    const score = Number(result.score) || 0;
    const riskClass = getRiskClass(score);

    return (
      <section className="result-card">
        <div className="result-header">
          <div className="result-title-area">
            <div className="result-complete">
              <CheckCircle2 size={15} />
              ANALYSIS COMPLETE
            </div>

            <h2>{result.category}</h2>

            <p className="scam-type">
              {result.scamType
                ? result.scamType.charAt(0).toUpperCase() +
                  result.scamType.slice(1)
                : "Suspicious activity"}
            </p>

            {mode === "url" && result.domain && (
              <div className="scanned-domain">
                <Link size={14} />
                {result.domain}
              </div>
            )}
          </div>

          <div className={`risk-score ${riskClass}`}>
            <div className="risk-score-number">
              {score}
              <span>%</span>
            </div>
            <strong>{getRiskLabel(score)}</strong>
            <small>
              {result.redFlags?.length || 0} indicators detected
            </small>
          </div>
        </div>

        <div className="result-grid">
          <div className="result-section">
            <div className="section-heading">
              <div className="section-icon danger">
                <AlertTriangle size={17} />
              </div>
              <div>
                <h3>Red Flags Detected</h3>
                <span>Suspicious signals found</span>
              </div>
            </div>

            {result.redFlags?.length > 0 ? (
              <ul className="red-flags">
                {result.redFlags.map((flag, index) => (
                  <li key={index}>
                    <span>{index + 1}</span>
                    {flag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-result">
                No major warning signs detected.
              </p>
            )}
          </div>

          <div className="result-section">
            <div className="section-heading">
              <div className="section-icon purple">
                <Zap size={17} />
              </div>
              <div>
                <h3>Scam Tactics</h3>
                <span>Detected manipulation techniques</span>
              </div>
            </div>

            <div className="tactics-list">
              {result.scamTactics?.map((tactic, index) => (
                <span className="tactic-tag" key={index}>
                  {tactic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="result-section explanation-section">
          <div className="section-heading">
            <div className="section-icon blue">
              <Activity size={17} />
            </div>
            <div>
              <h3>Why This Was Flagged</h3>
              <span>AI explanation</span>
            </div>
          </div>

          <p>{result.explanation}</p>
        </div>

        <div className="recommendation">
  <strong>🛡️ Recommended Action</strong>

  <p>
    {result.score < 30
      ? "✅ No major risk detected. The content appears relatively safe based on the available indicators. You can proceed, but remain cautious with unexpected requests for sensitive information."

      : result.score < 60
      ? "⚠️ Some suspicious indicators were detected. Verify the sender, website, or request independently before taking any action or sharing personal information."

      : result.score < 80
      ? "🟠 High caution is advised. Avoid clicking suspicious links or sharing personal information until the source has been independently verified."

      : "🔴 Do not interact with this content. Do not click suspicious links or share OTPs, passwords, PINs, banking information, or other sensitive information. Verify the source through an official channel."
    }
  </p>
</div>
      </section>
    );
  };

  const renderHistory = () => (
    <section className="page-section history-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SCAN HISTORY</span>
          <h1>Your recent security scans</h1>
          <p>
            Review your previous ScamShield analyses stored locally on
            this device.
          </p>
        </div>

        {history.length > 0 && (
          <button className="danger-outline-btn" onClick={clearHistory}>
            <Trash2 size={16} />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <div className="empty-history-icon">
            <History size={30} />
          </div>
          <h2>No scans yet</h2>
          <p>
            Your recent analyses will appear here after you scan
            suspicious content.
          </p>
          <button
            className="primary-btn"
            onClick={() => setActivePage("scan")}
          >
            Start a Scan
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((scan) => (
            <div className="history-card" key={scan.id}>
              <div className="history-card-top">
                <div className="history-mode">
                  {scan.mode === "url" ? (
                    <Link size={15} />
                  ) : scan.mode === "combined" ? (
                    <ShieldCheck size={15} />
                  ) : (
                    <MessageSquare size={15} />
                  )}
                  {getModeLabel(scan.mode)}
                </div>

                <div
                  className={`history-risk ${getRiskClass(
                    Number(scan.score)
                  )}`}
                >
                  {scan.score}%
                </div>
              </div>

              <h3>
                {scan.category}{" "}
                <span>•</span>{" "}
                {scan.scamType}
              </h3>

              <p className="history-input">
                {scan.input.length > 130
                  ? scan.input.slice(0, 130) + "..."
                  : scan.input}
              </p>

              <div className="history-card-footer">
                <span>
                  <Clock3 size={14} />
                  {scan.timestamp}
                </span>

                <button
                  onClick={() => {
                    setMessage(scan.input);
                    setMode(scan.mode);
                    setResult(null);
                    setActivePage("scan");
                  }}
                >
                  Recheck
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderAbout = () => (
    <section className="page-section about-page">
      <div className="about-hero">
        <div className="about-shield">
          <ShieldCheck size={42} />
        </div>

        <span className="eyebrow">ABOUT SCAMSHIELD AI</span>

        <h1>
          Think before
          <span> you click.</span>
        </h1>

        <p>
          ScamShield AI is an AI-powered scam and phishing detection
          assistant designed to help users understand suspicious
          digital communication before taking action.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-card-icon">
            <ScanLine size={20} />
          </div>
          <h3>What it does</h3>
          <p>
            Analyze suspicious messages, URLs, or a message and its
            embedded URL together.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <Activity size={20} />
          </div>
          <h3>Explainable results</h3>
          <p>
            Get a risk score, scam category, red flags, tactics,
            explanation, and recommended action.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <Lock size={20} />
          </div>
          <h3>Privacy focused</h3>
          <p>
            Recent scan history is stored locally in your browser
            using localStorage.
          </p>
        </div>
      </div>

      <div className="tech-stack-card">
        <div>
          <span className="eyebrow">TECHNOLOGY</span>
          <h2>Built for practical security analysis</h2>
        </div>

        <div className="tech-tags">
          <span>React</span>
          <span>Vite</span>
          <span>Python</span>
          <span>FastAPI</span>
          <span>Groq AI</span>
          <span>REST API</span>
          <span>Vercel</span>
          <span>Render</span>
        </div>
      </div>
    </section>
  );

  const renderHome = () => (
    <>
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            AI-POWERED SECURITY ASSISTANT
          </div>

          <h1>
            Think before
            <br />
            <span>you click.</span>
          </h1>

          <p>
            Detect suspicious messages and URLs, understand the
            warning signs, and know what to do next.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => goToScan("message")}
            >
              Start Analysis
              <ArrowRight size={18} />
            </button>

            <button
              className="secondary-btn"
              onClick={() => setActivePage("history")}
            >
              <History size={17} />
              View History
            </button>
          </div>

          <div className="hero-trust">
            <span>
              <CheckCircle2 size={15} />
              Explainable AI
            </span>
            <span>
              <Lock size={15} />
              Local history
            </span>
            <span>
              <Zap size={15} />
              Fast analysis
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="radar-card">
            <div className="radar-header">
              <span>SECURITY STATUS</span>
              <span className="online">
                <i /> ACTIVE
              </span>
            </div>

            <div className="radar">
              <div className="radar-ring ring-one" />
              <div className="radar-ring ring-two" />
              <div className="radar-ring ring-three" />
              <div className="radar-cross horizontal" />
              <div className="radar-cross vertical" />
              <div className="radar-sweep" />
              <div className="radar-center">
                <ShieldCheck size={24} />
              </div>
              <span className="radar-point point-one" />
              <span className="radar-point point-two" />
              <span className="radar-point point-three" />
            </div>

            <div className="radar-footer">
              <span>Threat monitoring</span>
              <strong>READY</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mode-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">CHOOSE YOUR ANALYSIS</span>
            <h2>Three ways to stay protected</h2>
          </div>
          <p>
            Select the type of content you want ScamShield to
            investigate.
          </p>
        </div>

        <div className="mode-cards">
          <button
            className="mode-card"
            onClick={() => goToScan("message")}
          >
            <div className="mode-icon blue-icon">
              <MessageSquare size={23} />
            </div>
            <span className="mode-number">01</span>
            <h3>Analyze Message</h3>
            <p>
              Detect urgency, impersonation, threats, OTP requests,
              and other social-engineering patterns.
            </p>
            <span className="card-link">
              Scan a message <ArrowRight size={15} />
            </span>
          </button>

          <button
            className="mode-card"
            onClick={() => goToScan("url")}
          >
            <div className="mode-icon purple-icon">
              <Link size={23} />
            </div>
            <span className="mode-number">02</span>
            <h3>Analyze URL</h3>
            <p>
              Examine suspicious links and identify potentially
              fraudulent or deceptive destinations.
            </p>
            <span className="card-link">
              Check a URL <ArrowRight size={15} />
            </span>
          </button>

          <button
            className="mode-card featured-mode"
            onClick={() => goToScan("combined")}
          >
            <div className="mode-icon cyan-icon">
              <ShieldCheck size={23} />
            </div>
            <span className="mode-number">03</span>
            <h3>Message + URL</h3>
            <p>
              Analyze the message and embedded link together for
              additional context.
            </p>
            <span className="card-link">
              Run contextual scan <ArrowRight size={15} />
            </span>
          </button>
        </div>
      </section>

      <section className="home-features">
        <div className="feature-panel">
          <span className="eyebrow">WHY SCAMSHIELD</span>
          <h2>
            More than a simple
            <span> scam / not-scam label.</span>
          </h2>
          <p>
            ScamShield breaks down suspicious content into
            understandable signals so you can see what triggered the
            risk assessment.
          </p>

          <div className="feature-list">
            <div>
              <div className="feature-check">
                <CheckCircle2 size={16} />
              </div>
              <span>
                <strong>Risk Detection</strong>
                Identify suspicious patterns.
              </span>
            </div>

            <div>
              <div className="feature-check">
                <CheckCircle2 size={16} />
              </div>
              <span>
                <strong>Explainable Results</strong>
                Understand why content was flagged.
              </span>
            </div>

            <div>
              <div className="feature-check">
                <CheckCircle2 size={16} />
              </div>
              <span>
                <strong>Actionable Guidance</strong>
                Know what to do next.
              </span>
            </div>
          </div>
        </div>

        <div className="scam-types-panel">
          <div className="mini-panel-header">
            <span>COMMON SIGNALS</span>
            <AlertTriangle size={17} />
          </div>

          <h3>Patterns ScamShield can identify</h3>

          <div className="signal-chips">
            <span>Urgency</span>
            <span>Impersonation</span>
            <span>OTP Requests</span>
            <span>Threats</span>
            <span>Fake KYC</span>
            <span>Suspicious URLs</span>
            <span>Credential Requests</span>
            <span>Social Engineering</span>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>

          <div>
            <strong>ScamShield</strong>
            <span>AI SECURITY</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">MENU</span>

          <button
            className={activePage === "home" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("home")}
          >
            <LayoutDashboard size={18} />
            Home
          </button>

          <button
            className={activePage === "scan" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("scan")}
          >
            <ScanLine size={18} />
            Scan
          </button>

          <button
            className={
              activePage === "history" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActivePage("history")}
          >
            <History size={18} />
            History
            {history.length > 0 && (
              <span className="nav-count">{history.length}</span>
            )}
          </button>

          <button
            className={activePage === "about" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("about")}
          >
            <Info size={18} />
            About
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="protection-card">
            <div className="protection-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Protection Active</strong>
              <span>AI scanner ready</span>
            </div>
            <i />
          </div>

          <div className="sidebar-footer">
            <span>ScamShield AI</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark">
              <ShieldCheck size={19} />
            </div>
            <strong>ScamShield</strong>
          </div>

          <div className="topbar-page">
            {activePage === "home" && "Security Overview"}
            {activePage === "scan" && "AI Scanner"}
            {activePage === "history" && "Scan History"}
            {activePage === "about" && "About ScamShield"}
          </div>

          <div className="topbar-status">
            <span />
            System Operational
          </div>
        </header>

        <div className="content-container">
          {activePage === "home" && renderHome()}

          {activePage === "scan" && (
            <>
              {renderScanner()}
              {renderResult()}
            </>
          )}

          {activePage === "history" && renderHistory()}

          {activePage === "about" && renderAbout()}
        </div>
      </main>
    </div>
  );
}

export default App;