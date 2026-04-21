import si from "systeminformation";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import type { SystemData, ProcessInfo } from "@/lib/types";

const execAsync = promisify(exec);

async function readPower(): Promise<{ source: "ac" | "battery" | "unknown"; thermalWarning: boolean }> {
  try {
    const [ps, therm] = await Promise.all([
      execAsync("pmset -g ps", { timeout: 1500 }).catch(() => ({ stdout: "" })),
      execAsync("pmset -g therm", { timeout: 1500 }).catch(() => ({ stdout: "" })),
    ]);
    const source = ps.stdout.includes("AC Power")
      ? "ac"
      : ps.stdout.includes("Battery Power")
      ? "battery"
      : "unknown";
    const thermalWarning =
      /CPU_Scheduler_Limit\s*=\s*([0-9]+)/.test(therm.stdout) &&
      !/CPU_Scheduler_Limit\s*=\s*100/.test(therm.stdout);
    return { source, thermalWarning };
  } catch {
    return { source: "unknown", thermalWarning: false };
  }
}

function topBy(list: si.Systeminformation.ProcessesProcessData[], key: "cpu" | "mem"): ProcessInfo[] {
  return [...list]
    .filter((p) => p[key] > 0.05 && p.name !== "kernel_task")
    .sort((a, b) => b[key] - a[key])
    .slice(0, 3)
    .map((p) => ({ name: p.name, cpu: Math.round(p.cpu * 10) / 10, mem: Math.round(p.mem * 10) / 10, pid: p.pid }));
}

export async function collect(): Promise<SystemData> {
  const [load, mem, fsSizes, cpuInfo, temp, net, battery, os, procs, power] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.cpu(),
    si.cpuTemperature().catch(() => ({ main: null } as { main: number | null })),
    si.networkStats().catch(() => []),
    si.battery().catch(() => null),
    si.osInfo(),
    si.processes().catch(() => ({ list: [], all: 0 } as si.Systeminformation.ProcessesData)),
    readPower(),
  ]);

  const mainFs = fsSizes.sort((a, b) => b.size - a.size)[0] ?? { size: 1, used: 0, use: 0 };
  const mainNet = net[0] ?? { rx_sec: 0, tx_sec: 0 };

  return {
    cpu: {
      load: Math.round(load.currentLoad),
      cores: cpuInfo.cores,
      brand: `${cpuInfo.manufacturer} ${cpuInfo.brand}`.trim(),
    },
    memory: {
      used: mem.active,
      total: mem.total,
      percent: Math.round((mem.active / mem.total) * 100),
    },
    disk: {
      used: mainFs.used,
      total: mainFs.size,
      percent: Math.round(mainFs.use),
    },
    temperature: typeof temp.main === "number" ? Math.round(temp.main) : null,
    network: {
      rxSec: Math.max(0, mainNet.rx_sec ?? 0),
      txSec: Math.max(0, mainNet.tx_sec ?? 0),
    },
    battery: {
      hasBattery: Boolean(battery?.hasBattery),
      percent: battery?.hasBattery ? battery.percent ?? null : null,
      charging: Boolean(battery?.isCharging),
    },
    host: {
      hostname: os.hostname,
      uptime: Math.floor(si.time().uptime),
      platform: `${os.distro} ${os.release}`.trim(),
    },
    power,
    processes: {
      topCpu: topBy(procs.list, "cpu"),
      topMem: topBy(procs.list, "mem"),
      total: procs.all,
    },
    loadAvg: os.loadavg() as [number, number, number],
  };
}
