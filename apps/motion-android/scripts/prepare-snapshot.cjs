#!/usr/bin/env node
/**
 * Reproduce a WebView-83-compatible static bundle of the actual Motion Launcher UI.
 * Run from the monorepo after npm ci and npm run build:tv.
 */
const fs = require("node:fs");
const path = require("node:path");
const postcss = require("postcss");
const { transform } = require("lightningcss");
const root = path.resolve(__dirname, "../../..");
const from = path.join(root, "dist/tv-preview");
const dest = path.join(root, "apps/motion-android/app/src/main/assets/webroot");
if (!fs.existsSync(path.join(from, "index.html"))) {
  throw new Error("Missing TV bundle. Run npm run build:tv from repository root first.");
}
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(from, dest, { recursive: true });
const assets = path.join(dest, "assets");
const cssName = fs.readdirSync(assets).find(file => file.endsWith(".css"));
if (!cssName) throw new Error("Missing CSS bundle");
const cssPath = path.join(assets, cssName);
const old = fs.readFileSync(cssPath);
const transformed = transform({
  filename: cssPath, code: old, targets: { chrome: 83 << 16 },
  drafts: { nesting: true }, minify: false
}).code.toString();
const ast = postcss.parse(transformed);
ast.walkAtRules("layer", rule => {
  if (rule.nodes) rule.replaceWith(...rule.nodes.map(n => n.clone()));
  else rule.remove();
});
ast.walkAtRules("property", rule => rule.remove());
const legacy = fs.readFileSync(path.join(__dirname, "../legacy-webview.css"), "utf8");
fs.writeFileSync(cssPath, ast.toString() + "\n" + legacy, "utf8");
console.log("Motion real Android snapshot ready:", cssName, fs.statSync(cssPath).size, "bytes CSS");
