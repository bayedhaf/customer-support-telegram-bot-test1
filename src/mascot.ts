import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { InputFile } from "grammy";

export type MascotMood = "happy" | "thinking" | "celebrating" | "apologizing";

const assetRoot = resolve(process.env.MICHUU_MEDIA_DIR ?? "assets");

export function mascot(mood: MascotMood): InputFile | undefined {
  for (const extension of ["webp", "png", "jpg", "jpeg"]) {
    const path = resolve(assetRoot, `michuu-${mood}.${extension}`);
    if (existsSync(path)) return new InputFile(path);
  }
  return undefined;
}
