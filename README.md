# SIGLAT Admin App

A SvelteKit-based administration panel for the SIGLAT emergency response system.

## Features

- 🔐 Admin login interface
- 🎨 Tailwind CSS styling via CDN
- ⚡ Built with SvelteKit and TypeScript
- 🔧 Environment-based configuration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Siglat/Admin-App.git
   cd Admin-App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your API URL:
   ```
   PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── routes/           # SvelteKit routes
│   ├── +layout.svelte # Root layout
│   └── +page.svelte   # Login page
├── lib/              # Shared components and utilities
└── app.html          # HTML template
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_API_URL` | SIGLAT API backend URL | `http://localhost:5000` |

## Building for Production

```bash
npm run build
```

The built app will be in the `build/` directory.

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript  
- **Styling**: Tailwind CSS (CDN)
- **Build Tool**: Vite

## License

This project is part of the SIGLAT emergency response system.