# MeetMe

A mobile-first dating app: swipe through profiles, match, and chat. There is no
backend. A mock backend runs in the browser, and a simulated partner replies in
the chat. You can shape its replies with rules you teach it.

The structure follows [ARCHITECTURE.md](ARCHITECTURE.md). The adaptations are
listed under [Architecture](#architecture).

## Run it

```sh
npm install
npm run dev          # http://localhost:5173
```

Open it in a phone-sized window, or with DevTools device mode. On a desktop the
app renders as a centred phone-width column.

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Dev server                                          |
| `npm run build`     | Type-check (`vue-tsc --build`) and production build |
| `npm run test:unit` | Vitest (use cases, reply engine, status, gestures)  |
| `npm run test:e2e`  | Playwright, phone viewport, full flows              |
| `npm run lint`      | oxlint, then ESLint                                 |
| `npm run format`    | Prettier                                            |

All data is stored in `localStorage` under `meetme:*`. To clear your own
swipes, matches and chats, use **Profile → Your activity → Reset activity**.

## What's in it

**Accounts**

- Every screen except log in and sign up needs you to be signed in. A signed-out
  visitor is sent to log in and, once signed in, returned to the page they
  wanted.
- **Sign up** asks for first name, gender (man or woman), date of birth (18+),
  city, email and password. New accounts land on their profile to fill it in.
- **Matching is by gender:** a man is shown only women and a woman is shown
  only men. The backend enforces this when it builds the deck, and it isn't a
  setting you can change. The gender you sign up with is fixed; the Profile
  screen shows who you're being shown.
- Each account has its own swipes, matches, chats and reply rules.
- **Demo accounts:** `femi@meetme.demo` (man) and `ada@meetme.demo` (woman),
  both with password `meetme123`. They are also one-tap buttons on the login
  screen.
- Log out from the bottom of the Profile screen.
- This is a front-end mock. Passwords are salted and hashed so they are never
  stored as plain text, but everything lives in the browser's `localStorage`.
  Real accounts need a real server.

**Discover (the deck)**

- Drag a card. It follows your pointer and rotates, and **LIKE** / **NOPE** /
  **SUPER LIKE** stamps fade in as the drag builds.
- A swipe commits when the card travels past the distance threshold, or when
  you flick it fast enough. A shorter, slower drag springs the card back.
- Tap the left or right side of the photo to browse photos. Tap the lower third
  or the ⓘ button to open the full profile.
- The action bar has rewind, pass, super like and like. On desktop you can also
  use the keys ← → ↑ and ⌫.
- Swipes are optimistic: the next card appears immediately. If the backend
  refuses a swipe, the card comes back.
- You can rewind a swipe, but not a match. The backend refuses to rewind a
  match, and the app shows its reason.
- The deck holds ten profiles, five men and five women, each with one supplied
  photo. The photos live in [src/assets/profiles/](src/assets/profiles/) and are
  bundled with the app, so they need no network. Which photo a profile uses is
  the `photo_urls` import in [src/mock-backend/seed.ts](src/mock-backend/seed.ts).
  Nothing in the app is generated artwork; your own account shows an initial
  instead of a photo until profile photo upload exists.
- On a mutual like, a match screen appears. Some profiles send the first
  message a few seconds after you match.

**Matches**

- A carousel of new matches, and a list of conversations with search.
- Filter chips (All, Your turn, Unread, Waiting) show a count for each.
- The unread badge on the tab bar updates live.

**Chat (the simulation)**

- **Simulated replies.** Each profile has a private persona with a tone
  (playful, warm, dry or curious), a typing pace, openers and follow-up
  questions. After you send a message, the pipeline runs: _delivered_, then
  _read_, then _typing…_, then a reply.
  - If you send several messages in a row, they get one combined reply, sent
    after you pause.
  - A message that opens with "Hey!" and then asks something gets an answer to
    the question, not just "hi" back.
- **Conversation coach (the feedback).** An interest meter from 0 to 100, and a
  one-line reason each time a message moves it, for example:
  - `+8 Asking a question shows you are curious about them.`
  - `-5 One-word replies make it hard for them to keep going.`

  Interest changes how they reply: low interest gets short replies, high
  interest gets follow-up questions and yes to a date. Below 15 they stop
  replying, and a thoughtful message can bring them back.

- **Teach replies (the prompts you give the system).** Write rules in the form
  "when I say X, they reply Y".
  - A trigger is a phrase or a `/regex/`.
  - A rule can apply to this conversation only or to every match.
  - Replies can use tokens: `{me}`, `{them}`, `{interest}`, `{shared}`,
    `{city}` and `{message}`.
  - Rules beat the persona, and they fire even after the persona has gone
    quiet.
- **Speak as them.** Tap the **You** button next to the composer to write as
  the other person, so you can play both sides. A message you voice replaces
  their pending simulated reply and is marked _voiced by you_.
- **Pause simulated replies** from the ⚙ menu if you'd rather write both sides
  by hand.
- **Suggestion chips** above the composer: openers before anyone has spoken,
  then follow-ups. Tapping one fills the composer without sending it.

**Profile**

- Edit your name, job, city, bio and interests, then save from the
  unsaved-changes bar.
- Discovery preferences (age range and distance) filter the deck. Who you're shown is set by your gender.
- Device settings: theme (system, light or dark), 12- or 24-hour time, and
  coach on or off.

## Architecture

The blueprint describes a Nuxt, Tailwind and TanStack dashboard. This repo is
Vue 3, Vite and Pinia, with no new dependencies. The table maps each blueprint
concept to its home here.

| Blueprint                                                     | Here                                                                                                                                                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens in one CSS file (`@theme`)                             | [src/assets/tokens.css](src/assets/tokens.css): same ramp shape (`50/100/150/500/600`), radius derived from one `--radius`, a derived semantic layer that dark mode remaps                    |
| `cn` = `twMerge(clsx())`                                      | [src/lib/cn.ts](src/lib/cn.ts): `clsx` only, because without utility CSS there are no class collisions to merge                                                                               |
| CVA + `*-variants.ts` siblings                                | [src/lib/cva.ts](src/lib/cva.ts), [button-variants.ts](src/components/n/button/button-variants.ts): orthogonal `color` × `variant` through `compoundVariants`                                 |
| `components/n/` design system, composition over configuration | [src/components/n/](src/components/n/): `NCard` + `NCardHeader/Title/Description/Action/Content/Footer`, `data-slot` on every part, `class` forwarded                                         |
| Status registry / resolver / palette                          | [src/utils/status/](src/utils/status/): connection, delivery, presence and verification kinds; the mock backend deliberately sends aliased spellings (`seen`, `active_now`, `waiting_on_you`) |
| Icon name map                                                 | [src/utils/icons.ts](src/utils/icons.ts): semantic names (`like`, `pending`, `read`) mapped to glyphs                                                                                         |
| Dates: one zone, one pattern resolved at call time            | [src/utils/date-formatters.ts](src/utils/date-formatters.ts): `Africa/Lagos`; raw timestamps travel to the component that prints them                                                         |
| `ApiResponse` envelope + `unwrapApiResponse`                  | [src/lib/api-envelope.ts](src/lib/api-envelope.ts): every write unwraps; refusals come back as `status: false`                                                                                |
| TanStack Query                                                | [src/lib/use-query.ts](src/lib/use-query.ts): a small stand-in with the same shape (`keepPreviousData`, stale window, prefix invalidation)                                                    |
| Feature slices                                                | [src/features/](src/features/): `discover/deck`, `matches/inbox`, `chat/conversation`, `account/profile`, `auth/session`, `shell/tabbar`                                                      |
| Mock latency (400 / 650 ms)                                   | [src/lib/latency.ts](src/lib/latency.ts), so loading states actually render                                                                                                                   |

Each slice has the blueprint's shape:

```
domain/          entities, pure rules (gesture physics, vibe thresholds)
ports/           service port (transport), query port, realtime/notifier ports
adapters/        query-port implementation over use-query
application/     the use case: takes a deps bag, returns reactive state
composition/     use-<x>-deps.ts (the swap point) + use-<x>.ts (the root)
infrastructure/  query keys, services/*-mock.ts, transformers/ (api → dto)
ui/<prefix>-<slice>/  index.vue + presentational parts
index.ts         barrel: domain, keys, port types only
```

### The mock backend

[src/mock-backend/](src/mock-backend/) stands in for a separate server:

- Wire types are snake_case, in [src/api/types.ts](src/api/types.ts).
- Every endpoint answers with the envelope and fakes latency.
- Every inbound payload is serialised, as a network would do.
- State is persisted to `localStorage`.
- [channel.ts](src/mock-backend/channel.ts) is its push channel: typing,
  messages, read receipts and inbox changes. It replaces a WebSocket.

Only the `infrastructure/services/*-mock.ts` files import the mock backend.

**Moving to a real backend:** write a sibling adapter that implements the same
service port, and a realtime adapter over WebSocket, SSE or polling. Then change
the one line in each slice's `composition/use-*-deps.ts`. Nothing above that
line changes.

### Deliberate deviations

- **Route names are app-level** ([src/router/route-names.ts](src/router/route-names.ts)).
  The blueprint keeps paths inside each slice, but here the deck links into
  chat, and features may not import each other.
- **No auto-registration.** Vite has no Nuxt component scanning, so UI parts
  are imported explicitly. `ui/dc-deck/card.vue` is imported as `DcDeckCard`.
  ESLint's multi-word-name rule is turned off for `src/features/**/ui/**` for
  this reason, and the config explains why.
- **`--*-fg` tokens.** Coloured text uses `--accent-fg` and its siblings. These
  equal the `600` step in light mode and a lighter tint in dark mode, so the
  raw `600` step stays a solid fill in both themes.
- **The shell tab bar has no `application/` layer.** Its use case is small
  enough to live in the composition root.
- **There is a test suite.** The blueprint's project has none; its judgement
  calls suggest adding one where the application layer allows it. Here it
  does.

## Tests

- **Unit** (`src/**/__tests__`):
  - the deck use case, run against a hand-written fake port (optimistic swipe,
    refused swipe restored, rewind, rewind of a match refused, envelope refusal
    on the read side)
  - the reply engine (scoring, ghosting, rules over persona, regex triggers,
    date timing)
  - the status resolver, gesture thresholds, `cva` and the envelope
  - sign-up and log-in validation (including the exact 18+ cut-off)
  - the backend's auth (hashed passwords, duplicate emails, one error for any
    failed log-in, demo accounts) and the matching rule (men see only women,
    women only men, accounts kept separate)
- **E2E** (`e2e/app.spec.ts`, 390×844):
  - dragging a card to swipe
  - rewinding a pass
  - match, then chat, then coach feedback, then a simulated reply and a read
    receipt
  - a taught rule overriding the persona
  - preferences filtering the deck
  - the sign-in guard and its return to the intended page
  - a man shown only women; a new woman shown only men, then logging out
  - sign-up field errors, and a wrong password refused

`npm run test:e2e` reuses a dev server that is already running on port 5173.
To test the production build instead, run `npm run build`, then
`CI=1 npx playwright test --project=chromium`, which serves the build on port 4173.
