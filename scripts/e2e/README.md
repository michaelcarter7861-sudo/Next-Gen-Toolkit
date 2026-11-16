# Browser acceptance suite

Not run in the audit environment: no browser binary could be installed there
(Playwright CDN unreachable, `libnss3` unavailable, Debian mirrors blocked).
This suite is the reproducible substitute the owner or CI can run.

## Run it

```bash
npm ci
npm run build
npx playwright install chromium        # needs network access
node scripts/e2e/run.mjs               # writes audit/screenshots/*.png + e2e-results.json
```

`BASE_URL` targets a deployed site instead of the local server; `BROWSER=firefox|webkit`
switches engines.

## Fixtures

The image-compression scenario expects `scripts/e2e/fixtures/photos/sample-photo.jpg`.
Generate one locally (any 1600×1200 JPEG above 200 KB works):

```bash
node -e "const {createCanvas}=require('@napi-rs/canvas');const c=createCanvas(1600,1200);const x=c.getContext('2d');const d=x.getImageData(0,0,1600,1200);for(let i=0;i<d.data.length;i+=4){d.data[i]=Math.random()*255;d.data[i+1]=Math.random()*255;d.data[i+2]=Math.random()*255;d.data[i+3]=255;}x.putImageData(d,0,0);require('fs').mkdirSync('scripts/e2e/fixtures/photos',{recursive:true});require('fs').writeFileSync('scripts/e2e/fixtures/photos/sample-photo.jpg',c.toBuffer('image/jpeg',95));"
```

## Scenarios covered

Direct navigation to 19 routes · refresh on a nested route · trust pages with
JavaScript disabled · preview-tool honesty · image compression with MIME/extension
consistency · dark-mode persistence · command-palette focus trap and Escape ·
horizontal overflow at 320/768/1440 px · console errors.

## Not covered yet

PDF rasteriser in a browser (engine verified in Node instead), OCR (preview tool),
file-picker camera behaviour on real phones, and Safari/WebKit `toBlob` fallbacks.
