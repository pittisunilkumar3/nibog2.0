"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, Save, PlugZap, Send, Copy, ExternalLink, ShieldCheck } from "lucide-react"

export default function WhatsAppMetaPage() {
  const [phoneId, setPhoneId] = useState("")
  const [wabaId, setWabaId] = useState("")
  const [token, setToken] = useState("")
  const [tokenMasked, setTokenMasked] = useState("")
  const [apiVersion, setApiVersion] = useState("v21.0")
  const [verifyToken, setVerifyToken] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState<"" | "save" | "verify" | "send">("")
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [testTo, setTestTo] = useState("")
  const [testMsg, setTestMsg] = useState("Hello from NIBOG! WhatsApp Meta connection works 🎉")

  // ---- templates ----
  const [templates, setTemplates] = useState<any[]>([])
  const [tplForm, setTplForm] = useState({ id: 0, template_name: "", category: "UTILITY", language: "en", header_text: "", body_text: "", footer_text: "" })
  const [tplBusy, setTplBusy] = useState("")
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
      flash("\u2705 " + j.message)
      setTplForm({ id: 0, template_name: "", category: "UTILITY", language: "en", header_text: "", body_text: "", footer_text: "" })
      loadTemplates()
    } catch (e: any) { flash("\u274c " + e.message) }
    setTplBusy("")
  }
  const syncAll = async () => {
    setTplBusy("syncall")
    try {
      const r = await fetch("/api/whatsapp-meta/templates/sync-all", { method: "POST" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Sync failed")
      flash("\u2705 " + j.message)
      loadTemplates()
    } catch (e: any) { flash("\u274c " + e.message) }
    setTplBusy("")
  }
  const syncOne = async (id: number) => {
    setTplBusy("sync" + id)
    try {
      const r = await fetch(`/api/whatsapp-meta/templates/${id}/sync`, { method: "POST" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Sync failed")
      flash("\u2705 " + (j.message || j.status))
      loadTemplates()
    } catch (e: any) { flash("\u274c " + e.message) }
    setTplBusy("")
  }
  const removeTpl = async (id: number, name: string) => {
    if (!confirm(`Delete template "${name}" from Meta and NIBOG?`)) return
    setTplBusy("del" + id)
    try {
      const r = await fetch(`/api/whatsapp-meta/templates/${id}`, { method: "DELETE" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Delete failed")
      flash("\u2705 " + j.message)
      loadTemplates()
    } catch (e: any) { flash("\u274c " + e.message) }
    setTplBusy("")
  }
  const statusBadge = (st: string) => {
    const map: Record<string, string> = { APPROVED: "bg-green-600", PENDING: "bg-amber-500", REJECTED: "bg-red-600", PAUSED: "bg-orange-500", NOT_SUBMITTED: "bg-slate-400" }
    return <Badge className={(map[st] || "bg-slate-400") + " text-[10px]"}>{st}</Badge>
  }

  useEffect(() => {
    ;(async () => {
      const r = await fetch("/api/whatsapp-meta/settings")
      const j = await r.json()
      if (j.configured && j.settings) {
        setPhoneId(j.settings.phone_number_id || "")
        setWabaId(j.settings.waba_id || "")
        setApiVersion(j.settings.api_version || "v21.0")
        setVerifyToken(j.settings.verify_token || "")
        setIsActive(!!j.settings.is_active)
        setTokenMasked(j.settings.access_token_masked || "")
      }
    })()
  }, [])

  const flash = (m: string) => { setStatus(m); setTimeout(() => setStatus(""), 6000) }

  const save = async () => {
    setBusy("save")
    try {
      const body: any = { phone_number_id: phoneId, waba_id: wabaId, api_version: apiVersion, verify_token: verifyToken, is_active: isActive }
      if (token.trim()) body.access_token = token.trim()
      const r = await fetch("/api/whatsapp-meta/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Save failed")
      flash("✓ Configuration saved")
      setToken("")
      const r2 = await fetch("/api/whatsapp-meta/settings")
      const j2 = await r2.json()
      if (j2.configured) setTokenMasked(j2.settings.access_token_masked || "")
    } catch (e: any) { flash("Save failed: " + e.message) }
    setBusy("")
  }

  const verify = async () => {
    setBusy("verify")
    setVerifyResult(null)
    try {
      const body: any = { phone_number_id: phoneId, api_version: apiVersion }
      if (token.trim()) body.access_token = token.trim()
      const r = await fetch("/api/whatsapp-meta/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Verification failed")
      setVerifyResult(j)
      flash("✓ " + j.message)
    } catch (e: any) { flash("❌ " + e.message) }
    setBusy("")
  }

  const sendTest = async () => {
    setBusy("send")
    try {
      const r = await fetch("/api/whatsapp-meta/send-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: testTo, message: testMsg }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Send failed")
      flash("✓ Test message sent to " + testTo)
    } catch (e: any) { flash("❌ " + e.message) }
    setBusy("")
  }

  const webhookUrl = "https://www.nibog.in/api/whatsapp-meta/webhook"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-green-600" /> WhatsApp — Meta Cloud API
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your Meta WhatsApp Business account to send messages & notifications
        </p>
      </div>

      {status && (
        <div className="rounded-lg border px-4 py-3 text-sm bg-slate-50">{status}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Configuration
              {isActive ? <Badge className="bg-green-600">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
            </CardTitle>
            <CardDescription>Get these from <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">developers.facebook.com <ExternalLink className="h-3 w-3" /></a> → your app → WhatsApp → API Setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-slate-500">Phone Number ID *</label>
              <Input value={phoneId} onChange={(e) => setPhoneId(e.target.value)} placeholder="e.g. 123456789012345" />
            </div>
            <div>
              <label className="text-xs text-slate-500">WhatsApp Business Account ID (WABA)</label>
              <Input value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="e.g. 987654321098765" />
            </div>
            <div>
              <label className="text-xs text-slate-500">
                Permanent Access Token * {tokenMasked && <span className="text-green-600">(saved: {tokenMasked})</span>}
              </label>
              <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder={tokenMasked ? "Leave empty to keep saved token" : "EAAG..."} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Graph API Version</label>
                <Input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} placeholder="v21.0" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Webhook Verify Token</label>
                <Input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} placeholder="auto-generates on save" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Enable WhatsApp sending
            </label>
            <div className="flex gap-2 pt-1">
              <Button onClick={save} disabled={busy !== "" || !phoneId} className="flex-1">
                <Save className="mr-2 h-4 w-4" /> {busy === "save" ? "Saving…" : "Save Configuration"}
              </Button>
              <Button onClick={verify} disabled={busy !== "" || !phoneId} variant="outline">
                <PlugZap className="mr-2 h-4 w-4" /> {busy === "verify" ? "Checking…" : "Verify & Connect"}
              </Button>
            </div>
            {verifyResult && (
              <div className="rounded-lg border bg-green-50/60 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-green-700"><ShieldCheck className="h-4 w-4" /> Connected</div>
                <div className="text-slate-600 mt-1">
                  {verifyResult.verified_name && <>Business: <b>{verifyResult.verified_name}</b><br /></>}
                  {verifyResult.phone_number && <>Number: {verifyResult.phone_number}<br /></>}
                  {verifyResult.quality_rating && <>Quality: {verifyResult.quality_rating}</>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook (delivery reports)</CardTitle>
              <CardDescription>Register this in Meta App → WhatsApp → Configuration → Webhook</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Callback URL</label>
                <div className="flex gap-2">
                  <Input readOnly value={webhookUrl} className="text-xs" />
                  <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(webhookUrl)} title="Copy"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Verify Token</label>
                <div className="flex gap-2">
                  <Input readOnly value={verifyToken || "(save configuration first)"} className="text-xs" />
                  <Button variant="outline" size="icon" disabled={!verifyToken} onClick={() => navigator.clipboard.writeText(verifyToken)} title="Copy"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-xs text-slate-400">Subscribe to the <b>messages</b> field. Delivery statuses (sent/delivered/read/failed) are logged automatically.</p>
            </CardContent>
          </Card>

          {/* Send test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send Test Message</CardTitle>
              <CardDescription>Only works within a 24-hour customer service window, or reply to this message from the test number first</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">To (WhatsApp number with country code)</label>
                <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="e.g. 919876543210" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Message</label>
                <Input value={testMsg} onChange={(e) => setTestMsg(e.target.value)} />
              </div>
              <Button onClick={sendTest} disabled={busy !== "" || !testTo} className="w-full">
                <Send className="mr-2 h-4 w-4" /> {busy === "send" ? "Sending…" : "Send Test"}
              </Button>
              <p className="text-xs text-slate-400">
                For business-initiated messages (booking confirmations, certificates…) an approved Meta <b>template</b> is required — submit templates in Meta Business Manager, then NIBOG can use them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Message Templates (Meta approval)
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={syncAll} disabled={tplBusy !== ""}>
                {tplBusy === "syncall" ? "Syncing…" : "↻ Sync all from Meta"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Create templates here and submit them to Meta for approval. Business-initiated WhatsApp messages require an approved template.</CardDescription>
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
            <div>
              <label className="text-xs text-slate-500">Header (optional, max 60 chars)</label>
              <Input value={tplForm.header_text} onChange={(e) => setTplForm({ ...tplForm, header_text: e.target.value })} placeholder="e.g. Booking Confirmed" />
            </div>
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
                      <div className="font-medium">{t.template_name}</div>
                      <div className="text-xs text-slate-400 line-clamp-2 max-w-md">{t.body_text}</div>
                      {t.rejected_reason && <div className="text-xs text-red-500 mt-0.5">Reason: {t.rejected_reason}</div>}
                    </td>
                    <td className="px-2 py-2 text-xs">{t.category}<br /><span className="text-slate-400">{t.language}</span></td>
                    <td className="px-2 py-2">{statusBadge(t.status)}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button className="text-xs underline mr-3" onClick={() => setTplForm({ id: t.id, template_name: t.template_name, category: t.category, language: t.language, header_text: t.header_text || "", body_text: t.body_text || "", footer_text: t.footer_text || "" })}>Edit</button>
                      <button className="text-xs underline mr-3" disabled={tplBusy !== ""} onClick={() => syncOne(t.id)}>{tplBusy === "sync" + t.id ? "…" : "Sync"}</button>
                      <button className="text-xs underline text-red-600" disabled={tplBusy !== ""} onClick={() => removeTpl(t.id, t.template_name)}>{tplBusy === "del" + t.id ? "…" : "Delete"}</button>
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
