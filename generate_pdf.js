const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '.');
const imageDir = path.join(projectDir, 'image');

function readImageAsBase64(imagePath) {
  if (!fs.existsSync(imagePath)) { console.warn('Image not found:', imagePath); return null; }
  const data = fs.readFileSync(imagePath);
  return `data:image/jpeg;base64,${data.toString('base64')}`;
}
function readPngAsBase64(imagePath) {
  if (!fs.existsSync(imagePath)) { console.warn('Image not found:', imagePath); return null; }
  const data = fs.readFileSync(imagePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

const images = {
  dashbord_admin: readImageAsBase64(path.join(imageDir, 'dashbord_admin.jpg')),
  cree_annonce: readImageAsBase64(path.join(imageDir, 'cree_annonce .jpg')),
  gestions_des_bureaux: readImageAsBase64(path.join(imageDir, 'gestions_des_bureaux.jpg')),
  manage_client: readImageAsBase64(path.join(imageDir, 'manage client .jpg')),
  manage_quotes: readImageAsBase64(path.join(imageDir, 'manage Quotes .jpg')),
  demoSaifMakouar: readImageAsBase64(path.join(imageDir, 'demoSaifMakouar.jpg')),
  annonces: readImageAsBase64(path.join(imageDir, 'annonces.jpg')),
  personaliser: readImageAsBase64(path.join(imageDir, 'personaliser mon  entrpise .jpg')),
  ia_conv: readImageAsBase64(path.join(imageDir, 'ia conv.jpg')),
  ia_conv2: readImageAsBase64(path.join(imageDir, 'ia conv 2 .jpg')),
  bpmn: readPngAsBase64(path.join(projectDir, 'bpmn.png')),
  n8n: readImageAsBase64(path.join(imageDir, 'N8N workflow .jpg')),
  n8n_flow: readPngAsBase64(path.join(projectDir, 'n8n_flow.png')),
};

const imgTag = (src, alt, caption) => src ? `<img src="${src}" alt="${alt}"><div class="img-caption">${caption}</div>` : '';

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #222; max-width: 820px; margin: 0 auto; padding: 40px; }
  h1 { font-size: 18pt; color: #1a237e; border-bottom: 3px solid #1a237e; padding-bottom: 10px; }
  h2 { font-size: 14pt; color: #283593; border-bottom: 1px solid #c5cae9; padding-bottom: 6px; margin-top: 30px; }
  h3 { font-size: 11pt; color: #3949ab; margin-top: 18px; }
  p, li { line-height: 1.6; margin-bottom: 5px; }
  ul, ol { padding-left: 18px; }
  strong { color: #1a237e; }
  img { max-width: 100%; border: 1px solid #e0e0e0; border-radius: 6px; margin: 12px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.08); display: block; }
  img.small { max-width: 65%; margin-left: auto; margin-right: auto; }
  img.medium { max-width: 75%; margin-left: auto; margin-right: auto; }
  .img-caption { text-align: center; font-style: italic; color: #666; font-size: 9pt; margin-top: -6px; margin-bottom: 12px; }
  .img-side-by-side { display: flex; gap: 10px; margin: 12px 0; }
  .img-side-by-side > div { flex: 1; text-align: center; }
  .img-side-by-side img { width: 100%; margin: 0 0 3px 0; }
  .img-side-by-side .img-caption { margin-top: 1px; }
  hr { border: none; border-top: 1px solid #e8eaf6; margin: 20px 0; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

<h1>Rapport de Projet : Automatisation et Intelligence Artificielle en Immobilier d'Entreprise</h1>
<p><strong>Rédigé par : Saif Makouar</strong></p>

<hr>

<h2>1. Introduction</h2>
<p>Suite à notre échange, je tiens tout d'abord à vous remercier pour l'opportunité d'avoir échangé avec vous.</p>
<p>Lors de notre entretien, nous avons abordé plusieurs points, notamment l'automatisation de certains processus. Nous avons particulièrement discuté de l'automatisation de la création de devis et de la manière dont l'intelligence artificielle pourrait être utilisée afin de générer des devis simples et personnalisés, adaptés aux besoins de chaque client et aux caractéristiques de chaque bureau.</p>
<p>Dans ce contexte, j'ai réalisé une première proposition de solution sous la forme d'un prototype afin d'illustrer ma vision de cette automatisation. Cette solution vise à faciliter la génération de devis à partir des informations disponibles dans la base de données, tout en permettant d'adapter automatiquement chaque devis en fonction des caractéristiques du bureau et des demandes spécifiques du client.</p>
<p>Par ailleurs, nous avons également discuté d'un second point concernant l'automatisation de la gestion des appels. Dans cette perspective, je propose un workflow réalisé avec n8n permettant de montrer comment un système automatisé pourrait gérer les appels, collecter les informations nécessaires auprès des clients et répondre automatiquement à certaines questions fréquentes.</p>
<p>Ce rapport présente donc la solution proposée, les principales fonctionnalités du prototype développé ainsi que les processus d'automatisation envisagés.</p>

<hr>

<h2>2. Problématiques Identifiées</h2>
<p>Actuellement, le processus commercial et de gestion des biens fait face à plusieurs défis opérationnels :</p>
<ul>
  <li><strong>Création manuelle des devis :</strong> Un processus chronophage, sujet aux erreurs.</li>
  <li><strong>Gestion manuelle des annonces de bureaux :</strong> La saisie de nouvelles propriétés est longue.</li>
  <li><strong>Collecte des informations clients :</strong> Le recueil des besoins est souvent dispersé.</li>
  <li><strong>Analyse des plans de bureaux :</strong> L'extraction des données techniques à partir de plans bruts exige du temps.</li>
</ul>

<hr>

<h2>3. Solution Proposée</h2>
<p>La solution développée est une plateforme logicielle complète s'appuyant sur l'Intelligence Artificielle pour automatiser la création des annonces immobilières et la génération de devis d'aménagement.</p>

<h3>3.1 Interface Administrateur (Opérateurs &amp; Agents)</h3>
<p>Le back-office permet aux équipes de gagner un temps précieux dans la mise en ligne des biens.</p>

${imgTag(images.dashbord_admin, 'Dashboard Administrateur', 'Dashboard Administrateur')}

<p>L'administrateur peut :</p>
<ul>
  <li><strong>Uploader un plan de bureau</strong> (au format PDF ou image).</li>
  <li>L'<strong>IA analyse automatiquement le plan</strong>.</li>
  <li>L'IA <strong>extrait les informations pertinentes</strong> (mesures, type d'agencement).</li>
  <li>L'IA <strong>génère automatiquement une description</strong> commerciale attractive.</li>
  <li>Le système <strong>crée une annonce structurée</strong> prête à être publiée.</li>
</ul>

${imgTag(images.cree_annonce, "Création d'annonce IA", "Création d'Annonce assistée par l'IA")}

<p>L'administrateur conserve également un contrôle total :</p>
<ul>
  <li>Gérer et mettre à jour l'ensemble des annonces.</li>
  <li>Gérer les requêtes clients et suivre les devis émis.</li>
</ul>

${imgTag(images.gestions_des_bureaux, 'Gestion des Bureaux', 'Gestion des Bureaux')}
${imgTag(images.manage_client, 'Gestion des Clients', 'Gestion des Clients')}
${imgTag(images.manage_quotes, 'Gestion des Devis', 'Suivi des Devis (Manage Quotes)')}

<h3>3.2 Interface Client</h3>
<p>L'expérience utilisateur a été pensée pour être interactive et autonome.</p>

${images.demoSaifMakouar ? `<img src="${images.demoSaifMakouar}" class="small" alt="Page d'accueil"><div class="img-caption">Page d'accueil — demo_SAIF-MAKOUAR</div>` : ''}
${images.annonces ? `<img src="${images.annonces}" class="small" alt="Catalogue"><div class="img-caption">Catalogue des annonces disponibles</div>` : ''}

<p>Les clients peuvent :</p>
<ul>
  <li><strong>Parcourir les annonces</strong> de bureaux via une interface moderne.</li>
  <li><strong>Consulter les détails</strong> techniques et visuels d'une propriété.</li>
  <li><strong>Demander un devis personnalisé</strong> via le simulateur intégré.</li>
  <li><strong>Interagir avec un assistant IA</strong> pour des demandes sur-mesure.</li>
</ul>

${imgTag(images.personaliser, 'Simulateur de Personnalisation', 'Simulateur de Devis et Personnalisation')}

<h3>3.3 L'Apport de l'Intelligence Artificielle</h3>
<p>L'IA est le moteur de l'automatisation dans ce système :</p>
<ul>
  <li><strong>Analyser les plans uploadés</strong> et comprendre l'organisation spatiale.</li>
  <li><strong>Extraire l'information</strong> clé de manière fiable sans intervention humaine.</li>
  <li><strong>Générer des descriptions textuelles</strong> pour la mise en valeur des annonces.</li>
  <li><strong>Automatiser la génération de devis</strong> en évaluant instantanément le coût.</li>
</ul>

${(images.ia_conv || images.ia_conv2) ? `
<div class="img-side-by-side">
  ${images.ia_conv ? `<div><img src="${images.ia_conv}" alt="IA conv 1"><div class="img-caption">Assistant IA — Demande initiale</div></div>` : ''}
  ${images.ia_conv2 ? `<div><img src="${images.ia_conv2}" alt="IA conv 2"><div class="img-caption">Assistant IA — Suite de l'échange</div></div>` : ''}
</div>` : ''}

<hr>

<h2>4. Architecture du Système</h2>
<ul>
  <li><strong>Application Globale :</strong> Développée avec <strong>Next.js</strong> et <strong>React</strong>, interface adaptative (responsive).</li>
  <li><strong>Base de données :</strong> <strong>SQLite</strong> gérée via l'ORM <strong>Prisma</strong>.</li>
  <li><strong>Génération PDF :</strong> Modules robustes pour la génération côté client des devis téléchargeables.</li>
</ul>

<hr>

<h2>5. Modélisation du Processus</h2>
<p>Le logigramme ci-dessous illustre le parcours utilisateur de la plateforme, de l'exploration du catalogue jusqu'à la génération automatique du devis.</p>

${images.bpmn ? imgTag(images.bpmn, 'BPMN', 'Diagramme — Processus de Génération d\'un Devis') : '<p><em>[Diagramme non trouvé]</em></p>'}

<hr>

<h2>6. Automatisation de la Gestion des Appels avec l'IA</h2>
<p>Afin d'illustrer la possibilité d'automatiser la gestion des appels entrants, un workflow a été conçu avec <strong>n8n</strong>, en intégrant <strong>Vapi</strong> (gestion vocale) et <strong>Gemini API</strong> (analyse IA des conversations).</p>

<h3>Fonctionnement du Workflow</h3>
<ol>
  <li><strong>Réception de l'appel</strong> via Vapi, qui agit comme agent vocal intelligent.</li>
  <li><strong>Extraction des données</strong> de la conversation via un webhook n8n.</li>
  <li><strong>Analyse par Gemini API</strong> : détection de la langue et identification de la demande.</li>
  <li><strong>Vérification</strong> de la complétude des informations client.</li>
</ol>

<p><strong>Si la conversation est complète :</strong></p>
<ul>
  <li>Création d'un rendez-vous dans <strong>Google Calendar</strong>.</li>
  <li>Enregistrement dans <strong>Google Sheets</strong>.</li>
  <li>Envoi d'un email de confirmation.</li>
  <li>Réponse vocale de confirmation via Vapi.</li>
</ul>

<p><strong>Si des informations manquent :</strong> un agent IA génère la prochaine question et la pose au client via Vapi pour poursuivre la collecte.</p>

<h3>Modélisation du Processus</h3>

${images.n8n_flow ? `<img src="${images.n8n_flow}" class="medium" alt="Schéma architecture n8n"><div class="img-caption">Schéma d'architecture du workflow d'automatisation des appels</div>` : ''}

${images.n8n ? `<img src="${images.n8n}" alt="Workflow n8n"><div class="img-caption">Workflow n8n — Capture de la plateforme d'automatisation</div>` : ''}

<hr>

<h2>7. Conclusion</h2>
<p>Ce travail présente deux propositions de solutions visant à illustrer comment certaines tâches au sein de votre activité pourraient être automatisées : d'une part, une plateforme permettant la génération automatisée de devis personnalisés à partir des données disponibles, et d'autre part un workflow de gestion des appels basé sur l'intelligence artificielle et n8n afin de collecter les informations clients et organiser les rendez-vous.</p>
<p>Ces propositions ont pour objectif de partager une première vision de ce qui pourrait être mis en place pour améliorer l'efficacité de certains processus. J'espère que ces idées pourront retenir votre attention et constituer une base de réflexion intéressante.</p>
<p>Je reste très motivé à l'idée de contribuer à ce type de projets et je vous remercie sincèrement pour le temps que vous m'avez accordé lors de notre échange. J'espère avoir l'opportunité de rejoindre votre équipe et de participer au développement de ces solutions.</p>

</body>
</html>`;

fs.writeFileSync(path.join(projectDir, 'rapport_projet.html'), html);

async function generatePDF() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(projectDir, 'rapport_projet.pdf'),
    format: 'A4',
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    printBackground: true
  });
  await browser.close();
  console.log('PDF generated => rapport_projet.pdf');
}

generatePDF().catch(console.error);
