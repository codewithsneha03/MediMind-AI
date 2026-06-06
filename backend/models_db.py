from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String)

    email = Column(
        String,
        unique=True
    )

    password = Column(String)


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    symptoms = Column(String)

    disease = Column(String)

    specialist = Column(String)

    confidence = Column(Float)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )