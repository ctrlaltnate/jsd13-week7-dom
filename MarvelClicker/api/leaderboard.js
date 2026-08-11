require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = async function handler(request, response) {
  if (request.method === "GET") {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("name, score")
      .order("score", { ascending: false });

    if (error) {
      console.error(error);

      return response.status(500).json({
        error: "Could not load leaderboard"
      });
    }

    return response.status(200).json({ data });
  }

  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  const { action, name, score } = request.body || {};
  const isValidName =
    typeof name === "string" && name.trim().length > 0 && name.trim().length <= 30;

  if (!isValidName) {
    return response.status(400).json({ error: "Invalid player name" });
  }

  if (action === "register") {
    const { error } = await supabase
      .from("leaderboard")
      .insert({ name: name.trim(), score: 0 });

    if (error?.code === "23505") {
      return response.status(409).json({ error: "Name already exists" });
    }

    if (error) {
      console.error(error);

      return response.status(500).json({ error: "Could not create player" });
    }

    return response.status(201).json({ name: name.trim(), score: 0 });
  }

  if (action === "save-score") {
    if (!Number.isInteger(score) || score < 0) {
      return response.status(400).json({ error: "Invalid score" });
    }

    const { error } = await supabase
      .from("leaderboard")
      .upsert(
        {
          name: name.trim(),
          score,
          updated_at: new Date().toISOString()
        },
        { onConflict: "name" }
      );

    if (error) {
      console.error(error);

      return response.status(500).json({ error: "Could not save score" });
    }

    return response.status(200).json({ name: name.trim(), score });
  }

  return response.status(400).json({ error: "Unknown action" });
};
