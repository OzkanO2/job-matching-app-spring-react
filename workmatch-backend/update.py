from pymongo import MongoClient

# Connexion MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]
collection = db["jobOffers"]

# Dictionnaire de mots-clés => catégories
category_map = {
    "devops": "Ingénieur DevOps",
    "fullstack": "Développement Web",
    "frontend": "Développement Web",
    "backend": "Développement Web",
    "web developer": "Développement Web",
    "software engineer": "Software Developer",
    "software developer": "Software Developer",
    "java developer": "Software Developer",
    "python developer": "Software Developer",
    "developer": "Software Developer",
    "data scientist": "Data Science",
    "data engineer": "Data Science",
    "data": "Data Science",
    "ai": "AI/ML",
    "machine learning": "AI/ML",
    "ml": "AI/ML",
    "marketing": "Marketing",
    "business developer": "Business Developer",
    "sales": "Business Developer",
    "finance": "Finance",
    "cyber": "Cybersecurity",
    "security": "Cybersecurity",
    "support": "Support IT",
    "helpdesk": "Support IT",
    "it support": "Support IT",
    "cloud": "Cloud Computing",
    "architect": "Solution Architect",
    "analyst": "Business Analyst"
}

def assign_category(title):
    title = title.lower()
    for keyword, category in category_map.items():
        if keyword in title:
            return category
    return "Other"

# Mise à jour des catégories dans MongoDB
updated = 0
for doc in collection.find():
    title = doc.get("title", "")
    correct_category = assign_category(title)
    if doc.get("category") != correct_category:
        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"category": correct_category}}
        )
        updated += 1

print(f"✅ Catégories mises à jour pour {updated} offres.")
