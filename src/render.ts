import {
  assertGrid,
  candidatesUnchecked,
  hasGridShape,
  validPosition,
} from "./grid.js";
import type { Position, ReadonlyGrid } from "./types.js";
export type RenderTheme = "paper" | "midnight" | "minimal";
export interface RenderOptions {
  /** Square image size, 256–2048 pixels. Default 900. */ size?: number;
  theme?: RenderTheme;
  title?: string;
  subtitle?: string;
  /** Original puzzle; values added later use the accent color. */ givens?: ReadonlyGrid;
  /** Render locally legal pencil marks in blank cells. */ showCandidates?: boolean;
  /** Emphasize the hint cell without silently filling it. */ hint?: {
    position: Position;
    value: number;
  };
  highlights?: Position[];
}
const palettes = {
  paper: {
    background: "#F5F2EA",
    board: "#FFFEFA",
    ink: "#17384A",
    added: "#007F78",
    light: "#C4CEC9",
    line: "#264958",
    note: "#62766F",
    highlight: "#DDEFE5",
    hint: "#F8D88C",
  },
  midnight: {
    background: "#101F2B",
    board: "#172C3A",
    ink: "#F1F4EE",
    added: "#7AD7C5",
    light: "#38505C",
    line: "#A9C0CB",
    note: "#9CB5BE",
    highlight: "#234E55",
    hint: "#775A2F",
  },
  minimal: {
    background: "#FFFFFF",
    board: "#FFFFFF",
    ink: "#111111",
    added: "#333333",
    light: "#CCCCCC",
    line: "#111111",
    note: "#666666",
    highlight: "#EEEEEE",
    hint: "#E0E0E0",
  },
};
// Original single-stroke numeral paths. No font, external URL or bitmap required for digits.
const digits = [
  "",
  "M8 9 L14 3 L14 33 M7 33 H21",
  "M3 10 C3 0 23 0 23 10 C23 18 5 23 3 33 H24",
  "M3 6 C10 0 23 2 23 10 C23 16 15 18 10 18 M10 18 C28 15 29 33 14 34 C8 34 4 32 2 29",
  "M19 34 V3 L2 24 H26",
  "M24 3 H5 L3 18 C23 10 31 31 16 34 C9 35 5 33 2 30",
  "M23 5 C9 -2 1 12 2 24 C2 38 25 38 25 24 C25 12 4 13 3 23",
  "M2 3 H26 L10 34",
  "M14 18 C-2 14 1 1 14 2 C28 1 31 14 14 18 C-4 22 0 35 14 34 C29 35 33 22 14 18",
  "M23 13 C22 27 17 39 4 32 M23 13 C23 -2 2 -2 2 12 C2 25 24 25 23 13",
];
const escapeXml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
function numeral(
  value: number,
  x: number,
  y: number,
  height: number,
  color: string,
  weight = 2.5,
): string {
  const scale = height / 38;
  return `<path d="${digits[value]}" transform="translate(${x - 14 * scale} ${y - 18 * scale}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
/** Self-contained SVG; no scripts, fonts, image URLs or HTML supplied by the caller are embedded. */
export function renderSudokuSvg(
  grid: ReadonlyGrid,
  options: RenderOptions = {},
): string {
  assertGrid(grid);
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Render options must be an object");
  const size = options.size ?? 900;
  if (!Number.isInteger(size) || size < 256 || size > 2048)
    throw new RangeError("size must be an integer from 256 to 2048");
  const theme = options.theme ?? "paper";
  if (!Object.hasOwn(palettes, theme))
    throw new TypeError("Unknown render theme");
  const p = palettes[theme];
  for (const [key, limit] of [
    ["title", 60],
    ["subtitle", 100],
  ] as const) {
    if (
      options[key] !== undefined &&
      (typeof options[key] !== "string" ||
        options[key]!.length > limit ||
        /[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u.test(
          options[key]!,
        ))
    )
      throw new TypeError(
        `${key} must be a short XML-safe string (maximum ${limit} characters)`,
      );
  }
  if (
    options.showCandidates !== undefined &&
    typeof options.showCandidates !== "boolean"
  )
    throw new TypeError("showCandidates must be boolean");
  if (options.givens !== undefined) {
    if (
      !hasGridShape(options.givens) ||
      options.givens.some((row, r) =>
        row.some((v, c) => v !== 0 && v !== grid[r][c]),
      )
    )
      throw new TypeError("givens must agree with the displayed grid");
  }
  const highlights = options.highlights ?? [];
  if (
    !Array.isArray(highlights) ||
    highlights.length > 81 ||
    !highlights.every(validPosition)
  )
    throw new TypeError("highlights must contain at most 81 valid positions");
  if (options.hint !== undefined) {
    const hint = options.hint;
    if (
      !hint ||
      !validPosition(hint.position) ||
      !Number.isInteger(hint.value) ||
      !candidatesUnchecked(grid, hint.position.row, hint.position.col).includes(
        hint.value,
      )
    )
      throw new TypeError(
        "hint must contain a locally legal value for an empty cell",
      );
  }
  const hasHeader = Boolean(options.title || options.subtitle),
    top = hasHeader ? 146 : 54,
    left = hasHeader ? 96 : 54;
  const boardSize = hasHeader ? 708 : 792,
    cell = boardSize / 9;
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 900 900" role="img" aria-labelledby="sudoku-title sudoku-description">`,
    `<title id="sudoku-title">${escapeXml(options.title || "Sudoku puzzle")}</title>`,
    `<desc id="sudoku-description">${grid.map((row) => row.map((v) => v || ".").join(" ")).join("; ")}${options.hint ? `. Hint: row ${options.hint.position.row + 1}, column ${options.hint.position.col + 1}, value ${options.hint.value}` : ""}</desc>`,
    `<rect width="900" height="900" rx="24" fill="${p.background}"/>`,
  ];
  if (options.title)
    out.push(
      `<text x="450" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.min(34, 1200 / options.title.length)}" font-weight="600" fill="${p.ink}">${escapeXml(options.title)}</text>`,
    );
  if (options.subtitle)
    out.push(
      `<text x="450" y="105" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.min(17, 1200 / options.subtitle.length)}" fill="${p.note}">${escapeXml(options.subtitle)}</text>`,
    );
  out.push(
    `<rect x="${left}" y="${top}" width="${boardSize}" height="${boardSize}" fill="${p.board}"/>`,
  );
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const x = left + c * cell,
        y = top + r * cell,
        value = grid[r][c],
        isHint =
          options.hint?.position.row === r && options.hint.position.col === c;
      if (isHint || highlights.some((pos) => pos.row === r && pos.col === c))
        out.push(
          `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${isHint ? p.hint : p.highlight}"/>`,
        );
      if (value)
        out.push(
          numeral(
            value,
            x + cell / 2,
            y + cell / 2,
            cell * 0.45,
            options.givens && options.givens[r][c] === 0 ? p.added : p.ink,
          ),
        );
      else if (isHint)
        out.push(
          numeral(
            options.hint!.value,
            x + cell / 2,
            y + cell / 2,
            cell * 0.45,
            p.ink,
          ),
        );
      else if (options.showCandidates)
        for (const n of candidatesUnchecked(grid, r, c))
          out.push(
            numeral(
              n,
              x + ((((n - 1) % 3) + 0.5) * cell) / 3,
              y + ((Math.floor((n - 1) / 3) + 0.5) * cell) / 3,
              cell * 0.17,
              p.note,
              2,
            ),
          );
    }
  for (let i = 0; i <= 9; i++) {
    const offset = i * cell,
      major = i % 3 === 0,
      color = major ? p.line : p.light,
      width = major ? 2.8 : 0.8;
    out.push(
      `<path d="M${left + offset} ${top} V${top + boardSize} M${left} ${top + offset} H${left + boardSize}" stroke="${color}" stroke-width="${width}" fill="none"/>`,
    );
  }
  out.push("</svg>");
  return out.join("");
}
