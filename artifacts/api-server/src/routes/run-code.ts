import { Router, type IRouter } from "express";
import { VM } from "vm2";

const router: IRouter = Router();

router.post("/run-code", (req, res) => {
  const { code } = req.body as { code: string };

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "No code provided", output: "" });
    return;
  }

  if (code.length > 50000) {
    res.status(400).json({ error: "Code too large (max 50000 chars)", output: "" });
    return;
  }

  const logs: string[] = [];
  const errors: string[] = [];

  try {
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        console: {
          log: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(" ")),
          error: (...args: unknown[]) => errors.push(args.map(a => String(a)).join(" ")),
          warn: (...args: unknown[]) => logs.push("[warn] " + args.map(a => String(a)).join(" ")),
          info: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(" ")),
        },
        Math,
        Date,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        Number,
        String,
        Boolean,
        Array,
        Object,
        RegExp,
        Error,
        TypeError,
        RangeError,
        Promise,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Symbol,
      },
    });

    const result = vm.run(code);
    const output = [...logs, ...errors].join("\n");
    const finalOutput = result !== undefined && output === "" 
      ? String(result) 
      : output;

    res.json({ output: finalOutput || "(no output)", error: null });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.json({
      output: [...logs].join("\n"),
      error: `Error: ${errorMsg}`,
    });
  }
});

export default router;
