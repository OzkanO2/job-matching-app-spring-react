from pymongo import MongoClient
from datetime import datetime, UTC
from bson import ObjectId

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]  # Assure-toi que c'est bien le nom de ta base
collection = db["jobOffers"]

# Nouvelle offre d'emploi pour correspondre à Alice
new_offer = {
    "_id": ObjectId("67aaaa35be8aff4765622155"),  # ID défini manuellement
    "title": "Développeur Frontend React",
    "description": "Nous recherchons un développeur React avec de l'expérience en JavaScript et React.",
    "salaryMin": 50000,
    "salaryMax": 70000,
    "category": "Développement Web",
    "remote": True,
    "companyId": ObjectId("67a0cb49dce20987f4326745"),  # ID de la compagnie
    "employmentType": "full_time",
    "locations": ["Paris"],
    "skills": [
        {"name": "JavaScript", "experience": 3},  # Alice a 3 ans d'expérience en JS
        {"name": "React", "experience": 2}  # Alice a 2 ans d'expérience en React
    ],
    "createdAt": datetime.now(UTC)
}

# Vérifier si l'offre existe déjà
existing_offer = collection.find_one({"_id": ObjectId("67aaaa35be8aff4765622155")})

if existing_offer:
    print("⚠️ L'offre existe déjà, pas besoin de l'ajouter.")
else:
    collection.insert_one(new_offer)
    print(f"✅ JobOffer ajouté avec succès ! ID: {new_offer['_id']}")
