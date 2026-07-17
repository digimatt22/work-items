import { randomInt } from "node:crypto";

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%";
const ALL_CHARACTERS = `${UPPERCASE}${LOWERCASE}${DIGITS}${SYMBOLS}`;

function pick(characters: string): string {
  return characters.charAt(randomInt(characters.length));
}

export function generateTemporaryPassword(length = 20): string {
  if (length < 4) {
    throw new Error(
      "Temporary passwords must contain at least four characters.",
    );
  }

  const characters = [
    pick(UPPERCASE),
    pick(LOWERCASE),
    pick(DIGITS),
    pick(SYMBOLS),
  ];

  while (characters.length < length) {
    characters.push(pick(ALL_CHARACTERS));
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const otherIndex = randomInt(index + 1);
    const current = characters[index]!;
    characters[index] = characters[otherIndex]!;
    characters[otherIndex] = current;
  }

  return characters.join("");
}
