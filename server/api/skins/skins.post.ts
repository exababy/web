import { query, queryOne, keychainPositions } from "~/server/utils/skins-db";

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

  // Set skin on a weapon
  if (body.action === "set_skin") {
    const skinId = body.skin_id;
    const weaponIndex = body.weapon_index;

    // Handle knife/glove weapon selection
    if (parseInt(weaponIndex) >= 500) {
      if (parseInt(weaponIndex) < 4725) {
        // Knife
        const existing = await queryOne(
          "SELECT * FROM `sc_items` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
          [profile.id, team, serverId]
        );
        if (existing) {
          await query(
            "UPDATE `sc_items` SET `knife` = ? WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
            [weaponIndex, profile.id, team, serverId]
          );
        } else {
          await query(
            "INSERT INTO `sc_items` (`player_id`, `server_id`, `team`, `knife`) VALUES (?, ?, ?, ?)",
            [profile.id, serverId, team, weaponIndex]
          );
        }
      } else {
        // Glove
        const existing = await queryOne(
          "SELECT * FROM `sc_items` WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
          [profile.id, team, serverId]
        );
        if (existing) {
          await query(
            "UPDATE `sc_items` SET `glove` = ? WHERE `player_id` = ? AND `team` = ? AND `server_id` = ?",
            [weaponIndex, profile.id, team, serverId]
          );
        } else {
          await query(
            "INSERT INTO `sc_items` (`player_id`, `server_id`, `team`, `glove`) VALUES (?, ?, ?, ?)",
            [profile.id, serverId, team, weaponIndex]
          );
        }
      }
    }

    // Set skin paint index
    const existingSkin = await queryOne(
      "SELECT * FROM `sc_skins` WHERE `player_id` = ? AND `weapon_index` = ? AND `team` = ? AND `server_id` = ?",
      [profile.id, weaponIndex, team, serverId]
    );

    if (existingSkin) {
      const skinParts = existingSkin.skin
        ? String(existingSkin.skin).split(";")
        : ["0", "0", "0"];
      skinParts[0] = String(skinId);
      await query(
        "UPDATE `sc_skins` SET `skin` = ? WHERE `player_id` = ? AND `weapon_index` = ? AND `team` = ? AND `server_id` = ? LIMIT 1",
        [skinParts.join(";"), profile.id, weaponIndex, team, serverId]
      );
    } else {
      await query(
        "INSERT INTO sc_skins (player_id, server_id, team, weapon_index, stattrack, stattrack_count, stickers, skin, tag) VALUES (?, ?, ?, ?, 0, 0, '0;0;0;0', ?, '')",
        [profile.id, serverId, team, weaponIndex, `${skinId};0;0.0`]
      );
    }

    if (skinId == 0) {
      return { status: "success", text: "Skin successfully removed" };
    }
    return { status: "success", text: "Skin successfully set" };
  }

  // Save skin with full settings
  if (body.action === "save_skin") {
    const skinId = body.skin_id;
    const weaponIndexVal = parseInt(body.weapon_index);
    const tag = (body.tag || "").replace(/[<>'"]/g, "");
    const float = body.float || "0.0";
    const pattern = body.pattern || "0";
    const stattrack = body.stattrack || 0;
    const sticker1 = body.sticker1 || "0";
    const sticker2 = body.sticker2 || "0";
    const sticker3 = body.sticker3 || "0";
    const sticker4 = body.sticker4 || "0";
    const keychainId = body.keychain || "0";

    const pos = keychainPositions[weaponIndexVal] || [0, 0, 0];
    const keychainStr = `${keychainId};${pos[0]};${pos[1]};${pos[2]}`;
    const skinStr = `${skinId};${pattern};${float}`;
    const stickersStr = `${sticker1};${sticker2};${sticker3};${sticker4}`;

    await query(
      "UPDATE `sc_skins` SET `stickers` = ?, `keychain` = ?, `skin` = ?, `tag` = ?, `stattrack` = ? WHERE `player_id` = ? AND `weapon_index` = ? AND `team` = ? AND `server_id` = ? LIMIT 1",
      [
        stickersStr,
        keychainStr,
        skinStr,
        tag,
        stattrack,
        profile.id,
        body.weapon_index,
        team,
        serverId,
      ]
    );

    return { status: "success", text: "Skin settings saved successfully" };
  }

  throw createError({ statusCode: 400, message: "Invalid action" });
});
