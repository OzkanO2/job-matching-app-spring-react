from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]

job_searchers_collection = db["jobSearchers"]
job_offers_collection = db["jobOffers"]

# ✅ Convertir `location` en `locations` (Array) pour `jobSearchers`
for searcher in job_searchers_collection.find({"location": {"$exists": True}}):
    locations = [searcher["location"]] if isinstance(searcher["location"], str) else searcher["location"]
    job_searchers_collection.update_one(
        {"_id": searcher["_id"]},
        {"$set": {"locations": locations}, "$unset": {"location": ""}}
    )

# ✅ Convertir `location` en `locations` (Array) pour `jobOffers`
for offer in job_offers_collection.find({"location": {"$exists": True}}):
    locations = [offer["location"]] if isinstance(offer["location"], str) else offer["location"]
    job_offers_collection.update_one(
        {"_id": offer["_id"]},
        {"$set": {"locations": locations}, "$unset": {"location": ""}}
    )

print("✅ Conversion de `location` en `locations` terminée pour `jobSearchers` et `jobOffers` !")
