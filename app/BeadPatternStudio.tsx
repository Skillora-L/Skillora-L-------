"use client";

import type { ChangeEvent, DragEvent, PointerEvent, WheelEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Rgb = [number, number, number];

type BeadColor = {
  code: string;
  name: string;
  hex: string;
  rgb: Rgb;
};

type PaletteDefinition = {
  label: string;
  maker: string;
  colors: BeadColor[];
};

type PatternStat = {
  color: BeadColor;
  count: number;
  symbol: string;
  percent: number;
};

type PatternResult = {
  columns: number;
  rows: number;
  cells: Array<BeadColor | null>;
  stats: PatternStat[];
  emptyCells: number;
  totalBeads: number;
  paletteLabel: string;
};

type SourceImage = {
  url: string;
  name: string;
  width: number;
  height: number;
  isDemo: boolean;
};

type BackgroundMode = "auto" | "white" | "ink" | "transparent" | "custom";

const MIN_SIZE = 12;
const MAX_SIZE = 260;
const MIN_GRID_BEADS = 400;
const MAX_GRID_BEADS = MAX_SIZE * MAX_SIZE;
const MIN_PREVIEW_CELL_SIZE = 4;
const MAX_PREVIEW_CELL_SIZE = 48;

const PALETTES = {
  atelier: {
    label: "工坊综合色卡",
    maker: "PB",
    colors: [
      bead("PB-001", "白瓷", "#f8f8f1"),
      bead("PB-002", "暖白", "#fff4dc"),
      bead("PB-003", "柠檬黄", "#ffd93d"),
      bead("PB-004", "金盏黄", "#f5b642"),
      bead("PB-005", "蜜橙", "#f47c35"),
      bead("PB-006", "珊瑚红", "#f45b4f"),
      bead("PB-007", "正红", "#d92d2b"),
      bead("PB-008", "莓果", "#a82743"),
      bead("PB-009", "浅粉", "#f6a5b8"),
      bead("PB-010", "玫瑰粉", "#de5f91"),
      bead("PB-011", "薰衣草", "#b8a4e3"),
      bead("PB-012", "紫罗兰", "#7656b7"),
      bead("PB-013", "夜蓝", "#26306f"),
      bead("PB-014", "湖蓝", "#1b75bc"),
      bead("PB-015", "晴空蓝", "#6ab8e8"),
      bead("PB-016", "冰蓝", "#b7e3ed"),
      bead("PB-017", "薄荷", "#93d6bf"),
      bead("PB-018", "孔雀绿", "#00a384"),
      bead("PB-019", "草绿", "#63ad43"),
      bead("PB-020", "橄榄绿", "#5f7f3a"),
      bead("PB-021", "米杏", "#e8c798"),
      bead("PB-022", "驼色", "#b98252"),
      bead("PB-023", "陶土", "#925235"),
      bead("PB-024", "深棕", "#4c2f25"),
      bead("PB-025", "浅灰", "#d8d9d4"),
      bead("PB-026", "中灰", "#8e938c"),
      bead("PB-027", "炭黑", "#202225"),
      bead("PB-028", "桃肤", "#f1b58f"),
      bead("PB-029", "鲑红", "#ee8771"),
      bead("PB-030", "水绿", "#68c9c2"),
      bead("PB-031", "青瓷", "#3da0a2"),
      bead("PB-032", "靛青", "#4152a3"),
      bead("PB-033", "葡萄", "#9c4aa2"),
      bead("PB-034", "荧光绿", "#b5d943"),
      bead("PB-035", "芥末黄", "#d6b034"),
      bead("PB-036", "墨绿", "#244c3e"),
    ],
  },
  hama: {
    label: "Hama Midi 参考",
    maker: "H",
    colors: [
      bead("H-01", "White", "#f7f7f2"),
      bead("H-02", "Cream", "#f4e7c4"),
      bead("H-03", "Yellow", "#f6cf36"),
      bead("H-04", "Orange", "#ee812f"),
      bead("H-05", "Red", "#c92f2f"),
      bead("H-06", "Pink", "#e78aa8"),
      bead("H-07", "Purple", "#7651a6"),
      bead("H-08", "Blue", "#244f9e"),
      bead("H-09", "Light Blue", "#64a9dc"),
      bead("H-10", "Green", "#3d9d48"),
      bead("H-11", "Light Green", "#8ac657"),
      bead("H-12", "Brown", "#7b5135"),
      bead("H-17", "Grey", "#8a8f8a"),
      bead("H-18", "Black", "#1b1b1d"),
      bead("H-20", "Reddish Brown", "#91453a"),
      bead("H-21", "Light Brown", "#bb8657"),
      bead("H-22", "Peach", "#e9b48d"),
      bead("H-26", "Beige", "#d8ba82"),
      bead("H-28", "Claret", "#8d2b50"),
      bead("H-29", "Burgundy", "#5d253f"),
      bead("H-30", "Turquoise", "#2aa8ad"),
      bead("H-31", "Light Turquoise", "#77d2d3"),
      bead("H-32", "Neon Yellow", "#e7ee4a"),
      bead("H-33", "Neon Orange", "#ff8b34"),
      bead("H-34", "Pastel Pink", "#f5bed1"),
      bead("H-35", "Pastel Blue", "#afd6ef"),
      bead("H-36", "Pastel Green", "#b8dc8d"),
      bead("H-37", "Plum", "#7c4f77"),
      bead("H-38", "Olive", "#687b45"),
      bead("H-43", "Pastel Yellow", "#f6e68b"),
      bead("H-44", "Pastel Red", "#ef7b73"),
      bead("H-46", "Pastel Purple", "#b49bd5"),
    ],
  },
  perler: {
    label: "Perler 参考",
    maker: "P",
    colors: [
      bead("P-001", "White", "#f9f8f0"),
      bead("P-002", "Creme", "#f3dfb8"),
      bead("P-003", "Yellow", "#f6cf26"),
      bead("P-004", "Cheddar", "#f39c2c"),
      bead("P-005", "Orange", "#ea682c"),
      bead("P-006", "Tomato", "#cf352f"),
      bead("P-007", "Cranapple", "#8c2639"),
      bead("P-008", "Bubblegum", "#ef9dbc"),
      bead("P-009", "Hot Coral", "#ef5c70"),
      bead("P-010", "Purple", "#6e4aa2"),
      bead("P-011", "Parrot Green", "#59b947"),
      bead("P-012", "Kiwi Lime", "#9bcc42"),
      bead("P-013", "Dark Green", "#23623e"),
      bead("P-014", "Toothpaste", "#6cd0bf"),
      bead("P-015", "Turquoise", "#00a3ad"),
      bead("P-016", "Light Blue", "#6ab6e8"),
      bead("P-017", "Blueberry", "#3856a6"),
      bead("P-018", "Dark Blue", "#26356f"),
      bead("P-019", "Tan", "#c89a62"),
      bead("P-020", "Rust", "#a75531"),
      bead("P-021", "Brown", "#5b3828"),
      bead("P-022", "Light Grey", "#cfd2cc"),
      bead("P-023", "Grey", "#868b87"),
      bead("P-024", "Black", "#202124"),
      bead("P-025", "Peach", "#ecb189"),
      bead("P-026", "Sand", "#dac594"),
      bead("P-027", "Blush", "#f4c1b6"),
      bead("P-028", "Lavender", "#b4a0d8"),
      bead("P-029", "Plum", "#874c8f"),
      bead("P-030", "Prickly Pear", "#7aa23c"),
      bead("P-031", "Gold", "#d7a928"),
      bead("P-032", "Silver", "#bfc3c0"),
    ],
  },
  artkal: {
    label: "Artkal C 参考",
    maker: "C",
    colors: [
      bead("C001", "White", "#f8f8f2"),
      bead("C002", "Black", "#202124"),
      bead("C003", "Light Grey", "#d4d5d0"),
      bead("C004", "Grey", "#8a8e8a"),
      bead("C005", "Dark Grey", "#4e5351"),
      bead("C006", "Cream", "#f1e0b2"),
      bead("C007", "Sand", "#d6b276"),
      bead("C008", "Brown", "#67412f"),
      bead("C009", "Dark Brown", "#3e2a22"),
      bead("C010", "Yellow", "#f7d43d"),
      bead("C011", "Orange", "#ef7d31"),
      bead("C012", "Red", "#cb2d2f"),
      bead("C013", "Wine Red", "#84233a"),
      bead("C014", "Pink", "#e986a9"),
      bead("C015", "Light Pink", "#f5becf"),
      bead("C016", "Purple", "#6f50a6"),
      bead("C017", "Lavender", "#ad9bd8"),
      bead("C018", "Blue", "#2756a4"),
      bead("C019", "Sky Blue", "#69b8e3"),
      bead("C020", "Mint Blue", "#9bd9df"),
      bead("C021", "Teal", "#169ca3"),
      bead("C022", "Green", "#37984a"),
      bead("C023", "Light Green", "#8fc65a"),
      bead("C024", "Olive", "#63773c"),
      bead("C025", "Peach", "#edb18b"),
      bead("C026", "Coral", "#ef776d"),
      bead("C027", "Magenta", "#c34f91"),
      bead("C028", "Indigo", "#323b82"),
      bead("C029", "Aqua", "#55c7c7"),
      bead("C030", "Lime", "#b1d64b"),
      bead("C031", "Mustard", "#d4a634"),
      bead("C032", "Brick", "#974331"),
    ],
  },
} satisfies Record<string, PaletteDefinition>;

type PaletteId = keyof typeof PALETTES;

const BACKGROUNDS: Record<BackgroundMode, { label: string; hex: string }> = {
  auto: { label: "智能留白", hex: "#ffffff" },
  white: { label: "白底", hex: "#ffffff" },
  ink: { label: "黑底", hex: "#202124" },
  transparent: { label: "透明留空", hex: "#ffffff" },
  custom: { label: "自定", hex: "#ffffff" },
};

function bead(code: string, name: string, hex: string): BeadColor {
  return { code, name, hex, rgb: hexToRgb(hex) };
}

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function luminance(rgb: Rgb) {
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

function colorDistance(a: Rgb, b: Rgb) {
  const rMean = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return (
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
}

function nearestColor(rgb: Rgb, palette: BeadColor[]) {
  let best = palette[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const color of palette) {
    const distance = colorDistance(rgb, color.rgb);
    if (distance < bestDistance) {
      best = color;
      bestDistance = distance;
    }
  }

  return best;
}

function symbolForIndex(index: number) {
  const symbols = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (index < symbols.length) {
    return symbols[index];
  }
  return String(index + 1);
}

function shortColorCode(code: string) {
  return code.replace(/^([A-Z]+)-?0*/, "$1");
}

function incrementStat(
  stats: Map<string, { color: BeadColor; count: number }>,
  color: BeadColor,
) {
  const current = stats.get(color.code);
  if (current) {
    current.count += 1;
  } else {
    stats.set(color.code, { color, count: 1 });
  }
}

function estimateBackground(data: Uint8ClampedArray, columns: number, rows: number): Rgb {
  const samples: Rgb[] = [];
  const cornerSize = Math.min(4, columns, rows);
  const cornerStarts = [
    [0, 0],
    [Math.max(0, columns - cornerSize), 0],
    [0, Math.max(0, rows - cornerSize)],
    [Math.max(0, columns - cornerSize), Math.max(0, rows - cornerSize)],
  ];

  for (const [startX, startY] of cornerStarts) {
    for (let y = startY; y < startY + cornerSize; y += 1) {
      for (let x = startX; x < startX + cornerSize; x += 1) {
        const index = (y * columns + x) * 4;
        if (data[index + 3] > 16) {
          samples.push([data[index], data[index + 1], data[index + 2]]);
        }
      }
    }
  }

  if (!samples.length) {
    return [255, 255, 255];
  }

  const channels = [0, 1, 2].map((channel) =>
    samples.map((sample) => sample[channel]).sort((a, b) => a - b),
  );
  const midpoint = Math.floor(samples.length / 2);
  return [channels[0][midpoint], channels[1][midpoint], channels[2][midpoint]];
}

function saturation(rgb: Rgb) {
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  return max === 0 ? 0 : (max - min) / max;
}

function isBackgroundCandidate(rgb: Rgb, alpha: number, background: Rgb, sharpness: number) {
  const strength = sharpness / 100;
  if (alpha < 0.28) {
    return true;
  }

  const backgroundIsLight = luminance(background) > 0.82 && saturation(background) < 0.18;
  const nearThreshold = backgroundIsLight ? 7800 + strength * 7600 : 5200 + strength * 4200;
  const nearBackground = colorDistance(rgb, background) < nearThreshold;
  const nearPaperWhite =
    backgroundIsLight &&
    luminance(rgb) > 0.9 - strength * 0.08 &&
    saturation(rgb) < 0.12 + strength * 0.08;
  return nearBackground || nearPaperWhite;
}

function sharpenSample(rgb: Rgb, sharpness: number): Rgb {
  const strength = sharpness / 100;
  const contrast = 1 + strength * 1.25;
  const saturationBoost = 1 + strength * 0.9;
  const levels = Math.max(5, Math.round(18 - strength * 11));
  const contrasted: Rgb = rgb.map((channel) =>
    clamp((channel - 128) * contrast + 128, 0, 255),
  ) as Rgb;
  const average = (contrasted[0] + contrasted[1] + contrasted[2]) / 3;

  return contrasted.map((channel) => {
    const saturated = clamp(average + (channel - average) * saturationBoost, 0, 255);
    return Math.round((Math.round((saturated / 255) * (levels - 1)) / (levels - 1)) * 255);
  }) as Rgb;
}

function floodConnectedBackground(
  candidates: boolean[],
  columns: number,
  rows: number,
) {
  const connected = new Array<boolean>(candidates.length).fill(false);
  const queue: number[] = [];

  const enqueue = (index: number) => {
    if (candidates[index] && !connected[index]) {
      connected[index] = true;
      queue.push(index);
    }
  };

  for (let x = 0; x < columns; x += 1) {
    enqueue(x);
    enqueue((rows - 1) * columns + x);
  }
  for (let y = 0; y < rows; y += 1) {
    enqueue(y * columns);
    enqueue(y * columns + columns - 1);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % columns;
    const y = Math.floor(index / columns);
    if (x > 0) {
      enqueue(index - 1);
    }
    if (x < columns - 1) {
      enqueue(index + 1);
    }
    if (y > 0) {
      enqueue(index - columns);
    }
    if (y < rows - 1) {
      enqueue(index + columns);
    }
  }

  return connected;
}

function cleanupPatternCells(
  cells: Array<BeadColor | null>,
  columns: number,
  rows: number,
  sharpness: number,
) {
  let next = [...cells];
  const strength = sharpness / 100;
  const isolatedLimit = strength > 0.72 ? 2 : 1;
  const replaceThreshold = strength > 0.72 ? 3 : 4;
  const fillThreshold = strength > 0.82 ? 6 : 7;

  for (let pass = 0; pass < 3; pass += 1) {
    const current = next;
    next = current.map((cell, index) => {
      const x = index % columns;
      const y = Math.floor(index / columns);
      const neighborCounts = new Map<string, { color: BeadColor; count: number }>();
      let filledNeighbors = 0;
      let sameNeighbors = 0;

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) {
            continue;
          }

          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || nx >= columns || ny < 0 || ny >= rows) {
            continue;
          }

          const neighbor = current[ny * columns + nx];
          if (!neighbor) {
            continue;
          }

          filledNeighbors += 1;
          if (cell && neighbor.code === cell.code) {
            sameNeighbors += 1;
          }

          const existing = neighborCounts.get(neighbor.code);
          if (existing) {
            existing.count += 1;
          } else {
            neighborCounts.set(neighbor.code, { color: neighbor, count: 1 });
          }
        }
      }

      const dominant = Array.from(neighborCounts.values()).sort((a, b) => b.count - a.count)[0];

      if (!cell) {
        return dominant && dominant.count >= fillThreshold ? dominant.color : null;
      }

      if (filledNeighbors <= isolatedLimit) {
        return null;
      }

      if (
        dominant &&
        dominant.color.code !== cell.code &&
        sameNeighbors <= (strength > 0.72 ? 2 : 1) &&
        dominant.count >= replaceThreshold
      ) {
        return dominant.color;
      }

      return cell;
    });
  }

  return next;
}

