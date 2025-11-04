# Clarity Journal API Documentation

## Vue d'ensemble
API REST pour l'application Clarity Journal permettant la gestion des journaux personnels, des utilisateurs, des insights et des paramètres utilisateur.

## Base URL
```
https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/
```

## Doc Swagger URL
```
https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/docs
```

## redoc  URL
```
https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/redoc
```

## Authentification
Non implémentée dans la version actuelle.

## Routes disponibles

### 👤 Utilisateurs

#### `GET /api/users`
Liste tous les utilisateurs.
- **Réponse**: Liste de `UserOut`

#### `POST /api/users`
Crée un nouvel utilisateur.
- **Corps**: `UserCreate`
  ```json
  {
    "email": "user@example.com",
    "password": "string",
    "role": "user|pro",
    "full_name": "string"
  }
  ```
- **Réponse**: `UserOut`

#### `GET /api/users/{user_id}`
Récupère un utilisateur par son ID.
- **Réponse**: `UserOut`

#### `PUT /api/users/{user_id}`
Met à jour un utilisateur.
- **Corps**: `UserUpdate` (tous les champs optionnels)
- **Réponse**: `UserOut`

#### `DELETE /api/users/{user_id}`
Supprime un utilisateur.

---

### ⚙️ Settings Utilisateur

#### `GET /api/users/{user_id}/settings`
Récupère les paramètres d'un utilisateur.
- **Paramètres query**: `create_if_missing` (bool) - Crée des settings par défaut si non existants
- **Réponse**: `UserSettingsOut`

#### `POST /api/users/{user_id}/settings`
Crée les paramètres pour un utilisateur.
- **Corps**: `UserSettingsCreate`
  ```json
  {
    "user_id": 0,
    "theme": "dark|light|auto",
    "journal_layout": "minimal|guided",
    "font_size": "small|medium|large",
    "mood_input": "emoji|slider|tags",
    "notif_daily_reflection": false,
    "notif_weekly_summary": false,
    "notif_streak_alerts": false,
    "notif_time_local": "09:00:00",
    "notif_timezone": "Europe/Paris",
    "e2ee_enabled": true,
    "data_masking": "off|standard|strict",
    "data_retention_days": 365
  }
  ```
- **Réponse**: `UserSettingsOut`
- **Erreur**: 409 si les settings existent déjà

#### `PUT /api/users/{user_id}/settings`
Met à jour les paramètres d'un utilisateur.
- **Corps**: `UserSettingsUpdate` (tous les champs optionnels)
- **Réponse**: `UserSettingsOut`

---

### 👥 Profils Utilisateur

#### `GET /api/users/{user_id}/profile`
Récupère le profil d'un utilisateur.
- **Paramètres query**: `create_if_missing` (bool)
- **Réponse**: `UserProfileOut`

#### `POST /api/users/{user_id}/profile`
Crée le profil pour un utilisateur.
- **Corps**: `UserProfileCreate`
  ```json
  {
    "user_id": 0,
    "first_name": "string",
    "last_name": "string",
    "nickname": "string",
    "birthdate": "2000-01-01",
    "favorite_animal": "string",
    "self_description": "string",
    "self_words": ["curious", "creative"],
    "control_flow_pref": "control|flow",
    "last_time_surprised": "string"
  }
  ```
- **Réponse**: `UserProfileOut`
- **Erreur**: 409 si le profil existe déjà

#### `PUT /api/users/{user_id}/profile`
Met à jour le profil d'un utilisateur.
- **Corps**: `UserProfileUpdate` (tous les champs optionnels)
- **Réponse**: `UserProfileOut`

---

### 🎯 Préférences Utilisateur

#### `GET /api/users/{user_id}/preferences`
Récupère les préférences d'un utilisateur.
- **Paramètres query**: `create_if_missing` (bool)
- **Réponse**: `UserPreferencesOut`

#### `POST /api/users/{user_id}/preferences`
Crée les préférences pour un utilisateur.
- **Corps**: `UserPreferencesCreate`
  ```json
  {
    "user_id": 0,
    "stress_response": "talk|think|distract",
    "word_most_days": "calm|energetic|reflective|driven|sensitive|steady",
    "feelings_ease": 3,
    "when_wrong": "analyze|retry|talk|avoid|reflect",
    "journal_frequency": "never|sometimes|weekly|daily",
    "primary_direction": "healing|focus|growth|balance|clarity|connection",
    "progress_style": "small_wins|deep_insights",
    "guide_tone": "factual|intuitive",
    "comfort_personal": 4,
    "check_ins": "daily|ad_hoc",
    "guide_style": "reflective_questions|just_listen",
    "mood_theme": "cool|warm|balanced",
    "tone_color": "blue|violet|rose",
    "voice_notes_enabled": false
  }
  ```
- **Réponse**: `UserPreferencesOut`
- **Erreur**: 409 si les préférences existent déjà

