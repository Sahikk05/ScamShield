import os
import json
from dotenv import load_dotenv
from groq import Groq

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import urlparse

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

def ai_analyze_url(url: str):
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
- suspicious TLDs
- excessive URL length
- use of IP addresses
- deceptive URL patterns

Only report warning signs that can actually be observed from the URL.
Do not claim that a website is malicious unless the URL itself provides evidence.

Return a structured security analysis.

riskScore must be between 0 and 100.
redFlags must contain specific warning signs actually found in the URL."""
            },
            {
                "role": "user",
                "content": url
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

        ai_result = ai_analyze_url(url)

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
            "explanation": ai_result["explanation"]
        }

    except Exception as e:
        return {
            "error": str(e)
        }

