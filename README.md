# ContextCard

ContextCard is a stateless Next.js app that builds a meeting prep brief from public information.

It takes:
- A person’s name
- Your meeting context

Then it:
- Runs 5 Exa searches in parallel
- Combines top results into a raw context blob
- Sends that blob to Gemini 1.5 Flash
- Returns a structured brief for practical meeting prep

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Exa API (search)
- Google Gemini API (`gemini-1.5-flash`) for synthesis
- Deployable to Vercel
- No DB, no auth, fully stateless

## Project Structure

```text
contextcard/
├── app/
│   ├── page.jsx
│   ├── brief/
│   │   └── page.jsx
│   └── api/
│       └── generate/
│           └── route.js
├── components/
│   ├── InputForm.jsx
│   ├── BriefCard.jsx
│   └── LoadingState.jsx
├── lib/
│   ├── exa.js
│   └── gemini.js
├── .env.local
└── README.md
```

## Data Flow

1. User submits name and context on `/`.
2. Frontend POSTs to `/api/generate`.
3. API builds 5 queries and runs Exa lookups in parallel with `Promise.all`.
4. Top results are merged into one text blob.
5. Blob + name + context are sent to Gemini with strict JSON instructions.
6. Gemini response is cleaned (fence stripping) and parsed.
7. Brief is returned and saved in `localStorage`.
8. App navigates to `/brief`, renders card sections, and shows source links used.

## Error Handling Notes

- Missing `name` or `context` returns `400`.
- If some Exa queries fail, they are skipped and synthesis continues.
- If all Exa queries fail/empty, route returns `404`.
- Gemini markdown code fences are stripped before parsing JSON.
- API returns actionable `error` messages for UI display.

## Notes

- The app intentionally has no authentication or persistence.
- Briefs are client-side only and cleared when user clicks Start Over.
