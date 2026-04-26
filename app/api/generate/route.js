import { searchExa } from "@/lib/exa";
import { synthesizeBrief } from "@/lib/gemini";

function extractContextKeyword(context) {
  const words = context
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "for",
    "from",
    "he",
    "her",
    "him",
    "i",
    "in",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "our",
    "she",
    "that",
    "the",
    "them",
    "they",
    "to",
    "we",
    "with",
    "you",
    "your"
  ]);

  const candidates = words.filter((word) => word.length > 3 && !stopWords.has(word));
  return candidates[0] || "work";
}

function formatExaBlob(resultsByQuery) {
  return resultsByQuery
    .map(
      ({ query, results }) =>
        `Query: ${query}\n${results
          .map(
            (r, index) =>
              `${index + 1}. Title: ${r.title}\nURL: ${r.url}\nSummary: ${r.text || "No summary available."}`
          )
          .join("\n\n")}`
    )
    .join("\n\n---\n\n");
}

function ensureBriefShape(brief) {
  const rawWatchOut = brief.watchOut;
  const normalizedWatchOut =
    rawWatchOut === null || rawWatchOut === undefined
      ? null
      : typeof rawWatchOut === "string"
        ? ["", "null", "none", "n/a", "na"].includes(rawWatchOut.trim().toLowerCase())
          ? null
          : rawWatchOut.trim()
        : null;

  return {
    whoTheyAre: brief.whoTheyAre || "Public information was limited, so this summary is brief.",
    whatTheyCareAbout:
      brief.whatTheyCareAbout || "Not enough high-confidence public themes were found.",
    recentActivity: brief.recentActivity || "Recent public activity was sparse in the available sources.",
    conversationStarters: Array.isArray(brief.conversationStarters)
      ? brief.conversationStarters.slice(0, 3)
      : [],
    commonGround:
      brief.commonGround || "Look for overlap based on your shared professional interests.",
    watchOut: normalizedWatchOut
  };
}

function collectSources(resultsByQuery) {
  const seen = new Set();
  const sources = [];

  for (const group of resultsByQuery) {
    for (const result of group.results) {
      if (!result.url || seen.has(result.url)) {
        continue;
      }
      seen.add(result.url);
      sources.push({
        title: result.title || result.url,
        url: result.url
      });
    }
  }

  return sources.slice(0, 12);
}

export async function POST(request) {
  try {
    const { name, context } = await request.json();

    if (!name || !context) {
      return Response.json({ error: "Both name and context are required." }, { status: 400 });
    }

    const keyword = extractContextKeyword(context);
    const queries = [
      `${name} LinkedIn`,
      `${name} interview OR talk OR podcast`,
      `${name} ${keyword}`,
      `${name} research OR writing OR projects`,
      `${name} Twitter OR news 2024 OR 2025`
    ];

    const settled = await Promise.all(
      queries.map(async (query) => {
        try {
          const results = await searchExa(query);
          if (!results.length) {
            return null;
          }
          return { query, results };
        } catch {
          return null;
        }
      })
    );

    const validResults = settled.filter(Boolean);

    if (!validResults.length) {
      return Response.json(
        { error: "No public results were found. Try a fuller name or more context." },
        { status: 404 }
      );
    }

    const rawResults = formatExaBlob(validResults);
    const brief = await synthesizeBrief({ name, context, rawResults });
    const normalized = ensureBriefShape(brief);
    const sources = collectSources(validResults);

    return Response.json({ brief: normalized, sources }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: "Something went wrong while generating the brief.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
