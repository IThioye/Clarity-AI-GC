# Clarity Orb – Exact SVG Recreation

This folder contains `clarity-orb.svg`, a pixel-faithful vector recreation of the Clarity AI orb at `800×800` using only SVG primitives (no raster images).

Files
- clarity-orb.svg – static SVG, viewBox `0 0 800 800`, grouped layers:
  - Halo, RimOuter, RimWarm, InnerClip, LobeTop, LobeBottom, SCurveHighlight, SpecularTop, InnerRim
- React components (at `components/`):
  - `ClarityOrbSVG.tsx` and `ClarityOrbExact.tsx` – JSX versions that inline the same SVG structure

How to verify visually
1) Ensure you have the reference at `information/logo.png`.
2) Open the test page below in your browser console or an editor with live server.
   - Create a scratch HTML and place the following snippet:

```html
<!doctype html>
<html>
  <body style="background:#111;margin:0;display:grid;place-items:center;height:100vh">
    <div style="position:relative;width:800px;height:800px">
      <img src="../information/logo.png" width="800" height="800" style="opacity:.5;position:absolute;inset:0;"/>
      <img src="../clarity-ai/public/brand/clarity-orb.svg" width="800" height="800" style="position:absolute;inset:0;mix-blend-mode:normal"/>
    </div>
  </body>
</html>
```
3) Toggle the PNG opacity between `0.5` and `0` and look for any edge deviation > 1 px along the rim and S-curve.

Where to tweak
- Colors: gradient stops are defined in `TopLobe`, `BottomLobe`, `WarmRim` definitions inside the SVG `<defs>`.
- Bézier curves: adjust the `C` control points in the `LobeTop`, `LobeBottom`, and `SCurveHighlight` paths to micro-align.
- Blur radii: halo uses filter `HaloBlur (stdDeviation=40)`, soft highlights use `SoftBlur (20)`.

Use in app
- Navbar already points to `/brand/clarity-orb.svg`.
- For inline usage in React (no <img>), import `ClarityOrbSVG` and render `<ClarityOrbSVG width={200} height={200} />`.
