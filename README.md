# xBlockOrigin

Automatically mute X.com (Twitter) users from specified countries using X's new country detection feature.

## Features

- **Automatic Country Detection**: Uses X.com's AboutAccountQuery API to detect users' originating countries
- **Customizable Blacklist**: Specify which countries to automatically mute
- **Multi-Page Support**: Works on timeline, profiles, search results, and notifications
- **Mute Database**: Tracks all automatically muted users with username, country, and timestamp
- **CSV Export**: Export your muted users list to CSV format
- **Cross-Browser**: Supports both Chrome/Edge (Manifest V3) and Firefox (Manifest V2)

## How It Works

When you browse X.com, the extension:

1. Scans pages for user profiles (timeline, search, profiles, notifications)
2. Queries X.com's AboutAccountQuery API to get the user's originating country
3. Checks if the country is in your blacklist
4. Automatically mutes the user if their country matches
5. Saves the muted user to a local database for tracking

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

2. **Browse X.com**
   - The extension automatically scans for users as you browse
   - When a user from a blacklisted country is found, they're automatically muted
   - A toast notification appears when a user is muted

3. **View Muted Users**
   - Open the extension popup to see all muted users
   - Sort by username, country, or mute date
   - View statistics about total muted users and top countries

4. **Export Data**
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
│   │   ├── Background/    # Background service worker
│   │   ├── Content/       # Content scripts & scanners
│   │   ├── Popup/         # React popup UI
│   │   ├── Storage/       # IndexedDB database
│   │   └── Utils/         # Cache, rate limiter, CSV exporter
│   ├── manifest.v2.json   # Firefox manifest
│   └── manifest.v3.json   # Chrome manifest
├── dist/
│   ├── chrome/            # Chrome build output
│   └── firefox/           # Firefox build output
└── package.json
```

## Technical Details

### API Endpoints

- **AboutAccountQuery**: `https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery`
  - Returns user's `account_based_in` field (originating country)
- **MuteUser**: `https://x.com/i/api/graphql/mCclF7Y-cdl87NyYin5M_A/CreateMute`
  - Mutes a user by their user ID

### Storage

- **IndexedDB**: Stores muted users (username, userId, country, mutedAt)
- **chrome.storage.sync**: Stores country blacklist (syncs across devices)

### Rate Limiting

- API requests are rate-limited to 1 request per second
- Country lookups are cached for 24 hours to reduce API load

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
- Country detection is based on the App Store region where the account was created

## CI/CD and Releases

This project uses GitLab CI/CD for automated builds and unsigned releases.

### How Releases Work

Every push to the main branch automatically:
1. Runs linting and type checks
2. Builds both Chrome and Firefox versions
3. Updates extension versions to match the release number (r1 → 1.0.0, r2 → 2.0.0, etc.)
4. Packages both extensions as downloadable ZIP files
5. Creates a GitLab release with auto-incremented version (r1, r2, r3...)

Releases follow a simple versioning scheme: **r1, r2, r3, r4...** where each number represents a pipeline run.
