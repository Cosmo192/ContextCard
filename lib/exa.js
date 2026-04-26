const EXA_ENDPOINT = "https://api.exa.ai/search";

function normalizeExaResults(results = []) {
  return results.map((item) => ({
    title: item.title || "Untitled",
    url: item.url || "",
    text: item.text || ""
  }));
}

export async function searchExa(query) {
  if (!process.env.EXA_API_KEY) {
    throw new Error("Missing EXA_API_KEY");
  }

  const response = await fetch(EXA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXA_API_KEY
    },
    body: JSON.stringify({
      query,
      numResults: 3,
      type: "auto",
      contents: {
        text: {
          maxCharacters: 12000
        }
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Exa search failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  return normalizeExaResults(data.results || []);
}
