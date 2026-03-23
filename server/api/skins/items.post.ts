import { query, queryOne } from "~/server/utils/skins-db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.steamid) {
    throw createError({ statusCode: 400, message: "steamid is required" });
  }

  let profile = await queryOne(
    "SELECT id FROM sc_player WHERE steamid = ?",
    [body.steamid]
  );
  
  if (!profile) {
    const insertResult = await query(
      "INSERT INTO `sc_player` (`steamid`, `name`, `playtime`, `last_played`, `coins`) VALUES (?, 'Web User', 0, 0, 0)",
      [body.steamid]
    ) as any;
    profile = { id: insertResult.insertId };
  }

  const team = parseInt(body.team || "0");
  const serverId = parseInt(body.server_id || "1");

  // Set item (agent, coin, music)
  if (body.action === "set_item") {
    const type = body.item_type; // 'agent' | 'coin' | 'music'
    const itemId = body.item_id || "0";

    if (!["agent", "coin", "music"].includes(type)) {
      throw createError({ statusCode: 400, message: "Invalid item_type" });
    }

    const existing = await queryOne(
      "SELECT * FROM `sc_items` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
      [profile.id, team, serverId]
    );

    if (existing) {
      await query(
        `UPDATE \`sc_items\` SET \`${type}\` = ? WHERE \`player_id\` = ? AND \`team\` = ? AND \`server_id\` = ?`,
        [itemId, profile.id, team, serverId]
      );
    } else {
      await query(
        `INSERT INTO \`sc_items\` (\`player_id\`, \`server_id\`, \`team\`, \`${type}\`) VALUES (?, ?, ?, ?)`,
        [profile.id, serverId, team, itemId]
      );
    }

    return { status: "success", text: `${type} successfully set` };
  }

  // Set knife
  if (body.action === "set_knife") {
    const knifeId = body.item_id || "0";
    const existing = await queryOne(
      "SELECT * FROM `sc_items` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
      [profile.id, team, serverId]
    );

    if (existing) {
      await query(
        "UPDATE `sc_items` SET `knife` = ? WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
        [knifeId, profile.id, team, serverId]
      );
    } else {
      await query(
        "INSERT INTO `sc_items` (`player_id`, `server_id`, `team`, `knife`) VALUES (?, ?, ?, ?)",
        [profile.id, serverId, team, knifeId]
      );
    }

    return { status: "success", text: "Knife successfully set" };
  }

  // Set glove
  if (body.action === "set_glove") {
    const gloveId = body.item_id || "0";
    const existing = await queryOne(
      "SELECT * FROM `sc_items` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
      [profile.id, team, serverId]
    );

    if (existing) {
      await query(
        "UPDATE `sc_items` SET `glove` = ? WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
        [gloveId, profile.id, team, serverId]
      );
    } else {
      await query(
        "INSERT INTO `sc_items` (`player_id`, `server_id`, `team`, `glove`) VALUES (?, ?, ?, ?)",
        [profile.id, serverId, team, gloveId]
      );
    }

    return { status: "success", text: "Glove successfully set" };
  }

  throw createError({ statusCode: 400, message: "Invalid action" });
});
