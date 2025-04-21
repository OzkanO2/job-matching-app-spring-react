from pymongo import MongoClient
from bson import ObjectId

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]
users_collection = db["users"]

# Liste des ObjectId des users à supprimer
user_ids_to_delete = [
    "67f8653d4086291a97495857",  # synapse-zone
    "67f8688b4086291a9749585c",  # global-systems
    "67f86d9d4086291a9749586f",  # digital-group
    "67f870754086291a97495878",  # cyber-works
    "67f876524086291a9749587d",  # byte-hub
    "67f8806a4086291a97495881",  # byte-zone
    "67f882e84086291a97495892",  # code-institute
    "67f883f94086291a97495893",  # global-partners
    "67f8840e4086291a97495894",  # cyber-group
    "67f8848c4086291a97495896",  # byte-ventures
]

# Suppression des utilisateurs
result = users_collection.delete_many({"_id": {"$in": [ObjectId(uid) for uid in user_ids_to_delete]}})

print(f"✅ Utilisateurs supprimés : {result.deleted_count}")
