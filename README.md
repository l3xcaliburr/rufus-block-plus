# Amazon Rufus Blocker

A lightweight Chrome extension that removes Amazon's Rufus AI chatbot panel and gives you your full browser width back.

![Amazon Rufus Blocker](icon128.png)

## The Problem

Amazon now docks a Rufus AI chatbot panel on every page, reserving 600 pixels of screen space that loads open by default. Every single page refresh brings it back. Your cart is embedded inside the Rufus panel, so simply hiding it breaks cart functionality.

## The Solution

Amazon Rufus Blocker slides the entire Rufus panel off screen and resets the body padding Amazon injects, reclaiming your full page width instantly. The cart is preserved and repurposed as a clean slide in overlay triggered by clicking the cart icon in the nav bar.

## Features

**Reclaims screen space** by resetting the forced 600px body padding that Amazon injects on every page load.

**Preserves cart functionality** by keeping the Rufus panel alive in the DOM (since Amazon nests the cart inside it) and repositioning it as a toggleable fixed overlay.

**Cart interaction** works naturally. Click the cart icon to slide the cart panel in from the left. Close it by clicking outside the panel, pressing Escape, or clicking the cart icon again. Ctrl/Cmd clicking the cart icon navigates to the full cart page as usual.

**Runs at document start** so the CSS is injected before the page renders, preventing the 600px layout shift entirely. No flash of the Rufus panel on load.

**Works across all Amazon domains** including .com, .co.uk, .ca, .de, .fr, .it, .es, .co.jp, .com.au, .in, and .com.br.

## Installation

### Chrome Web Store

Install from the [Chrome Web Store](https://chrome.google.com/webstore/) (link pending approval).

### Manual Install (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** using the toggle in the top right
4. Click **Load unpacked** and select the extension folder
5. Refresh any Amazon page

## How It Works

The extension consists of two files injected as content scripts on Amazon pages.

**rufus-nuke.css** is injected at `document_start` before the page renders. It resets the body padding and Rufus CSS custom properties, slides the Rufus panel off screen using `position: fixed; left: -700px`, and defines a `.rb-cart-open` class that slides the panel back in when the cart is triggered. A backdrop overlay is styled for the open cart state.

**rufus-nuke.js** handles the dynamic side. It cleans Rufus classes and inline styles from the body element, hooks the nav cart icon click to toggle the panel, creates a backdrop overlay for closing the cart, listens for Escape key presses, and runs a MutationObserver that catches Amazon re-applying Rufus styles or padding after async script execution.

No elements are removed from the DOM. The Rufus panel is repositioned off screen so all of Amazon's existing JavaScript continues to function normally, including the cart widget and any event delegation that depends on the panel's DOM ancestry.

## File Structure

```
amazon-rufus-blocker/
├── manifest.json      # Extension manifest (Manifest V3)
├── rufus-nuke.css     # Injected stylesheet
├── rufus-nuke.js      # Content script
├── icon16.png         # Toolbar icon
├── icon48.png         # Extensions page icon
├── icon128.png        # Chrome Web Store icon
├── PRIVACY.md         # Privacy policy
└── README.md
```

## Privacy

This extension collects zero user data. No analytics, no telemetry, no network requests, no cookies, no storage. Everything runs locally as content scripts on Amazon pages. See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## Contributing

Issues and pull requests are welcome. If Amazon changes their Rufus panel structure or class names, the selectors may need updating. Screenshots from DevTools showing the new DOM structure are the most helpful thing you can include in a bug report.

## License

MIT
