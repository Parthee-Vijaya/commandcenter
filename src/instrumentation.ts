export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const [{ startSparklineCollector }, { autoImportPlexToken }] = await Promise.all([
    import("@/jobs/sparkline-collector"),
    import("@/jobs/plex-token-import"),
  ]);

  await autoImportPlexToken();
  startSparklineCollector();
}
