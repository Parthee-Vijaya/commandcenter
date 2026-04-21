import { collect as collectSystem } from "@/lib/collectors/system";
import { writePoints, pruneOld } from "@/lib/history";

const INTERVAL_MS = 60_000;

let timer: NodeJS.Timeout | null = null;

async function tick(): Promise<void> {
  try {
    const s = await collectSystem();
    writePoints([
      { metric: "cpu", value: s.cpu.load },
      { metric: "mem", value: s.memory.percent },
      { metric: "disk", value: s.disk.percent },
      { metric: "netIn", value: s.network.rxSec },
      { metric: "netOut", value: s.network.txSec },
      { metric: "temp", value: s.temperature ?? 0 },
    ]);
    pruneOld();
  } catch (e) {
    console.error("[sparkline] tick failed", e);
  }
}

export function startSparklineCollector(): void {
  if (timer) return;
  console.log("[sparkline] starter — interval 60s");
  void tick();
  timer = setInterval(() => void tick(), INTERVAL_MS);
}

export function stopSparklineCollector(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
