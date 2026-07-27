export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        {/* Premium animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#170C79]/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#170C79] animate-spin" />
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium animate-pulse">
          Memuat...
        </p>
      </div>
    </div>
  );
}
