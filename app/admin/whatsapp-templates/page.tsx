"use client"

import { useEffect, useRef, useState } from "react"
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

  // ---- variables (drag & drop / click to insert) ----
  const VARIABLES = [
    { name: "parent_name", label: "👤 Parent Name", sample: "Sunil" },
    { name: "event_name", label: "🎪 Event Name", sample: "NIBOG Banglore Season 5" },
    { name: "booking_id", label: "🎫 Booking ID", sample: "2999" },
    { name: "child_name", label: "👶 Child Name", sample: "Aadhya" },
    { name: "child_age", label: "🎂 Child Age", sample: "18 months" },
    { name: "child_dob", label: "📅 Child DOB", sample: "15/03/2025" },
    { name: "child_gender", label: "🧒 Child Gender", sample: "Female" },
    { name: "school_name", label: "🏫 School", sample: "Little Angels School" },
    { name: "games_list", label: "🎮 Games", sample: "Running Race, Balance Cycle" },
    { name: "event_date", label: "📅 Event Date", sample: "20 Sep 2026" },
    { name: "event_time", label: "⏰ Slot Time", sample: "10:00 AM - 10:30 AM" },
    { name: "venue", label: "📍 Venue", sample: "Decathlon Sports" },
    { name: "total_amount", label: "💰 Amount", sample: "Rs. 499" },
    { name: "parent_phone", label: "📞 Parent Phone", sample: "919876543210" },
  ]
  const SAMPLES: Record<string, string> = Object.fromEntries(VARIABLES.map(v => [v.name, v.sample]))
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const insertVar = (name: string) => {
    const token = `{{${name}}}`
    const el = bodyRef.current
    if (!el) { setTplForm(f => ({ ...f, body_text: f.body_text + token })); return }
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const val = el.value
    setTplForm(f => ({ ...f, body_text: val.slice(0, start) + token + val.slice(end) }))
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + token.length }, 0)
  }

  // live preview: replace named + numbered variables with samples
  const previewBody = (() => {
    let t = tplForm.body_text || ""
    const named = [...new Set((t.match(/\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/g) || []))]
    named.forEach((tok, i) => {
      const name = tok.slice(2, -2)
      t = t.split(tok).join(`{{${i + 1}|${name}}}`)
    })
    // numbered-only vars map in order of appearance
    let n = 0
    t = t.replace(/\{\{(\d+)\}\}/g, () => `{{${++n}|num}}`)
    return t.replace(/\{\{([^}]+)\}\}/g, (_, tag) => {
      const name = tag.split("|")[1]
      if (name === "num") return `var${tag.split("|")[0]}`
      return SAMPLES[name] || tag.split("|")[0]
    })
  })()

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
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">
                  Body * — drag variables into the text (or click to insert) <span className="text-slate-400">({varCount || (tplForm.body_text.match(/\{\{[a-zA-Z_\d]+\}\}/g) || []).length} variable(s))</span>
                </label>
                <div className="flex flex-wrap gap-2 my-2">
                  {VARIABLES.map(v => (
                    <span
                      key={v.name}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", `{{${v.name}}}`)}
                      onClick={() => insertVar(v.name)}
                      className="cursor-grab active:cursor-grabbing select-none text-xs bg-green-50 text-green-800 border border-green-200 rounded-full px-3 py-1 hover:bg-green-100"
                      title={`Drag into body or click — inserts {{${v.name}}}`}
                    >
                      {v.label}
                    </span>
                  ))}
                </div>
                <textarea
                  ref={bodyRef}
                  value={tplForm.body_text}
                  onChange={(e) => setTplForm({ ...tplForm, body_text: e.target.value })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const token = e.dataTransfer.getData("text/plain")
                    if (!token) return
                    const el = bodyRef.current
                    const start = el?.selectionStart ?? tplForm.body_text.length
                    const end = el?.selectionEnd ?? tplForm.body_text.length
                    setTplForm(f => ({ ...f, body_text: f.body_text.slice(0, start) + token + f.body_text.slice(end) }))
                    setTimeout(() => { if (el) { el.focus(); const p = start + token.length; el.selectionStart = el.selectionEnd = p } }, 0)
                  }}
                  rows={7}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder={"Hi {{parent_name}}, your booking for {{event_name}} is confirmed!"}
                />
              </div>

              {/* live WhatsApp preview */}
              <div>
                <label className="text-xs text-slate-500">Live preview — how the message looks</label>
                <div className="rounded-xl border bg-[#efeae2] p-4 min-h-[220px]" style={{ backgroundImage: "url(data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23d6cec2'/%3E%3C/svg%3E)" }}>
                  <div className="bg-white rounded-lg rounded-tr-sm p-3 max-w-sm ml-auto shadow relative">
                    {tplForm.header_format === "document" && (
                      <div className="border rounded-lg p-2 mb-2 flex items-center gap-2 bg-[#f0f2f5]">
                        <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">PDF</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">NIBOG_Ticket_2999.pdf</div>
                          <div className="text-[10px] text-slate-400">1 page • PDF</div>
                        </div>
                      </div>
                    )}
                    {tplForm.header_format === "text" && tplForm.header_text && (
                      <div className="font-semibold text-sm mb-1">{tplForm.header_text}</div>
                    )}
                    <div className="text-sm whitespace-pre-wrap text-slate-800">{previewBody || "Body preview appears here as you type…"}</div>
                    {tplForm.footer_text && <div className="text-xs text-slate-500 mt-2 pt-1 border-t">{tplForm.footer_text}</div>}
                    <div className="text-[10px] text-slate-400 text-right mt-1">12:45 <span className="text-blue-500">✓✓</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Variables show sample values; parents see their real details. PDF shown for Document header.</p>
              </div>
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
