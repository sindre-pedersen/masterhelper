// === KONFIGURASJON ===
// Sett inn URL-en til Cloudflare Workeren din her:
const WORKER_URL = "https://masterhelper-ai-proxy.sindre-sveen.workers.dev/"; 
// ⬆️ BYTT UT denne med din ekte URL (fra Cloudflare)


// Hjelpefunksjon: snakker med Cloudflare Worker (som igjen snakker med OpenAI)
async function callOpenAI(prompt) {
    const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Feil fra worker:", text);
        throw new Error("Noe gikk galt med proxyen (Cloudflare Worker).");
    }

    const data = await response.json();

    // Forventer samme struktur som OpenAI /v1/responses
    try {
        const text = data.output[0].content[0].text.value;
        return text.trim();
    } catch (e) {
        console.error("Klarte ikke å lese svar fra worker/OpenAI:", data);
        throw new Error("Klarte ikke å lese svar fra modellen.");
    }
}

// Hjelpefunksjon for "laster..."
function setLoading(elementId, isLoading, loadingText = "Laster…") {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (isLoading) {
        el.innerText = loadingText;
        el.classList.remove("text-red-600");
    } else if (!isLoading && el.innerText === loadingText) {
        el.innerText = "";
    }
}

// Hjelpefunksjon for feil
function setError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = message;
    el.classList.add("text-red-600");
}

/* 1. PROBLEMSTILLING-GENERATOR */
async function generateProblemstilling() {
    const tema = document.getElementById("tema").value.trim();
    const fagfelt = document.getElementById("fagfelt").value.trim();
    const outputId = "output-problemstilling";

    if (!tema || !fagfelt) {
        setError(outputId, "Fyll inn både tema og fagfelt først.");
        return;
    }

    setLoading(outputId, true, "Genererer problemstillinger…");

    const prompt = `
Du er en ekspert på forskningsmetode og akademisk skriving.

Lag 10 konkrete, forskbare problemstillinger på masternivå
basert på informasjonen under.

Tema: ${tema}
Fagfelt: ${fagfelt}

Krav:
- Hver problemstilling skal være avgrenset og presist formulert
- Ikke bruk vurderende ord som "viktig", "spennende" osv.
- Svar på norsk.
- Formater svaret som en nummerert liste (1., 2., 3. ...).
`;

    try {
        const result = await callOpenAI(prompt);
        const el = document.getElementById(outputId);
        el.classList.remove("text-red-600");
        el.innerText = result;
    } catch (err) {
        console.error(err);
        setError(outputId, "Noe gikk galt. Prøv igjen eller sjekk oppsettet av Cloudflare Worker.");
    }
}

/* 2. STRUKTURBYGGER */
async function generateStruktur() {
    const problemstilling = document.getElementById("struktur-problemstilling").value.trim();
    const outputId = "output-struktur";

    if (!problemstilling) {
        setError(outputId, "Skriv inn problemstillingen din først.");
        return;
    }

    setLoading(outputId, true, "Genererer forslag til struktur…");

    const prompt = `
Du er en erfaren veileder på masternivå.

Basert på denne problemstillingen:
"${problemstilling}"

Lag en anbefalt struktur for en masteroppgave på norsk.

Inkluder:
- Kapitteloverskrifter (Innledning, Teori, Metode, Analyse, Diskusjon, Konklusjon osv.)
- 1–3 setninger som forklarer hva som bør stå i hvert kapittel
- Evt. typiske fallgruver for denne typen problemstilling

Svar på norsk. Formater gjerne med overskrifter og punktlister.
`;

    try {
        const result = await callOpenAI(prompt);
        const el = document.getElementById(outputId);
        el.classList.remove("text-red-600");
        el.innerText = result;
    } catch (err) {
        console.error(err);
        setError(outputId, "Noe gikk galt. Prøv igjen eller sjekk oppsettet av Cloudflare Worker.");
    }
}

/* 3. AKADEMISK OMSKRIVER */
async function rewriteAcademic() {
    const inputText = document.getElementById("akademisk-input").value.trim();
    const outputId = "output-akademisk";

    if (!inputText) {
        setError(outputId, "Lim inn en tekst først.");
        return;
    }

    setLoading(outputId, true, "Skriver om teksten til akademisk språk…");

    const prompt = `
Du er en språkvasker som skriver på norsk, på masternivå.

Skriv om teksten under til et mer formelt og akademisk språk,
uten å endre innholdet eller betydningen.

Tekst:
${inputText}
`;

    try {
        const result = await callOpenAI(prompt);
        const el = document.getElementById(outputId);
        el.classList.remove("text-red-600");
        el.innerText = result;
    } catch (err) {
        console.error(err);
        setError(outputId, "Noe gikk galt. Prøv igjen eller sjekk oppsettet av Cloudflare Worker.");
    }
}

/* 4. REFERANSEHJELPER */
async function generateReferanse() {
    const tittel = document.getElementById("ref-tittel").value.trim();
    const forfatter = document.getElementById("ref-forfatter").value.trim();
    const år = document.getElementById("ref-år").value.trim();
    const outputId = "output-referanse";

    if (!tittel || !forfatter || !år) {
        setError(outputId, "Fyll inn tittel, forfatter og år først.");
        return;
    }

    setLoading(outputId, true, "Genererer referanser…");

    const prompt = `
Du er en ekspert på referansestiler.

Lag en referanse i både APA7 og Harvard basert på:

Tittel: ${tittel}
Forfatter(e): ${forfatter}
År: ${år}

Anta at dette er en bok, hvis ikke noe annet er oppgitt.
Svar på norsk, men med korrekt engelsk formatering av referansene.
`;

    try {
        const result = await callOpenAI(prompt);
        const el = document.getElementById(outputId);
        el.classList.remove("text-red-600");
        el.innerText = result;
    } catch (err) {
        console.error(err);
        setError(outputId, "Noe gikk galt. Prøv igjen eller sjekk oppsettet av Cloudflare Worker.");
    }
}

// Gjør funksjonene tilgjengelig globalt (siden vi bruker onclick="" i HTML)
window.generateProblemstilling = generateProblemstilling;
window.generateStruktur = generateStruktur;
window.rewriteAcademic = rewriteAcademic;
window.generateReferanse = generateReferanse;
