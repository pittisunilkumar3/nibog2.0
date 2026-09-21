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
    </div>
  )
}