#### `PUT /api/users/{user_id}/preferences`
Met à jour les préférences d'un utilisateur.
- **Corps**: `UserPreferencesUpdate` (tous les champs optionnels)
- **Réponse**: `UserPreferencesOut`

---

### 🏷️ Tags - Grounding

#### `GET /api/grounding-tags`
Liste tous les tags de grounding (catalogue).
- **Réponse**: Liste de `GroundingTagOut`
  ```json
  [
    {
      "id": 1,
      "code": "writing",
      "label": "Writing"
    }
  ]
  ```

#### `POST /api/grounding-tags`
Crée un nouveau tag de grounding.
- **Corps**: `GroundingTagCreate`
  ```json
  {
    "code": "meditation",
    "label": "Meditation"
  }
  ```
- **Réponse**: `GroundingTagOut`
- **Erreur**: 409 si le code existe déjà

#### `GET /api/users/{user_id}/grounding-tags`
Liste les tags de grounding d'un utilisateur.
- **Réponse**: Liste avec relations complètes

#### `PUT /api/users/{user_id}/grounding-tags`
Définit les tags de grounding d'un utilisateur.
- **Corps**: Liste d'IDs
  ```json
  [1, 3, 5]
  ```
- **Réponse**: Données de confirmation

---

### 🏷️ Tags - Journal Help

#### `GET /api/journal-help-tags`
Liste tous les tags d'aide journal (catalogue).
- **Réponse**: Liste de `JournalHelpTagOut`

#### `POST /api/journal-help-tags`
Crée un nouveau tag d'aide journal.
- **Corps**: `JournalHelpTagCreate`
  ```json
  {
    "code": "anxiety",
    "label": "Anxiety"
  }
  ```
- **Réponse**: `JournalHelpTagOut`
- **Erreur**: 409 si le code existe déjà

#### `GET /api/users/{user_id}/journal-help-tags`
Liste les tags d'aide journal d'un utilisateur.
- **Réponse**: Liste avec relations complètes

#### `PUT /api/users/{user_id}/journal-help-tags`
Définit les tags d'aide journal d'un utilisateur.
- **Corps**: Liste d'IDs
  ```json
  [2, 4]
  ```
- **Réponse**: Données de confirmation

---

### 📓 Journaux

#### `GET /api/journals`
Liste les journaux.
- **Paramètres**: `user_id` (optionnel)
- **Réponse**: Liste de `JournalOut`

#### `POST /api/journals`
Crée un nouveau journal.
- **Corps**: `JournalCreate`
  ```json
  {
    "user_id": 0,
    "title": "string"
  }
  ```
- **Réponse**: `JournalOut`

#### `GET /api/journals/{journal_id}`
Récupère un journal par son ID.
- **Réponse**: `JournalOut`

#### `PUT /api/journals/{journal_id}`
Met à jour un journal.
- **Corps**: `JournalUpdate`
- **Réponse**: `JournalOut`

#### `DELETE /api/journals/{journal_id}`
Supprime un journal.

---

### 📄 Pages de journal

#### `GET /api/journals/{journal_id}/pages`
Liste les pages d'un journal.
- **Réponse**: Liste de `JournalPageOut`

#### `POST /api/journals/{journal_id}/pages`
Crée une nouvelle page.
- **Corps**: `JournalPageCreate`
  ```json
  {
    "journal_id": 0,
    "page_number": 0,
    "content": "string",
    "encoding": "utf-8",
    "mood": 5,
    "entry_type": "text"
  }
  ```
- **Réponse**: `JournalPageOut`
- **Note**: Les champs `content` et `encoding` sont automatiquement chiffrés

#### `GET /api/journal_pages/{page_id}`
Récupère une page par son ID.
- **Réponse**: `JournalPageOut`

#### `PUT /api/journal_pages/{page_id}`
Met à jour une page.
- **Corps**: `JournalPageUpdate`
- **Réponse**: `JournalPageOut`

#### `DELETE /api/journal_pages/{page_id}`
Supprime une page.

#### `GET /api/journal_pages`
Liste toutes les pages.
- **Réponse**: Liste de `JournalPageOut`

---

### 🔐 Sessions

#### `GET /api/sessions`
Liste toutes les sessions.
- **Réponse**: Liste de `SessionOut`

#### `POST /api/sessions`
Crée une nouvelle session.
- **Corps**: `SessionCreate`
  ```json
  {
    "user_id": 0,
    "session_token": "string",
    "expires_at": "2024-12-31T23:59:59Z"
  }
  ```
- **Réponse**: `SessionOut`

#### `GET /api/sessions/{session_token}`
Récupère une session par son token.
- **Réponse**: `SessionOut`

#### `DELETE /api/sessions/{session_token}`
Supprime une session.

---

### 👩‍⚕️ Permissions

#### `GET /api/permissions`
Liste toutes les permissions.
- **Réponse**: Liste de `PermissionOut`

