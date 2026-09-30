import fs from "fs/promises";
import path from "path";
import axios from "axios";

const BASE_URL = "https://www.fut.gg/api/fut/collections/27/?";
const PAGE_ENDPOINT = (page) => `page=${page}`;
const OUT_FILE = path.join("db", "core-data", "collections.json");

const REQUEST_HEADERS = {
  "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.fut.gg/",
  "Origin": "https://www.fut.gg",
};

async function fetchCollections() {
  console.log("Starting to fetch collections...");
  let allCollections = [];
  let page = 1;

  while (true) {
    const url = `${BASE_URL}${PAGE_ENDPOINT(page)}`;
    console.log(`Fetching page ${page}...`);
    const res = await axios.get(url);
    const json = res.data

    if (json.data && Array.isArray(json.data)) {
      const filtered = json.data.map((item) => ({
        id: item.id,
        name: item.name,
        highlightedIds: item.highlightedPlayerItemEaIds,
        allIds: item.allPlayerItemEaIds,
      }));
      allCollections.push(...filtered);
    }

    if (json.next === null) {
      console.log("Reached last page.");
      break;
    }

    page = json.next;
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(allCollections, null, 2));
  console.log(`Saved ${allCollections.length} collections to ${OUT_FILE}`);
}

fetchCollections().catch(console.error);
