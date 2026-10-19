const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const url = 'https://justsayless.xyz/contact';

QRCode.toString(url, {
  type: 'svg',
  margin: 4,
  errorCorrectionLevel: 'H',
  color: { dark: '#ffffff', light: '#000000' }
}).then(svg => {
  const html = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="SAYLESS - contact" />
        <meta property="og:title" content="SAYLESS" />
        <meta property="og:url" content="https://justsayless.xyz/qr/" />
        <title>SAYLESS</title>
        <style>
            @font-face {
                font-family: "Stencil Gothic";
                src: url("/assets/fonts/StencilGothic.ttf") format("truetype");
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                background-color: black;
                color: white;
                font-family: "Stencil Gothic", monospace;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 32px 24px;
                text-transform: uppercase;
            }

            h1 {
                font-size: clamp(2.5rem, 12vw, 6rem);
                letter-spacing: 0.18em;
                animation: flicker 2s infinite;
                text-align: center;
            }

            .circuit-divider {
                width: min(88vw, 520px);
                margin: 20px 0 24px;
            }

            .circuit-divider svg {
                display: block;
                width: 100%;
                height: auto;
            }

            .circuit-divider path,
            .circuit-divider circle {
                vector-effect: non-scaling-stroke;
            }

            @media (prefers-reduced-motion: reduce) {
                .circuit-divider .cd-pulse { display: none; }
            }

            .qr {
                width: min(78vw, 420px);
                height: min(78vw, 420px);
                margin: 0 0 20px;
            }

            .qr svg {
                width: 100%;
                height: 100%;
                display: block;
            }

            .caption {
                font-size: 12px;
                letter-spacing: 4px;
                color: #666;
                text-align: center;
            }

            @keyframes flicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
        </style>
    </head>
    <body>
        <h1>SAYLESS</h1>
        <div class="circuit-divider" aria-hidden="true">
            <svg viewBox="0 0 900 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cd-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="900" y2="0">
                        <stop offset="0" stop-color="#fff" />
                        <stop offset="0.45" stop-color="#999" />
                        <stop offset="1" stop-color="#3a3a3a" />
                    </linearGradient>
                    <mask id="cd-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="64">
                        <rect width="900" height="64" fill="url(#cd-fade)" />
                    </mask>
                    <pattern id="cd-stipple" width="4" height="4" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.6" fill="#fff" />
                        <circle cx="3" cy="3" r="0.5" fill="#fff" />
                    </pattern>
                    <linearGradient id="cd-band">
                        <stop offset="0" stop-color="#000" />
                        <stop offset="0.7" stop-color="#fff" />
                        <stop offset="1" stop-color="#000" />
                    </linearGradient>
                    <mask id="cd-pulse-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="64">
                        <rect x="-180" width="180" height="64" fill="url(#cd-band)">
                            <animateTransform
                                attributeName="transform"
                                type="translate"
                                values="0 0; 1080 0; 1080 0"
                                keyTimes="0; 0.5; 1"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </rect>
                    </mask>
                    <g id="cd-circuit">
                        <g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M0 12 H900" />
                            <path d="M62 12 L88 38 H170" />
                            <path d="M228 12 L248 32 H300 L318 50 H380" />
                            <path d="M420 12 L440 32 H480" />
                            <path d="M640 12 L656 28 H690" />
                            <path d="M97 50 H158" />
                            <path d="M322 58 H368" />
                            <path d="M662 36 H686" />
                            <circle cx="174.5" cy="38" r="4" />
                            <circle cx="484.5" cy="32" r="4" />
                        </g>
                        <g fill="#fff">
                            <circle cx="383" cy="50" r="3" />
                            <circle cx="693" cy="28" r="2.5" />
                            <circle cx="95" cy="50" r="2" />
                            <circle cx="659" cy="36" r="2" />
                            <circle cx="120" cy="30" r="1.6" />
                            <circle cx="130" cy="30" r="1.6" />
                            <circle cx="262" cy="50" r="1.6" />
                            <circle cx="272" cy="50" r="1.6" />
                            <circle cx="282" cy="50" r="1.6" />
                            <circle cx="600" cy="40" r="1.4" />
                            <circle cx="610" cy="40" r="1.4" />
                        </g>
                    </g>
                </defs>
                <g mask="url(#cd-mask)" opacity="0.35">
                    <g opacity="0.7">
                        <polygon points="62,12 88,12 88,38" fill="url(#cd-stipple)" />
                        <polygon points="300,32 318,50 340,50 322,32" fill="url(#cd-stipple)" />
                        <polygon points="14,30 40,30 40,44 28,44" fill="url(#cd-stipple)" opacity="0.6" />
                    </g>
                    <use href="#cd-circuit" />
                </g>
                <g class="cd-pulse" mask="url(#cd-pulse-mask)" opacity="0.5">
                    <use href="#cd-circuit" />
                </g>
            </svg>
        </div>
        <div class="qr">${svg}</div>
        <div class="caption">JUSTSAYLESS.XYZ / CONTACT</div>
    </body>
</html>
`;
  const out = path.resolve(__dirname, 'index.html');
  fs.writeFileSync(out, html);
  console.log('wrote', out, html.length, 'bytes');
});
