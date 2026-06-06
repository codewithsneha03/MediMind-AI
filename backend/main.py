from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from doctors import doctors_data
from knowledge_base import KNOWLEDGE_BASE
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_user_optional

from fastapi.responses import FileResponse
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet

from database import engine, SessionLocal
from models_db import (
    Base,
    PredictionHistory,
    User
)

from joblib import load

import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(".env")

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

gemini_model = genai.GenerativeModel("gemini-2.0-flash")

app = FastAPI()

Base.metadata.create_all(bind=engine)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model and vectorizer
model = load("models/disease_model.pkl")
vectorizer = load("models/vectorizer.pkl")


# Specialist mapping
specialist_mapping = {
    "Flu": "General Physician",
    "Common Cold": "General Physician",
    "Heart Disease": "Cardiologist",
    "Allergy": "Dermatologist",
    "Migraine": "Neurologist",
    "Arthritis": "Orthopedic",
    "Food Poisoning": "Gastroenterologist",
    "Diabetes": "Endocrinologist",
    "Anxiety Disorder": "Psychiatrist",
    "Spine Disorder": "Orthopedic"
}

medicine_mapping = {
    "Flu": [
        "Paracetamol",
        "Cough Syrup"
    ],

    "Common Cold": [
        "Cetirizine",
        "Vitamin C"
    ],

    "Heart Disease": [
        "Consult Cardiologist Immediately"
    ],

    "Allergy": [
        "Antihistamine",
        "Calamine Lotion"
    ],

    "Migraine": [
        "Ibuprofen",
        "Paracetamol"
    ],

    "Arthritis": [
        "Pain Relief Gel",
        "Ibuprofen"
    ],

    "Food Poisoning": [
        "ORS",
        "Probiotics"
    ],

    "Diabetes": [
        "Consult Endocrinologist"
    ],

    "Anxiety Disorder": [
        "Stress Management",
        "Consult Psychiatrist"
    ],

    "Spine Disorder": [
        "Pain Relief Spray",
        "Physiotherapy"
    ]
}


class SymptomRequest(BaseModel):
    symptoms: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/")
def home():
    return {"message": "MediMind AI Backend Running"}


@app.post("/register")
def register(data: RegisterRequest):
    db = SessionLocal()
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=data.name, email=data.email, password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.close()
    return {"message": "User registered successfully"}


@app.post("/login")
def login(data: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    db.close()
    return {"token": token, "name": user.name, "email": user.email}


@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "name": user.name, "email": user.email}


@app.post("/predict")
def predict(data: SymptomRequest, current_user: dict = Depends(get_current_user_optional)):

    symptoms = data.symptoms.lower()

    # Convert input into vector
    symptoms_vector = vectorizer.transform([symptoms])

    # Predict disease
    prediction = model.predict(symptoms_vector)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(symptoms_vector)

    # Highest confidence
    confidence = round(max(probabilities[0]) * 100, 2)

    # Get specialist
    specialist = specialist_mapping.get(
        prediction,
        "General Physician"
    )

    medicines = medicine_mapping.get(
    prediction,
    ["Consult Doctor"]
    )

    db = SessionLocal()
    user_id = int(current_user["sub"]) if current_user else None
    record = PredictionHistory(
    symptoms=symptoms,
    disease=prediction,
    specialist=specialist,
    confidence=confidence,
    user_id=user_id
    )
    
    db.add(record)
    db.commit()
    db.close()

    return {
    "prediction": prediction,
    "specialist": specialist,
    "confidence": confidence,
    "medicines": medicines
    }

@app.get("/history")
def get_history(current_user: dict = Depends(get_current_user)):

    db = SessionLocal()
    user_id = int(current_user["sub"])

    records = db.query(
        PredictionHistory
    ).filter(
        PredictionHistory.user_id == user_id
    ).all()

    db.close()

    return [
        {
            "id": record.id,
            "symptoms": record.symptoms,
            "disease": record.disease,
            "specialist": record.specialist,
            "confidence": record.confidence
        }
        for record in records
    ]


@app.delete("/history/{record_id}")
def delete_history(record_id: int, current_user: dict = Depends(get_current_user)):

    db = SessionLocal()
    user_id = int(current_user["sub"])

    record = db.query(
        PredictionHistory
    ).filter(
        PredictionHistory.id == record_id,
        PredictionHistory.user_id == user_id
    ).first()

    if not record:
        db.close()
        return {
            "message": "Record not found"
        }

    db.delete(record)
    db.commit()
    db.close()

    return {
        "message": "Record deleted successfully"
    }

