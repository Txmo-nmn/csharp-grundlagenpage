/* ========================================
       SMOOTH SCROLLING
       Sanftes Scrollen beim Klick auf Navigation
       ======================================== */
// Für jeden Link in der Navigation...
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();  // Verhindert normales Link-Verhalten

        // Finde das Ziel (z.B. <section id="intro">)
        const target = document.querySelector(this.getAttribute('href'));

        // Scrolle sanft zum Ziel
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Entferne "active" Klasse von allen Links
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

        // Füge "active" Klasse zum geklickten Link hinzu
        this.classList.add('active');
    });
});

/* ========================================
   SCROLL SPY
   Markiert aktuellen Abschnitt in Navigation
   ======================================== */
const sections = document.querySelectorAll('section');  // Alle <section> Elemente
const navLinks = document.querySelectorAll('nav a');    // Alle Navigations-Links

// Bei jedem Scroll-Event...
window.addEventListener('scroll', () => {
    let current = '';  // Speichert aktuelle Section-ID

    // Prüfe für jede Section...
    sections.forEach(section => {
        const sectionTop = section.offsetTop;      // Position der Section
        const sectionHeight = section.clientHeight; // Höhe der Section

        // Wenn wir in dieser Section sind (200px Puffer)
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');  // Speichere ID
        }
    });

    // Aktualisiere Navigation
    navLinks.forEach(link => {
        link.classList.remove('active');  // Entferne von allen

        // Wenn Link zur aktuellen Section gehört
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');  // Markiere als aktiv
        }
    });
});

/* ========================================
   SEARCH FUNCTIONALITY
   Live-Suche mit Highlighting
   ======================================== */
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

/* Erstellt einen durchsuchbaren Index */
function createSearchIndex() {
    const index = [];  // Array für alle durchsuchbaren Inhalte
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('h2')?.textContent || '';

        // Sammle alle Textinhalte aus der Section
        const paragraphs = section.querySelectorAll('p, pre, h3, li');
        paragraphs.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > 0) {
                // Speichere Infos für spätere Suche
                index.push({
                    sectionId: sectionId,      // ID der Section
                    sectionTitle: sectionTitle, // Titel der Section
                    content: text,              // Textinhalt
                    element: element            // Original-Element
                });
            }
        });
    });

    return index;
}

// Erstelle Index beim Laden der Seite
const searchIndex = createSearchIndex();

/* Highlightet Suchbegriffe im Text */
function highlightText(text, query) {
    // Regex: findet alle Vorkommen des Suchbegriffs (case-insensitive)
    const regex = new RegExp(`(${query})`, 'gi');
    // Ersetzt gefundene Begriffe mit <span class="search-highlight">
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

/* Führt die Suche durch */
function performSearch(query) {
    // Wenn weniger als 2 Zeichen: verstecke Ergebnisse
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    // Durchsuche den Index
    searchIndex.forEach(item => {
        // Wenn Suchbegriff im Inhalt vorkommt...
        if (item.content.toLowerCase().includes(lowerQuery)) {
            // Finde Position des Suchbegriffs
            const index = item.content.toLowerCase().indexOf(lowerQuery);

            // Extrahiere Kontext (50 Zeichen vor und nach)
            const start = Math.max(0, index - 50);
            const end = Math.min(item.content.length, index + query.length + 50);
            let context = item.content.substring(start, end);

            // Füge "..." hinzu wenn Text abgeschnitten
            if (start > 0) context = '...' + context;
            if (end < item.content.length) context = context + '...';

            results.push({
                sectionId: item.sectionId,
                sectionTitle: item.sectionTitle,
                context: context,
                element: item.element
            });
        }
    });

    displayResults(results, query);  // Zeige Ergebnisse an
}

/* Zeigt Suchergebnisse an */
function displayResults(results, query) {
    // Wenn keine Ergebnisse gefunden
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">❌ Keine Ergebnisse gefunden</div>';
        searchResults.classList.add('active');
        return;
    }

    // Begrenze auf maximal 10 Ergebnisse
    const limitedResults = results.slice(0, 10);

    let html = '';
    // Erstelle HTML für jedes Ergebnis
    limitedResults.forEach((result, index) => {
        const highlightedContext = highlightText(result.context, query);
        html += `
                <div class="search-result-item" data-section="${result.sectionId}" data-index="${index}">
                    <div class="search-result-title">${result.sectionTitle}</div>
                    <div class="search-result-context">${highlightedContext}</div>
                </div>
            `;
    });

    searchResults.innerHTML = html;
    searchResults.classList.add('active');  // Zeige Dropdown

    // Click-Handler für Ergebnisse
    document.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            const resultIndex = parseInt(item.dataset.index);
            const targetElement = limitedResults[resultIndex].element;

            // Scrolle zum gefundenen Element
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Kurzes Highlighting-Effekt (2 Sekunden)
            targetElement.style.transition = 'background 0.3s ease';
            targetElement.style.background = 'rgba(139, 92, 246, 0.2)';
            setTimeout(() => {
                targetElement.style.background = '';  // Zurücksetzen
            }, 2000);

            // Schließe Suchergebnisse
            searchResults.classList.remove('active');
            searchInput.value = '';  // Leere Suchfeld
        });
    });
}

/* Event Listener für Sucheingabe */
// Bei jeder Eingabe im Suchfeld...
searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);  // Führe Suche aus
});

/* Schließe Suchergebnisse bei Klick außerhalb */
document.addEventListener('click', (e) => {
    // Wenn nicht in der Suchleiste geklickt wurde
    if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('active');  // Verstecke Ergebnisse
    }
});

/* Tastatur-Shortcuts */
// ESC-Taste zum Schließen
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchResults.classList.remove('active');
        searchInput.blur();  // Entferne Fokus vom Suchfeld
    }
});

// Strg+K / Cmd+K für schnellen Zugriff zur Suche
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();  // Verhindere Browser-Suchleiste
        searchInput.focus(); // Fokussiere Suchfeld
    }
});