import requests

BASE_URL = "http://localhost:8080"

company_user = {
    "username": "juju",
    "email": "juju@gmail.com",
    "password": "1234",
    "userType": "COMPANY"
}

job_offers = [
    {
        "title": "Ingénieur DevOps/Ingénieure DevOps",
        "description": "À propos d'Itera Group : Chez Itera, nous croyons que le succès naît...",
        "salaryMin": 35000,
        "salaryMax": 50000,
        "category": "Développement Web",
        "remote": False,
        "employmentType": "part_time",
        "locations": ["Bordeaux, Gironde"],
        "skills": [
            {"name": "Terraform", "experience": 3},
            {"name": "Ansible", "experience": 5},
            {"name": "AWS", "experience": 5}
        ],
        "url": "https://www.adzuna.fr/land/ad/5030622956?se=WDfAwhvo7xGHm9LvMlqtQ&utm"
    },
    {
        "title": "Développeur Frontend React",
        "description": "Rejoignez une équipe dynamique en tant que dev React !",
        "salaryMin": 32000,
        "salaryMax": 48000,
        "category": "Développement Web",
        "remote": True,
        "employmentType": "full_time",
        "locations": ["Paris"],
        "skills": [
            {"name": "React", "experience": 2},
            {"name": "JavaScript", "experience": 3}
        ],
        "url": "https://example.com/frontend-react-offre"
    },
    {
        "title": "DevOps Engineer - Kubernetes & CI/CD",
        "description": "Tu adores l'automatisation ? Ce poste est pour toi !",
        "salaryMin": 40000,
        "salaryMax": 60000,
        "category": "Développement Web",
        "remote": False,
        "employmentType": "freelance",
        "locations": ["Lyon"],
        "skills": [
            {"name": "Kubernetes", "experience": 3},
            {"name": "GitLab CI", "experience": 2}
        ],
        "url": "https://example.com/devops-k8s"
    }
]

def create_company_and_offers():
    try:
        # Étape 1 : Créer le compte COMPANY
        print("🧾 Création de l'utilisateur COMPANY...")
        register_response = requests.post(f"{BASE_URL}/users/register", json=company_user)
        register_response.raise_for_status()

        company_data = register_response.json()
        company_id = company_data.get("id")

        if not company_id:
            raise ValueError("L'ID du compte company est introuvable.")

        print(f"✅ COMPANY créé avec ID : {company_id}")

        # Étape 2 : Créer les offres liées à ce COMPANY
        for offer in job_offers:
            offer["companyId"] = company_id
            response = requests.post(f"{BASE_URL}/joboffers", json=offer)
            response.raise_for_status()
            print(f"📝 Offre créée : {offer['title']}")

        print("🎉 Toutes les données ont été créées avec succès.")

    except requests.RequestException as err:
        print("❌ Erreur HTTP :", err.response.text if err.response else err)
    except Exception as e:
        print("❌ Erreur inattendue :", str(e))

if __name__ == "__main__":
    create_company_and_offers()
