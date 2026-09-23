"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"

export default function WhatsAppTemplatesPage() {
  const [notice, setNotice] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  const [tplForm, setTplForm] = useState({ id: 0, template_name: "", category: "UTILITY", language: "en", header_format: "text", header_text: "", body_text: "", footer_text: "" })
  const [tplBusy, setTplBusy] = useState("")

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(""), 6000) }

  const loadTemplates = async () => {
    const r = await fetch("/api/whatsapp-meta/templates")
    const j = await r.json()
    setTemplates(j.templates || [])
  }
  useEffect(() => { loadTemplates() }, [])

  const varCount = (tplForm.body_text.match(/\{\{\d+\}\}/g) || []).length

  const submitTemplate = async () => {
    setTplBusy("submit")
    try {
      const r = await fetch("/api/whatsapp-meta/templates/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tplForm) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Submit failed")
      flash("✅ " + j.message)
      setTplForm({ id: 0, template_name: "", category: "UTILITY", language: "en", header_format: "text", header_text: "", body_text: "", footer_text: "" })
      loadTemplates()
    } catch (e: any) { flash("❌ " + e.message) }
    setTplBusy("")
  }

  const syncAll = async () => {
    setTplBusy("syncall")
    try {
      const r = await fetch("/api/whatsapp-meta/templates/sync-all", { method: "POST" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Sync failed")
      flash("✅ " + j.message)
      loadTemplates()
    } catch (e: any) { flash("❌ " + e.message) }
    setTplBusy("")
  }

  const syncOne = async (id: number) => {
    setTplBusy("sync" + id)
    try {
      const r = await fetch(`/api/whatsapp-meta/templates/${id}/sync`, { method: "POST" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Sync failed")
      flash("✅ " + (j.message || j.status))
      loadTemplates()
    } catch (e: any) { flash("❌ " + e.message) }
    setTplBusy("")
  }

  const removeTpl = async (id: number, name: string) => {
    if (!confirm(`Delete template "${name}" from Meta and NIBOG?`)) return
    setTplBusy("del" + id)
    try {
      const r = await fetch(`/api/whatsapp-meta/templates/${id}`, { method: "DELETE" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Delete failed")
      flash("✅ " + j.message)
      loadTemplates()
    } catch (e: any) { flash("❌ " + e.message) }
    setTplBusy("")
  }

  const statusBadge = (st: string) => {
    const map: Record<string, string> = { APPROVED: "bg-green-600", PENDING: "bg-amber-500", REJECTED: "bg-red-600", PAUSED: "bg-orange-500", NOT_SUBMITTED: "bg-slate-400" }
    return <Badge className={(map[st] || "bg-slate-400") + " text-[10px]"}>{st}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-green-600" /> WhatsApp Message Templates
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create templates and submit them to Meta for approval</p>
      </div>

      {notice && <div className="rounded-lg border px-4 py-3 text-sm bg-slate-50">{notice}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Message Templates (Meta approval)
            <Button variant="outline" size="sm" onClick={syncAll} disabled={tplBusy !== ""}>
              {tplBusy === "syncall" ? "Syncing…" : "↻ Sync all from Meta"}
            </Button>
          </CardTitle>
          <CardDescription>
            Business-initiated WhatsApp messages require an approved template. Submit here — statuses update from Meta (🟢 APPROVED / 🟡 PENDING / 🔴 REJECTED).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* composer */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-slate-500">Template name * (lowercase_with_underscores)</label>
                <Input value={tplForm.template_name} onChange={(e) => setTplForm({ ...tplForm, template_name: e.target.value })} placeholder="booking_confirmation" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Category</label>
                <select value={tplForm.category} onChange={(e) => setTplForm({ ...tplForm, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="UTILITY">UTILITY</option>
                  <option value="MARKETING">MARKETING</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Language</label>
                <select value={tplForm.language} onChange={(e) => setTplForm({ ...tplForm, language: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="en">English (en)</option>
                  <option value="en_US">English US (en_US)</option>
                  <option value="hi">Hindi (hi)</option>
                  <option value="ta">Tamil (ta)</option>
                  <option value="te">Telugu (te)</option>
                  <option value="kn">Kannada (kn)</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">Header type</label>
                <select value={tplForm.header_format} onChange={(e) => setTplForm({ ...tplForm, header_format: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="text">Text</option>
                  <option value="document">📄 Document (PDF — e.g. entry ticket)</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Header text {tplForm.header_format === "text" ? "(max 60 chars)" : "(text header not used)"}</label>
                <Input value={tplForm.header_text} disabled={tplForm.header_format !== "text"} onChange={(e) => setTplForm({ ...tplForm, header_text: e.target.value })} placeholder="e.g. Booking Confirmed" />
              </div>
            </div>
            {tplForm.header_format === "document" && (
              <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                📄 Meta requires a sample PDF for approval — NIBOG uploads one automatically. When sending, the parent&apos;s <b>entry ticket PDF</b> is attached here.
              </p>
            )}
            <div>
              <label className="text-xs text-slate-500">
                Body * — use variables {"{{1}}"}, {"{{2}}"}… <span className="text-slate-400">({varCount} variable{varCount === 1 ? "" : "s"} detected)</span>
              </label>
              <textarea
                value={tplForm.body_text}
                onChange={(e) => setTplForm({ ...tplForm, body_text: e.target.value })}
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder={"Hi {{1}}, your booking {{2}} for {{3}} is confirmed! - Team NIBOG"}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Footer (optional, max 60 chars)</label>
              <Input value={tplForm.footer_text} onChange={(e) => setTplForm({ ...tplForm, footer_text: e.target.value })} placeholder="- Team NIBOG" />
            </div>
            <Button onClick={submitTemplate} disabled={tplBusy !== "" || !tplForm.template_name || !tplForm.body_text}>
              {tplBusy === "submit" ? "Submitting…" : tplForm.id ? "☁️ Update & Resubmit to Meta" : "☁️ Submit to Meta for Approval"}
            </Button>
          </div>

          {/* list */}
          <div className="rounded-xl border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-3 py-2 font-medium">Template</th>
                  <th className="px-2 py-2 font-medium">Category</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-t align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium flex items-center gap-2">
                        {t.template_name}
                        {!!t.is_default && <Badge className="bg-blue-600 text-[10px]">Default</Badge>}
                      </div>
                      <div className="text-xs text-slate-400 max-w-md">{t.body_text}</div>
                      {t.rejected_reason && <div className="text-xs text-red-500 mt-0.5">Reason: {t.rejected_reason}</div>}
                    </td>
                    <td className="px-2 py-2 text-xs">{t.category}<br /><span className="text-slate-400">{t.language}</span></td>
                    <td className="px-2 py-2">{statusBadge(t.status)}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button className="text-xs underline mr-3" onClick={() => setTplForm({ id: t.id, template_name: t.template_name, category: t.category, language: t.language, header_format: t.header_format || "text", header_text: t.header_text || "", body_text: t.body_text || "", footer_text: t.footer_text || "" })}>Edit</button>
                      <button className="text-xs underline mr-3" disabled={tplBusy !== ""} onClick={() => syncOne(t.id)}>{tplBusy === "sync" + t.id ? "…" : "Sync"}</button>
                      {!t.is_default && <button className="text-xs underline text-red-600" disabled={tplBusy !== ""} onClick={() => removeTpl(t.id, t.template_name)}>{tplBusy === "del" + t.id ? "…" : "Delete"}</button>}
                      {!!t.is_default && <span className="text-xs text-slate-400">no delete</span>}
                    </td>
                  </tr>
                ))}
                {!templates.length && (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-400 text-sm">No templates yet — create one above and submit it to Meta for approval.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
