require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const SHOP_ITEMS = {
  power2: { price: 999, column: "owns_power_2", power: 2 },
  power4: { price: 9999, column: "owns_power_4", power: 4 },
  power8: { price: 99999, column: "owns_power_8", power: 8 }
};
const PLAYER_COLUMNS =
  "name, score, click_power, owns_power_2, owns_power_4, owns_power_8, boost_used_at, boost_until";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const BOOST_DURATION_MS = 60 * 1000;
const BOOST_COUNTDOWN_MS = 3 * 1000;

function validName(name) {
  return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 30;
}

function playerPayload(player) {
  return {
    name: player.name,
    score: player.score,
    clickPower: player.click_power,
    owned: {
      power2: player.owns_power_2,
      power4: player.owns_power_4,
      power8: player.owns_power_8
    },
    boostUsedAt: player.boost_used_at,
    boostUntil: player.boost_until
  };
}

async function getPlayer(name) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select(PLAYER_COLUMNS)
    .eq("name", name.trim())
    .single();

  if (error) {
    throw error;
  }

  return data;
}

module.exports = async function handler(request, response) {
  if (request.method === "GET") {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("name, score")
      .order("score", { ascending: false });

    if (error) {
      console.error(error);
      return response.status(500).json({ error: "Could not load leaderboard" });
    }

    return response.status(200).json({ data });
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { action, name, score, itemId } = request.body || {};

  if (!validName(name)) {
    return response.status(400).json({ error: "Invalid player name" });
  }

  const normalizedName = name.trim();

  try {
    if (action === "register") {
      const { data, error } = await supabase
        .from("leaderboard")
        .insert({ name: normalizedName, score: 0 })
        .select(PLAYER_COLUMNS)
        .single();

      if (error?.code === "23505") {
        return response.status(409).json({ error: "Name already exists" });
      }
      if (error) throw error;

      return response.status(201).json({ player: playerPayload(data) });
    }

    if (action === "get-player") {
      return response.status(200).json({ player: playerPayload(await getPlayer(normalizedName)) });
    }

    if (action === "save-score") {
      if (!Number.isInteger(score) || score < 0) {
        return response.status(400).json({ error: "Invalid score" });
      }

      const { data, error } = await supabase
        .from("leaderboard")
        .update({ score, updated_at: new Date().toISOString() })
        .eq("name", normalizedName)
        .select(PLAYER_COLUMNS)
        .single();

      if (error) throw error;
      return response.status(200).json({ player: playerPayload(data) });
    }

    if (action === "buy-item") {
      const player = await getPlayer(normalizedName);
      const item = SHOP_ITEMS[itemId];

      if (!item) {
        return response.status(400).json({ error: "Unknown shop item" });
      }
      if (player[item.column]) {
        return response.status(409).json({ error: "This permanent upgrade is already owned" });
      }
      if (player.score < item.price) {
        return response.status(400).json({ error: "Not enough points" });
      }

      const updates = {
        score: player.score - item.price,
        click_power: Math.max(player.click_power, item.power),
        [item.column]: true,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from("leaderboard")
        .update(updates)
        .eq("name", normalizedName)
        .eq(item.column, false)
        .select(PLAYER_COLUMNS)
        .single();

      if (error) throw error;
      return response.status(200).json({ player: playerPayload(data) });
    }

    if (action === "buy-boost") {
      const player = await getPlayer(normalizedName);
      const now = Date.now();
      const lastUsed = player.boost_used_at ? new Date(player.boost_used_at).getTime() : 0;

      if (lastUsed && now - lastUsed < WEEK_MS) {
        return response.status(429).json({
          error: "Weekly boost is still on cooldown",
          availableAt: new Date(lastUsed + WEEK_MS).toISOString()
        });
      }

      const nowIso = new Date(now).toISOString();
      const updates = {
        score: Math.floor(player.score / 2),
        boost_used_at: nowIso,
        // The client locks input for a 3-second countdown before the boost begins.
        boost_until: new Date(now + BOOST_COUNTDOWN_MS + BOOST_DURATION_MS).toISOString(),
        updated_at: nowIso
      };
      const { data, error } = await supabase
        .from("leaderboard")
        .update(updates)
        .eq("name", normalizedName)
        .select(PLAYER_COLUMNS)
        .single();

      if (error) throw error;
      return response.status(200).json({ player: playerPayload(data) });
    }

    return response.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Database request failed" });
  }
};
