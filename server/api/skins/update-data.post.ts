import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { weaponIndex } from "~/server/utils/skins-db";

const CSGO_API_BASE =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api";
const LANGUAGES = ["ru", "uk", "en", "de"];

function getDataDir() {
  return join(process.cwd(), "public", "skins-data");
}

function getLangFilename(base: string, language: string): string {
  const lang = language === "uk" ? "ua" : language;
  return `${base}-${lang}.json`;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
}

async function updateSkins() {
  const dataDir = getDataDir();
  for (const language of LANGUAGES) {
    const filePath = join(dataDir, getLangFilename("skins", language));
    const newFormat: Record<number, Record<number, any>> = {};
    const skins = await fetchJson(
      `${CSGO_API_BASE}/${language}/skins.json`
    );
    if (!skins) continue;
    for (const item of skins) {
      const weaponId = weaponIndex[item.weapon.id];
      if (!weaponId) continue;
      const nameParts = item.name.split("|");
      if (!newFormat[weaponId]) newFormat[weaponId] = {};
      newFormat[weaponId][item.paint_index] = {
        weapon_name: (nameParts[0] || "").trim(),
        name: (nameParts[1] || "").trim(),
        image: item.image,
        color: item.rarity?.color || "",
      };
    }
    await writeFile(filePath, JSON.stringify(newFormat, null, 2));
  }
}

async function updateStickers() {
  const dataDir = getDataDir();
  for (const language of LANGUAGES) {
    const filePath = join(dataDir, getLangFilename("stickers", language));
    const stickers = await fetchJson(
      `${CSGO_API_BASE}/${language}/stickers.json`
    );
    if (!stickers) continue;
    const newFormat: Record<string, any> = {};
    for (const item of stickers) {
      const nameParts = item.name.split("|");
      const id = item.id.split("-")[1];
      newFormat[id] = {
        weapon_name: (nameParts[0] || "").trim(),
        name: (nameParts[1] || "").trim(),
        image: item.image,
      };
    }
    await writeFile(filePath, JSON.stringify(newFormat, null, 2));
  }
}

async function updateKeychains() {
  const dataDir = getDataDir();
  for (const language of LANGUAGES) {
    const filePath = join(dataDir, getLangFilename("keychains", language));
    const keychains = await fetchJson(
      `${CSGO_API_BASE}/${language}/keychains.json`
    );
    if (!keychains) continue;
    const newFormat: Record<string, any> = {};
    for (const item of keychains) {
      const nameParts = item.name.split("|");
      const id = item.id.split("-")[1];
      newFormat[id] = {
        weapon_name: (nameParts[0] || "").trim(),
        name: (nameParts[1] || "").trim(),
        image: item.image,
      };
    }
    await writeFile(filePath, JSON.stringify(newFormat, null, 2));
  }
}

async function updateAgents() {
  const dataDir = getDataDir();
  for (const language of LANGUAGES) {
    const filePath = join(dataDir, getLangFilename("agents", language));
    const agents = await fetchJson(
      `${CSGO_API_BASE}/${language}/agents.json`
    );
    if (!agents) continue;
    const newFormat: Record<string, any> = {};
    for (const item of agents) {
      const weaponId = item.id.split("-")[1];
      const nameParts = item.name.split("|");
      const team = item.team?.id === "terrorists" ? 0 : 1;
      newFormat[weaponId] = {
        weapon_name: (nameParts[0] || "").trim(),
        name: (nameParts[1] || "").trim(),
        image: item.image,
        team,
        color: item.rarity?.color || "",
      };
    }
    await writeFile(filePath, JSON.stringify(newFormat, null, 2));
  }
}

async function updateCoins() {
  const dataDir = getDataDir();
  for (const language of LANGUAGES) {
    const filePath = join(
      dataDir,
      getLangFilename("collectibles", language)
    );
    const coins = await fetchJson(
      `${CSGO_API_BASE}/${language}/collectibles.json`
    );
    if (!coins) continue;
    const newFormat: Record<string, any> = {};
    for (const item of coins) {
      if (item.type?.includes("Pass")) continue;
      if (item.type?.includes("Stars for Operation")) continue;
      const weaponId = item.id.split("-")[1];
      const nameParts = item.name.split("|");
      newFormat[weaponId] = {
        weapon_name: (nameParts[0] || "").trim(),
        name: (nameParts[1] || "").trim(),
        image: item.image,
        color: item.rarity?.color || "",
      };
    }
    await writeFile(filePath, JSON.stringify(newFormat, null, 2));
  }
}

async function updateMusic() {
  const dataDir = getDataDir();
  for (const language of LANGUAGES) {
    const filePath = join(
      dataDir,
      getLangFilename("musickit", language)
    );
    const musickit = await fetchJson(
      `${CSGO_API_BASE}/${language}/music_kits.json`
    );
    if (!musickit) continue;
    const newFormat: Record<string, any> = {};
    for (const item of musickit) {
      const weaponId = item.id.split("-")[1];
      if (weaponId.includes("_st")) continue;
      const nameParts = item.name.split("|");
      newFormat[weaponId] = {
        weapon_name: (nameParts[0] || "").trim(),
        name: (nameParts[1] || "").trim(),
        image: item.image,
        color: item.rarity?.color || "",
      };
    }
    await writeFile(filePath, JSON.stringify(newFormat, null, 2));
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const dataDir = getDataDir();

  // Ensure data directory exists
  await mkdir(dataDir, { recursive: true });

  try {
    switch (body.type) {
      case "skins":
        await updateSkins();
        return { status: "success", text: "Skins successfully updated" };
      case "stickers":
        await updateStickers();
        return { status: "success", text: "Stickers successfully updated" };
      case "keychains":
        await updateKeychains();
        return {
          status: "success",
          text: "Keychains successfully updated",
        };
      case "agents":
        await updateAgents();
        return { status: "success", text: "Agents successfully updated" };
      case "coins":
        await updateCoins();
        return { status: "success", text: "Coins successfully updated" };
      case "music":
        await updateMusic();
        return {
          status: "success",
          text: "Music kits successfully updated",
        };
      case "all":
        await Promise.all([
          updateSkins(),
          updateStickers(),
          updateKeychains(),
          updateAgents(),
          updateCoins(),
          updateMusic(),
        ]);
        return {
          status: "success",
          text: "All items successfully updated",
        };
      default:
        throw createError({
          statusCode: 400,
          message: "Invalid type. Use: skins, stickers, keychains, agents, coins, music, all",
        });
    }
  } catch (error: any) {
    return {
      status: "error",
      text: `Update failed: ${error.message}`,
    };
  }
});
