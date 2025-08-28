// scripts/convertPostalCodes.js
import fs from "fs";
import readline from "readline";

const inputFile = "./ES.txt"; // ruta al archivo descargado
const outputFile = "./postalCodes.json";

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  crlfDelay: Infinity,
});

const postalData = {};

rl.on("line", (line) => {
  const parts = line.split("\t"); // separado por tab
  const postalCode = parts[1];
  const lat = parseFloat(parts[9]);
  const lng = parseFloat(parts[10]);

  postalData[postalCode] = { lat, lng };
});

rl.on("close", () => {
  fs.writeFileSync(outputFile, JSON.stringify(postalData, null, 2));
  console.log("Archivo JSON creado:", outputFile);
});