#### `POST /api/permissions`
Accorde une nouvelle permission.
- **Corps**: `PermissionCreate`
  ```json
  {
    "user_id": 0,
    "professional_id": 0,
    "journal_id": 0,
    "can_view": true,
    "can_comment": false
  }
  ```
- **Réponse**: `PermissionOut`

#### `GET /api/permissions/{permission_id}`
Récupère une permission par son ID.
- **Réponse**: `PermissionOut`

#### `DELETE /api/permissions/{permission_id}`
Révoque une permission.

---

### 💡 Insights

#### `GET /api/insights`
Liste tous les insights.
- **Réponse**: Liste de `InsightOut`

#### `POST /api/insights`
Crée un nouvel insight.
- **Corps**: `InsightCreate`
  ```json
  {
    "journal_id": 0,
    "journal_page_id": 0,
    "summary": "string",
    "sentiment_score": 0.75,
    "emotion_tags": {
      "joy": 0.8,
      "calm": 0.6
    }
  }
  ```
- **Réponse**: `InsightOut`

#### `GET /api/insights/{insight_id}`
Récupère un insight par son ID.
- **Réponse**: `InsightOut`

#### `PUT /api/insights/{insight_id}`
Met à jour un insight.
- **Corps**: `InsightCreate`
- **Réponse**: `InsightOut`

#### `DELETE /api/insights/{insight_id}`
Supprime un insight.

#### `GET /api/journals/{journal_id}/insights`
Liste les insights d'un journal.
- **Réponse**: Liste de `InsightOut`

---

## Modèles de données

### UserOut
```json
{
  "email": "string",
  "role": "string",
  "full_name": "string",
  "id": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### UserSettingsOut
```json
{
  "id": 0,
  "user_id": 0,
  "theme": "auto",
  "journal_layout": "guided",
  "font_size": "medium",
  "mood_input": "slider",
  "notif_daily_reflection": false,
  "notif_weekly_summary": false,
  "notif_streak_alerts": false,
  "notif_time_local": "09:00:00",
  "notif_timezone": "Europe/Paris",
  "e2ee_enabled": true,
  "data_masking": "standard",
  "data_retention_days": 365,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### UserProfileOut
```json
{
  "id": 0,
  "user_id": 0,
  "first_name": "string",
  "last_name": "string",
  "nickname": "string",
  "birthdate": "2000-01-01",
  "favorite_animal": "string",
  "self_description": "string",
  "self_words": ["curious", "creative"],
  "control_flow_pref": "flow",
  "last_time_surprised": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### UserPreferencesOut
```json
{
  "id": 0,
  "user_id": 0,
  "stress_response": "talk",
  "word_most_days": "calm",
  "feelings_ease": 3,
  "when_wrong": "analyze",
  "journal_frequency": "daily",
  "primary_direction": "growth",
  "progress_style": "small_wins",
  "guide_tone": "factual",
  "comfort_personal": 4,
  "check_ins": "daily",
  "guide_style": "reflective_questions",
  "mood_theme": "cool",
  "tone_color": "blue",
  "voice_notes_enabled": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### JournalOut
```json
{
  "user_id": 0,
  "title": "string",
  "id": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### JournalPageOut
```json
{
  "journal_id": 0,
  "page_number": 0,
  "content": "string",
  "encoding": "utf-8",
  "mood": 5,
  "entry_type": "text",
  "id": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### SessionOut
```json
{
  "user_id": 0,
  "session_token": "string",
  "expires_at": "2024-12-31T23:59:59Z",
  "id": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "last_active": "2024-01-01T00:00:00Z"
}
```

### PermissionOut
```json
{
  "user_id": 0,
  "professional_id": 0,
  "journal_id": 0,
  "can_view": true,
  "can_comment": false,
  "id": 0,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### InsightOut
```json
{
  "journal_id": 0,
  "journal_page_id": 0,
  "summary": "string",
  "sentiment_score": 0.75,
  "emotion_tags": {
    "joy": 0.8,
    "calm": 0.6
  },
  "id": 0,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GroundingTagOut
```json
{
  "id": 1,
  "code": "writing",
  "label": "Writing"
}
```

### JournalHelpTagOut
```json
{
  "id": 1,
  "code": "stress",
  "label": "Stress"
}
```

---

## Notes de sécurité

- 🔒 Les champs `content` et `encoding` des pages de journal sont automatiquement chiffrés avec Fernet avant stockage
- 🔑 Les mots de passe utilisateurs sont hachés avec bcrypt
- 🛡️ L'option E2EE (End-to-End Encryption) peut être activée dans les settings utilisateur
- 📊 Les données sensibles peuvent être masquées avec les niveaux: `off`, `standard`, `strict`

## Liens utiles

- 📖 [Documentation interactive Swagger](/api/docs)
- 📋 [Vue d'ensemble des modèles](/api/api-overview)
- 🔄 [Documentation ReDoc](/api/redoc)
