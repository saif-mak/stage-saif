# Rapport de Projet : Automatisation et Intelligence Artificielle en Immobilier d'Entreprise

## 1. Introduction

Suite à notre échange, je tiens tout d’abord à vous remercier pour l’opportunité d’avoir échangé avec vous.

Lors de notre entretien, nous avons abordé plusieurs points, notamment l’automatisation de certains processus. Nous avons particulièrement discuté de l’automatisation de la création de devis et de la manière dont l’intelligence artificielle pourrait être utilisée afin de générer des devis simples et personnalisés, adaptés aux besoins de chaque client et aux caractéristiques de chaque bureau.

Dans ce contexte, j’ai réalisé une première proposition de solution sous la forme d’un prototype afin d’illustrer ma vision de cette automatisation. Cette solution vise à faciliter la génération de devis à partir des informations disponibles dans la base de données, tout en permettant d’adapter automatiquement chaque devis en fonction des caractéristiques du bureau et des demandes spécifiques du client.

Par ailleurs, nous avons également discuté d’un second point concernant l’automatisation de la gestion des appels. Dans cette perspective, je propose un workflow réalisé avec n8n permettant de montrer comment un système automatisé pourrait gérer les appels, collecter les informations nécessaires auprès des clients et répondre automatiquement à certaines questions fréquentes.

Ce rapport présente donc la solution proposée, les principales fonctionnalités du prototype développé ainsi que les processus d’automatisation envisagés.

---

## 2. Problématiques Identifiées

Actuellement, le processus commercial et de gestion des biens fait face à plusieurs défis opérationnels qui ralentissent la réactivité face aux clients :

- **Création manuelle des devis :** Un processus chronophage, sujet aux erreurs, nécessitant de calculer et d'ajuster systématiquement les coûts d'aménagement selon la surface de chaque bureau ou les demandes spécifiques.
- **Gestion manuelle des annonces de bureaux :** La saisie de nouvelles propriétés est longue et demande un effort de rédaction constant pour identifier les atouts de chaque espace.
- **Collecte des informations clients :** Le recueil des besoins est souvent dispersé, manquant de centralisation pour un suivi efficace.
- **Analyse des plans de bureaux :** L'extraction des données techniques et des surfaces utiles à partir de plans bruts (fichiers PDF ou images) exige du temps et une expertise humaine à chaque nouvelle acquisition.

---

## 3. Solution Proposée

Pour répondre à ces problématiques, la solution développée est une plateforme logicielle complète qui s'appuie sur l'Intelligence Artificielle pour automatiser la création des annonces immobilières et la génération de devis d'aménagement. 

Le système s'articule autour de deux interfaces principales :

### 3.1 Interface Administrateur (Opérateurs & Agents)
Le back-office permet aux équipes de gagner un temps précieux dans la mise en ligne des biens. 

![Dashboard Administrateur](../image/dashbord_admin.jpg)

L'administrateur peut :
- **Uploader un plan de bureau** (au format PDF ou image).
- L'**IA analyse automatiquement le plan**.
- L'IA **extrait les informations pertinentes** (mesures, type d'agencement).
- L'IA **génère automatiquement une description** commerciale attractive de la propriété.
- Le système **crée une annonce structurée** prête à être publiée.

![Création d'annonce optimisée par l'IA](../image/cree_annonce%20.jpg)

En outre, l'administrateur conserve un contrôle total et peut :
- Gérer et mettre à jour l'ensemble des annonces.
- Éditer manuellement les propriétés si nécessaire.
- Gérer les requêtes clients et suivre les devis émis.

![Gestion des Bureaux](../image/gestions_des_bureaux.jpg)

### 3.2 Interface Client
L'expérience utilisateur a été pensée pour être interactive et autonome. 

![Catalogue des annonces clients](../image/annonces.jpg)

Les clients peuvent :
- **Parcourir les annonces** de bureaux via une interface moderne.
- **Consulter les détails** techniques et visuels d'une propriété.
- **Demander un devis personnalisé** via le simulateur d'aménagement intégré.
- **Interagir avec un assistant IA** pour formuler des demandes d'aménagement sur-mesure (ex: "Ajout d'une cuisine équipée de 10m²").

![Simulateur de Devis](../image/personaliser%20mon%20%20entrpise%20.jpg)

### 3.3 L'Apport de l'Intelligence Artificielle
Dans ce système, l'IA est le moteur de l'automatisation. Elle est utilisée pour :
- **Analyser les plans uploadés** et comprendre l'organisation spatiale d'un document brut.
- **Extraire l'information** clé de manière fiable sans intervention humaine.
- **Générer des descriptions textuelles** ciblées pour la mise en valeur des annonces.
- **Automatiser la génération de devis** en évaluant instantanément le coût des travaux classiques et des demandes sur-mesure des visiteurs.

![Assistant Conversationnel IA](../image/ia%20conv.jpg)

---

## 4. Architecture du Système

Le prototype repose sur une architecture moderne orientée services :
- **Application Globale :** Développée avec **Next.js** et **React**, offrant un rendu rapide et une interface adaptative (responsive) sur tous les appareils.
- **Base de données :** Utilisation de **SQLite** gérée via l'ORM **Prisma**, offrant une modélisation structurée et un accès fluide aux entités du système (Bureaux, Clients, Devis).
- **Génération PDF :** Des modules robustes génèrent instanément, côté client et serveur, les devis finaux téléchargeables.

---

## 5. Modélisation du Processus

Le logigramme ci-dessous illustre le parcours utilisateur cible de la plateforme, allant de l'exploration du catalogue immobilier jusqu'à la génération dynamique du document d'aménagement assisté par IA.

![BPMN de génération de devis](bpmn.png)

---

  

## 7. Conclusion

La mise en œuvre de ce système propulsé par l'Intelligence Artificielle offre des avantages concurrentiels majeurs :
- **Automatisation élevée :** Disparition des tâches manuelles répétitives concernant l'analyse documentaire et la création d'annonces.
- **Gain de temps :** Réduction radicale du délai entre la demande d'un prospect et l'envoi d'un devis chiffré complet.
- **Amélioration de la gestion des données :** Centralisation fiable du patrimoine immobilier et des interactions clients.
- **Expérience client supérieure :** Parcours de location autonome, interactif et hautement personnalisé.
