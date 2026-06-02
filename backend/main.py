from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from doctors import doctors_data

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

print("API KEY:", os.getenv("GEMINI_API_KEY"))

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

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


@app.get("/")
def home():
    return {"message": "MediMind AI Backend Running"}


@app.post("/predict")
def predict(data: SymptomRequest):

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
    record = PredictionHistory(
    symptoms=symptoms,
    disease=prediction,
    specialist=specialist,
    confidence=confidence
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
def get_history():

    db = SessionLocal()

    records = db.query(
        PredictionHistory
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
def delete_history(record_id: int):

    db = SessionLocal()

    record = db.query(
        PredictionHistory
    ).filter(
        PredictionHistory.id == record_id
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

    prompt = f"""
You are a healthcare assistant.

Symptoms:
{symptoms}

Predicted Disease:
{prediction}

Recommended Specialist:
{specialist}

Suggested Medicines:
{', '.join(medicines)}

Give a SHORT response.

Format exactly like this:

Condition:
<condition>

Specialist:
<specialist>

Possible Causes:
- cause 1
- cause 2
- cause 3

Advice:
- advice 1
- advice 2
- advice 3

See a doctor if:
- warning 1
- warning 2

Important:
This is informational only and not a medical diagnosis.

Maximum 120 words.
"""

    response = gemini_model.generate_content(
        prompt
    )

    recommended_doctors = doctors_data.get(
    specialist,
    []
    )

    return {
    "prediction": prediction,
    "specialist": specialist,
    "confidence": confidence,
    "medicines": medicines,
    "doctors": recommended_doctors,
    "response": response.text
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