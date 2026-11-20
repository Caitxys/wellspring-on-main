# Where each part of the public website comes from

The public pages are built now with placeholder content. Each part will come from one of three places:

| Label | Who builds it | Database tables |
|---|---|---|
| **Static** | Written into the page code | None |
| **Content & Community group** | Content team | `staff`, `web_page`, `content_item`, `audience`, `content_audience`, `update_request` |
| **Events group** | Events team | `client`, `coordinator`, `room`, `event`, `inquiry` |

On the pages, every placeholder that will come from a database is a dashed box with a tag:

- **Teal tag** "Placeholder · Content & Community group"
- **Coral tag** "Placeholder · Events group"

Each box says which table it reads from and which rows to show. The boxes run no database queries. To connect one, replace the whole `<DbSlot>` block with the real content.

The two groups use separate databases today. They will be joined later.

---

## Page by page

### Home (`/`)

| Part | Comes from |
|---|---|
| Rental search bar (top of page: event type, date, guests) | Events group: checks open dates and room capacity from `room` and `event`. For now it only opens the request form on Rental options |
| Hero, quick facts, "Ways to engage" cards, testimonial, contact box | Static |
| Event type chips | Static for now. Same list as Rental options, kept in `src/lib/event-types.ts` to match the Events group's `event.e_type` |

### About (`/about`)

| Part | Comes from |
|---|---|
| Our story, Visit us | Static |
| Our mission | Content & Community group: `content_item` on `/` |
| Announcements (e.g. holiday hours) | Content & Community group: `content_item` on `/` |
| Request a tour form | Events group: saves a `client` and an `inquiry` with type `tour` |

### Rental options (`/event-rentals`)

| Part | Comes from |
|---|---|
| Our spaces (room name and capacity) | Events group: `room` table, rooms that are Available. Photos are static |
| Rates | Content & Community group: `content_item` on `/event-rentals` |
| Included with every rental | Static |
| Events we host | Events group: the allowed values of `event.e_type` |
| Request your event form | Events group: saves a `client` and an `event` with status `submitted` |

### Programs + Projects (`/programs`)

| Part | Comes from |
|---|---|
| Intro, featured project, "Roll up your sleeves" | Static |
| Current programs, with audiences | Content & Community group: `content_item` on `/programs`, with `content_audience` |
| Upcoming public events | Events group: `event` (public, scheduled, not archived, upcoming) with the `room` name |

### Gallery (`/gallery`)

All static. Neither database stores images. Put photos in `public/images/`.

### FAQs (`/faqs`)

| Part | Comes from |
|---|---|
| Questions and answers | Static for now. Could later become `content_item` rows on an FAQ page |
| Still have a question? form | Events group: saves a `client` and an `inquiry` |

### Staff portal (`/staff`)

Sign-in and roles are shared. The update-request screens belong to the Content & Community group. The Events group's coordinator screens (reviewing requests, assigning rooms, archiving events) would be added here when the systems are joined.

---

## Rules for anything shown to the public

- Show only published, current information: `content_item` that is published and not archived, and `event` rows that are public, scheduled and not archived.
- Never show client names, emails, phone numbers, notes or other people's requests on a public page.
- A visitor who fills in a form can add a new request but cannot read anyone else's.

---

## Things to line up when the two databases are joined

| Topic | Content & Community group | Events group | Decision needed |
|---|---|---|---|
| Staff | `staff` table, linked to sign-in | `coordinator` table, not linked to sign-in | Keep one list of staff. Coordinators are staff |
| Roles | `staff.role` text, checked in `src/lib/auth.ts` | `roles` + `user_roles` tables | Pick one way to store roles |
| Room capacity | Written inside rental text | `room.r_capacity` | Capacity comes from `room` only |
| Event types | A copy of the Events group's list in `src/lib/event-types.ts`, used by the home and Rental options pages | `event.e_type` (wedding, birthday party, corporate, community, non-profit, other) | Read the list from the database so the site and the form can't drift apart |
| Groups of people | `audience` (Community Members, Nonprofits, Event Renters, Tenants) | `client.c_type` and `event.e_category` | Agree on shared names, or map one to the other |
| Public events | Programs written as content items | Public events as `event` rows | Decide which one a public event lives in, so it isn't entered twice |
