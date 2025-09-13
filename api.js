const API_BASE_URL = 'https://api.alquran.cloud/v1';
const ARABIC_EDITION = 'quran-uthmani';
const TRANSLATION_EDITION = 'en.sahih'; // Saheeh International

/**
 * Fetches the list of all Surahs (chapters) from the alquran.cloud API.
 * @returns {Promise<Array>} A promise that resolves to an array of Surah objects.
 */
async function getSurahList() {
    try {
        const response = await fetch(`${API_BASE_URL}/surah`);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        // The API returns surahs in the `data` property.
        // We'll adapt it to the format our app expects.
        return data.data.map(surah => ({
            id: surah.number,
            name_simple: surah.englishName
        }));
    } catch (error) {
        console.error("Failed to fetch Surah list:", error);
        return [];
    }
}

/**
 * Fetches verses for a specific Surah, including translations, from the alquran.cloud API.
 * @param {number} surahId The ID of the Surah.
 * @param {number} from The starting verse number.
 * @param {number} to The ending verse number.
 * @returns {Promise<Array>} A promise that resolves to an array of verse objects.
 */
async function getVerseRange(surahId, from, to) {
    const arabicUrl = `${API_BASE_URL}/surah/${surahId}/${ARABIC_EDITION}`;
    const translationUrl = `${API_BASE_URL}/surah/${surahId}/${TRANSLATION_EDITION}`;

    try {
        console.log(`Fetching data for Surah ${surahId} from alquran.cloud...`);
        const [arabicRes, translationRes] = await Promise.all([
            fetch(arabicUrl),
            fetch(translationUrl)
        ]);

        if (!arabicRes.ok || !translationRes.ok) {
            throw new Error('Failed to fetch verse data from the API.');
        }

        const arabicData = await arabicRes.json();
        const translationData = await translationRes.json();

        // Map translations for quick lookup by Ayah number
        const translationMap = new Map();
        translationData.data.ayahs.forEach(ayah => {
            translationMap.set(ayah.numberInSurah, ayah.text);
        });

        // Filter verses by the requested range and combine data
        const verses = arabicData.data.ayahs
            .filter(ayah => ayah.numberInSurah >= from && ayah.numberInSurah <= to)
            .map(ayah => ({
                id: ayah.numberInSurah,
                text: ayah.text,
                translation: translationMap.get(ayah.numberInSurah) || ''
            }));
        
        console.log(`Successfully processed ${verses.length} verses.`);
        return verses;

    } catch (error) {
        console.error("Failed to fetch verse range:", error);
        return [];
    }
}