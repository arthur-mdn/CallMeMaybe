# 📞 CallMeMaybe – Plateforme d’entretiens audio avec IA

**CallMeMaybe** est une application web permettant d'organiser des appels audio, de les enregistrer, de les transcrire automatiquement avec l'IA (Whisper/OpenAI), et de générer une fiche candidat personnalisée en PDF grâce à GPT-4.

---

## 🚀 Fonctionnalités

- Appels audio avec [LiveKit](https://livekit.io/)
- Enregistrement et upload du fichier audio
- Transcription automatique via Whisper API
- Génération de fiche candidat via GPT-4
- Interface de chat IA pour compléter ou modifier les fiches
- Génération de PDF à partir du contenu analysé
- Authentification simple pour les administrateurs

---

## 🛠️ Stack technique

| Type            | Technologie                                |
|-----------------|---------------------------------------------|
| Framework       | Next.js (App Router)                        |
| Audio temps réel| LiveKit                                     |
| Enregistrement  | MediaRecorder API (navigateur)              |
| Transcription   | OpenAI Whisper API                          |
| IA Profil       | OpenAI GPT-4 API                            |
| PDF             | [pdf-lib](https://pdf-lib.js.org/)          |
| Conteneurisation| Docker / Docker Compose                     |

---

## 📁 Arborescence du projet

```
callmemaybe/
├── app/                  # Pages Next.js (App Router)
│   └── api/              # Routes API (upload, IA, etc.)
├── components/           # Composants React
├── lib/                  # Utilitaires (auth, openai, pdf, etc.)
├── public/               # Fichiers statiques
├── styles/               # Feuilles de styles
├── Dockerfile            # Image Docker
├── docker-compose.yml    # Stack complète
├── .env.local.example    # Exemple de configuration
└── README.md
```

---

## ⚙️ Configuration

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/callmemaybe.git
cd callmemaybe
```

### 2. Variables d’environnement

Copiez le fichier d'exemple :

```bash
cp .env.local.example .env.local
```

Puis remplissez avec vos clés :

```env
OPENAI_API_KEY=sk-...
```

---

## 🐳 Lancer avec Docker

### 1. Construction de l’image

```bash
docker-compose build
```

### 2. Démarrage du projet

```bash
docker-compose up
```

L'application sera accessible sur :  
👉 http://localhost:3000

---

## 📤 Endpoints API

| Méthode | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| POST   | `/api/upload-audio`    | Upload du fichier audio              |
| POST   | `/api/transcribe`      | Transcription via Whisper API       |
| POST   | `/api/generate`        | Génération fiche via GPT-4          |
| POST   | `/api/chat`            | Chat IA avec contexte candidat       |
