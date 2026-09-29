import { readFileSync, writeFileSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const mode = process.argv[2];
if (mode !== "turbo" && mode !== "bun") {
	console.error("Usage: bun scripts/switch-workspace.ts <turbo|bun>");
	process.exit(1);
}

// --- package.json scripts ---
const pkgPath = resolve(ROOT, "package.json");
const raw = readFileSync(pkgPath, "utf-8");
const pkg = JSON.parse(raw);

const indentMatch = raw.match(/^[\t ]+/m);
const indent = indentMatch ? indentMatch[0] : "\t";

const modeScripts: Record<string, string> = JSON.parse(
	readFileSync(resolve(__dirname, `workspace-scripts.${mode}.json`), "utf-8"),
);

pkg.scripts = {
	...modeScripts,
	"switch:turbo": "bun scripts/switch-workspace.ts turbo",
	"switch:bun": "bun scripts/switch-workspace.ts bun",
};

writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + "\n");

// --- turbo.json + vercel.json ---
const managedFiles: Array<{ src: string; dest: string }> = [
	{ src: resolve(__dirname, "turbo.template.json"), dest: resolve(ROOT, "turbo.json") },
	{ src: resolve(__dirname, "vercel.template.json"), dest: resolve(ROOT, "vercel.json") },
];

for (const { src, dest } of managedFiles) {
	const name = dest.split("/").pop();
	if (mode === "turbo") {
		copyFileSync(src, dest);
		console.log(`Created ${name}`);
	} else if (existsSync(dest)) {
		rmSync(dest);
		console.log(`Removed ${name}`);
	}
}

const label = mode === "turbo" ? "Turborepo" : "Bun workspace";
console.log(`Switched to ${label} mode.`);
if (mode === "turbo") {
	console.log("Tip: run 'bun install' if turbo is not yet installed.");
}
