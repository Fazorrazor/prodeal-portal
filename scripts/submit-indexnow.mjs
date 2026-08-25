/**
 * IndexNow Submission Script for Prodeal Industries
 * Pings Bing and Yandex with all indexed URLs for instant real-time re-indexing.
 */

const HOST = 'www.prodealindustries.com';
const BASE_URL = `https://${HOST}`;
const API_KEY = '1e5b47e2eadd44d0acdf8d482234a46b';
const KEY_LOCATION = `${BASE_URL}/${API_KEY}.txt`;

const URL_LIST = [
  BASE_URL,
  `${BASE_URL}/solutions`,
  `${BASE_URL}/solutions/roof-waterproofing-ghana`,
  `${BASE_URL}/solutions/damp-wall-water-seepage-repair`,
  `${BASE_URL}/solutions/concrete-waterproofing-admixtures`,
  `${BASE_URL}/solutions/waterproof-exterior-wall-coatings`,
  `${BASE_URL}/solutions/construction-chemicals-contractors-ghana`,
  `${BASE_URL}/divisions/chemicals`,
  `${BASE_URL}/divisions/bowls`,
  `${BASE_URL}/divisions/signages`,
  `${BASE_URL}/divisions/printing`,
  `${BASE_URL}/support`,
  `${BASE_URL}/track`,
  `${BASE_URL}/privacy`,
  `${BASE_URL}/terms`,
];

async function submitIndexNow() {
  console.log(`[IndexNow] Submitting ${URL_LIST.length} URLs to IndexNow...`);

  const payload = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`✅ [IndexNow] Success! Response status: ${response.status} (URLs submitted for real-time indexing)`);
    } else {
      const text = await response.text();
      console.warn(`⚠️ [IndexNow] Search engines responded with HTTP ${response.status}: ${text || response.statusText}`);
      console.log(`(Note: If this site was just deployed, make sure ${KEY_LOCATION} is publicly accessible)`);
    }
  } catch (error) {
    console.error('❌ [IndexNow] Error submitting URLs:', error);
  }
}

submitIndexNow();
