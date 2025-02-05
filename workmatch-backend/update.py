from pymongo import MongoClient
from bson.objectid import ObjectId

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]

# Collections
users_collection = db["users"]
jobsearchers_collection = db["jobSearchers"]
likes_collection = db["likes"]
matches_collection = db["matches"]
joboffers_collection = db["jobOffers"]

# 1️⃣ Mise à jour des `userId` dans `jobSearchers`
def update_jobsearchers_user_ids():
    jobsearchers = jobsearchers_collection.find()
    for jobsearcher in jobsearchers:
        user = users_collection.find_one({"email": jobsearcher["email"]})
        if user:
            jobsearchers_collection.update_one(
                {"_id": jobsearcher["_id"]},
                {"$set": {"userId": user["_id"]}}
            )
            print(f"✅ userId mis à jour pour {jobsearcher['email']}")

# 2️⃣ Vérification des likes mutuels et création des matchs
def check_and_create_matches():
    likes = likes_collection.find()
    
    for like in likes:
        swiper_id = like["swiperId"]
        swiped_id = like["swipedId"]
        company_id = like["companyId"]

        # Cas 1: Un individu like une offre d'emploi
        if company_id == "":
            mutual_like = likes_collection.find_one({
                "swiperId": swiped_id,
                "swipedId": swiper_id,
                "companyId": {"$ne": ""}
            })
        else:
            # Cas 2: Une entreprise like un jobseeker
            mutual_like = likes_collection.find_one({
                "swiperId": swiped_id,
                "swipedId": swiper_id,
                "companyId": ""
            })

        if mutual_like:
            # Vérifier si le match existe déjà
            existing_match = matches_collection.find_one({
                "$or": [
                    {"swiperId": swiper_id, "swipedId": swiped_id},
                    {"swiperId": swiped_id, "swipedId": swiper_id}
                ]
            })
            
            if not existing_match:
                match_data = {
                    "swiperId": swiper_id,
                    "swipedId": swiped_id,
                    "offerId": company_id if company_id else mutual_like["companyId"]
                }
                matches_collection.insert_one(match_data)
                print(f"🔥 Match créé entre {swiper_id} et {swiped_id} pour l'offre {match_data['offerId']}")

# Exécuter les mises à jour
update_jobsearchers_user_ids()
check_and_create_matches()

print("✅ Mise à jour terminée.")
