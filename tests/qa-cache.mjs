// tests/qa-cache.mjs — comprobar que ningún módulo se sirve sin versión.
//
//   python3 -m http.server 8125 &
//   node tests/qa-cache.mjs
//
// El navegador cachea cada archivo por separado, así que puede servir un
// index.html nuevo con un styles.js viejo: la página parece actualizada y los
// prompts son los de ayer. Pasó de verdad y costó una noche. El mapa de
// importaciones de index.html le pone versión a todos los módulos; esto
// verifica que no se quede ninguno fuera al añadir un archivo nuevo.

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { findStyle, DEFAULT_STYLE_ID } from "../styles.js";
// La versión sale del propio index.html: así la prueba no hay que tocarla en
// cada publicación, y lo que comprueba es que TODOS los módulos lleven la misma.
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const VERSION = html.match(/\.js\?v=(\d+)/)[1];
const marca = `?v=${VERSION}`;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox","--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage({ viewport: { width: 1440, height: 940 } });
const pedidos = [];
p.on("request", r => { const u = r.url(); if (u.endsWith(".js") || u.includes(".js?")) pedidos.push(u.split("/").pop()); });
const errs=[]; p.on("pageerror",e=>errs.push(String(e))); p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
await p.goto("http://localhost:8125/?demo", { waitUntil: "load" });
await p.waitForTimeout(2500);
console.log(`módulos pedidos (versión ${VERSION}):`);
pedidos.forEach(u => console.log("  ", u, u.includes(marca) ? "✓ con versión" : "✗ SIN VERSIÓN"));
console.log("\ntodos versionados:", pedidos.every(u=>u.includes(marca)));
await p.click("#key-btn"); await p.waitForTimeout(300);
const prompt = await p.inputValue("#prompt-activo");
console.log("prompt cargado :", prompt.slice(0,58)+"…");
console.log("es el de fábrica:", prompt === findStyle(DEFAULT_STYLE_ID).prompt);
console.log("errores:", errs.length?errs:"ninguno");
await b.close();
