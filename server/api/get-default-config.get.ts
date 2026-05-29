export default defineCachedEventHandler(
  async (event) => {
    try {
      let type = getQuery(event).type?.trim().toLowerCase();

      if (!type) {
        throw new Error("type is required");
      }

      const response = await fetch(
        `https://raw.githubusercontent.com/5v5tech/game-server/refs/heads/main/cfg/5v5.TECH.${type}.cfg`,
      );

      return await response.text();
    } catch (error) {
      console.error("unable to get config:", error);
    }
  },
  { maxAge: 60 * 60 },
);
