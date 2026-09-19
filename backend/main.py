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
            "explanation": ai_result["explanation"]
        }

    except Exception as e:
        return {
            "error": str(e)
        }


@app.post("/analyze-url")
def analyze_url(request: ScanRequest):
    url = request.text.strip().lower()
    red_flags = []

    try:
        parsed_url = urlparse(url)
        domain = parsed_url.hostname or "Invalid URL"
    except Exception:
        domain = "Invalid URL"

    if url.startswith("http://"):
        red_flags.append("Uses an insecure HTTP connection")

    if any(char.isdigit() for char in domain) and "." in domain:
        parts = domain.split(".")
        if all(part.isdigit() for part in parts):
            red_flags.append("Uses an IP address instead of a domain name")

    if any(word in url for word in [
        "verify", "login", "secure", "account", "update", "confirm", "bank"
    ]):
        red_flags.append("Contains words commonly used in phishing links")

    if len(url) > 80:
        red_flags.append("Unusually long URL")

    if any(pattern in url for pattern in [
        "@", "--", ".xyz", ".top", ".click"
    ]):
        red_flags.append("Contains potentially suspicious domain patterns")

    if any(shortener in domain for shortener in [
        "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "shorturl.at"
    ]):
        red_flags.append("Uses a URL shortening service that hides the destination")

    score = min(98, 10 + len(red_flags) * 20)

    if score >= 70:
        category = "High Risk"
    elif score >= 40:
        category = "Potentially Suspicious"
    else:
        category = "Low Risk"

    explanation = (
        "This URL contains one or more patterns commonly associated "
        "with suspicious or phishing links."
        if red_flags
        else "No obvious suspicious patterns were detected in this URL."
    )

    return {
        "score": score,
        "category": category,
        "scamType": "Suspicious URL",
        "domain": domain,
        "redFlags": red_flags,
        "explanation": explanation,
    }

