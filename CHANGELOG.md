# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Backend
- Upgraded Quarkus from 3.17.4 → 3.36.2 (latest stable)
- Fixed `L32X64MixRandom` error: replaced `@GeneratedValue` with `@UuidGenerator(style = Style.RANDOM)` on all 8 entities (`Bet`, `User`, `Championship`, `Group`, `BetResult`, `Round`, `Match`, `Sport`) — uses `UUID.randomUUID()` compatible with all Java versions
- Bet validation: block new bets if match has already started (`matchDate` in the past) or status is `IN_PROGRESS`

### Frontend — UI Redesign

#### Design System
- Added Inter font via Google Fonts for consistent typography
- Extended Tailwind config with `brand` color palette (green-based), custom box shadows (`card`, `card-hover`, `nav`) and custom font family
- New CSS utility classes: `btn-primary`, `btn-outline`, `btn-ghost`, `card`, `input-base`, `skeleton`

#### LoginPage
- Two-panel layout: brand panel (desktop) + form panel
- Email and password fields with icons and show/hide password toggle
- Inline error alert with icon

#### RegisterPage
- Two-panel layout matching LoginPage
- Feature bullet list on brand panel
- Terms of use checkbox with validation

#### Layout
- Sticky top nav with shadow
- Logo + breadcrumb navigation
- User avatar with initials, name, and link to account page
- Logout button with hover state

#### DashboardPage
- Group cards with avatar icon, invite code display, one-click copy and visual feedback
- Skeleton loading state while fetching groups
- Empty state with CTAs to create or join a group
- Inline forms for creating/joining groups (with cancel and loading states)

#### GroupPage
- Tab switcher (Partidas / Ranking) with pill style
- Match cards now show date and time (`Sáb 14 jun · 20:00`) below team names
- Points badge in match card header for finished matches (green = exact, blue = partial, gray = zero)
- Expanded match card: "Meu resultado" section with score, points, and net winnings highlighted
- Message "Você não apostou neste jogo" when a finished match had no bet from the user
- **Bracket view (Chave):** Lista/Chave toggle per championship; rounds displayed as horizontal columns with compact `BracketMatchCard` (colored status header, winner in bold)
- Ranking scope filter pills (Geral / per championship / Partidas avulsas)
- Scoring rules tooltip (`ⓘ`) on leaderboard header and championship badges
- Skeleton loading for match list
- Empty state cards for matches and leaderboard
- Championship badges showing scoring mode (Proporcional/Exato) with tooltip
- Owner-only actions (add match, add championship, finalize score, delete) hidden for non-owners

---

## [Prior releases]

See git log for history before this changelog was introduced.
