# ATELIER BYTE

A French/Arabic website demo for a fictional computer and phone repair studio in Marrakech. React, Vite, TypeScript, and an original procedural Three.js repair bench bring the “Inside the repair” concept to life. No external device models or branded assets are used.

## Install and run

Use Node.js 22.12 or newer and npm. From the repository root:

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Open the address printed by Vite. On a fresh checkout without a lockfile, use `npm install` instead of `npm ci`.

In this Codex cloud workspace, keep npm’s cache in a writable location:

```sh
cd /workspace/3D-repair
npm ci --cache /workspace/.cache/npm --no-audit --no-fund
```

```sh
npm run check
npm run build
npm run preview -- --host 0.0.0.0
```

`check` runs the TypeScript checker; `build` checks types and generates the production site in `dist/`. `preview` serves that production build locally. Stop either server with Ctrl+C.

## Shop details

Edit **`src/config.ts`** to change the shop name, French/Arabic location label, address, opening hours, phone, and WhatsApp number. Replace these placeholders before publishing:

- `YOUR_ADDRESS`
- `YOUR_OPENING_HOURS`
- `YOUR_PHONE_NUMBER`
- `YOUR_WHATSAPP_NUMBER`

Set `whatsappNumber` to your actual international phone number including its country code. The number must contain 8–15 digits, begin with a nonzero digit, and may include a leading `+`, spaces, parentheses, periods, or hyphens. The app formats it for `wa.me`. Do not include a local dialing prefix in place of the country code. Shop details are public frontend configuration; never put tokens or other secrets here.

Until a valid WhatsApp number is configured, the main contact actions lead visitors to the repair request form and the form explains that the number still needs configuration. It does not open a fabricated contact number.

French and Arabic page copy, service descriptions, form messages, and device labels live in **`src/lib/content.ts`**. French is the initial language. The language switch updates the content and the document’s language and reading direction.

## Requests and scene behavior

The request form checks the visitor’s name, device type, model, and problem description. A valid request opens WhatsApp with a prefilled message. The visitor sends the message in WhatsApp. This is a frontend demo: there is no form server, database, payment, booking confirmation, or server-side request submission.

The scene is lazy-loaded and uses procedural geometry. Scrolling separates the devices; selecting a service opens the devices and highlights the matching components. The assembled/exploded controls also let visitors explore without scrolling. Desktop pointer movement gently adjusts the camera. Mobile uses a lighter scene. The scene respects `prefers-reduced-motion` by keeping the device assembled and suppressing camera movement. A designed fallback preserves the service information and contact actions when WebGL is unavailable. Geometry, display artwork, reflections, and fonts are local; no remote model or texture is needed.

The data-recovery copy describes assessment and possible recovery; results are not guaranteed. Replace the fictional studio’s details and review all copy before using the demo for a real business.
