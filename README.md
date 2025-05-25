# BlockDays

![BlockDays Banner](assets/banner.png) <!-- Replace with actual banner image if available -->

> **BlockDays** is a modern, community-driven platform for discovering, organizing, and celebrating blockchain events. Designed for Persian-speaking audiences, BlockDays combines a sleek, accessible interface with robust event management and community features.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

BlockDays is your gateway to the world of blockchain events in Iran and the broader Farsi-speaking region. Whether you’re an enthusiast, organizer, or company, BlockDays helps you stay updated, connect, and grow in the blockchain ecosystem.

- **Language:** Persian (RTL)
- **Theme:** Night mode by default (DaisyUI)
- **Audience:** Blockchain event seekers, organizers, and sponsors

---

## Features

- ⚡ **Dynamic Landing Page**: Engaging homepage with sections for upcoming events, statistics, past events, galleries, sponsors, FAQs, and contact.
- 🗓️ **Event Management**: Browse and discover blockchain events in a beautiful, organized layout.
- 📊 **Stats & Impact**: View community and event statistics at a glance.
- 🖼️ **Galleries**: Image gallery from past events (video gallery coming soon).
- 🤝 **Sponsors**: Showcase of sponsors and partners.
- ❓ **FAQs**: Answers to frequently asked questions about events and participation.
- 📬 **Contact Form**: Easily reach out to the organizers.
- 🛡️ **Robust Error Handling**: User-friendly error boundaries and toast notifications.
- 🛠️ **Admin CMS (Experimental)**: Built-in admin panel for content and event management (`/admin` route).
- 🌙 **RTL & Theme Support**: Fully right-to-left with night theme and Persian typography.

---

## Demo

> **Live Preview:** [BlockDays Demo](https://ham3d-s.github.io/BlockDays) <!-- Replace with actual link if available -->

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
git clone https://github.com/Ham3d-s/BlockDays.git
cd BlockDays
npm install
# or
yarn install
```

### Development

Start the local development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Folder Structure

```
BlockDays/
├── public/
│   └── assets/           # Images, icons, and static files
├── src/
│   ├── components/       # React components (Header, Hero, Events, Gallery, etc.)
│   ├── contexts/         # React context providers (e.g., ThemeContext)
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # CSS and theme files
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # Landing page HTML
├── package.json
└── README.md
```

---

## Technologies Used

- **TypeScript** & **React** (Vite)
- **DaisyUI** + **Tailwind CSS** (for design and RTL support)
- **Vazirmatn Font** (Persian typography)
- **CSS/HTML** (custom tweaks)
- **Modern React Patterns** (Context API, Suspense, Error Boundaries, Lazy Loading)
- **Admin CMS** (React-based, optional)

---

## Contributing

We welcome contributions from the community!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -am 'Add awesome feature'`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a pull request

**For bug reports or feature requests, please use [GitHub Issues](https://github.com/Ham3d-s/BlockDays/issues).**

---

## License

[MIT](LICENSE)

---

## Contact

- **Project Lead:** [Ham3d-s](https://github.com/Ham3d-s)
- **Email:** [YourContactEmail@example.com](mailto:YourContactEmail@example.com) <!-- Replace with your email -->
- **Telegram:** [@yourtelegram](https://t.me/yourtelegram) <!-- Optional -->

---

## Special Notes

- The project is under active development; features and content may change.
- Persian language and RTL support are first-class citizens.
- For admin access, navigate to `/admin` (experimental).

---

Made with ❤️
