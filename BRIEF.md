# Mind wearable: build brief

**MadHacks 2026 · Nov 14, 2026 · state as of ~3:45 pm**

A pendant that listens through the day and turns conversation into a transcript. The transcripts are
the base for the memory, nudge and action layer still to come. This session built the full
pipeline from mic to database, as small as possible, to prove two things:

1. **The wearable connects reliably to an iPhone.**
2. **Transcription is robust:** nothing is lost when the phone or network is away, and failures retry.

---

## 1. Where everything lives

`~/Projects/mind/` holds three separate git repos: no monorepo, no shared code. Nothing is
committed yet.

| Folder | What it is |
|---|---|
| `firmware/` | Arduino firmware for the Seeed XIAO ESP32-S3 Sense. `PROTOCOL.md` is the Bluetooth contract both sides follow |
| `backend/` | Convex project `mind`: database, file storage, and transcription jobs |
| `app/` | Expo / React Native iOS app |
| *(later)* `web/`, `landing/` | Will use the same Convex backend |

---

## 2. How it works, end to end

```
 PENDANT (XIAO ESP32-S3 Sense)                 iPHONE APP (Expo)                      CONVEX (cloud)
 ────────────────────────────                  ─────────────────                      ──────────────
 PDM mic 16 kHz ─► filter ─► level/noise       BLE notify (172 B / 20 ms)
   ─► speech gate (1 s pre-roll, 2.5 s tail)  ───────────────────────────►  1. append frame to disk
   ─► gain + limiter ─► IMA ADPCM (4:1)                                      2. segment by seq
          │                                                                  3. decode ─► WAV
          ├─ phone connected ─► live notify                                  4. local SQLite queue
          └─ no phone ─► microSD backlog ─► auto-drain on reconnect (~6×)    5. upload when online ─────► file storage
                                                                                                         recordings.create
                                                                                                              │
                                                                              live query ◄── utterances ◄── transcribe.run
                                                                              (Transcripts tab)               (ElevenLabs Scribe v3,
                                                                                                               diarized)
```

### 2.1 Pendant → phone (Bluetooth LE)

The full spec is `firmware/PROTOCOL.md` (**v2**). Summary:

- **BLE only**, no Wi-Fi: the ESP32-S3 has no Classic Bluetooth, so the app talks to it through
  CoreBluetooth directly. It advertises as `Mind-Pendant` with service `5C1B0001-…`.
- **Three characteristics:** **Audio** (notify), **Status** (read/notify, JSON), **Control** (write, text
  commands: `mute 0|1`, `mode gated|all`, `wake`, `tail`, `gain`, `status`, `sync`, `clear`).
- **Audio frame:** 172 bytes = 20 ms of 16 kHz mono audio, about 8.6 KB/s. A 12-byte header (`seq`,
  `level`, flags `SPEECH/START/END/BACKFILL`, ADPCM state, `bootTag`) is followed by 160 bytes of
  IMA-ADPCM. Every frame decodes on its own, so losing one frame never corrupts the next.
- **`seq` is the timeline.** Audio is placed by frame number, never by arrival time. The phone
  works out wall-clock time from Status: `T − (status.seq − seq) × 20 ms`.
- **Gating:** the board only sends around speech. It starts when sound is above the wake level for 300 of
  500 ms, includes 1 s of audio from before that, and stops 2.5 s after the sound ends. A gap
  between `END` and `START` is silence, not loss.
- **Store-and-forward:** with no phone subscribed, frames go to the **microSD card**, or a PSRAM ring of
  about 6 minutes if there's no card. On reconnect the board drains the backlog oldest-first, about 6× faster than
  real time, then goes back to live. The backlog survives reboots.
- **Re-send after reconnect (v2):** BLE notifications aren't acknowledged, so the board re-sends
  its last ≤32 frames after each reconnect. The app drops the copies it already has and keeps the rest.

### 2.2 Phone: save first, then transcribe

- **Save first:** every frame is appended to a file before anything else happens. Writes are buffered and
  flushed every second.
