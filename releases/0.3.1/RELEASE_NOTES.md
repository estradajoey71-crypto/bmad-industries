# BMAD Arcade 0.3.1 — Early Access (2026-10-08)

BMAD Arcade is an early-access game library and launcher for Linux: the games you already own, in one place, launched through their own launchers, with a clear answer when something does not start.

## Changes in 0.3.1
- Settings → About & updates now describes what the Early Access licence adds (BMAD Vault and custom backgrounds) and offers "Get Early Access"; 0.3.0 wrongly mentioned Premium, Fusions and Mod Lab, which are not part of this edition.
- The Vault page says before you type a passcode when a Vault needs the Early Access licence.

## What you get
- **Your library, found automatically:** Steam, Epic Games through Heroic, GOG, Lutris and programs you add; DLC listed under its game; artwork from your launchers' own caches and the stores' public image servers.
- **Launches you can trust:** Arcade follows the game itself and tells you why when it does not start (files moved, sign-in needed, a launcher prompt waiting for you, a game closing right after it opened, a Wine crash).
- **Retro consoles** through the emulators you installed (RetroArch, melonDS, PPSSPP, mGBA, PCSX2, Dolphin, DuckStation and more). BMAD Arcade includes no games or ROMs.
- **Arcade Mode** for full-screen, controller-first browsing.
- **Free and homebrew games** from open-licence sources (Homebrew Hub).
- **Signed update notifications** and a **diagnostics file** you create and choose to share. No telemetry.

## Early Access supporter licence (optional, one-time)
Unlocks BMAD Vault (an encrypted private section) and custom backgrounds, plus every Early Access build and priority support. Everything above stays free.

## Verified on the reference machine (Arch Linux, Hyprland, RTX 5060)
Real launches through Arcade's own pipeline: Bitburner, Hacknet (Steam, native); Over The Top: WWI, Raft, Bodycam, Hogwarts Legacy (Steam, Proton); Civilization VI, Grand Theft Auto V, ARK (Epic through Heroic); RetroArch (Game Boy, Game Boy Color, GBA, NES, PC Engine, PlayStation cores), melonDS, PPSSPP. Honestly reported instead of "started": Battlefield V (stops at the EA app sign-in; EA anti-cheat blocks Linux), New World (closes right after opening), The Elder Scrolls Online (starter crashes under Proton).

## Not in this edition
Cross-game Fusions and Mod Lab are in development and are **not distributed**: they connect third-party games whose licences have not been cleared for distribution.

## Known limitations
- Online-only or anti-cheat-locked games may not run on Linux.
- Physical 8BitDo button mapping is not yet verified on hardware; standard Linux gamepads (SDL) are supported.
- Linux x86_64 only.

## Install
- **AppImage:** `chmod +x BMAD-Arcade-0.3.1-x86_64.AppImage` and run it (glibc 2.35+: Ubuntu 22.04+, Debian 12+, Fedora 36+, Arch).
- **Tarball:** extract, `./install.sh` (keeps the previous version; `--rollback`), `./uninstall.sh` keeps your library.
- **Arch Linux:** `sudo pacman -U bmad-arcade-bin-0.3.1-1-x86_64.pkg.tar.zst`.
The tarball and Arch package use the system's WebKitGTK 4.1, GTK 3 and SDL2. Verify downloads with `sha256sum -c SHA256SUMS`.
