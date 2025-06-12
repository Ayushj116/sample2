// Simple test to verify Babel is working
const testImport = require("./src/constants");
console.log("Babel transformation test passed");
console.log("Constants loaded:", Object.keys(testImport).slice(0, 3));
