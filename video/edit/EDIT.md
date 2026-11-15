# Launch video edit

Camera clips (Sony, 1080p 59.94) are synced to the iPhone voice memo by cross-correlating the camera's scratch audio against the memo:
coarse GCC-PHAT at 8 kHz over each whole clip, then 48 kHz normalized cross-correlation (`sync.py`, `fine3.py`).
Drift between clip halves is < 1 ms. Every clip shows two peaks ~6.5 ms apart (room echo / mic distance); the later one is used.
Final offsets (memo seconds where clip t=0 lands): `offsets_final.json`. Camera audio is fully muted.

| # | Line | Source | Memo / VO in → out |
|---|------|--------|--------------------|
| 1 | "Most AI wearables…" | C0195 | 183.89 → 192.90 |
| 2 | "We think true understanding…" | C0196 | 371.10 → 379.81 |
| 3 | notification, "One sec." "That's wali…" | C0198 | 578.66 → 589.55 |
| 4 | "The pendant records all day…" | C0199 | 638.81 → 644.61 |
| 5 | VO over screen recordings, bad takes removed | last-bit.m4a | 4.15–13.95, 20.75–28.40, 29.70–31.85, 37.85–46.40, 47.10–end |

Notification overlay: `launch-video/renders/wali-notification-climb-1080p5994-alpha.mov`, from the head of shot 3, no chime.
End card: `launch-video/public/brand/wali-wordmark-cream.svg`. Subtitles: `subs.ass`.
