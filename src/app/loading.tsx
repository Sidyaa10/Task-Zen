export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-primary/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-lg font-medium text-muted-foreground">Loading your dashboard...</p>
    </div>
  )
}
