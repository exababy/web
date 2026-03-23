import { query } from "~/server/utils/skins-db";

export default defineEventHandler(async () => {
  const servers = await query("SELECT * FROM `sc_servers`");
  return servers;
});
