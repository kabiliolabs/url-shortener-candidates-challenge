import { randomBytes } from "node:crypto";

export const createCode = () => randomBytes(4).toString("base64url");