function createPattern(
  image: HTMLImageElement,
  options: {
    columns: number;
    rows: number;
    palette: PaletteDefinition;
    maxColors: number;
    dither: boolean;
    smooth: boolean;
    edgeCleanup: boolean;
    sharpness: number;
    backgroundMode: BackgroundMode;
    backgroundHex: string;
  },
): PatternResult {
  const canvas = document.createElement("canvas");
  canvas.width = options.columns;
  canvas.height = options.rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Canvas is not available.");
  }

  ctx.clearRect(0, 0, options.columns, options.rows);
  if (options.backgroundMode !== "transparent" && options.backgroundMode !== "auto") {
    ctx.fillStyle =
      options.backgroundMode === "custom"
        ? options.backgroundHex
        : BACKGROUNDS[options.backgroundMode].hex;
    ctx.fillRect(0, 0, options.columns, options.rows);
  }

  ctx.imageSmoothingEnabled = options.smooth;
  ctx.imageSmoothingQuality = options.smooth ? "high" : "low";
  ctx.drawImage(image, 0, 0, options.columns, options.rows);

  const data = ctx.getImageData(0, 0, options.columns, options.rows).data;
  const sampled: Rgb[] = [];
  const backgroundCandidates = new Array<boolean>(options.columns * options.rows).fill(false);
  const autoBackground = estimateBackground(data, options.columns, options.rows);

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    const rgb: Rgb = [data[i], data[i + 1], data[i + 2]];
    const cellIndex = i / 4;
    sampled.push(rgb);
    backgroundCandidates[cellIndex] =
      options.backgroundMode === "transparent"
        ? alpha < 0.35
        : options.backgroundMode === "auto"
          ? isBackgroundCandidate(rgb, alpha, autoBackground, options.sharpness)
          : false;
  }

  const connectedBackground =
    options.backgroundMode === "auto"
      ? floodConnectedBackground(backgroundCandidates, options.columns, options.rows)
      : backgroundCandidates;
  const raw: Array<Rgb | null> = [];
  const preliminary = new Map<string, { color: BeadColor; count: number }>();

  sampled.forEach((rgb, index) => {
    if (connectedBackground[index]) {
      raw.push(null);
      return;
    }

    const sharpRgb = sharpenSample(rgb, options.sharpness);
    raw.push(sharpRgb);
    incrementStat(preliminary, nearestColor(sharpRgb, options.palette.colors));
  });

  const ranked = Array.from(preliminary.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, clamp(options.maxColors, 1, options.palette.colors.length))
    .map((entry) => entry.color);
  const candidateColors = ranked.length ? ranked : [options.palette.colors[0]];
  let cells: Array<BeadColor | null> = new Array(raw.length).fill(null);

  if (options.dither) {
    const work = raw.map((pixel) => (pixel ? ([...pixel] as Rgb) : null));

    for (let y = 0; y < options.rows; y += 1) {
      for (let x = 0; x < options.columns; x += 1) {
        const index = y * options.columns + x;
        const oldPixel = work[index];
        if (!oldPixel) {
          continue;
        }

        const nextColor = nearestColor(oldPixel, candidateColors);
        cells[index] = nextColor;

        const error: Rgb = [
          oldPixel[0] - nextColor.rgb[0],
          oldPixel[1] - nextColor.rgb[1],
          oldPixel[2] - nextColor.rgb[2],
        ];

        addError(work, options.columns, options.rows, x + 1, y, error, 7 / 16);
        addError(work, options.columns, options.rows, x - 1, y + 1, error, 3 / 16);
        addError(work, options.columns, options.rows, x, y + 1, error, 5 / 16);
        addError(work, options.columns, options.rows, x + 1, y + 1, error, 1 / 16);
      }
    }
  } else {
    raw.forEach((pixel, index) => {
      cells[index] = pixel ? nearestColor(pixel, candidateColors) : null;
    });
  }

  if (options.edgeCleanup) {
    cells = cleanupPatternCells(cells, options.columns, options.rows, options.sharpness);
  }

  const stats = new Map<string, { color: BeadColor; count: number }>();
  let emptyCells = 0;

  cells.forEach((cell) => {
    if (!cell) {
      emptyCells += 1;
    } else {
      incrementStat(stats, cell);
    }
  });

  const totalBeads = cells.length - emptyCells;
  const sortedStats = Array.from(stats.values())
    .sort((a, b) => b.count - a.count)
    .map((entry, index) => ({
      ...entry,
      symbol: shortColorCode(entry.color.code) || symbolForIndex(index),
      percent: totalBeads ? entry.count / totalBeads : 0,
    }));

  return {
    columns: options.columns,
    rows: options.rows,
    cells,
    stats: sortedStats,
    emptyCells,
    totalBeads,
    paletteLabel: options.palette.label,
  };
}

