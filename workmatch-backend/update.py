from pymongo import MongoClient

# 🔒 Remplace ceci par ta vraie connexion MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]  # Remplace "workmatch" par le nom de ta base

# 🔁 Liste des collections à vider
collections_to_clear = [
    "likes",
    "conversations",
    "matches",
    "messages",
    "swipedCard"
]

# 🧹 Suppression des documents dans chaque collection
for collection_name in collections_to_clear:
    result = db[collection_name].delete_many({})
    print(f"✅ {result.deleted_count} document(s) supprimé(s) dans la collection '{collection_name}'")

print("🧼 Toutes les collections ont été nettoyées.")