- **Segments:** frames from one boot whose `seq` gaps are under 20 s form one segment, so a whole
  conversation shares one set of speaker numbers. A segment closes after **20 s with no audio**, at
  **5 minutes**, or on a reboot of the board.
- **On close:** ADPCM is decoded to a 16 kHz WAV (gaps filled with silence, so WAV time is linear in
  `seq`) along with a per-20 ms level array. Both go into a local **SQLite** queue.
- **Uploader:** when the phone is online it gets an upload URL, uploads the WAV, then calls
  `recordings.create` with an id the phone generated, so retries never create duplicates. It backs off
  on failure and survives app restarts.
- **Background:** `bluetooth-central` background mode plus a state-restoration ID keep the
  stream alive while the app isn't on screen. This hasn't been tested on a phone yet.

### 2.3 Convex: transcription

- `recordings` (one per segment) and `utterances` (one per speaker turn).
- `recordings.create` schedules the internal action **`transcribe.run`**:
  - **Silent clips:** decided from the level array and marked `empty` without calling Scribe, which saves credits.
  - **Otherwise:** it calls **ElevenLabs Scribe batch** (`scribe_v3`, `diarize=true`, `language_code=en`).
  - **Grouping:** words become utterances: runs of one speaker, split on pauses longer than 2 s.
  - **Speaker labels:** neutral **`Speaker 1`, `Speaker 2`, …** in order of appearance. By decision, there is **no** loudness-based "Me"
    detection. Identifying the user is left to the LLM layer, and later to voice-enrollment
    onboarding using Scribe's speaker identification.
  - **Retries:** network errors, 429 and 5xx retry with exponential backoff, up to 5 attempts. Auth and quota errors
    fail immediately without retrying.
- The ElevenLabs key exists **only** as a Convex environment variable. The app never holds it.

### 2.4 Latency today

| Path | Delay |
|---|---|
| Board → phone (live) | A few ms per frame |
| Speech → transcript, short exchange | About 25–30 s after you stop talking (2.5 s tail + 20 s segment close + upload and Scribe) |
| Speech → transcript, nonstop talking | Up to about 5 min (segment cap) |
| Offline backlog | Arrives on reconnect. In testing, 26 min of audio was uploaded and transcribed in about 35 s |

---

## 3. Verified results

**Firmware, tested on the real board with a MacBook in place of the phone:**
- **Link:** MTU 517, 2M PHY, 15 ms connection interval, connects in about 1.2 s.
- **Throughput:** 50 frames/s. A 90 s test had 0 lost, 0 duplicated and 0 out-of-order frames. The audio code takes ≤1 ms of every 20 ms.
- **microSD:** a 128 GB card, FAT32 with MBR, was detected. Speech recorded while disconnected arrived in order with 0 loss
  after reconnecting, and the backlog survived a reboot.
- **Mic levels:** the mic is quiet: speech is about −50 to −43 dBFS raw. The default gain is **4×** with a soft limiter, so decoded
  speech sits at about −35 dBFS. The room noise floor was −64 to −69 dBFS in a quiet room and −57 to −64 dBFS in a busy one.
- **Audio quality:** Scribe got the words exactly right on board audio, so ADPCM compression costs no words.

**Backend:** real Scribe calls work end to end, including diarization across two voices. Uploading the
same clip twice doesn't create a duplicate, silent clips are skipped, and quota errors are handled.

**App:** type checks and unit tests pass, including an ADPCM decoder check and the segmenter
rules. A development build is installed on Reed's iPhone and has received real pendant audio:
the SD backlog drained into the dev database as 12 transcribed recordings.

---

## 4. Frameworks and services

