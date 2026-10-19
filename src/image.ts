import { renderSudokuSvg, type RenderOptions } from "./render.js";
import type { ReadonlyGrid } from "./types.js";
/** Node-only PNG rasterization. Install the optional @resvg/resvg-js peer first. */
export async function renderSudokuPng(
  grid: ReadonlyGrid,
  options: RenderOptions = {},
): Promise<Uint8Array> {
  const svg = renderSudokuSvg(grid, options);
  let module: typeof import("@resvg/resvg-js");
  try {
    module = await import("@resvg/resvg-js");
  } catch (error) {
    throw new Error(
      "PNG rendering requires the optional @resvg/resvg-js peer. Run npm install @resvg/resvg-js.",
      { cause: error },
    );
  }
  const renderer = new module.Resvg(svg, { font: { loadSystemFonts: true } });
  return new Uint8Array(renderer.render().asPng());
}
export { renderSudokuSvg } from "./render.js";
export type { RenderOptions, RenderTheme } from "./render.js";
