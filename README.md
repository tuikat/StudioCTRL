<div align="center">

# StudioCTRL

**A fast, beautiful desktop controller for Blackmagic cameras.**

Built for the **Blackmagic Micro Studio Camera 4K G2**. Configure and switch between up to **8 cameras** over the network, with a dark, low latency control surface for exposure, lens, colour and recording.

[![CI](https://github.com/tuikat/StudioCTRL/actions/workflows/ci.yml/badge.svg)](https://github.com/tuikat/StudioCTRL/actions/workflows/ci.yml)
[![Release](https://github.com/tuikat/StudioCTRL/actions/workflows/release.yml/badge.svg)](https://github.com/tuikat/StudioCTRL/actions/workflows/release.yml)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-25e6c5.svg)](LICENSE)

</div>

---

## Download

Grab the installer for your platform from the [**Releases**](https://github.com/tuikat/StudioCTRL/releases) page. One package per platform:

| Platform | File |
| --- | --- |
| **Windows** | `StudioCTRL_*_x64-setup.exe` (NSIS installer) |
| **macOS** (universal) | `StudioCTRL_*_universal.dmg` (Apple Silicon and Intel) |
| **Linux** | `StudioCTRL_*_amd64.AppImage` |

> The macOS and Windows builds are currently **unsigned**. On first launch you may need to allow the app through Gatekeeper (macOS: right click, then Open) or SmartScreen (Windows: *More info*, then *Run anyway*).

## How it connects (important)

The **Micro Studio Camera 4K G2 has no Bluetooth radio.** StudioCTRL controls it the way Blackmagic documents for this model: the **Camera Control REST API over USB-C Ethernet**.

For each camera:

1. Plug a **USB-C to Ethernet adapter** into the camera and connect it to your network (the same LAN as the computer running StudioCTRL).
2. In **Blackmagic Camera Setup**, enable network control and note the camera's name or IP address.
3. In StudioCTRL, open a camera slot's **settings** (gear icon) and enter its IP address or `.local` hostname (for example `192.168.1.50` or `studiocam1.local`), then **Save & connect**.

> SDI camera control (via an ATEM switcher or a 3G-SDI shield) uses the same parameter set but needs hardware to inject the protocol into the SDI feed, so it is not something a standalone app can do. StudioCTRL targets the REST API path.

## Features

- **Up to 8 cameras.** Configure each slot with a name and address; switch instantly with the sidebar or number keys **1 to 8**.
- **Link mode.** Send a control change to *every* connected camera at once for matched multi cam looks (toggle with **L**).
- **Exposure.** ISO, gain (dB), shutter angle and speed, white balance and tint, auto white balance, and auto exposure modes.
- **Lens.** Iris (aperture), focus with one touch autofocus, zoom, optical image stabilisation.
- **Colour correction.** Lift, gamma, gain and offset wheels (R G B Y), contrast and pivot, hue and saturation, luma mix, reset.
- **Recording.** Start and stop with optional clip name, live record state and timecode.
- **Dark, fast UI.** A native [Tauri](https://tauri.app) app (Rust core plus web UI) in a single small binary.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `1` to `8` | Switch to camera slot |
| `L` | Toggle Link mode (apply to all cameras) |

## Why Tauri?

StudioCTRL is built with **Tauri 2**, a Rust backend with a web rendered UI. The Rust core proxies all HTTP to the cameras (avoiding webview CORS and mixed content limits) and ships as a tiny, fast, self contained desktop binary on Windows, macOS and Linux.

## Build from source

Prerequisites: [Node.js](https://nodejs.org) 18 or newer, [Rust](https://rustup.rs) 1.77 or newer, and the [Tauri system dependencies](https://tauri.app/start/prerequisites/) for your OS.

```bash
git clone https://github.com/tuikat/StudioCTRL.git
cd StudioCTRL
npm install

# run in dev
npm run tauri dev

# produce installers for the current platform (output in src-tauri/target/release/bundle)
npm run tauri build
```

## Compatibility

Primarily developed and tested against the **Blackmagic Micro Studio Camera 4K G2**. It should also work with any Blackmagic camera that exposes the **Camera Control REST API** (for example URSA Broadcast G2, URSA Cine, Pocket Cinema 6K and 4K G2 on recent firmware). Capabilities are discovered from the camera, so unsupported controls simply have no effect on a given model.

## Acknowledgements

Built from Blackmagic Design's official developer documentation: the *Blackmagic Camera Control* manual (SDI and Bluetooth protocol) and the *REST API for Blackmagic Cameras* manual.

## License

[PolyForm Noncommercial License 1.0.0](LICENSE), copyright 2026 Forester Christensen.

You are free to use, copy, modify and share StudioCTRL for any **noncommercial** purpose. Selling it or using it for commercial purposes is not permitted under this license.

> Not affiliated with or endorsed by Blackmagic Design. "Blackmagic", "Micro Studio Camera" and related marks belong to Blackmagic Design.
