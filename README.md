# xBlockOrigin

Automatically mute X.com (Twitter) users from specified countries using X's new country detection feature.

## Features

- **Instant Post Hiding**: Posts from blacklisted users are hidden immediately with a 50% opacity overlay and 8px blur effect that adapts to your X.com theme
- **Automatic Country Detection**: Uses X.com's AboutAccountQuery API to detect users' originating countries
- **Customizable Blacklist**: Specify which countries to automatically mute
- **Whitelist Support**: Whitelist specific users to never mute them, regardless of country
- **Following Protection**: Optional setting to skip muting users you follow (enabled by default)
- **Multi-Page Support**: Works on timeline, profiles, search results, post detail pages (with replies), and notifications
- **Persistent Cache**: Country and following status cached to reduce API calls
- **Mute Database**: Tracks all automatically muted users with username, country, and timestamp
- **CSV Export**: Export your muted users list to CSV format
- **Cross-Browser**: Supports both Chrome/Edge (Manifest V3) and Firefox (Manifest V2)

## How It Works

When you browse X.com, the extension:

1. Scans pages for user profiles (timeline, search, profiles, post detail pages, notifications)
2. Fetches user ID and following status from X.com's UserByScreenName API
3. Checks if user is whitelisted (skips if true)
4. Checks if you follow the user and if "mute following" is disabled (skips if true)
5. Queries X.com's AboutAccountQuery API to get the user's originating country (cached for 24 hours)
6. Checks if the country is in your blacklist
7. **Immediately overlays the post** with a 50% opacity background (matching your theme) and 8px blur, while keeping the original post intact
8. Automatically mutes the user via X.com's API if first time seeing them
9. Saves the muted user to a local database for tracking

The overlay approach preserves all post functionality - click handlers remain intact so you can interact with the post after unhiding it.

All checks use persistent caching to minimize API requests and improve performance.

## Installation

### From Releases (Recommended)

Download pre-built **unsigned** extensions from the [GitLab Releases page](../../releases).

#### Chrome/Edge (Developer Mode - Unsigned)

