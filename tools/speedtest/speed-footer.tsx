export function SpeedFooter() {
  return (
    <footer className="w-full mt-6 md:mt-4 py-4 border-t border-slate-200 dark:border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          Test completed at {new Date().toLocaleTimeString()}
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-xs">
          Powered by HandyTool Performance Analytics
        </div>
      </div>
    </footer>
  )
}