| Layer | Stack |
|---|---|
| **Hardware** | Seeed XIAO ESP32-S3 Sense: PDM mic, 8 MB flash and 8 MB PSRAM, microSD slot (CS on GPIO21, which is shared with the LED); external antenna required |
| **Firmware** | Arduino-ESP32 core 3.3.12 (ESP-IDF 5.5), **NimBLE-Arduino 2.5.2**, `ESP_I2S` (PDM), SD/FAT, Preferences (settings that survive restarts); built with `arduino-cli` 1.6, flashed with `esptool` 5.6 |
| **Firmware test tools** | Python `bleak` (BLE from the Mac), `pyserial`; `tools/ble_test.py` decodes frames and writes WAVs |
| **App** | **Expo SDK 58** / React Native 0.88 (New Architecture), expo-router, **react-native-ble-manager 13** (chosen over ble-plx, which looks unmaintained), expo-file-system, expo-sqlite, NetInfo, expo-audio, Convex React client |
| **Backend** | **Convex** 1.50: database, file storage, scheduled jobs, live queries. Dev: `dapper-retriever-913.convex.cloud`; prod: `posh-orca-594.convex.cloud` |
| **Speech-to-text** | **ElevenLabs Scribe v3** (batch, diarized). About 1 credit per second of audio; ~121k credits must last the event |
| **Builds** | **EAS** (`@reedgrenager/mind`). Profiles: `development` (dev client, dev Convex), `preview` (ad hoc standalone app, prod Convex), `production` |

---

## 5. Getting the app on phones

- **Development build** (Reed): the installed app is a shell. Run `npx expo start --dev-client`
  on the Mac, then open the app or scan the QR code. Add `--tunnel` if event Wi-Fi blocks device-to-device traffic.
  Code changes appear immediately.
- **Preview build** (teammate, friend): a standalone app that needs no Mac. Steps:
  1. Register the iPhone with `eas device:create` → **Website**. The link must be opened in Safari, and then the profile installed in Settings.
  2. Build with `eas build -p ios --profile preview`, selecting all devices.
  3. On the phone, turn on **Developer Mode**.
- **Registered devices:** `00008140-…401C` (Reed), `00008120-…A01E` (teammate).
- **Known pitfalls:**
  - Apple returns a 403 until the latest Program License Agreement is accepted at developer.apple.com.
  - zsh doesn't treat `#` on a pasted line as a comment.
  - Use `/opt/homebrew/bin/eas` (v27); the `eas` on the path is v16.
- **No over-the-air updates yet:** `expo-updates` isn't installed, so preview builds need a rebuild to pick up JavaScript changes.

---

## 6. Open items and next steps

**Not yet verified:**
- background streaming on iPhone
- the board's BOOT mute button
- falling back to PSRAM after an SD card error

**Known rough edges:**
- **Mute display (just fixed):** the app didn't clearly show mute state. Fixed in JavaScript with a banner, confirmation, and a
  status read after every command. If the "Pendant status · Xs ago" label climbs past about 2 s, the board's
  automatic status updates aren't reaching the phone.
- **Dev and prod are separate databases:** development builds write to dev, preview builds to prod.
- **Old-boot timestamps are approximate:** frames from an earlier boot use the 8-bit `bootTag`, so their times are best-effort.
- **Power loss:** can drop up to about 1 s of audio not yet written to the card.
- **Not committed:** none of the three repos has a commit yet, and there's no remote.

**Privacy:** the board records everyone in earshot. `firmware/recordings/` and the dev
database contain real conversations from the room.

**Suggested next steps:**
1. **Faster transcripts / real-time actions:** add a fast lane. The phone streams to Scribe's
   realtime WebSocket (`scribe_v3_live`) using a single-use token from Convex; finished sentences are
   written to Convex as they arrive; a cheap LLM check runs on each sentence and escalates to actions,
   nudges or push notifications. Keep the current batch path as the permanent, better-diarized record.
   A quick interim step is closing segments after about 5 s of quiet with a 60 s cap, for about 10 s of delay.
2. **Identifying the user:** an onboarding voice sample plus Scribe speaker identification, and LLM context.
3. **Over-the-air updates:** EAS Update, so JavaScript fixes reach everyone's phones without a rebuild.
4. **Memory layer:** process new `utterances` in Convex into people, goals and habits.
5. **TestFlight:** for adding more testers without registering each phone.