function addError(
  work: Array<Rgb | null>,
  columns: number,
  rows: number,
  x: number,
  y: number,
  error: Rgb,
  factor: number,
) {
  if (x < 0 || x >= columns || y < 0 || y >= rows) {
    return;
  }

  const pixel = work[y * columns + x];
  if (!pixel) {
    return;
  }

  pixel[0] = clamp(pixel[0] + error[0] * factor, 0, 255);
  pixel[1] = clamp(pixel[1] + error[1] * factor, 0, 255);
  pixel[2] = clamp(pixel[2] + error[2] * factor, 0, 255);
}

function drawCellLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  left: number,
  top: number,
  cellSize: number,
  color: BeadColor,
) {
  const maxFont = Math.floor(cellSize * 0.38);
  const labelScale = label.length > 3 ? 0.28 : 0.34;
  const fontSize = Math.max(6, Math.min(maxFont, Math.floor(cellSize * labelScale)));
  ctx.fillStyle = luminance(color.rgb) > 0.62 ? "#222222" : "#ffffff";
  ctx.font = `700 ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, left + cellSize / 2, top + cellSize / 2 + 0.35);
}

function drawChartGrid(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  columns: number,
  rows: number,
  cellSize: number,
) {
  const width = columns * cellSize;
  const height = rows * cellSize;

  if (cellSize >= 5) {
    ctx.strokeStyle = "rgba(95, 104, 98, 0.22)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= columns; x += 1) {
      ctx.beginPath();
      ctx.moveTo(left + x * cellSize + 0.5, top);
      ctx.lineTo(left + x * cellSize + 0.5, top + height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(left, top + y * cellSize + 0.5);
      ctx.lineTo(left + width, top + y * cellSize + 0.5);
      ctx.stroke();
    }
  }

  if (cellSize >= 6) {
    ctx.strokeStyle = "#ff4338";
    ctx.lineWidth = Math.max(1.25, Math.min(2.5, cellSize * 0.12));
    for (let x = 0; x <= columns; x += 10) {
      ctx.beginPath();
      ctx.moveTo(left + x * cellSize + 0.5, top);
      ctx.lineTo(left + x * cellSize + 0.5, top + height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y += 10) {
      ctx.beginPath();
      ctx.moveTo(left, top + y * cellSize + 0.5);
      ctx.lineTo(left + width, top + y * cellSize + 0.5);
      ctx.stroke();
    }
  }
}

function drawPatternCanvas(
  canvas: HTMLCanvasElement,
  pattern: PatternResult,
  options: { cellSize: number; showLabels: boolean },
) {
  const dpr = window.devicePixelRatio || 1;
  const { cellSize } = options;
  const width = pattern.columns * cellSize;
  const height = pattern.rows * cellSize;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y < pattern.rows; y += 1) {
    for (let x = 0; x < pattern.columns; x += 1) {
      const cell = pattern.cells[y * pattern.columns + x];
      const left = x * cellSize;
      const top = y * cellSize;

      if (cell) {
        ctx.fillStyle = cell.hex;
        ctx.fillRect(left, top, cellSize, cellSize);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(left, top, cellSize, cellSize);
      }

      if (options.showLabels && cell && cellSize >= 8) {
        drawCellLabel(ctx, shortColorCode(cell.code), left, top, cellSize, cell);
      }
    }
  }

  drawChartGrid(ctx, 0, 0, pattern.columns, pattern.rows, cellSize);
}

function drawDownloadCanvas(
  pattern: PatternResult,
  title: string,
  showLabels: boolean,
) {
  const density = pattern.columns * pattern.rows;
  let cellSize = density > 18000 ? 14 : density > 10000 ? 16 : 22;
  const maxChartSide = 5200;
  cellSize = Math.min(
    cellSize,
    Math.floor(maxChartSide / Math.max(pattern.columns, pattern.rows)),
  );
  cellSize = Math.max(8, cellSize);

  const padding = 44;
  const headerHeight = 96;
  const legendWidth = 390;
  const gap = 34;
  const chartWidth = pattern.columns * cellSize;
  const chartHeight = pattern.rows * cellSize;
  const legendHeight = 150 + pattern.stats.length * 32;
  const pageWidth = padding * 2 + chartWidth + gap + legendWidth;
  const pageHeight = Math.max(padding * 2 + headerHeight + chartHeight, padding * 2 + legendHeight);

  const canvas = document.createElement("canvas");
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return canvas;
  }

  ctx.fillStyle = "#f7f8f3";
  ctx.fillRect(0, 0, pageWidth, pageHeight);
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "800 32px Arial";
  ctx.fillText("拼豆图纸工坊", padding, padding + 8);
  ctx.font = "700 18px Arial";
  ctx.fillStyle = "#464942";
  ctx.fillText(title, padding, padding + 42);
  ctx.font = "14px Arial";
  ctx.fillStyle = "#6a6d68";
  ctx.fillText(
    `${pattern.columns} 列 x ${pattern.rows} 行 / ${pattern.totalBeads} 颗 / ${pattern.stats.length} 色 / ${pattern.paletteLabel}`,
    padding,
    padding + 70,
  );

  const chartX = padding;
  const chartY = padding + headerHeight;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
  for (let y = 0; y < pattern.rows; y += 1) {
    for (let x = 0; x < pattern.columns; x += 1) {
      const cell = pattern.cells[y * pattern.columns + x];
      const left = chartX + x * cellSize;
      const top = chartY + y * cellSize;
      if (cell) {
        ctx.fillStyle = cell.hex;
        ctx.fillRect(left, top, cellSize, cellSize);
        if (showLabels && cellSize >= 8) {
          drawCellLabel(ctx, shortColorCode(cell.code), left, top, cellSize, cell);
        }
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(left, top, cellSize, cellSize);
      }
    }
  }

  drawChartGrid(ctx, chartX, chartY, pattern.columns, pattern.rows, cellSize);

  const legendX = chartX + chartWidth + gap;
  let legendY = padding + 8;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "800 24px Arial";
  ctx.fillText("色号清单", legendX, legendY);
  legendY += 34;
  ctx.fillStyle = "#6a6d68";
  ctx.font = "14px Arial";
  ctx.fillText("色号为近似参考，制作前请以实际色卡复核。", legendX, legendY);
  legendY += 28;

  pattern.stats.forEach((stat) => {
    ctx.fillStyle = stat.color.hex;
    ctx.beginPath();
    ctx.arc(legendX + 14, legendY - 6, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.stroke();
    ctx.fillStyle = "#1d1d1f";
    ctx.font = "800 13px Arial";
    ctx.fillText(stat.symbol, legendX + 36, legendY - 1);
    ctx.font = "700 13px Arial";
    ctx.fillText(`${stat.color.code} ${stat.color.name}`, legendX + 72, legendY - 1);
    ctx.font = "800 13px Arial";
    ctx.fillText(`${stat.count}`, legendX + 320, legendY - 1);
    legendY += 32;
  });

  return canvas;
}

function buildDemoImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  ctx.fillStyle = "#f8f8f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#b7e3ed";
  ctx.fillRect(0, 0, canvas.width, 150);
  ctx.fillStyle = "#93d6bf";
  ctx.fillRect(0, 150, canvas.width, 150);
  ctx.fillStyle = "#f4c84a";
  ctx.beginPath();
  ctx.arc(288, 70, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#de5f91";
  ctx.beginPath();
  ctx.ellipse(164, 142, 76, 46, -0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6a5b8";
  ctx.beginPath();
  ctx.arc(114, 126, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#26306f";
  ctx.beginPath();
  ctx.arc(109, 120, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ee8771";
  ctx.beginPath();
  ctx.moveTo(230, 142);
  ctx.lineTo(292, 104);
  ctx.lineTo(292, 180);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#77b255";
  ctx.beginPath();
  ctx.ellipse(134, 198, 94, 22, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#00a384";
  ctx.beginPath();
  ctx.ellipse(86, 220, 42, 14, -0.22, 0, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL("image/png");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function BeadPatternStudio() {
  const [source, setSource] = useState<SourceImage | null>(null);
  const [columns, setColumns] = useState(84);
  const [rows, setRows] = useState(70);
  const [lockRatio, setLockRatio] = useState(true);
  const [maxColors, setMaxColors] = useState(12);
  const [paletteId, setPaletteId] = useState<PaletteId>("atelier");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("auto");
  const [customBackground, setCustomBackground] = useState("#ffffff");
  const [dither, setDither] = useState(false);
  const [smooth, setSmooth] = useState(false);
  const [edgeCleanup, setEdgeCleanup] = useState(true);
  const [sharpness, setSharpness] = useState(82);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(11);
  const [isDragging, setIsDragging] = useState(false);
  const [pattern, setPattern] = useState<PatternResult | null>(null);
  const [message, setMessage] = useState("示例图纸已就绪");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const panStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const palette = PALETTES[paletteId];
  const baseplateCount = pattern
    ? Math.ceil(pattern.columns / 29) * Math.ceil(pattern.rows / 29)
    : 0;
  const gridBeads = columns * rows;

  const topColors = useMemo(() => pattern?.stats.slice(0, 6) ?? [], [pattern]);

  useEffect(() => {
    loadDemo();
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!source) {
      setPattern(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      try {
        const nextPattern = createPattern(image, {
          columns,
          rows,
          palette,
          maxColors,
          dither,
          smooth,
          edgeCleanup,
          sharpness,
          backgroundMode,
          backgroundHex: customBackground,
        });
        if (!cancelled) {
          setPattern(nextPattern);
          setMessage("图纸已更新");
        }
      } catch {
        if (!cancelled) {
          setMessage("当前浏览器无法处理这张图片");
        }
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setMessage("图片读取失败，请换一张图片");
      }
    };
    image.src = source.url;

    return () => {
      cancelled = true;
    };
  }, [
    source,
    columns,
    rows,
    palette,
    maxColors,
    dither,
    smooth,
    edgeCleanup,
    sharpness,
    backgroundMode,
    customBackground,
  ]);

  useEffect(() => {
    if (canvasRef.current && pattern) {
      drawPatternCanvas(canvasRef.current, pattern, { cellSize: zoom, showLabels });
    }
  }, [pattern, zoom, showLabels]);

  useEffect(() => {
    const shouldIgnoreKeyboard = () => {
      const element = document.activeElement;
      if (!element) {
        return false;
      }
      const tagName = element.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        element.getAttribute("contenteditable") === "true"
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || shouldIgnoreKeyboard()) {
        return;
      }
      event.preventDefault();
      setIsSpacePressed(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }
      setIsSpacePressed(false);
      setIsPanning(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function setSourceFromUrl(url: string, name: string, isDemo: boolean, shouldRevoke: boolean) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (shouldRevoke) {
      objectUrlRef.current = url;
    }

    const image = new Image();
    image.onload = () => {
      const nextSource = {
        url,
        name,
        width: image.naturalWidth,
        height: image.naturalHeight,
        isDemo,
      };
      setSource(nextSource);
      if (lockRatio) {
        setRows(clamp(Math.round(columns * (image.naturalHeight / image.naturalWidth)), MIN_SIZE, MAX_SIZE));
      }
    };
    image.onerror = () => setMessage("图片读取失败，请换一张图片");
    image.src = url;
  }

  function loadDemo() {
    const demoUrl = buildDemoImage();
    if (!demoUrl) {
      return;
    }
    setSourceFromUrl(demoUrl, "示例小鱼.png", true, false);
  }

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("请选择 PNG、JPG、WEBP 或 GIF 图片");
      return;
    }
    const url = URL.createObjectURL(file);
    setSourceFromUrl(url, file.name, false, true);
    setMessage("正在生成图纸");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function updateColumns(value: number) {
    const next = clamp(Math.round(value), MIN_SIZE, MAX_SIZE);
    setColumns(next);
    if (lockRatio && source) {
      setRows(clamp(Math.round(next * (source.height / source.width)), MIN_SIZE, MAX_SIZE));
    }
  }

  function updateRows(value: number) {
    const next = clamp(Math.round(value), MIN_SIZE, MAX_SIZE);
    setRows(next);
    if (lockRatio && source) {
      setColumns(clamp(Math.round(next * (source.width / source.height)), MIN_SIZE, MAX_SIZE));
    }
  }

  function dimensionsForTargetBeads(value: number) {
    const target = clamp(Math.round(value), MIN_GRID_BEADS, MAX_GRID_BEADS);
    const ratio = source ? source.width / source.height : columns / rows;
    let nextColumns = clamp(Math.round(Math.sqrt(target * ratio)), MIN_SIZE, MAX_SIZE);
    let nextRows = clamp(Math.round(target / nextColumns), MIN_SIZE, MAX_SIZE);

    if (nextRows === MAX_SIZE || nextRows === MIN_SIZE) {
      nextColumns = clamp(Math.round(target / nextRows), MIN_SIZE, MAX_SIZE);
    }
    if (nextColumns === MAX_SIZE || nextColumns === MIN_SIZE) {
      nextRows = clamp(Math.round(target / nextColumns), MIN_SIZE, MAX_SIZE);
    }

    return { nextColumns, nextRows };
  }

  function updateTargetBeads(value: number) {
    const { nextColumns, nextRows } = dimensionsForTargetBeads(value);
    setColumns(nextColumns);
    setRows(nextRows);
  }

  function handleCanvasWheel(event: WheelEvent<HTMLDivElement>) {
    if (!pattern || !canvasScrollRef.current) {
      return;
    }

    event.preventDefault();
    const container = canvasScrollRef.current;
    const rect = container.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const contentX = container.scrollLeft + pointerX;
    const contentY = container.scrollTop + pointerY;
    const scale = event.deltaY < 0 ? 1.12 : 0.88;
    const nextZoom = clamp(Math.round(zoom * scale), MIN_PREVIEW_CELL_SIZE, MAX_PREVIEW_CELL_SIZE);

    if (nextZoom === zoom) {
      return;
    }

    setZoom(nextZoom);
    window.requestAnimationFrame(() => {
      const zoomScale = nextZoom / zoom;
      container.scrollLeft = contentX * zoomScale - pointerX;
      container.scrollTop = contentY * zoomScale - pointerY;
    });
  }

  function handleCanvasPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!isSpacePressed || event.button !== 0 || !canvasScrollRef.current) {
      return;
    }

    event.preventDefault();
    const container = canvasScrollRef.current;
    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
    container.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isPanning || !canvasScrollRef.current) {
      return;
    }

    event.preventDefault();
    const container = canvasScrollRef.current;
    const state = panStateRef.current;
    container.scrollLeft = state.scrollLeft - (event.clientX - state.startX);
    container.scrollTop = state.scrollTop - (event.clientY - state.startY);
  }

  function stopCanvasPan(event?: PointerEvent<HTMLDivElement>) {
    if (event && canvasScrollRef.current?.hasPointerCapture(event.pointerId)) {
      canvasScrollRef.current.releasePointerCapture(event.pointerId);
    }
    setIsPanning(false);
  }

  function toggleLockRatio(nextValue: boolean) {
    setLockRatio(nextValue);
    if (nextValue && source) {
      setRows(clamp(Math.round(columns * (source.height / source.width)), MIN_SIZE, MAX_SIZE));
    }
  }

  function downloadPattern() {
    if (!pattern) {
      return;
    }
    const exportCanvas = drawDownloadCanvas(pattern, source?.name ?? "拼豆图纸", showLabels);
    exportCanvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `bead-pattern-${pattern.columns}x${pattern.rows}.png`);
      }
    }, "image/png");
  }

  function downloadCsv() {
    if (!pattern) {
      return;
    }
    const rowsCsv = [
      ["符号", "色号", "颜色名", "HEX", "用量", "占比"],
      ...pattern.stats.map((stat) => [
        stat.symbol,
        stat.color.code,
        stat.color.name,
        stat.color.hex,
        String(stat.count),
        `${Math.round(stat.percent * 1000) / 10}%`,
      ]),
    ];
    const csv = `\uFEFF${rowsCsv.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n")}`;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "bead-color-list.csv");
  }

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <i key={index} />
            ))}
          </span>
          <div>
            <p className="eyebrow">图片转拼豆图纸</p>
            <h1>拼豆图纸工坊</h1>
            <p className="provider-line">
              网站由 <strong>Skillora-L</strong> 提供
            </p>
          </div>
        </div>
        <div className="top-actions">
          <button className="secondary-button" type="button" onClick={loadDemo}>
            载入示例
          </button>
          <button className="primary-button" type="button" onClick={downloadPattern} disabled={!pattern}>
            下载图纸 PNG
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="panel control-panel">
          <div className="panel-heading">
            <h2>制图参数</h2>
            <span className="status-pill">{message}</span>
          </div>

          <div className="control-stack">
            <label
              className={`dropzone ${isDragging ? "is-dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <span>
                <strong>拖入图片或选择文件</strong>
                <span>本地生成，不上传原图</span>
              </span>
              <input className="file-input" type="file" accept="image/*" onChange={onFileChange} />
            </label>

            {source ? (
              <div className="source-preview">
                <img src={source.url} alt="" />
                <div>
                  <strong>{source.name}</strong>
                  <span className="subtle">
                    {source.width} x {source.height} px{source.isDemo ? " / 示例" : ""}
                  </span>
                </div>
              </div>
            ) : null}

            <section className="control-block">
              <h3>尺寸</h3>
              <div className="field">
                <div className="field-row">
                  <label htmlFor="columns">列数</label>
                  <input
                    id="columns"
                    type="number"
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    value={columns}
                    onChange={(event) => updateColumns(Number(event.target.value))}
                  />
                </div>
                <div className="range-line">
                  <input
                    aria-label="列数滑块"
                    type="range"
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    value={columns}
                    onChange={(event) => updateColumns(Number(event.target.value))}
                  />
                  <span className="subtle">{columns} 列</span>
                </div>
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="rows">行数</label>
                  <input
                    id="rows"
                    type="number"
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    value={rows}
                    onChange={(event) => updateRows(Number(event.target.value))}
                  />
                </div>
                <div className="range-line">
                  <input
                    aria-label="行数滑块"
                    type="range"
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    value={rows}
                    onChange={(event) => updateRows(Number(event.target.value))}
                  />
                  <span className="subtle">{rows} 行</span>
                </div>
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="target-beads">目标总豆数</label>
                  <input
                    id="target-beads"
                    type="number"
                    min={MIN_GRID_BEADS}
                    max={MAX_GRID_BEADS}
                    step={100}
                    value={gridBeads}
                    onChange={(event) => updateTargetBeads(Number(event.target.value))}
                  />
                </div>
                <div className="range-line">
                  <input
                    aria-label="目标总豆数滑块"
                    type="range"
                    min={MIN_GRID_BEADS}
                    max={MAX_GRID_BEADS}
                    step={100}
                    value={gridBeads}
                    onChange={(event) => updateTargetBeads(Number(event.target.value))}
                  />
                  <span className="subtle">约 {gridBeads} 格</span>
                </div>
              </div>

              <label className="toggle-row">
                <span>锁定原图比例</span>
                <input
                  type="checkbox"
                  checked={lockRatio}
                  onChange={(event) => toggleLockRatio(event.target.checked)}
                />
              </label>
            </section>

            <section className="control-block">
              <h3>色卡</h3>
              <div className="field">
                <label htmlFor="palette">色号体系</label>
                <select
                  id="palette"
                  value={paletteId}
                  onChange={(event) => setPaletteId(event.target.value as PaletteId)}
                >
                  {(Object.entries(PALETTES) as Array<[PaletteId, PaletteDefinition]>).map(([id, item]) => (
                    <option key={id} value={id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="max-colors">最多颜色</label>
                  <input
                    id="max-colors"
                    type="number"
                    min={4}
                    max={48}
                    value={maxColors}
                    onChange={(event) => setMaxColors(clamp(Number(event.target.value), 4, 48))}
                  />
                </div>
                <div className="range-line">
                  <input
                    aria-label="最多颜色滑块"
                    type="range"
                    min={4}
                    max={48}
                    value={maxColors}
                    onChange={(event) => setMaxColors(Number(event.target.value))}
                  />
                  <span className="subtle">{maxColors} 色</span>
                </div>
              </div>
            </section>

            <section className="control-block">
              <h3>取样</h3>
              <div className="segmented" aria-label="背景处理">
                {(Object.entries(BACKGROUNDS) as Array<[BackgroundMode, { label: string; hex: string }]>).map(
                  ([mode, item]) => (
                    <button
                      className={backgroundMode === mode ? "is-active" : ""}
                      key={mode}
                      type="button"
                      onClick={() => setBackgroundMode(mode)}
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </div>
              {backgroundMode === "custom" ? (
                <div className="field-row">
                  <label htmlFor="custom-background">底色</label>
                  <input
                    id="custom-background"
                    type="color"
                    value={customBackground}
                    onChange={(event) => setCustomBackground(event.target.value)}
                  />
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="sharpness">锐化强度</label>
                <div className="range-line">
                  <input
                    id="sharpness"
                    type="range"
                    min={0}
                    max={100}
                    value={sharpness}
                    onChange={(event) => setSharpness(Number(event.target.value))}
                  />
                  <span className="subtle">{sharpness}%</span>
                </div>
              </div>
              <label className="toggle-row">
                <span>平滑采样</span>
                <input type="checkbox" checked={smooth} onChange={(event) => setSmooth(event.target.checked)} />
              </label>
              <label className="toggle-row">
                <span>边缘清理</span>
                <input
                  type="checkbox"
                  checked={edgeCleanup}
                  onChange={(event) => setEdgeCleanup(event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>误差扩散</span>
                <input type="checkbox" checked={dither} onChange={(event) => setDither(event.target.checked)} />
              </label>
            </section>

            <section className="control-block">
              <h3>预览</h3>
              <label className="toggle-row">
                <span>显示格内符号</span>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(event) => setShowLabels(event.target.checked)}
                />
              </label>
              <div className="field">
                <label htmlFor="zoom">格子大小</label>
                <div className="range-line">
                  <input
                    id="zoom"
                    type="range"
                    min={MIN_PREVIEW_CELL_SIZE}
                    max={MAX_PREVIEW_CELL_SIZE}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                  />
                  <span className="subtle">{zoom}px</span>
                </div>
              </div>
            </section>
          </div>
        </aside>

        <section className="panel canvas-panel">
          <div className="canvas-toolbar">
            <h2>图纸预览</h2>
            <button className="quiet-button" type="button" onClick={downloadCsv} disabled={!pattern}>
              导出色号清单
            </button>
          </div>

          <div className="metric-strip">
            <div className="metric">
              <span>图纸尺寸</span>
              <strong>
                {columns} x {rows}
              </strong>
            </div>
            <div className="metric">
              <span>拼豆数量</span>
              <strong>{pattern ? pattern.totalBeads : "-"}</strong>
            </div>
            <div className="metric">
              <span>使用颜色</span>
              <strong>{pattern ? pattern.stats.length : "-"}</strong>
            </div>
            <div className="metric">
              <span>29x29 底板</span>
              <strong>{pattern ? baseplateCount : "-"}</strong>
            </div>
          </div>

          <div className="canvas-wrap">
            <div
              className={`canvas-scroll ${isSpacePressed ? "is-space-pan" : ""} ${isPanning ? "is-panning" : ""}`}
              ref={canvasScrollRef}
              onWheel={handleCanvasWheel}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={stopCanvasPan}
              onPointerCancel={stopCanvasPan}
            >
              {pattern ? (
                <canvas className="chart-canvas" ref={canvasRef} aria-label="拼豆图纸预览" />
              ) : (
                <div className="empty-preview">
                  <div className="placeholder-board" aria-hidden="true">
                    {Array.from({ length: 144 }).map((_, index) => (
                      <i key={index} />
                    ))}
                  </div>
                  <p>选择图片后生成图纸</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="panel legend-panel">
          <div className="panel-heading">
            <h2>色号与用量</h2>
            <span className="status-pill">{palette.maker}</span>
          </div>

          <div className="legend-stack">
            <div className="legend-summary">
              <div className="summary-tile">
                <span>当前色卡</span>
                <strong>{palette.label}</strong>
              </div>
              <div className="summary-tile">
                <span>留空格</span>
                <strong>{pattern ? pattern.emptyCells : 0}</strong>
              </div>
            </div>

            <div className="legend-list">
              {(pattern?.stats ?? []).map((stat) => (
                <div className="legend-row" key={stat.color.code}>
                  <span className="swatch" style={{ background: stat.color.hex }} />
                  <span className="symbol">{stat.symbol}</span>
                  <span className="legend-name">
                    <strong>{stat.color.code}</strong>
                    <span>{stat.color.name}</span>
                  </span>
                  <span className="legend-count">{stat.count}</span>
                </div>
              ))}
            </div>

            {topColors.length ? (
              <div className="note-box">
                主色：
                {topColors.map((stat) => `${stat.color.code} ${stat.count}颗`).join(" / ")}
              </div>
            ) : null}

            <div className="button-grid">
              <button className="primary-button" type="button" onClick={downloadPattern} disabled={!pattern}>
                下载 PNG
              </button>
              <button className="secondary-button" type="button" onClick={downloadCsv} disabled={!pattern}>
                下载清单
              </button>
            </div>

            <p className="subtle">
              色号为近似参考映射，显示效果会受屏幕与批次差异影响，购买前请用实物色卡复核。
            </p>
          </div>
        </aside>
      </div>

      <div className="site-watermark" aria-hidden="true">
        Skillora-L 提供
      </div>
    </main>
  );
}
