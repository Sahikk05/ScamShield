import React, { useState } from "react";
import { ShieldCheck, Link, MessageSquare, AlertTriangle } from "lucide-react";
import "./App.css";

function App() {
const [message, setMessage] = useState("");
const [mode, setMode] = useState("message");
const [result, setResult] = useState(null);

  const analyzeURL = () => {
const url = message.trim().toLowerCase();
const redFlags = [];

let domain = "";

try {
  const parsedURL = new URL(url);
  domain = parsedURL.hostname;
} catch {
  domain = "Invalid URL";
}

  if (url.startsWith("http://")) {
    redFlags.push("Uses an insecure HTTP connection");
  }

  if (url.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
    redFlags.push("Uses an IP address instead of a domain name");
  }

  if (url.match(/verify|login|secure|account|update|confirm|bank/)) {
    redFlags.push("Contains words commonly used in phishing links");
  }

  if (url.length > 80) {
    redFlags.push("Unusually long URL");
  }

  if (url.match(/@|-{2,}|\.xyz|\.top|\.click/)) {
    redFlags.push("Contains potentially suspicious domain patterns");
  }

  const score = Math.min(98, 10 + redFlags.length * 20);

  let category = "Low Risk";

  if (score >= 70) {
    category = "High Risk";
  } else if (score >= 40) {
    category = "Potentially Suspicious";
  }

setResult({
  score,
  category,
  scamType: "Suspicious URL",
  domain,
  redFlags,
  explanation:
    redFlags.length > 0
      ? "This URL contains one or more patterns commonly associated with suspicious or phishing links."
      : "No obvious suspicious patterns were detected in this URL.",
});
};
  const analyzeMessage = () => {
    const text = message.toLowerCase();

    const redFlags = [];

    if (text.match(/urgent|immediately|now|today|expires|blocked/)) {
      redFlags.push("Creates urgency or pressure");
    }

    if (text.match(/otp|password|pin|cvv|bank|account|kyc/)) {
      redFlags.push("Requests sensitive financial information");
    }

    if (text.match(/click|verify|confirm|login|link/)) {
      redFlags.push("Contains a suspicious verification request");
    }

    if (text.match(/prize|winner|reward|lottery|cashback|free/)) {
      redFlags.push("Uses a reward or prize lure");
    }

    const score = Math.min(
      98,
      15 + redFlags.length * 20
    );

    let category = "Low Risk";
let scamType = "No clear scam pattern";

if (text.match(/sbi|bank|kyc|account|otp|upi|cvv|pin|debit|credit|blocked/)) {
  scamType = "Banking / KYC Scam";
} else if (text.match(/prize|winner|lottery|reward|cashback|free gift|congratulations/)) {
  scamType = "Prize / Lottery Scam";
} else if (text.match(/job|hiring|work from home|salary|vacancy|registration fee|interview/)) {
  scamType = "Job Scam";
} else if (text.match(/instagram|facebook|whatsapp|telegram|account suspended|verify your account|login/)) {
  scamType = "Social Media / Account Scam";
} else if (text.match(/click|verify|confirm|login|http|www|link/)) {
  scamType = "Phishing";
}

if (score >= 70) {
  category = "High Risk";
} else if (score >= 40) {
  category = "Potentially Suspicious";
}

 setResult({
  score,
  category,
  scamType,
  redFlags,
  explanation:
    scamType === "Banking / KYC Scam"
      ? "This message uses urgency and requests sensitive banking information, which are common warning signs of financial scams."
      : scamType === "Prize / Lottery Scam"
      ? "This message uses a reward or prize to encourage you to act quickly or provide personal information."
      : scamType === "Job Scam"
      ? "This message may be suspicious because it combines job-related claims with requests or instructions that could lead to financial loss."
      : scamType === "Social Media / Account Scam"
      ? "This message may be attempting to make you reveal account credentials by creating a verification or account-security concern."
      : scamType === "Phishing"
      ? "This message contains language commonly used to make users click a link or provide information without verifying the sender."
      : "No strong scam pattern was identified in this message.",
});
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
{mode === "message" ? "Analyze Message" : "Analyze URL"}
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
              {result && (
          <div className="result-card">
            <div className="result-header">
              <div>
                <span className="result-label">ANALYSIS COMPLETE</span>
                <h2>{result.category}</h2>
                <p className="scam-type">{result.scamType}</p>

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
    </div>
  );
}

export default App;