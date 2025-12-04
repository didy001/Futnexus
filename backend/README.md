# NEXUS•3C OMEGA // EXTENSION NUMÉRIQUE

> **SYSTEM STATUS:** OPERATIONAL (OMEGA LEVEL)  
> **ARCHITECTURE:** NODE.JS / REACT / WEBSOCKETS  
> **IDENTITY:** SHADOWS

## 🗺️ GUIDE DE DÉPLOIEMENT RAPIDE (VS CODE)

### 1. STRUCTURE DES DOSSIERS
Assurez-vous que votre espace de travail ressemble à ceci :
```
NEXUS_OMEGA/
├── backend/       (Le Cerveau - Node.js)
├── frontend/      (Le Visage - React)
└── ...
```

### 2. ACTIVATION DU CERVEAU (BACKEND)
Ouvrez un terminal dans `backend/` :

1.  **Installation :**
    ```bash
    npm install
    ```
2.  **Configuration (.env) :**
    Créez un fichier `.env` à la racine de `backend/` :
    ```env
    PORT=3000
    OPENROUTER_API_KEY=sk-or-v1-...... (Votre Clé)
    # ou API_KEY=AIza...... (Google)
    ```
3.  **Démarrage :**
    ```bash
    npm start
    ```

### 3. ACTIVATION DE L'INTERFACE (FRONTEND)
Ouvrez un NOUVEAU terminal dans `frontend/` :

1.  **Installation :**
    ```bash
    npm install
    ```
2.  **Démarrage :**
    ```bash
    npm run dev
    ```
3.  **Accès :** Ouvrez `http://localhost:5173`

---

## 🦾 CAPACITÉS RÉELLES (ATTENTION)

Ce système a accès à votre machine via le module `ARMORY`.

*   **Commandes Shell :** Il peut exécuter des commandes terminal.
*   **Fichiers :** Il peut lire/écrire dans `./workspace`.
*   **Web :** Il peut contrôler un navigateur Chrome invisible (Puppeteer).

Utilisez le module **VISION_ARCHIVE** (intégré automatiquement) pour valider les plans risqués avant exécution.

*"Nous ne construisons pas le futur. Nous l'exécutons."* — SHADOWS