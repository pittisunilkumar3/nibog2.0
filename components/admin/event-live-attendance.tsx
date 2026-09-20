"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ScanLine, UserCheck, Users, UserX, Percent } from "lucide-react"

type Checkin = {
  booking_id: number; child_name: string; event_name: string;
  games: string; checked_in_at: string; checked_in_by: string | null;
}
type Scoped = {
  summary: { registered: number; attended: number; no_show: number; attendance_rate: number };
  recent_checkins: Checkin[];
}

export default function EventLiveAttendance({ eventId }: { eventId: number | string }) {
  const [data, setData] = useState<Scoped | null>(null)
  const [error, setError] = useState("")
  const [updatedAt, setUpdatedAt] = useState("")

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/attendance/report?event_id=${eventId}`, { cache: "no-store" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Failed to load")
      setData(j)
      setError("")
      setUpdatedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e.message || "Failed to load attendance")
    }
  }, [eventId])

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [load])

  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0)
  const s = data?.summary

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live Attendance
          </CardTitle>
          <CardDescription>
            Ticket scans from the NIBOG Ticket Scanner app{updatedAt ? ` • updated ${updatedAt}` : ""}
          </CardDescription>
        </div>
        <button onClick={load} className="text-slate-400 hover:text-slate-700" title="Refresh now">
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!data && !error && <p className="text-sm text-slate-400">Loading…</p>}
        {data && s && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Users className="h-3.5 w-3.5" /> Registered</div>
                <div className="text-xl font-bold">{fmt(s.registered)}</div>
              </div>
              <div className="rounded-xl border p-3 bg-green-50/60">
                <div className="flex items-center gap-1.5 text-xs text-green-700 mb-1"><UserCheck className="h-3.5 w-3.5" /> Attended</div>
                <div className="text-xl font-bold text-green-700">{fmt(s.attended)}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><UserX className="h-3.5 w-3.5" /> No-show</div>
                <div className="text-xl font-bold">{fmt(s.no_show)}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Percent className="h-3.5 w-3.5" /> Rate</div>
                <div className="text-xl font-bold">{s.attendance_rate}%</div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-green-600" /> Recent check-ins at this event
                <Badge variant="outline" className="text-[10px]">{data.recent_checkins.length}</Badge>
              </h3>
              <div className="rounded-xl border max-h-64 overflow-auto">
                {data.recent_checkins.length ? (
                  <ul className="divide-y">
                    {data.recent_checkins.map((c) => (
                      <li key={c.booking_id} className="px-3 py-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.child_name}</div>
                          <div className="text-xs text-slate-400 truncate">{c.games}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-slate-500">
                            {new Date(c.checked_in_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-[10px] text-slate-400">#{c.booking_id}{c.checked_in_by ? ` • ${c.checked_in_by}` : ""}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-8 text-center text-slate-400 text-sm">
                    <ScanLine className="h-7 w-7 mx-auto mb-2 text-slate-300" />
                    No tickets scanned for this event yet — scans from the app appear here instantly.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
