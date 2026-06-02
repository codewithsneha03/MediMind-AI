from database import engine
from models_db import Base

Base.metadata.create_all(bind=engine)

print("Database created successfully")