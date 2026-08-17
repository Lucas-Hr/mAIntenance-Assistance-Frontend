# Lien demo : https://drive.google.com/drive/folders/1DJ7PtCEKSJYtYc71L4ytfoExjG0uzqlc?usp=drive_link

# Lien live : https://maintenance-assistance-frontend.vercel.app/

# Module de Classification de Tickets — mAIntenance & Assistance

## Objectif
Classifier automatiquement des tickets IT en langage naturel : catégorie, équipe compétente, priorité, justification.

## Approche : LLM few-shot + sortie JSON structurée (Gemini)

**Pourquoi ce choix :**
- Pas d'entraînement ni de dataset labellisé nécessaire → rapide à mettre en place
- Comprend nativement le langage naturel imprécis (contrairement à des règles seules)
- Un seul appel suffit pour raisonner sur catégorie + urgence + équipe
- Sortie directement exploitable par le reste du pipeline

## Taxonomie
- **Catégorie** : comptes_auth, réseau, matériel, logiciel, imprimantes, droits_acces, cybersécurité, autre
- **Équipe** : support_n1, réseau, sécurité, infra
- **Priorité** : critique, haute, moyenne, basse

## Points clés de conception
- **Schéma JSON avec enums** : le modèle ne peut pas produire une valeur hors taxonomie → fiabilité structurelle, sans effort de prompt supplémentaire
- **Température basse (0.2)** : réponses stables et reproductibles
- **Few-shot avec exemples variés** : guide le modèle sur les critères de décision (notamment la priorité "critique", réservée aux pannes multi-utilisateurs ou incidents de sécurité avérés)
- **Repli sur "autre"** : un ticket vague reçoit quand même une classification plutôt que de bloquer le traitement
- **Gestion d'erreur par ticket** : une erreur sur un ticket n'interrompt pas le traitement du lot
- **Client simulé (mock)** : permet de tester toute la logique du pipeline sans clé API ni réseau

## Prérequis
- Librairie `google-genai`
- Aucun GPU requis (calcul côté API)
- Clé API à charger via variable d'environnement / secrets — jamais en clair dans le code

## Sortie
Fichier JSON par ticket : id, texte original, catégorie, équipe, priorité, justification.


# Partie Diagnostic

## 1. Objectif du diagnostic

Le diagnostic consiste à permettre l'assistant chatbot d'être capable d'analyser un ticket informatique afin d'identifier les informations utiles déjà présentes dans celui-ci.

Les informations recherchées sont :

- utilisateur concerné ;
- équipement ;
- application ou service ;
- symptômes ;
- moment d'apparition ;
- impact sur l'activité ;
- manipulations déjà effectuées.

Lorsque certaines informations sont absentes, l'assistant doit poser des questions ciblées afin de compléter le diagnostic.

Le module de diagnostic ne propose pas de solution, ne réalise pas d'escalade et ne consulte pas la base de connaissances. Son rôle est uniquement de **collecter, structurer et compléter les informations nécessaires au diagnostic**.

---

## 2. Principe général du diagnostic

Le principe repose sur une boucle de collecte d'informations :

1. Réception du ticket informatique.
2. Analyse du contenu du ticket par le LLM.
3. Extraction des sept informations recherchées.
4. Création d'un diagnostic structuré.
5. Détection des informations encore absentes.
6. Génération de questions ciblées uniquement pour les informations manquantes.
7. Réception de la réponse de l'utilisateur.
8. Mise à jour du diagnostic avec les nouvelles informations.
9. Nouvelle vérification des informations manquantes.
10. Répétition du processus jusqu'à obtenir un diagnostic complet ou atteindre la limite de collecte prévue.
11. Transmission du diagnostic final aux étapes suivantes du système.

Le modèle ne doit jamais inventer une information absente du ticket ou de la réponse de l'utilisateur. Une information inconnue reste vide jusqu'à ce qu'elle soit explicitement fournie.

---

## 3. Structure du diagnostic

Le diagnostic est organisé autour de sept champs :

- `utilisateur_concerne` : personne concernée par le problème ;
- `equipement` : matériel concerné ;
- `application_service` : application, logiciel ou service concerné ;
- `symptomes` : description du problème observé ;
- `moment_apparition` : moment ou période d'apparition du problème ;
- `impact_activite` : conséquence du problème sur le travail ou l'activité ;
- `manipulations_effectuees` : actions déjà réalisées par l'utilisateur.

