#!/usr/bin/env python3
"""
Script pour reconstruire le fichier de credentials Google Cloud à partir des variables d'environnement.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

def rebuild_credentials():
    """Reconstruit le fichier hackaton-auth.json à partir des variables d'environnement."""
    # Charger les variables d'environnement
    env_path = Path(__file__).parent / '.env'
    load_dotenv(dotenv_path=env_path)
    
    # Récupérer toutes les valeurs
    credentials = {
        "type": os.getenv("GCP_TYPE", "service_account"),
        "project_id": os.getenv("GCP_PROJECT_ID"),
        "private_key_id": os.getenv("GCP_PRIVATE_KEY_ID"),
        "private_key": os.getenv("GCP_PRIVATE_KEY"),
        "client_email": os.getenv("GCP_CLIENT_EMAIL"),
        "client_id": os.getenv("GCP_CLIENT_ID"),
        "auth_uri": os.getenv("GCP_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
        "token_uri": os.getenv("GCP_TOKEN_URI", "https://oauth2.googleapis.com/token"),
        "auth_provider_x509_cert_url": os.getenv("GCP_AUTH_PROVIDER_CERT_URL", 
                                                  "https://www.googleapis.com/oauth2/v1/certs"),
        "client_x509_cert_url": os.getenv("GCP_CLIENT_CERT_URL"),
        "universe_domain": os.getenv("GCP_UNIVERSE_DOMAIN", "googleapis.com")
    }
    
    # Vérifier les champs obligatoires
    required_fields = ["project_id", "private_key", "client_email"]
    missing_fields = [field for field in required_fields if not credentials.get(field)]
    
    if missing_fields:
        raise ValueError(
            f"Variables d'environnement manquantes: {', '.join(f'GCP_{field.upper()}' for field in missing_fields)}"
        )
    
    # Créer le répertoire data
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(exist_ok=True)
    
    # Chemin du fichier de credentials
    credentials_path = data_dir / 'hackaton-auth.json'
    
    # Écrire le fichier JSON
    with open(credentials_path, 'w', encoding='utf-8') as f:
        json.dump(credentials, f, indent=2)
    
    print(f"✓ Fichier de credentials créé: {credentials_path}")
    print(f"  - Project ID: {credentials['project_id']}")
    print(f"  - Client Email: {credentials['client_email']}")
    
    return str(credentials_path)


if __name__ == "__main__":
    try:
        rebuild_credentials()
    except Exception as e:
        print(f"✗ Erreur: {e}")
        raise
