# FundooNotes Backend

Next.js 14 + TypeScript + MongoDB + JWT + Zod + Winston.

## Archive / restore / trash

- **Archive** moves the note from the main DB (`fundoonotes`) into `fundoonotes_archive` and deletes it from main.
- **Restore** reads it by id from the archive DB and inserts it back into main.
- **Trash** (or `DELETE /api/notes/:id`) permanently deletes that id from **both** databases.

## Run

```bash
npm install
npm run dev
```

Uses `127.0.0.1:3000`. Swagger: http://127.0.0.1:3000/api-docs

Required in `.env.local`: `MONGODB_URI`, `JWT_SECRET`. Optional: `MONGODB_ARCHIVE_DB=fundoonotes_archive`.
