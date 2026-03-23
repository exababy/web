import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getSkinsDb(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.SKINS_DB_HOST || "localhost",
      port: parseInt(process.env.SKINS_DB_PORT || "3306"),
      user: process.env.SKINS_DB_USER || "root",
      password: process.env.SKINS_DB_PASSWORD || "",
      database: process.env.SKINS_DB_NAME || "skins",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query(sql: string, params: any[] = []) {
  const db = getSkinsDb();
  const [rows] = await db.execute(sql, params);
  return rows;
}

export async function queryOne(sql: string, params: any[] = []) {
  const rows = (await query(sql, params)) as any[];
  return rows.length > 0 ? rows[0] : null;
}

// Keychain position offsets per weapon_index
export const keychainPositions: Record<number, [number, number, number]> = {
  1: [8.0, 0.0, 3.0],
  2: [10.0, 0.0, 9.2],
  3: [8.0, 0.0, 1.0],
  4: [5.7, 0.0, 2.2],
  7: [6.0, 0.0, 2.0],
  8: [6.7, 5.0, 3.2],
  9: [10.0, 0.0, 8.0],
  10: [7.0, 0.0, 3.0],
  11: [20.0, 0.0, 5.6],
  13: [8.5, 1.0, 3.0],
  14: [4.2, 0.0, 4.8],
  16: [18.6, 7.0, 12.4],
  17: [9.0, 0.0, 5.6],
  19: [8.7, 0.0, 5.9],
  23: [5.5, 0.0, 3.7],
  24: [9.0, 0.0, 3.8],
  25: [4.5, 0.0, 3.7],
  26: [2.4, 0.0, 2.7],
  27: [3.8, 0.0, 8.7],
  28: [1.2, 0.0, 3.8],
  29: [5.2, 0.0, 0.8],
  30: [10.1, 5.0, 7.0],
  31: [5.9, 5.0, 5.1],
  32: [9.0, 0.0, 2.5],
  33: [-3.0, 0.0, 2.5],
  34: [9.0, 0.0, 5.6],
  35: [6.5, 0.0, 3.7],
  36: [8.0, 0.0, 1.0],
  38: [20.0, 0.0, 12.2],
  39: [7.5, 0.0, 4.0],
  40: [10.0, 5.0, 3.8],
  60: [6.0, 0.0, 4.5],
  61: [7.0, 0.0, 4.0],
  63: [6.8, 0.0, 4.7],
  64: [9.0, 0.0, 4.0],
};

// Weapon name => weapon_index mapping
export const weaponIndex: Record<string, number> = {
  weapon_deagle: 1,
  weapon_elite: 2,
  weapon_fiveseven: 3,
  weapon_glock: 4,
  weapon_ak47: 7,
  weapon_aug: 8,
  weapon_awp: 9,
  weapon_famas: 10,
  weapon_g3sg1: 11,
  weapon_galilar: 13,
  weapon_m249: 14,
  weapon_m4a1: 16,
  weapon_mac10: 17,
  weapon_p90: 19,
  weapon_mp5sd: 23,
  weapon_ump45: 24,
  weapon_xm1014: 25,
  weapon_bizon: 26,
  weapon_mag7: 27,
  weapon_negev: 28,
  weapon_sawedoff: 29,
  weapon_tec9: 30,
  weapon_taser: 31,
  weapon_hkp2000: 32,
  weapon_mp7: 33,
  weapon_mp9: 34,
  weapon_nova: 35,
  weapon_p250: 36,
  weapon_scar20: 38,
  weapon_sg556: 39,
  weapon_ssg08: 40,
  weapon_m4a1_silencer: 60,
  weapon_usp_silencer: 61,
  weapon_cz75a: 63,
  weapon_revolver: 64,
  weapon_bayonet: 500,
  weapon_knife_css: 503,
  weapon_knife_flip: 505,
  weapon_knife_gut: 506,
  weapon_knife_karambit: 507,
  weapon_knife_m9_bayonet: 508,
  weapon_knife_tactical: 509,
  weapon_knife_falchion: 512,
  weapon_knife_survival_bowie: 514,
  weapon_knife_butterfly: 515,
  weapon_knife_push: 516,
  weapon_knife_cord: 517,
  weapon_knife_canis: 518,
  weapon_knife_ursus: 519,
  weapon_knife_gypsy_jackknife: 520,
  weapon_knife_outdoor: 521,
  weapon_knife_stiletto: 522,
  weapon_knife_widowmaker: 523,
  weapon_knife_skeleton: 525,
  weapon_knife_kukri: 526,
  studded_brokenfang_gloves: 4725,
  studded_bloodhound_gloves: 5027,
  sporty_gloves: 5030,
  slick_gloves: 5031,
  leather_handwraps: 5032,
  motorcycle_gloves: 5033,
  specialist_gloves: 5034,
  studded_hydra_gloves: 5035,
};
