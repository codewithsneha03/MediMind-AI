# MediMind AI 🏥🤖

MediMind AI is an advanced, full-stack medical symptom checker and healthcare assistant. Built with a **Next.js** frontend and a **FastAPI** Python backend, it uses Machine Learning and Google's Gemini AI to predict potential diseases based on user symptoms, recommend specialists, and provide verified home care advice.

## ✨ Features

- **Symptom Checker (ML)**: Enter your symptoms to receive an instant disease prediction with confidence scores, powered by a trained Scikit-Learn model.
- **RAG Knowledge Base**: Uses a verified clinical database to ground AI responses, ensuring safe, hallucination-free advice for home care and warning signs.
- **Google Maps Hospital Finder**: Automatically detects your location and embeds an interactive map to find nearby hospitals and clinics.
- **User Authentication**: Secure Registration and Login with JWT tokens and `bcrypt` password hashing.
- **Analytics Dashboard**: Tracks your prediction history and visualizes data using interactive charts (Disease Frequency and Confidence Trends).
- **Downloadable Medical Reports**: Generate and download your prediction results as a clean PDF file.

## 🛠️ Technology Stack

**Frontend:**
- Next.js (React Framework)
- Tailwind CSS (Styling)
- Recharts (Data Visualization)
- Google Maps Embed API

**Backend:**
- FastAPI (Python Web Framework)
- SQLAlchemy with SQLite (Database)
- Scikit-Learn (Machine Learning)
- Google GenAI (Gemini for conversational responses)
- ReportLab (PDF Generation)
- PyJWT & Passlib (Authentication)

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Clone the Repository
```bash
git clone https://github.com/codewithsneha03/MediMind-AI.git
cd MediMind-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_string
```
Start the FastAPI server:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The application will be running at `http://localhost:3000`.

## ☁️ Deployment

For comprehensive deployment instructions, please refer to the [DEPLOYMENT.md](DEPLOYMENT.md) file included in this repository. 
- **Frontend** is configured for easy deployment on [Vercel](https://vercel.com).
- **Backend** includes a `Procfile` and `requirements.txt` ready for deployment on [Render](https://render.com) or Heroku.
