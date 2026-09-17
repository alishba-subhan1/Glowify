const express = require("express");
const Service = require("../models/Service");
const { openaiApiKey, openaiModel } = require("../config");

const router = express.Router();

function scoreByKeywords(services, query) {
  const q = String(query || "").toLowerCase();
  if (!q.trim()) {
    return services.slice(0, 5).map((s) => ({ service: s, reason: "Popular this week" }));
  }
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const scored = services.map((s) => {
    const blob = `${s.title || ""} ${s.name || ""} ${s.description || ""} ${s.category || ""}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (blob.includes(w)) score += 2;
    }
    if (q.includes("bridal") && /bridal|wedding|mehndi/i.test(blob)) score += 5;
    if (q.includes("hair") && /hair|curl|blow|dye|color/i.test(blob)) score += 5;
    if (q.includes("skin") && /facial|skin|polish/i.test(blob)) score += 5;
    if (q.includes("nail") && /nail|manicure/i.test(blob)) score += 5;
    return { service: s, score, reason: score > 0 ? "Matches your keywords" : "General pick" };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((x) => x.score > 0).slice(0, 5).length
    ? scored.filter((x) => x.score > 0).slice(0, 5)
    : scored.slice(0, 5);
}

async function openAiPickServiceNames(services, userQuery) {
  if (!openaiApiKey || !userQuery.trim()) return null;
  const catalog = services.slice(0, 35).map((s) => `${s._id}|${s.title || s.name}`).join("\n");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: openaiModel,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You help a beauty salon suggest services. Reply ONLY with valid JSON: {\"ids\": [\"mongoId\", ...]} with at most 5 service _ids from the catalog lines (format id|name). No prose."
        },
        {
          role: "user",
          content: `Customer: "${userQuery}"\nCatalog (id|name):\n${catalog}`
        }
      ]
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const ids = Array.isArray(parsed.ids) ? parsed.ids : [];
    return ids.map((id) => services.find((s) => String(s._id) === String(id))).filter(Boolean);
  } catch {
    return null;
  }
}

/** GET /api/ai/booking-suggestions?q=... */
router.get("/booking-suggestions", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const services = await Service.find({ isActive: true })
      .select("title name description price category _id")
      .limit(45)
      .lean();

    let source = "rules";
    let picks = [];

    if (openaiApiKey && q.length > 2) {
      const ai = await openAiPickServiceNames(services, q);
      if (ai && ai.length) {
        picks = ai.map((s) => ({
          _id: s._id,
          title: s.title || s.name,
          name: s.name || s.title,
          price: s.price,
          reason: "AI-assisted match"
        }));
        source = "openai";
      }
    }

    if (!picks.length) {
      const ranked = scoreByKeywords(services, q);
      picks = ranked.map((r) => ({
        _id: r.service._id,
        title: r.service.title || r.service.name,
        name: r.service.name || r.service.title,
        price: r.service.price,
        reason: r.reason
      }));
    }

    return res.json({ suggestions: picks, source });
  } catch (error) {
    return res.status(500).json({ message: "Suggestion failed", error: error.message });
  }
});

module.exports = router;
