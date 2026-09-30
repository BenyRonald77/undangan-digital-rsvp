import { randomBytes } from "crypto";

export const buatToken = (panjang = 16) =>
  randomBytes(panjang).toString("hex").slice(0, panjang);
