import { Worker } from "node:worker_threads";
import { createRequire } from "node:module";
import { assertGrid } from "./grid.js";
import { checkOptions, SearchLimitError } from "./engine.js";
import type { ReadonlyGrid, SolveOptions, SudokuGrid } from "./types.js";
/** Node-only worker solver. Cancellation terminates the worker, keeping the caller responsive. */
export function solveGridAsync(
  grid: ReadonlyGrid,
  options: SolveOptions = {},
): Promise<SudokuGrid | null> {
  // A Promise boundary also turns validation failures into rejections.
  return new Promise((resolve, reject) => {
    assertGrid(grid);
    checkOptions(options);
    // The ESM build substitutes import.meta.url for the CommonJS module location.
    const requireHere = createRequire(__filename);
    const enginePath = requireHere.resolve("../cjs/index.js");
    const worker = new Worker(
      `const {parentPort,workerData}=require('node:worker_threads');
      try { parentPort.postMessage({result:require(workerData.engine).solveGrid(workerData.grid,{maxNodes:workerData.maxNodes})}); }
      catch(e) { parentPort.postMessage({error:{name:e.name,message:e.message,maxNodes:e.maxNodes}}); }`,
      {
        eval: true,
        workerData: { engine: enginePath, grid, maxNodes: options.maxNodes },
      },
    );
    let done = false;
    const finish = (ok: boolean, value: unknown) => {
      if (done) return;
      done = true;
      options.signal?.removeEventListener("abort", abort);
      void worker.terminate();
      if (ok) resolve(value as SudokuGrid | null);
      else reject(value);
    };
    const abort = () => finish(false, options.signal!.reason);
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) {
      abort();
      return;
    }
    worker.once("message", (message) => {
      if (!message.error) finish(true, message.result);
      else
        finish(
          false,
          message.error.name === "SearchLimitError"
            ? new SearchLimitError(message.error.maxNodes)
            : new Error(message.error.message),
        );
    });
    worker.once("error", (error) => finish(false, error));
    worker.once("exit", (code) => {
      if (!done)
        finish(
          false,
          new Error(`Sudoku worker exited before returning a result (${code})`),
        );
    });
  });
}
