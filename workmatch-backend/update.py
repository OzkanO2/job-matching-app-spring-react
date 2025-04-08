from pymongo import MongoClient
import random

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]
collection = db["jobSearchers"]

# Liste des types de contrat possibles
employment_types = ['internship', 'full_time', 'part_time', 'freelance']

# Récupère tous les jobSearchers sans le champ employmentType
jobsearchers = collection.find({ "employmentType": { "$exists": False } })

count = 0

for jobsearcher in jobsearchers:
    random_type = random.choice(employment_types)
    collection.update_one(
        { "_id": jobsearcher["_id"] },
        { "$set": { "employmentType": random_type } }
    )
    count += 1

print(f"✅ Champ 'employmentType' ajouté à {count} documents.")
