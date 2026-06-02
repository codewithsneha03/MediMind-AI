import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

from joblib import dump

# Load dataset
data = pd.read_csv("../dataset/symptom_disease_dataset.csv")

# Inputs and outputs
X = data["symptoms"]
y = data["disease"]

# Convert text into numerical vectors
vectorizer = TfidfVectorizer()

X_vectorized = vectorizer.fit_transform(X)

# Train model
model = RandomForestClassifier()

model.fit(X_vectorized, y)

# Save model and vectorizer
dump(model, "models/disease_model.pkl")
dump(vectorizer, "models/vectorizer.pkl")

print("Model trained successfully!")