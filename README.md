# Click the Cookie

A Firefox extension with all features removed.

## Features

All features have been removed from this extension.

## Installation

### Method 1: Temporary Installation (Development)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select `manifest.json`
5. The extension will be loaded and appear in your toolbar

### Method 2: Permanent Installation (Requires Signing)

For permanent installation, the extension needs to be signed by Mozilla. You can:
1. Submit it to Mozilla Add-ons (AMO) for review and signing
2. Use Mozilla's signing API for self-distribution

## Usage

1. Navigate to [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/)
2. Wait for the game to fully load
3. Click the Cookie Clicker Auto-Clicker extension icon in your toolbar
4. Configure your settings:
   - **Auto-click big cookie**: Enable/disable automatic clicking
   - **Click speed**: Set interval between clicks (lower = faster)
   - **Auto-buy upgrades**: Automatically purchase available upgrades
   - **Auto-buy buildings**: Automatically purchase buildings
5. Click "Start Auto-Clicker" to begin automation
6. Click "Stop Auto-Clicker" to stop automation

## Settings

- **Click Speed**: Controls how fast the big cookie is clicked (10-5000ms)
- **Auto-click**: Toggles automatic big cookie clicking
- **Auto-upgrade**: Toggles automatic upgrade purchasing
- **Auto-building**: Toggles automatic building purchasing

## File Structure

```
ClickTheCookie/
├── manifest.json       # Extension manifest
├── popup.html          # Extension popup interface
├── popup.js           # Popup logic and settings
├── content.js         # Main auto-clicker functionality
├── icons/             # Extension icons
└── README.md          # This file
```

## Technical Details

### Permissions

- `activeTab`: Required to interact with the Cookie Clicker page
- `storage`: Required to save user settings

### Content Script

The extension injects a content script that:
- Waits for the Cookie Clicker game to fully load
- Finds and clicks the big cookie at specified intervals
- Automatically purchases upgrades when available
- Strategically purchases buildings (most expensive affordable first)
- Listens for start/stop commands from the popup

### Security

- Only runs on the official Cookie Clicker domain
- Uses standard browser APIs
- No external network requests
- Settings stored locally in browser

## Development

To modify the extension:

1. Edit the relevant files (`content.js`, `popup.js`, `popup.html`)
2. Reload the extension in `about:debugging`
3. Test on Cookie Clicker

### Key Components

- **manifest.json**: Defines extension metadata and permissions
- **content.js**: Main automation logic, injected into Cookie Clicker pages
- **popup.html/js**: User interface for controlling the extension

## Troubleshooting

**Extension not working?**
- Make sure you're on the official Cookie Clicker website
- Wait for the game to fully load before starting
- Check browser console for any error messages
- Try reloading the extension in about:debugging

**Settings not saving?**
- Check that the extension has storage permissions
- Try restarting Firefox

**Auto-clicker too fast/slow?**
- Adjust the click speed in the popup (10ms minimum, 5000ms maximum)
- Very low values (under 50ms) may impact browser performance

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension.

## Disclaimer

This extension is for educational and entertainment purposes. Use responsibly and in accordance with Cookie Clicker's terms of service.
