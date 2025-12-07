import fs from "fs";
import path from "path";

// Fix package.json
const packagePath = path.join(__dirname, "package.json");
import packageJson from "packagePath";

// Add missing scripts
packageJson.scripts = {
  ...packageJson.scripts,
  fix: "tsc --noEmit && npm run lint",
  clean: "rm -rf dist",
  prebuild: "npm run clean",
};

// Ensure all required dev dependencies
const requiredDevDeps = {
  "@types/cookie-parser": "^1.4.7",
  "@types/compression": "^1.7.5",
  "@types/bcryptjs": "^2.4.6",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/cors": "^2.8.16",
  "@types/node": "^20.8.3",
  "@types/express": "^4.17.20",
  typescript: "^5.2.2",
  nodemon: "^3.0.1",
  "ts-node": "^10.9.1",
  "@typescript-eslint/eslint-plugin": "^6.8.0",
  "@typescript-eslint/parser": "^6.8.0",
  eslint: "^8.51.0",
  prettier: "^3.0.3",
};

packageJson.devDependencies = {
  ...packageJson.devDependencies,
  ...requiredDevDeps,
};

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log("Updated package.json");

// Create .env if it doesn't exist
const envExamplePath = path.join(__dirname, ".env.example");
const envPath = path.join(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log("Created .env file from .env.example");
}

console.log("\nRun these commands:");
console.log("1. npm install");
console.log("2. npm run build");
console.log("3. npm run dev");
