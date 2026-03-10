# Nejvyhledávanější témata – Clean (bílé UI)

## Spuštění
Otevři `index.html` v prohlížeči.

## Jak přidat/změnit téma
V `index.html` najdi seznam:
`<ul class="topics" id="topics">`

Zkopíruj jeden blok:
`<li class="topic" data-tags="..."> ... </li>`

Uprav:
- název v `<h2>`
- popis v `.desc`
- rychlou odpověď v `.answer`
- `data-tags` (kvůli vyhledávání)

## Vyhledávání
Search bar filtruje položky v seznamu (při psaní i po kliknutí na Hledat).
