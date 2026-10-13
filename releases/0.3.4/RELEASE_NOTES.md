# BMAD Arcade 0.3.4 — Early Access (2026-10-12)

BMAD Arcade is an early-access game library and launcher for Linux: the games you already own, in one place, launched through their own launchers, with a clear answer when something does not start.

## Changes in 0.3.4
- BMAD Vault and custom backgrounds now say up front when they need the optional Early Access licence, with a link to what it adds and a shortcut to adding a licence file, instead of opening a file picker and then refusing the image.
- The AppImage no longer ships the copyright files of the two libraries 0.3.3 removed.

## Changes in 0.3.3
- The AppImage no longer carries the TIFF image loader and the GPL-licensed JBIG library it needed. BMAD Arcade never loads TIFF images, so nothing changes for you.
- Notices for every library the AppImage bundles (package, version, licence and where to get the source) are published with the release.
- The End User Licence Agreement in the packages is version 0.3: it describes the Early Access features and no longer mentions Fusions, which are not part of this edition.

## Changes in 0.3.2
- Global search no longer offers franchise archives; the catalogs are left out of the program entirely.
- Command-line paths for experimental Fusions, Mod Lab and external engines refuse to run in this edition.
- Game Boy and Game Boy Color games can be played with a standalone mGBA install.

## What you get
- **Your library, found automatically:** Steam, Epic Games through Heroic, GOG, Lutris and programs you add; DLC listed under its game; artwork from your launchers' own caches and the stores' public image servers.
- **Launches you can trust:** Arcade follows the game itself and tells you why when it does not start (files moved, sign-in needed, a launcher prompt waiting for you, a game closing right after it opened, a Wine crash).
- **Retro consoles** through the emulators you installed (RetroArch, melonDS, PPSSPP, mGBA, PCSX2, Dolphin, DuckStation and more). BMAD Arcade includes no games or ROMs.
- **Arcade Mode** for full-screen, controller-first browsing.
- **Free and homebrew games** from open-licence sources (Homebrew Hub).
- **Signed update notifications** and a **diagnostics file** you create and choose to share. No telemetry.

## Early Access supporter licence (optional, one-time)
Unlocks BMAD Vault (a passcode-locked private section whose entries, such as titles, paths and artwork, are stored encrypted; the game and media files themselves are not encrypted or moved) and custom backgrounds. The licence keeps working on every Early Access build, and support messages from buyers are answered first. Everything above stays free.

## Verified on the reference machine (Arch Linux, Hyprland, RTX 5060)
Real launches through Arcade's own pipeline: Bitburner, Hacknet (Steam, native); Over The Top: WWI, Raft, Bodycam, Hogwarts Legacy (Steam, Proton); Civilization VI, Grand Theft Auto V, ARK (Epic through Heroic); RetroArch (Game Boy, Game Boy Color, GBA, NES, PC Engine, PlayStation cores), melonDS, PPSSPP. Honestly reported instead of "started": Battlefield V (stops at the EA app sign-in; EA anti-cheat blocks Linux), New World (closes right after opening), The Elder Scrolls Online (starter crashes under Proton).

## Not in this edition
Cross-game Fusions and Mod Lab are in development and are **not distributed**: they connect third-party games whose licences have not been cleared for distribution.

## Known limitations
- Online-only or anti-cheat-locked games may not run on Linux.
- Physical 8BitDo button mapping is not yet verified on hardware; standard Linux gamepads (SDL) are supported.
- Linux x86_64 only.

## Install
- **AppImage:** `chmod +x BMAD-Arcade-0.3.4-x86_64.AppImage` and run it (glibc 2.35+: Ubuntu 22.04+, Debian 12+, Fedora 36+, Arch).
- **Tarball:** extract, `./install.sh` (keeps the previous version; `--rollback`), `./uninstall.sh` keeps your library.
- **Arch Linux:** `sudo pacman -U bmad-arcade-bin-0.3.4-1-x86_64.pkg.tar.zst`.
The tarball and Arch package use the system's WebKitGTK 4.1, GTK 3 and SDL2. Verify downloads with `sha256sum -c SHA256SUMS`.
