# Web

Frontend for the system, built with React, TypeScript, Vite, and Tailwind CSS.

## Requirements

- Node.js 22+
- npm
- Backend running at `http://127.0.0.1:4000` for local development

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

## Run Locally

```bash
npm run dev
```

The app runs at:

```text
http://localhost:3000
```

## Type Check

```bash
npm run lint
```

## Production Build

```bash
npm run build
```

The production build is generated in the `dist/` directory.

## Docker

Build image:

```bash
docker build -t nauts-web:latest --build-arg VITE_API_URL=http://localhost:4000 -f Dockerfile .
```

Or run the PowerShell script:

```powershell
.\build_image.ps1
```
