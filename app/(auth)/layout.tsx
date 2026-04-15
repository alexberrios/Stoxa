import { StoxaBrandLockup } from "@/components/stoxa-logo";

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
      <div className="relative z-10 flex w-full flex-col items-center">
        <StoxaBrandLockup
          href="/"
          className="mb-8 scale-[1.02] sm:mb-10"
          markClassName="drop-shadow-[0_0_20px_oklch(0.55_0.12_200/0.35)]"
        />
        {children}
      </div>
    </div>
  );
}
