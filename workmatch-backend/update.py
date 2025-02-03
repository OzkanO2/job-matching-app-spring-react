import bcrypt
from pymongo import MongoClient
from bson import ObjectId  # Import pour ObjectId

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["workmatchdb"]
users_collection = db["users"]

# Fonction pour hasher un mot de passe avec BCrypt
def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# Utilisateurs à insérer avec ObjectId
users_data = [
    {
        "_id": ObjectId(),
        "username": "momo",
        "email": "momo@gmail.com",
        "password": hash_password("momo"),
        "userType": "INDIVIDUAL",
        "swipedOffers": []
    },
    {
        "_id": ObjectId(),
        "username": "juju",
        "email": "juju@gmail.com",
        "password": hash_password("juju"),
        "userType": "COMPANY",
        "swipedUsers": []
    },
    {
        "_id": ObjectId(),
        "username": "adem",
        "email": "adem@gmail.com",
        "password": hash_password("adem"),
        "userType": "INDIVIDUAL",
        "swipedOffers": []
    },
    {
        "_id": ObjectId(),
        "username": "mpmp",
        "email": "mpmp@gmail.com",
        "password": hash_password("mpmp"),
        "userType": "COMPANY",
        "swipedUsers": []
    },
    {
        "_id": ObjectId(),
        "username": "mama",
        "email": "mama@gmail.com",
        "password": hash_password("mama"),
        "userType": "INDIVIDUAL",
        "swipedOffers": []
    }
]

# Insérer les utilisateurs dans la base de données
users_collection.insert_many(users_data)

print("✅ Tous les utilisateurs ont été recréés avec ObjectId et BCrypt !")
