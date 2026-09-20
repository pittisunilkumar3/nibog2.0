"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, UserCheck, X as UserX, Percent, RefreshCw, ScanLine } from "lucide-react"

type EventRow = {
  event_id: number; event_name: string; event_date: string | null;
  venue_name: string; city_name: string;
  registered: number; attended: number; no_show: number; attendance_rate: number;
}
type Checkin = {
  booking_id: number; child_name: string; event_name: string;
  games: string; checked_in_at: string; checked_in_by: string | null;
}
type Report = {
  summary: { registered: number; attended: number; no_show: number; attendance_rate: number };
  by_event: EventRow[]; recent_checkins: Checkin[]; generated_at: string;
}

export default function AdminAttendanceAnalytics() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string>("")
  const [query, setQuery] = useState("")

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/attendance/report", { cache: "no-store" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Failed to load")
      setReport(j)
      setError("")
      setUpdatedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e.message || "Failed to load attendance")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 15000) // live refresh every 15s
    return () => clearInterval(t)
  }, [load])

  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0)

  const filtered = (report?.by_event || []).filter(e =>
    !query || `${e.event_name} ${e.venue_name} ${e.city_name}`.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-16 text-center text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" />
          Loading live attendance…
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-16 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={load} className="underline">Retry</button>
        </CardContent>
      </Card>
    )
  }

  const s = report!.summary

  return (
    <Card className="col-span-full">
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
            Real-time entry data from the NIBOG Ticket Scanner app
            {updatedAt && <> • updated {updatedAt}</>}
          </CardDescription>
        </div>
        <button onClick={() => { setLoading(true); load() }} className="text-slate-400 hover:text-slate-700" title="Refresh now">
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Users className="h-3.5 w-3.5" /> Registered (paid)</div>
            <div className="text-2xl font-bold">{fmt(s.registered)}</div>
          </div>
          <div className="rounded-xl border p-4 bg-green-50/60">
            <div className="flex items-center gap-2 text-xs text-green-700 mb-1"><UserCheck className="h-3.5 w-3.5" /> Attended (scanned)</div>
            <div className="text-2xl font-bold text-green-700">{fmt(s.attended)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><UserX className="h-3.5 w-3.5" /> No-show</div>
            <div className="text-2xl font-bold">{fmt(s.no_show)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Percent className="h-3.5 w-3.5" /> Attendance rate</div>
            <div className="text-2xl font-bold">{s.attendance_rate}%</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* per-event table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">By event ({filtered.length})</h3>
              <Input placeholder="Search event / city…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-48 text-xs" />
            </div>
            <div className="rounded-xl border max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-3 py-2 font-medium">Event</th>
                    <th className="px-2 py-2 font-medium text-right">Reg.</th>
                    <th className="px-2 py-2 font-medium text-right">Att.</th>
                    <th className="px-3 py-2 font-medium text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.event_id} className="border-t hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        <div className="font-medium leading-tight">{e.event_name}</div>
                        <div className="text-xs text-slate-400">{[e.venue_name, e.city_name].filter(Boolean).join(", ")}{e.event_date ? ` • ${e.event_date}` : ""}</div>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(e.registered)}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-semibold text-green-700">{fmt(e.attended)}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-14 rounded bg-slate-100 overflow-hidden hidden sm:block">
                            <div className="h-full bg-green-500 rounded" style={{ width: `${e.attendance_rate}%` }} />
                          </div>
                          <span className="tabular-nums text-xs">{e.attendance_rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-400 text-sm">No paid registrations found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* recent check-ins */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-green-600" /> Recent check-ins
              <Badge variant="outline" className="text-[10px]">{report!.recent_checkins.length}</Badge>
            </h3>
            <div className="rounded-xl border max-h-[420px] overflow-auto">
              {report!.recent_checkins.length ? (
                <ul className="divide-y">
                  {report!.recent_checkins.map((c) => (
                    <li key={c.booking_id} className="px-3 py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.child_name}</div>
                        <div className="text-xs text-slate-400 truncate">{c.event_name} • {c.games}</div>
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
                <div className="px-3 py-10 text-center text-slate-400 text-sm">
                  <ScanLine className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No tickets scanned yet.<br />Check-ins from the NIBOG Ticket Scanner app appear here instantly.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