Le résultat du diagnostic est conservé sous forme de données structurées afin de pouvoir être exploité par les étapes suivantes de l'assistant.

---

## 4. Étapes effectuées dans le projet

### Étape 1 — Préparation de l'environnement

- Installation des bibliothèques nécessaires.
- Configuration de l'accès au modèle Gemini.
- Initialisation du client utilisé pour communiquer avec le LLM.

### Étape 2 — Définition du modèle de diagnostic

Création d'une structure Pydantic représentant les sept informations attendues.

Cette structure permet d'obtenir un résultat normalisé et facilement exploitable par Python.

### Étape 3 — Création du prompt de diagnostic

Définition des règles permettant au LLM de :

- extraire uniquement les informations présentes ;
- ne pas inventer d'informations ;
- conserver les champs absents comme informations manquantes ;
- ne pas proposer de solution ;
- ne pas effectuer d'escalade ;
- ne pas consulter la base de connaissances.

### Étape 4 — Extraction des informations

Le ticket est envoyé au module de diagnostic.

Le LLM analyse le texte et remplit les sept champs du diagnostic en fonction des informations explicitement présentes.

### Étape 5 — Détection des informations manquantes

Le programme vérifie automatiquement chacun des champs du diagnostic.

Les champs textuels vides sont considérés comme manquants.

Le champ des manipulations est considéré comme manquant lorsqu'aucune manipulation n'a encore été identifiée.

### Étape 6 — Génération de questions ciblées

Lorsque des informations sont absentes, le LLM génère uniquement les questions nécessaires pour les récupérer.

Les informations déjà connues ne doivent pas être redemandées.

### Étape 7 — Collecte de la réponse utilisateur

L'utilisateur répond aux questions générées par l'assistant.

### Étape 8 — Mise à jour du diagnostic

La réponse utilisateur est analysée afin d'identifier les nouvelles informations.

Le diagnostic existant est ensuite complété sans supprimer les informations précédemment acquises, sauf en cas de correction explicite par l'utilisateur.

Les nouvelles manipulations sont ajoutées à la liste existante.

### Étape 9 — Nouvelle vérification

Une nouvelle détection des informations manquantes est effectuée après chaque mise à jour.

### Étape 10 — Obtention du diagnostic final

Lorsque toutes les informations nécessaires sont présentes, le diagnostic est considéré comme complet.

Le résultat peut alors être transmis aux modules suivants, par exemple pour la classification, la recherche dans une base de connaissances, la résolution ou l'escalade.

---

## 5. Classes utilisées

### `Diagnostic`

Classe Pydantic représentant le résultat structuré du diagnostic.

Elle contient les sept attributs suivants :

- `utilisateur_concerne`
- `equipement`
- `application_service`
- `symptomes`
- `moment_apparition`
- `impact_activite`
- `manipulations_effectuees`

### `QuestionsManquantes`

Classe Pydantic utilisée pour structurer la liste des questions générées lorsque certaines informations sont absentes.

---

## 6. Fonctions utilisées

### `extraire_diagnostic(ticket)`

Analyse le ticket et extrait les sept informations du diagnostic.

**Entrée :** texte du ticket.

**Sortie :** objet `Diagnostic`.

---

### `afficher_diagnostic(diagnostic)`

Affiche le contenu du diagnostic sous une forme lisible et structurée.

**Entrée :** objet `Diagnostic`.

**Sortie :** affichage du diagnostic.

---

### `detecter_informations_manquantes(diagnostic)`

Analyse les champs du diagnostic afin d'identifier ceux qui sont encore incomplets.

**Entrée :** objet `Diagnostic`.

**Sortie :** liste des champs manquants.

---

### `generer_questions(diagnostic, champs_manquants)`

Génère des questions ciblées à partir du diagnostic actuel et des informations manquantes.

**Entrées :** diagnostic actuel et liste des champs manquants.

**Sortie :** liste de questions.

---

### `mettre_a_jour_diagnostic(diagnostic, reponse_utilisateur)`

Analyse la réponse de l'utilisateur et complète le diagnostic avec les nouvelles informations obtenues.

**Entrées :** diagnostic actuel et réponse utilisateur.

**Sortie :** diagnostic mis à jour.

---

