import os
import json
from dotenv import load_dotenv
from groq import Groq

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import urlparse
import re

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="ScamShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "ScamShield API is running"}


def ai_analyze_message(text: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": """You are ScamShield AI, a cybersecurity assistant.

Analyze the user's message for scam, phishing, fraud, or social-engineering indicators.

Return a structured security analysis.

riskScore must be between 0 and 100.
redFlags must contain specific warning signs actually found in the message.
scamTactics must identify the manipulation tactics actually used in the message.
Use only these categories when applicable:
Urgency, Threat, Impersonation, OTP Request, Credential Harvesting, Financial Pressure, Suspicious Link.
Do not include tactics that are not supported by the message.
Do not invent facts that are not present in the message."""
            },
            {
                "role": "user",
                "content": text
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "scam_analysis",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "scamType": {
                            "type": "string"
                        },
                        "riskScore": {
                            "type": "number"
                        },
                        "redFlags": {
    "type": "array",
    "items": {
        "type": "string"
    }
},
"scamTactics": {
    "type": "array",
    "items": {
        "type": "string"
    }
},
"explanation": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scamType",
                        "riskScore",
                        "redFlags",
"scamTactics",
"explanation"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )

    return json.loads(response.choices[0].message.content)

def check_url_structure(url: str):
    flags = []

    parsed = urlparse(url)
    domain = parsed.hostname or ""

    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
        flags.append("URL uses an IP address instead of a domain name")

    if "@" in url:
        flags.append("URL contains an @ symbol that can hide the actual destination")

    if len(url) > 100:
        flags.append("URL is unusually long")

    shorteners = [
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "is.gd",
        "cutt.ly",
        "shorturl.at"
    ]

    if domain.lower() in shorteners:
        flags.append("URL uses a URL shortening service")

    if domain.count(".") >= 3:
        flags.append("URL contains multiple subdomains")

    return flags

def ai_analyze_url(url: str, structure_flags):
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": """You are ScamShield AI, a cybersecurity assistant.

Analyze the provided URL for phishing, scam, malicious, or suspicious characteristics.

Consider:
- suspicious domain names
- impersonation of trusted brands
- unusual subdomains
- misleading paths
- URL shorteners
- unusual or potentially suspicious TLDs (but do not treat a TLD alone as proof of a scam)
- excessive URL length
- use of IP addresses
- deceptive URL patterns

Only report warning signs that can actually be observed from the URL.
Do not claim that a website is malicious based on a single signal such as a TLD, URL length, or subdomain. Base the assessment on multiple observable indicators when possible.

Return a structured security analysis.

riskScore must be between 0 and 100.
redFlags must contain specific warning signs actually found in the URL.
scamTactics must identify the manipulation or deception tactics supported by the URL.
Use only these categories when applicable:
Impersonation, Suspicious Link, Credential Harvesting, Urgency, Financial Pressure.
Do not include tactics that are not supported by the URL.
Use cautious language. Describe a URL as suspicious or potentially phishing when the evidence is based only on URL characteristics. Do not state that it is confirmed malicious unless there is direct evidence in the URL itself."""

            },
            {
                "role": "user",
                "content": f"""URL: {url}

Automatically detected URL structure signals:
{structure_flags}"""
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "url_analysis",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "scamType": {
                            "type": "string"
                        },
                        "riskScore": {
                            "type": "number"
                        },
                        "redFlags": {
    "type": "array",
    "items": {"type": "string"}
},
"scamTactics": {
    "type": "array",
    "items": {"type": "string"}
},
"explanation": {"type": "string"}
                    },
                    "required": [
                        "scamType",
                        "riskScore",
                        "redFlags",
                        "scamTactics",
                        "explanation"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )

    return json.loads(response.choices[0].message.content)


@app.post("/analyze")
def analyze(request: ScanRequest):
    try:
        ai_result = ai_analyze_message(request.text)

        score = max(0, min(100, int(ai_result["riskScore"])))

        if score >= 70:
            category = "High Risk"
        elif score >= 40:
            category = "Potentially Suspicious"
        else:
            category = "Low Risk"

        return {
    "score": score,
    "category": category,
    "scamType": ai_result["scamType"],
    "redFlags": ai_result["redFlags"],
    "scamTactics": ai_result["scamTactics"],
    "explanation": ai_result["explanation"]
}

    except Exception as e:
        return {
            "error": str(e)
        }


@app.post("/analyze-url")
def analyze_url(request: ScanRequest):
    try:
        url = request.text.strip()

        parsed_url = urlparse(url)
        domain = parsed_url.hostname or "Invalid URL"

        structure_flags = check_url_structure(url)

        ai_result = ai_analyze_url(url, structure_flags)

        score = max(0, min(100, int(ai_result["riskScore"])))

        if score >= 70:
            category = "High Risk"
        elif score >= 40:
            category = "Potentially Suspicious"
        else:
            category = "Low Risk"

        return {
            "score": score,
            "category": category,
            "scamType": ai_result["scamType"],
            "domain": domain,
            "redFlags": ai_result["redFlags"],
            "scamTactics": ai_result["scamTactics"],
            "explanation": ai_result["explanation"]
        }

    except Exception as e:
        return {
            "error": str(e)
        }

