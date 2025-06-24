# [![Purinton Dev](https://purinton.us/logos/brand.png)](https://discord.gg/QSBxQnX7PF)

## @purinton/wx [![npm version](https://img.shields.io/npm/v/@purinton/wx.svg)](https://www.npmjs.com/package/@purinton/wx)[![license](https://img.shields.io/github/license/purinton/wx.svg)](LICENSE)[![build status](https://github.com/purinton/wx/actions/workflows/nodejs.yml/badge.svg)](https://github.com/purinton/wx/actions)

A modern Discord weather bot built with Node.js, OpenAI, and OpenWeatherMap, based on the [@purinton/discord](https://github.com/purinton/discord) foundation. Provides real-time weather, multi-language support, and automated weather reports for any location.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running as a Service (systemd)](#running-as-a-service-systemd)
- [Docker](#docker)
- [Customization](#customization)
  - [Commands](#commands)
  - [Events](#events)
  - [Locales](#locales)
- [Testing](#testing)
- [Support](#support)
- [License](#license)

## Features

- Discord.js-based app with ESM support
- Command and event handler architecture
- Multi-language/localized responses
- Real-time weather via OpenWeatherMap
- Automated weather reports with cron scheduling
- AI-powered location and report generation via OpenAI
- Environment variable support via dotenv
- Logging and signal handling via `@purinton/common`
- Ready for deployment with systemd or Docker
- Jest for testing

## Getting Started

1. **Clone this project:**

   ```bash
   git clone https://github.com/purinton/wx.git
   cd wx
   npm install
   ```

2. **Set up your environment:**
   - Copy `.env.example` to `.env` and fill in your Discord app token, OpenAI key, and other secrets.
   - Edit `package.json` (name, description, author, etc.)
   - Update this `README.md` as needed.

3. **Start the app locally:**

   ```bash
   npm start
   # or
   node wx.mjs
   ```

## Configuration

- All configuration is handled via environment variables in the `.env` file.
- See `.env.example` for required and optional variables.
- For scheduled weather reports, edit `cron.json` (see `cron.json.example`).

## Running as a Service (systemd)

1. Copy `wx.service` to `/usr/lib/systemd/system/wx.service`.
2. Edit the paths and user/group as needed.
3. Reload systemd and start the service:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable wx
   sudo systemctl start wx
   sudo systemctl status wx
   ```

## Docker

1. Build the Docker image:

   ```bash
   docker build -t wx .
   ```

2. Run the container:

   ```bash
   docker run --env-file .env wx
   ```

## Customization

### Commands

- Add new commands in the `commands/` directory.
- Each command has a `.json` definition (for Discord registration/localization) and a `.mjs` handler (for logic).

### Events

- Add or modify event handlers in the `events/` directory.
- Each Discord event (e.g., `ready`, `messageCreate`, `interactionCreate`) has its own handler file.

### Locales

- Add or update language files in the `locales/` directory.
- Localize command names, descriptions, and app responses.

## Testing

- Run tests with:

  ```bash
  npm test
  ```

- Add your tests in the `tests/` folder or alongside your code.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://purinton.us/logos/discord_96.png)](https://discord.gg/QSBxQnX7PF)[![Purinton Dev](https://purinton.us/logos/purinton_96.png)](https://discord.gg/QSBxQnX7PF)

**[Purinton Dev on Discord](https://discord.gg/QSBxQnX7PF)**

## License

[MIT © 2025 Russell Purinton](LICENSE)

## Links

- [GitHub Repo](https://github.com/purinton/wx)
- [GitHub Org](https://github.com/purinton)
- [GitHub Personal](https://github.com/rpurinton)
- [Discord](https://discord.gg/QSBxQnX7PF)
