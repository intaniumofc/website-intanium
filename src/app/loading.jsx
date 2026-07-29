export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC]">
      <div className="flex flex-col items-center gap-4">
        {/* Premium animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#FF5FB2]/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF5FB2] animate-spin" />
        </div>
        <p className="text-sm text-[#9097A5] font-medium animate-pulse">
          Memuat...
        </p>
      </div>
    </div>
  );
}
