export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        aria-hidden
        style={{
          backgroundImage: `linear-gradient(oklch(0.5 0.08 195 / 0.06) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.5 0.08 195 / 0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-chart-2/20 blur-3xl dark:bg-chart-2/15"
        aria-hidden
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
