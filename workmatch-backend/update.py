from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]  # Assure-toi que c'est le bon nom de la DB
collection = db["jobSearchers"]  # Table des chercheurs d'emploi

# Mettre à jour toutes les expériences
for jobseeker in collection.find():
    updated_skills = []
    for skill in jobseeker["skills"]:
        if "experience" in skill:
            try:
                skill["experience"] = int(skill["experience"].split(" ")[0])  # Extraire uniquement le nombre
            except ValueError:
                skill["experience"] = 0  # Valeur par défaut en cas d'erreur

        updated_skills.append(skill)

    # Mise à jour dans la DB
    collection.update_one({"_id": jobseeker["_id"]}, {"$set": {"skills": updated_skills}})

print("✅ Mise à jour terminée avec succès !")
