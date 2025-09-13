document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const surahSelect = document.getElementById('surah-select');
    const ayahStartInput = document.getElementById('ayah-start');
    const ayahEndInput = document.getElementById('ayah-end');
    const loadSurahBtn = document.getElementById('load-surah');
    const customTextInput = document.getElementById('custom-text');
    const visualizeTextBtn = document.getElementById('visualize-text');
    const viewSwitcherBtns = document.querySelectorAll('.view-switcher');
    const exportPdfBtn = document.getElementById('export-pdf');
    const visualizationContainer = document.getElementById('visualization');
    const visSvg = document.getElementById('vis-svg');

    // --- App State ---
    let currentData = null;
    let activeView = 'ring'; // 'ring', 'tree', or 'timeline'

    // --- Initialization ---
    async function initialize() {
        console.log('App initialized.');
        loadSurahBtn.disabled = true;
        await populateSurahSelector();
        addEventListeners();
        loadSurahBtn.disabled = false;
        // Load default view with Al-Fatihah
        ayahStartInput.value = 1;
        ayahEndInput.value = 7;
        await handleLoadSurah();
    }

    async function populateSurahSelector() {
        console.log('Populating Surah selector...');
        try {
            const surahs = await getSurahList();
            surahSelect.innerHTML = ''; // Clear placeholder
            surahs.forEach(surah => {
                const option = document.createElement('option');
                option.value = surah.id;
                option.textContent = `${surah.id}: ${surah.name_simple}`;
                surahSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load Surah list:', error);
            surahSelect.innerHTML = '<option>Failed to load</option>';
        }
    }

    // --- Event Listeners ---
    function addEventListeners() {
        loadSurahBtn.addEventListener('click', handleLoadSurah);
        visualizeTextBtn.addEventListener('click', handleVisualizeText);
        exportPdfBtn.addEventListener('click', handleExportPdf);
        viewSwitcherBtns.forEach(btn => {
            btn.addEventListener('click', () => switchView(btn.dataset.view));
        });
    }

    // --- Handlers ---
    async function handleLoadSurah() {
        loadSurahBtn.disabled = true;
        loadSurahBtn.textContent = 'Loading...';
        const surahId = surahSelect.value;
        const start = parseInt(ayahStartInput.value, 10);
        const end = parseInt(ayahEndInput.value, 10);

        if (start > end) {
            alert('Starting Ayah must be less than or equal to Ending Ayah.');
            loadSurahBtn.disabled = false;
            loadSurahBtn.textContent = 'Load';
            return;
        }

        console.log(`Loading Surah ${surahId} from Ayah ${start} to ${end}`);
        
        const verses = await getVerseRange(surahId, start, end);
        if (verses.length === 0) {
            alert('Could not load verse data. Please check the console for errors.');
            loadSurahBtn.disabled = false;
            loadSurahBtn.textContent = 'Load';
            return;
        }

        const pairs = generatePalindromePairs(verses);

        currentData = {
            title: `Surah ${surahSelect.options[surahSelect.selectedIndex].text} (${start}-${end})`,
            verses: verses,
            pairs: pairs
        };

        renderVisualization();
        loadSurahBtn.disabled = false;
        loadSurahBtn.textContent = 'Load';
    }

    function handleVisualizeText() {
        const text = customTextInput.value;
        if (!text) {
            alert('Please paste some text to visualize.');
            return;
        }
        console.log('Visualizing custom text...');
        currentData = parseText(text);
        renderVisualization();
    }

    function switchView(view) {
        activeView = view;
        console.log(`Switched to ${view} view.`);
        renderVisualization();
    }

    function handleExportPdf() {
        if (!currentData) {
            alert('No data to export.');
            return;
        }
        console.log('Exporting to PDF...');
        exportToPdf(visSvg, currentData.title);
    }

    // --- Rendering ---
    function renderVisualization() {
        if (!currentData) return;

        const svg = d3.select(visSvg);
        svg.selectAll('*').remove(); // Clear previous visualization

        console.log(`Rendering ${activeView} view...`);

        switch (activeView) {
            case 'ring':
                drawRing(svg, currentData);
                break;
            case 'tree':
                drawTree(svg, currentData);
                break;
            case 'timeline':
                drawTimeline(svg, currentData);
                break;
        }
    }

    // --- Start the App ---
    initialize();
});
