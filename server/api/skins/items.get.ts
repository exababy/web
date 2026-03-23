import { query, queryOne } from "~/server/utils/skins-db";

export default defineEventHandler(async (event) => {
  const { steamid, team, server_id } = getQuery(event);

  if (!steamid) {
    throw createError({ statusCode: 400, message: "steamid is required" });
  }

  const teamVal = parseInt(String(team || "0"));
  const serverId = parseInt(String(server_id || "1"));

  // Get player profile
  const profile = await queryOne(
    "SELECT id FROM sc_player WHERE steamid = ?",
    [steamid]
  );
  if (!profile) {
    return { items: null, skins: [] };
  }

  // Get items (knife, glove, agent, coin, music)
  const items = await queryOne(
    "SELECT * FROM `sc_items` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
    [profile.id, teamVal, serverId]
  );

  // Get skins
  const skinsRaw = (await query(
    "SELECT * FROM `sc_skins` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
    [profile.id, teamVal, serverId]
  )) as any[];

  const skins: Record<string, any> = {};
  for (const row of skinsRaw) {
    const weaponKey = row.weapon_index;
    const skinParts = row.skin ? String(row.skin).split(";") : ["0", "0", "0"];
    const stickerParts = row.stickers
      ? String(row.stickers).split(";")
      : ["0", "0", "0", "0"];
    skins[weaponKey] = {
      ...row,
      skin: skinParts,
      stickers: stickerParts,
    };
  }

  return { items: items || null, skins, playerId: profile.id };
});
