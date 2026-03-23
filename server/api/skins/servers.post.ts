import { query } from "~/server/utils/skins-db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Add server
  if (body.action === "add") {
    if (!body.name || !body.ip || !body.port) {
      throw createError({
        statusCode: 400,
        message: "name, ip, port are required",
      });
    }
    await query(
      "INSERT INTO `sc_servers` (`name`, `ip_address`, `port`) VALUES (?, ?, ?)",
      [body.name, body.ip, body.port]
    );
    return { status: "success", text: "Server added successfully" };
  }

  // Delete server
  if (body.action === "delete") {
    if (!body.id) {
      throw createError({ statusCode: 400, message: "id is required" });
    }
    await query("DELETE FROM `sc_skins` WHERE `server_id` = ?", [body.id]);
    await query("DELETE FROM `sc_items` WHERE `server_id` = ?", [body.id]);
    await query("DELETE FROM `sc_servers` WHERE `id` = ?", [body.id]);
    return { status: "success", text: "Server successfully deleted" };
  }

  throw createError({ statusCode: 400, message: "Invalid action" });
});
