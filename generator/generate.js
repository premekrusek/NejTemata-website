const fs = require("fs");
const fetch = require("node-fetch");

let latestDate = "";

const SHEET_ID = "1ePlQgU0QVQZCbqgACvgRxOyDFlUk2qSQ3Xq_v7H_Xcs";
const SHEET_NAME = "Sheet1";

const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

async function generate() {

  const res = await fetch(URL);
  const data = await res.json();

  if (!fs.existsSync("../topics")) {
    fs.mkdirSync("../topics");
  }

  const cardTemplate = fs.readFileSync("../templates/topic-card.html", "utf8");

  let topicsHTML = "";
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const today = new Date();

  data.forEach(topic => {
    if (topic.updated) {
      if (!latestDate || new Date(topic.updated) > new Date(latestDate)) {
        latestDate = topic.updated;
      }
    }
    const from = topic.show_from ? new Date(topic.show_from) : null;
    const to = topic.show_to ? new Date(topic.show_to) : null;
    if (from && today < from) return;
    if (to && today > to) return;

    sitemap += `<url>
                <loc>https://nejtemata.com/topics/${topic.slug}.html</loc>
                </url>`;

    // vytvoření stránky tématu

    const page = `
<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/images/favicon.ico" sizes="any">
  <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
  <title>${topic.title}</title>
  <meta name="description" content="${topic.description}" />

  <link rel="canonical" href="https://nejtemata.com/topics/${topic.slug}.html" />
  <meta property="og:title" content="${topic.title}">
  <meta property="og:description" content="${topic.description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://nejtemata.com/topics/${topic.slug}.html">
  <meta name="twitter:card" content="summary">

  <script type="application/ld+json">
  {
   "@context": "https://schema.org",
   "@type": "Article",
   "headline": "${topic.title}",
   "description": "${topic.description}",
   "url": "https://nejtemata.com/topics/${topic.slug}.html"
  }
  </script>

  <script type="application/ld+json">
  {
   "@context": "https://schema.org",
   "@type": "FAQPage",
   "mainEntity": [{
     "@type": "Question",
     "name": "${topic.title}",
     "acceptedAnswer": {
       "@type": "Answer",
       "text": "${topic.answer}"
     }
   }]
  }
  </script>

  <link rel="stylesheet" href="../styles.css" />
</head>
<body>
  <a class="skip-link" href="#obsah">Přeskočit na obsah</a>
  <header class="topbar">
    <div class="container topbar-inner">
      <div class="brand"><span class="dot" aria-hidden="true"></span><div><h1>Nejvyhledávanější témata</h1><p class="sub">${topic.tag}</p></div></div>
      <div class="meta"><span class="chip">Detailní stránka tématu</span></div>
      
      <div class="meta">
        <!-- ZMĚŇ: datum -->
        <span class="chip">Aktualizováno: <strong>${topic.updated || ""}</strong></span>      </div>
    </div>
  </header>
  <main id="obsah">
    <section class="detail-hero">
      <div class="container">
        <a class="back-link" href="../index.html">← Zpět na seznam témat</a>
        <div class="detail-card">
          <h1>${topic.title}</h1>
          <p><strong>Rychlá odpověď:</strong> ${topic.answer}</p>
          ${topic.content
            .split(/\r?\n/)
            .filter(p => p.trim() !== "")
            .map(p => `<p>${p}</p>`)
            .join("")}
          <h3>Související témata</h2>
          <ul class="related-topics">
            ${data
                .filter(t => t.slug !== topic.slug && t.tag === topic.tag)
                .slice(0,3)
                .map(t => `<li><a href="../topics/${t.slug}.html">${t.title}</a></li>`)
                .join("")}
          </ul>
        </div>
      </div>
    </section>
  </main>
<footer class="footer">
    <div class="container footer-inner">
      <p>© <span id="year"></span> Nejvyhledávanější témata</p>
      <a class="muted" href="../legal/privacy.html">Zásady ochrany osobních údajů</a>
      <a class="muted" href="../legal/contact.html">Kontakt</a>
      <a class="muted" href="../legal/about.html">O webu</a>
      <!--<p class="muted">Jednoduchá šablona • čisté UI • snadná aktualizace</p>-->
    </div>
  </footer>  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body></html>
`;

    fs.writeFileSync(`../topics/${topic.slug}.html`, page);

    // vytvoření karty tématu na homepage

    let card = cardTemplate
      .replace(/{{title}}/g, topic.title)
      .replace(/{{description}}/g, topic.description)
      .replace(/{{answer}}/g, topic.answer)
      .replace(/{{tag}}/g, topic.tag)
      .replace(/{{slug}}/g, topic.slug)
      .replace(/{{updated}}/g, topic.updated || "");
      
    topicsHTML += card + "\n";

  });

  // načteme index.html
  let index = fs.readFileSync("../templates/index-template.html", "utf8");
  
  // přidání datumu do indexu
  index = index.replace("{{UPDATED}}", latestDate);

  // nahradíme blok témat
  index = index.replace(
    /<!--TOPICS-->([\s\S]*?)<!--TOPICS-END-->/,
    `<!--TOPICS-->
  ${topicsHTML}
  <!--TOPICS-END-->`
  );

  fs.writeFileSync("../index.html", index);

  sitemap += "</urlset>";
  fs.writeFileSync("../sitemap.xml", sitemap);

  console.log("Hotovo! Stránky i index byly vygenerovány.");

}

generate();