1. Download `xblockorigin-chrome-rX.zip` from the latest release
2. **Unzip** the file to a permanent folder on your computer (don't delete this folder!)
3. Open Chrome/Edge and navigate to `chrome://extensions/`
4. Enable **"Developer mode"** using the toggle in the top-right corner
5. Click **"Load unpacked"**
6. Select the unzipped folder

**Important Notes**:
- Extension will show as "unpackaged" - this is normal for unsigned extensions
- Chrome may warn on every startup that developer mode extensions are installed
- Extension will stay installed as long as you keep the folder and don't disable developer mode

#### Firefox Standard Edition (Temporary - Unsigned)

Firefox **requires** extensions to be signed. For unsigned extensions in standard Firefox:

1. Download `xblockorigin-firefox-rX.zip` from the latest release
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Select the `manifest.json` file inside the extracted ZIP (or select the ZIP directly)

**Important Notes**:
- Extension is **temporary** and will be removed when Firefox restarts
- You must reload the extension after every Firefox restart
- This is the only option for unsigned extensions in standard Firefox

#### Firefox Developer Edition / Nightly / ESR (Permanent - Unsigned)

For permanent installation of unsigned extensions:

1. Download `xblockorigin-firefox-rX.zip` from the latest release
2. Open Firefox and navigate to `about:config`
3. Search for `xpinstall.signatures.required`
4. Set it to **`false`** (double-click to toggle)
5. Navigate to `about:addons`
6. Click the gear icon (⚙️) → **"Install Add-on From File"**
7. Select the downloaded `.zip` file
8. Click **"Add"** when prompted

**Important Notes**:
- Works in Developer Edition, Nightly, and ESR versions
- Extension stays installed permanently
- Disabling signature checks affects all extensions system-wide
- Not available in standard Firefox release builds

## Usage

1. **Add Countries to Blacklist**
   - Click the extension icon to open the popup
   - Enter a country name (e.g., "United States", "Antarctica")
   - Click "Add" to add it to your blacklist

2. **Manage Whitelist**
   - Open the extension popup
   - In the "Whitelisted Users" section, enter a username
   - Click "Add" to whitelist them (they'll never be muted, regardless of country)
   - Click the "×" next to a username to remove them from whitelist

3. **Configure Settings**
   - Open the extension popup and go to "Settings"
   - Toggle "Show country flags" to display flags next to usernames
   - Toggle "Also mute users you are following" (disabled by default means you won't mute users you follow)

4. **Browse X.com**
   - The extension automatically scans for users as you browse
   - When a user from a blacklisted country is found, their posts are **immediately hidden** with a blurred overlay
   - A toast notification appears when a user is muted via X.com's API

5. **Interact with Hidden Posts**
   - **Unhide**: Click "Unhide" on the overlay to reveal the post
     - A notice appears below the unhidden post: "Post unhidden, but user is still muted"
     - Click "Unmute and whitelist" to unmute via X.com API and add user to whitelist (unhides all their posts)
     - Click "×" to dismiss the notice
   - **Unmute and whitelist from overlay**: Click "Unmute and whitelist" on the overlay to immediately unmute the user via X.com API, add them to whitelist, and unhide all their posts

6. **View Muted Users**
   - Open the extension popup to see all muted users
   - Sort by username, country, or mute date
   - View statistics about total muted users and top countries

7. **Export Data**
   - Click "Export to CSV" in the popup
   - Download a CSV file with all muted users

## Development

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)

### Setup

```bash
# Install dependencies
bun install

# Run type checking
bun run typecheck

# Run linting and formatting
bun run lint
bun run format

# Build for both browsers
bun run build

# Build for specific browser
bun run build:firefox
bun run build:chrome
```

### Project Structure

```
xblockorigin/
├── packages/extension/
│   ├── src/
│   │   ├── Api/           # X.com GraphQL API client
│   │   │   ├── countryQuery.ts       # Fetch user country
│   │   │   ├── muteQuery.ts          # Mute user via API
│   │   │   ├── unmuteQuery.ts        # Unmute user via API
│   │   │   ├── userDataQuery.ts      # Combined userId + following fetch
│   │   │   └── schemas.ts            # Valibot schemas
│   │   ├── Background/    # Background service worker
│   │   ├── Content/       # Content scripts & scanners
│   │   │   ├── orchestrator.ts       # Main processing logic
│   │   │   ├── postHider.ts          # Post hiding with overlay
│   │   │   ├── hiddenPostNotice.ts   # Hidden post UI components
│   │   │   ├── timelineScanner.ts    # Scan timeline
│   │   │   ├── searchScanner.ts      # Scan search results
│   │   │   ├── statusScanner.ts      # Scan post detail pages
│   │   │   ├── replyScanner.ts       # Scan notifications/replies
│   │   │   └── profileScanner.ts     # Scan profiles
│   │   ├── Popup/         # Preact popup UI
│   │   │   ├── WhitelistManager.tsx  # Whitelist UI
│   │   │   └── Settings.tsx          # Settings UI
│   │   ├── Storage/       # Data persistence
│   │   │   ├── database.ts           # Muted users storage
│   │   │   ├── whitelist.ts          # Whitelist storage
│   │   │   ├── settings.ts           # Settings storage
│   │   │   └── schema.ts             # Valibot schemas
│   │   └── Utils/         # Utilities
│   │       ├── cache.ts              # Persistent cache (24h + 5m TTL)
│   │       ├── rateLimit.ts          # API request queue
│   │       └── csvExporter.ts        # CSV export
│   ├── manifest.v2.json   # Firefox manifest
│   └── manifest.v3.json   # Chrome manifest
├── dist/
│   ├── chrome/            # Chrome build output
│   └── firefox/           # Firefox build output
└── package.json
```

## Technical Details

### API Endpoints

- **UserByScreenName**: `https://x.com/i/api/graphql/-oaLodhGbbnzJBACb1kk2Q/UserByScreenName`
  - Returns user ID and following status in a single call
  - Used to fetch `rest_id` (user ID) and `relationship_perspectives.following`
- **AboutAccountQuery**: `https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery`
  - Returns user's `account_based_in` field (originating country)
- **MuteUser**: `https://x.com/i/api/graphql/mCclF7Y-cdl87NyYin5M_A/CreateMute`
  - Mutes a user by their user ID
- **UnmuteUser**: `https://x.com/i/api/1.1/mutes/users/destroy.json`
  - Unmutes a user by their user ID
  - Called when "Unmute and whitelist" is clicked

### Storage

All data is stored using Chrome's storage APIs:

- **chrome.storage.sync**: Stores country blacklist and settings (syncs across devices)
- **chrome.storage.local**: Stores all local data:
  - Muted users (username, userId, country, mutedAt)
  - Whitelisted users (userId, username, whitelistedAt)
  - Persistent cache with TTL:
    - User IDs (username → userId, 24 hour TTL)
    - Countries (username → country, 24 hour TTL)
    - Following status (userId → boolean, 5 minute TTL)

### Request Queue & Optimization

- API requests are queued and processed sequentially (no concurrent requests)
- Country lookups cached for 24 hours
- Following status cached for 5 minutes
- User ID lookups cached for 24 hours
- In-flight request tracking prevents duplicate API calls for same user
- Combined UserByScreenName call fetches both userId and following status in single request

### Browser Support

- **Chrome/Edge**: Manifest V3 with service worker
- **Firefox**: Manifest V2 with persistent background page

## Privacy

- All data is stored locally on your device
- No data is sent to external servers
- Only communicates with X.com's official API

## Notes

- The extension requires an active X.com session to work
- X.com's API may change, requiring updates to query IDs
- Country detection is based on the geolocation of the user's IP and, according to X, is updated every 30 days

## CI/CD and Releases

This project uses GitLab CI/CD for automated builds and unsigned releases.

### Setup

Install the pre-commit hook to enable automatic version bumping:

```bash
bun run scripts/setup-hooks.ts
```

This installs a pre-commit hook that automatically increments the major version on every commit (e.g., 1.0.0 → 2.0.0 → 3.0.0).

### How Releases Work

When you push to the main branch with an incremented version:

1. **Verify**: CI checks that version was incremented (fails if pre-commit hook didn't run)
2. **Lint**: Runs type checking and linting
3. **Build**: Builds both Chrome and Firefox versions, injects version into manifests
4. **Package**: Creates ZIP files for both browsers
5. **Release**: Creates a GitLab release with tag derived from major version (1.0.0 → r1, 2.0.0 → r2, etc.)

All extensions are **unsigned** for personal/testing use only.
