import { createInterface } from "node:readline/promises";

const input = createInterface({
  input: process.stdin,
  output: process.stdout
});

let name = await input.question("What is your name?");
console.log(`Hello ${name}`);

input.close();
