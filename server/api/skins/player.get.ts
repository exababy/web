import { query, queryOne } from "~/server/utils/skins-db";

export default defineEventHandler(async (event) => {
  const { steamid } = getQuery(event);

  if (!steamid) {
    throw createError({ statusCode: 400, message: "steamid is required" });
  }

  let profile = await queryOne(
    "SELECT id FROM sc_player WHERE steamid = ?",
    [steamid]
  );

  if (!profile) {
    const result = (await query(
      "INSERT INTO `sc_player` (`name`, `steamid`) VALUES (?, ?)",
      [String(steamid), String(steamid)]
    )) as any;
    profile = { id: result.insertId };
  }

  return { id: profile.id, steamid };
});