### `analyser_ticket(ticket)`

Effectue une analyse initiale complète du ticket : extraction du diagnostic, détection des informations manquantes et génération des premières questions.

**Entrée :** texte du ticket.

**Sortie :** diagnostic, informations manquantes et questions.

---

### `chatbot_diagnostic(ticket_initial)`

Orchestre l'ensemble du processus conversationnel.

Cette fonction :

- lance l'extraction initiale ;
- détecte les informations manquantes ;
- pose les questions ciblées ;
- récupère les réponses ;
- met à jour le diagnostic ;
- répète le contrôle jusqu'à obtenir un diagnostic complet ou atteindre la limite prévue.

**Entrée :** ticket initial.

**Sortie :** diagnostic final ou diagnostic partiel.

---

### `diagnostic_to_json(diagnostic)`

Transforme le diagnostic structuré en JSON afin de pouvoir le transmettre facilement aux autres composants de l'application.

**Entrée :** objet `Diagnostic`.

**Sortie :** représentation JSON du diagnostic.

---

## 7. Architecture fonctionnelle

Le module de diagnostic peut être résumé ainsi :

**Ticket → Extraction → Détection des manques → Questions ciblées → Réponse utilisateur → Mise à jour → Vérification → Diagnostic final**

Cette architecture permet de séparer clairement la collecte d'informations de la phase ultérieure de résolution du ticket.

---

## 8. Résultat attendu

À la fin du processus, l'assistant doit disposer d'un diagnostic structuré contenant, autant que possible, les sept informations nécessaires :

- utilisateur concerné ;
- équipement ;
- application ou service ;
- symptômes ;
- moment d'apparition ;
- impact sur l'activité ;
- manipulations déjà effectuées.

Le diagnostic final constitue ainsi une entrée propre et structurée pour les prochaines étapes de l'assistant IT.

# Module Outils
## 1.Objectif

Fournir à l'agent les fonctionnalités nécessaires pour rechercher, sélectionner et évaluer les connaissances techniques afin de résoudre les demandes de maintenance.

## 2.Approche : Tool Manager + Knowledge Base

Pourquoi ce choix :

Centralise la gestion et l'exécution des outils nécessaires à l'agent
Permet d'interroger la Knowledge Base pour retrouver les connaissances pertinentes
Sépare la recherche et l'évaluation des sources de la génération de la réponse
Permet de vérifier si les informations récupérées sont suffisantes avant le diagnostic
Fournit au LLM les informations nécessaires pour générer une réponse justifiée

## 3.Outils
-Recherche : recherche les passages pertinents dans la Knowledge Base
-Sources : sélectionne les sources les plus pertinentes et leurs scores
-Vérification : détermine si les sources disponibles sont suffisantes
-Confiance : calcule le niveau de confiance associé aux informations récupérées
-Réponse : prépare les informations utilisées par le LLM pour produire le résultat final

## 4.Points clés de conception
-Tool Manager centralisé : permet d'enregistrer, configurer et exécuter les outils disponibles
-Knowledge Base comme source de vérité : les outils utilisent uniquement les connaissances présentes dans la base
-Sources avec score de pertinence : permet de sélectionner les passages les plus adaptés à la demande
-Vérification des sources : évite de produire un diagnostic lorsque les informations disponibles sont insuffisantes
-Calcul de confiance : fournit une estimation de la fiabilité des informations récupérées
-Traçabilité des appels : chaque outil conserve son nom, ses paramètres, son résultat et son statut
-Pas d'invention de connaissances : les outils ne produisent pas d'informations absentes de la Knowledge Base
-Gestion des erreurs : une erreur d'exécution est enregistrée sans interrompre inutilement le traitement

## 5.Prérequis
Knowledge Base contenant les connaissances techniques
Tool Manager pour gérer les outils
Outils de recherche et d'évaluation des sources
LLM pour générer le diagnostic et la solution
Dépendances Python nécessaires au fonctionnement du module

## 6.Sortie

Objet JSON contenant le diagnostic, la solution, les sources utilisées, le niveau de confiance et l'indication de suffisance des sources.

{
  "diagnostic": "...",
  "solution": "...",
  "sources": [
    {
      "document": "KB-NET-04",
      "passage": "...",
      "score": 0.91
    }
  ],
  "confiance": 0.89,
  "source_suffisante": true
}