@app.post("/chat")
def chat(data: SymptomRequest):

    symptoms = data.symptoms.lower()

    # Convert text into vector
    symptoms_vector = vectorizer.transform([symptoms])

    # Predict disease
    prediction = model.predict(symptoms_vector)[0]

    # Get specialist
    specialist = specialist_mapping.get(
        prediction,
        "General Physician"
    )

    medicines = medicine_mapping.get(
    prediction,
    ["Consult Doctor"]
    )

    # Generate chatbot response
    response = f"""
Possible condition: {prediction}

Recommended specialist: {specialist}

Suggested OTC Medicines:
- {'\n- '.join(medicines)}

Advice:
- Drink plenty of water
- Take proper rest
- Consult a doctor if symptoms worsen
- Do not self-medicate excessively
"""

    return {
        "response": response
    }


@app.post("/chat-ai")
def chat_ai(data: SymptomRequest):

    symptoms = data.symptoms.lower()

    symptoms_vector = vectorizer.transform(
        [symptoms]
    )

    prediction = model.predict(
        symptoms_vector
    )[0]

    specialist = specialist_mapping.get(
        prediction,
        "General Physician"
    )

    medicines = medicine_mapping.get(
        prediction,
        ["Consult Doctor"]
    )

    probabilities = model.predict_proba(
    symptoms_vector
    )

    confidence = round(
    max(probabilities[0]) * 100,
    2
    )

    # --- RAG: Retrieve matching knowledge base article ---
    kb_article = KNOWLEDGE_BASE.get(prediction, {})
    kb_description = kb_article.get("description", "")
    kb_home_care = kb_article.get("home_care", [])
    kb_warnings = kb_article.get("warning_signs", [])

    kb_context = ""
    if kb_article:
        kb_context = f"""
--- Verified Clinical Reference ---
Description: {kb_description}
Home Care:
{chr(10).join('- ' + tip for tip in kb_home_care)}
Warning Signs:
{chr(10).join('- ' + w for w in kb_warnings)}
--- End Reference ---
"""

    prompt = f"""
You are a healthcare assistant. Use ONLY the verified clinical reference below to ground your advice. Do NOT add information beyond what is provided.

Symptoms: {symptoms}
Predicted Disease: {prediction}
Recommended Specialist: {specialist}
Suggested Medicines: {', '.join(medicines)}
{kb_context}
Give a SHORT, clean response. Maximum 100 words.

Format exactly like this:

Condition:
<condition>

Specialist:
<specialist>

Home Care:
- tip 1
- tip 2
- tip 3

See a doctor if:
- warning 1
- warning 2

Important:
This is informational only and not a medical diagnosis.
"""

    recommended_doctors = doctors_data.get(
        specialist,
        []
    )

    try:
        response = gemini_model.generate_content(
            prompt
        )
        ai_response = response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        # Fallback response using knowledge base data directly
        home_care_text = chr(10).join('- ' + tip for tip in kb_home_care) if kb_home_care else "- Stay hydrated and get adequate rest\n- Monitor your symptoms closely"
        warning_text = chr(10).join('- ' + w for w in kb_warnings) if kb_warnings else "- Symptoms persist for more than 3 days\n- Symptoms suddenly worsen"
        ai_response = f"""Condition:
{prediction}

Specialist:
{specialist}

Home Care:
{home_care_text}

See a doctor if:
{warning_text}

Important:
This is informational only and not a medical diagnosis."""

    return {
    "prediction": prediction,
    "specialist": specialist,
    "confidence": confidence,
    "medicines": medicines,
    "doctors": recommended_doctors,
    "response": ai_response
    }


class ReportRequest(BaseModel):
    symptoms: str
    disease: str
    specialist: str
    confidence: float


@app.post("/generate-report")
def generate_report(data: ReportRequest):

    pdf_file = "medical_report.pdf"

    doc = SimpleDocTemplate(pdf_file)

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(
            "MediMind AI Medical Report",
            styles["Title"]
        )
    )

    content.append(Spacer(1, 12))

    content.append(
        Paragraph(
            f"Symptoms: {data.symptoms}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Disease: {data.disease}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Specialist: {data.specialist}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Confidence: {data.confidence}%",
            styles["BodyText"]
        )
    )

    doc.build(content)

    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        filename="MediMind_Report.pdf"
    )

@app.get("/users-count")
def users_count():

    db = SessionLocal()

    count = db.query(User).count()

    db.close()

    return {"users": count}


@app.get("/knowledge-base")
def get_knowledge_base(q: str = ""):
    """Return knowledge base articles. Optional ?q= to filter by condition name."""
    if q:
        query = q.strip().lower()
        filtered = {
            k: v for k, v in KNOWLEDGE_BASE.items()
            if query in k.lower()
        }
        return {"articles": [
            {"condition": k, **v} for k, v in filtered.items()
        ]}
    return {"articles": [
        {"condition": k, **v} for k, v in KNOWLEDGE_BASE.items()
    ]}