# Mind

AI wearable for mental health and self-improvement (MadHacks 2026). Each folder is its own repo.

| Folder | What |
|---|---|
| `firmware/` | XIAO ESP32-S3 Sense pendant: mic → gated IMA-ADPCM frames → BLE, microSD store-and-forward. Contract: `firmware/PROTOCOL.md` (v2) |
| `backend/` | Convex (`mind`): recordings + utterances DB, file storage, Scribe batch transcription in actions |
| `app/` | wali iOS app (Expo): Clerk sign-in, chat with wali, transcripts, memory, pendant settings; BLE client with save-first local queue and uploads to Convex. See `app/README.md` |
| `web/` | Bun + Turbo monorepo: `apps/landing` (marketing site), `apps/app` (Mind web app: chat, transcripts, connections, proactive activity). See `web/apps/app/README.md` |

Flow: pendant → BLE → phone (append to disk) → segment → WAV → Convex storage → `transcribe.run`
(ElevenLabs `scribe_v3`, diarized) → `utterances` (Speaker 1, Speaker 2, …).


Agent layer (in `backend/convex/agentNode.ts` + `agent/`): Mastra agents on OpenRouter, Jev gate for proactive
nudges, Composio and Browser Use tools with approval cards. Clerk auth for the web app.
