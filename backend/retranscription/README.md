# 🎤 Mini Projet - Transcription Audio

Transcription audio en temps réel avec Google Cloud Speech-to-Text.

## 📦 Installation

### 1. Créer un environnement virtuel

```bash
python -m venv venv
```

### 2. Activer l'environnement

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

**Windows - Installation de PyAudio:**
```powershell
pip install pipwin
pipwin install pyaudio
```

**Linux - Installation de PyAudio:**
```bash
sudo apt-get install portaudio19-dev python3-pyaudio
pip install pyaudio
```

### 4. Configurer les credentials

Le fichier `.env` est déjà configuré avec les credentials Google Cloud.

Reconstruire le fichier JSON:
```bash
python rebuild_credentials.py
```

## 🚀 Utilisation

```bash
python audio_transcription.py
```

### Commandes vocales:
- Dites **"Arrêt"** ou **"Stop"** pour quitter

## 📝 Ce que fait le script

1. **Capture audio** depuis votre microphone
2. **Envoie à Google Speech-to-Text** en streaming
3. **Affiche la transcription** en temps réel
   - 🔴 Rouge = Transcription provisoire
   - 🟢 Vert = Transcription finale

## 🔧 Configuration

- **Langue**: Français (fr-FR)
- **Sample Rate**: 16kHz
- **Chunk Size**: 1600 (100ms)
- **Streaming Limit**: 4 minutes

## 📁 Structure

```
mini_projet/
├── audio_transcription.py    # Script principal
├── rebuild_credentials.py    # Reconstruction des credentials
├── requirements.txt          # Dépendances
├── .env                      # Variables d'environnement
└── data/
    └── hackaton-auth.json   # Généré automatiquement
```

## ⚠️ Prérequis

- Python 3.8+
- Microphone fonctionnel
- Compte Google Cloud avec API Speech-to-Text activée

## 🐛 Dépannage

### PyAudio ne s'installe pas
- Windows: Utilisez `pipwin install pyaudio`
- Linux: Installez `portaudio19-dev` d'abord

### Erreur de credentials
```bash
python rebuild_credentials.py
```

### Pas de transcription
- Vérifiez que votre microphone fonctionne
- Vérifiez les permissions microphone
- Parlez plus fort et clairement
