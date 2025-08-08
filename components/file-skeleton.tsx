import { Card, CardContent } from "@/components/ui/card"

export function FileCardSkeleton() {
  return (
    <Card className="group border-0 bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-[4/3] bg-slate-200 animate-pulse"></div>
        <div className="p-5 space-y-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FileListSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="w-16 h-12 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
