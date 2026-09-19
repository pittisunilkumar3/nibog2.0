"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Style {
  x: number; y: number; font_size: number; font_family: string; color: string; max_width?: number;
}
interface Template {
  id?: number; name: string; description: string; type: string;
  certificate_title: string; certificate_title_style: Style | null;
  appreciation_text: string; appreciation_text_style: Style | null;
  signature_image: string | null; signature_style: any;
  background_image: string | null; background_style: any;
  paper_size: string; orientation: string;
  fields: { name: string; x: number; y: number; font_size: number; font_family: string; color: string; alignment?: string }[];
  is_active: boolean;
}

const FONTS = ["Arial", "Georgia", "Times New Roman", "Verdana", "Trebuchet MS", "Courier New"];
const VARIABLES = [
  { token: "{participant_name}", label: "Name", sample: "Agan Prabakaran" },
  { token: "{age}", label: "Age", sample: "20 months" },
  { token: "{game_name}", label: "Game", sample: "RUNNING RACE" },
  { token: "{event_name}", label: "Event", sample: "BENGALURU SEASON 5" },
  { token: "{place}", label: "Place", sample: "Kalyana Lakshmi Hall, Bengaluru" },
  { token: "{venue_name}", label: "Venue", sample: "Kalyana Lakshmi Hall" },
  { token: "{city_name}", label: "City", sample: "Bengaluru" },
  { token: "{event_date}", label: "Date", sample: "15 Nov 2026" },
  { token: "{year}", label: "Year", sample: "2026" },
];
const renderVars = (raw: string) =>
  raw.replace(/\{(\w+)\}/g, (_: string, v: string) => {
    const f = VARIABLES.find((x) => x.token === `{${v}}`);
    return f ? f.sample : `{${v}}`;
  });
const renderRich = (raw: string) =>
  renderVars(raw).replace(/\[\[([^\[\]|]+)\|([^\[\]|]+)(?:\|([^\[\]|]*))?\]\]/g,
    (_m: string, txt: string, color: string, bold?: string) =>
      `<span style="color:${color};${bold ? "font-weight:bold;" : ""}">${txt}</span>`);

export default function CertificateDesignerPage() {
  const [name, setName] = useState("My Certificate");
  const [background, setBackground] = useState<string | null>(null);
  const [orientation, setOrientation] = useState("landscape");
  // participant name element
  const [nameStyle, setNameStyle] = useState<Style>({ x: 50, y: 47, font_size: 32, font_family: "Georgia", color: "#9d174d" });
  // description element
  const [descText, setDescText] = useState("for actively participating in NIBOG games and showing great spirit");
  const [descStyle, setDescStyle] = useState<Style>({ x: 50, y: 62, font_size: 16, font_family: "Arial", color: "#444444" });

  const [selected, setSelected] = useState<"name" | "desc">("name");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentId, setCurrentId] = useState<number | undefined>();
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [hlColor, setHlColor] = useState("#e11d48");
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ key: "name" | "desc"; dx: number; dy: number } | null>(null);

  const naturalW = orientation === "portrait" ? 595 : 842;
  const naturalH = orientation === "portrait" ? 842 : 595;

  /* load templates */
  const loadTemplates = useCallback(async () => {
    try {
      const r = await fetch("/api/certificate-templates/get-all");
      if (r.ok) setTemplates(await r.json());
    } catch {}
  }, []);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  /* responsive scale */
  useEffect(() => {
    const compute = () => {
      const w = wrapRef.current?.clientWidth ?? 800;
      setScale(Math.min(1, (w - 8) / naturalW));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [naturalW]);

  const styleOf = () => (selected === "name" ? nameStyle : descStyle);
  const setStyleOf = (patch: Partial<Style>) => {
    if (selected === "name") setNameStyle((s) => ({ ...s, ...patch }));
    else setDescStyle((s) => ({ ...s, ...patch }));
  };

  /* drag */
  const onDragStart = (e: React.MouseEvent, key: "name" | "desc") => {
    e.stopPropagation(); e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    const st = key === "name" ? nameStyle : descStyle;
    if (!rect) return;
    const ex = rect.left + (st.x / 100) * rect.width;
    const ey = rect.top + (st.y / 100) * rect.height;
    dragRef.current = { key, dx: e.clientX - ex, dy: e.clientY - ey };
    setSelected(key);
  };
  const onDragMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current; const rect = canvasRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - d.dx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - d.dy - rect.top) / rect.height) * 100));
    const patch = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    if (d.key === "name") setNameStyle((s) => ({ ...s, ...patch }));
    else setDescStyle((s) => ({ ...s, ...patch }));
  }, []);
  const onDragEnd = () => { dragRef.current = null; };

  /* wrap selected description text with highlight markup */
  const applyHighlight = (bold: boolean) => {
    const ta = descRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    if (start === end) { setStatus("Select some text first"); setTimeout(() => setStatus(""), 2000); return; }
    const sel = descText.slice(start, end);
    const marked = `[[${sel}|${hlColor}${bold ? "|b" : ""}]]`;
    setDescText(descText.slice(0, start) + marked + descText.slice(end));
  };

  /* upload background */
  const uploadBg = async (file: File) => {
    setUploading(true); setStatus("Uploading background…");
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/certificate-templates/upload-background", { method: "POST", body: fd });
      const j = await r.json();
      const up = j.file_path || j.url || j.path;
      if (!r.ok || !up) throw new Error(j.error || "Upload failed");
      setBackground(up); setStatus("Uploaded ✓");
    } catch (e: any) { setStatus("Upload failed: " + e.message); }
    setUploading(false);
    setTimeout(() => setStatus(""), 2500);
  };

  /* save */
  const save = async () => {
    setStatus("Saving…");
    const payload: Template = {
      id: currentId,
      name,
      description: "",
      type: "participation",
      certificate_title: "",
      certificate_title_style: null,
      appreciation_text: descText,
      appreciation_text_style: descStyle,
      signature_image: null,
      signature_style: { x: 82, y: 88, font_size: 12, color: "#888888", signature_type: "text", text: "NIBOG" },
      background_image: background,
      background_style: null,
      paper_size: "a4",
      orientation,
      fields: [{ name: "participant_name", ...nameStyle, alignment: "center" }],
      is_active: true,
    };
    try {
      const r = await fetch(currentId ? "/api/certificate-templates/update" : "/api/certificate-templates/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Save failed");
      const saved = Array.isArray(j) ? j[0] : j;
      if (saved?.id) setCurrentId(saved.id);
      setStatus("Saved ✓"); loadTemplates();
    } catch (e: any) { setStatus("Save failed: " + e.message); }
    setTimeout(() => setStatus(""), 3000);
  };

  const loadTpl = (t: Template) => {
    setCurrentId(t.id);
    setName(t.name);
    setBackground(t.background_image);
    setOrientation(t.orientation || "landscape");
    setDescText(t.appreciation_text || "");
    if (t.appreciation_text_style) setDescStyle({ x: t.appreciation_text_style.x ?? 50, y: t.appreciation_text_style.y ?? 62, font_size: t.appreciation_text_style.font_size ?? 16, font_family: t.appreciation_text_style.font_family ?? "Arial", color: t.appreciation_text_style.color ?? "#444444" });
    const pn = (t.fields || []).find((f) => f.name === "participant_name");
    if (pn) setNameStyle({ x: pn.x ?? 50, y: pn.y ?? 47, font_size: pn.font_size ?? 32, font_family: pn.font_family ?? "Georgia", color: pn.color ?? "#9d174d" });
    setSelected("name");
  };

  const delTpl = async (id?: number) => {
    if (!id || !confirm("Delete this template?")) return;
    await fetch("/api/certificate-templates/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (currentId === id) setCurrentId(undefined);
    setStatus("Deleted"); loadTemplates();
    setTimeout(() => setStatus(""), 2000);
  };

  const elStyle = (st: Style, key: "name" | "desc"): React.CSSProperties => ({
    position: "absolute", left: `${st.x}%`, top: `${st.y}%`, transform: "translate(-50%,-50%)",
    width: `${st.max_width || 80}%`, textAlign: "center", fontFamily: st.font_family, fontSize: `${st.font_size}px`,
    fontWeight: key === "name" ? "bold" : "normal",
    color: st.color, cursor: "grab", userSelect: "none", lineHeight: 1.3,
    outline: selected === key ? "2px dashed #ec4899" : "2px dashed transparent",
    outlineOffset: 5, borderRadius: 4, whiteSpace: "pre-wrap",
  });

  const sel = styleOf();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Link href="/admin" className="text-slate-500 hover:text-slate-800 text-xl leading-none">←</Link>
        <h1 className="font-bold text-slate-800 text-lg">🎨 Certificate Designer</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name"
          className="border rounded-lg px-3 py-1.5 text-sm w-44" />
        <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
          <option value="landscape">Landscape</option>
          <option value="portrait">Portrait</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          {status && <span className="text-sm text-pink-600 font-semibold">{status}</span>}
          <button onClick={() => { setCurrentId(undefined); setBackground(null); setName("My Certificate"); }} className="border rounded-lg px-3 py-1.5 text-sm hover:bg-slate-50">+ New</button>
          <button onClick={save} disabled={uploading} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg px-5 py-1.5 text-sm font-semibold shadow hover:opacity-90 disabled:opacity-50">
            💾 Save Template
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 p-4">
        {/* left: saved templates */}
        <div className="xl:w-56 shrink-0 bg-white rounded-xl shadow-sm p-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Saved Templates</div>
          <div className="space-y-1 max-h-[60vh] overflow-auto">
            {templates.map((t) => (
              <div key={t.id} className={`flex items-center rounded-lg ${currentId === t.id ? "bg-pink-50" : ""}`}>
                <button onClick={() => loadTpl(t)} className="flex-1 text-left px-3 py-2 text-sm truncate text-slate-700 hover:text-pink-600">
                  {t.name}
                </button>
                <button onClick={() => delTpl(t.id)} title="Delete" className="px-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
            {!templates.length && <div className="text-xs text-slate-400 px-2">No templates yet — design one and save</div>}
          </div>
        </div>

        {/* center: canvas */}
        <div className="flex-1 min-w-0">
          <div ref={wrapRef} className="bg-white rounded-xl shadow-sm p-3">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <label className="text-sm bg-slate-800 text-white rounded-lg px-3 py-1.5 cursor-pointer hover:opacity-90">
                🖼️ {background ? "Replace Background" : "Upload Background"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadBg(e.target.files[0])} />
              </label>
              {background && (
                <button onClick={() => setBackground(null)} className="text-xs text-red-500 border border-red-200 rounded-lg px-2 py-1.5 hover:bg-red-50">Remove</button>
              )}
              <span className="text-xs text-slate-400">Click an element to style it · drag to move</span>
            </div>
            <div className="overflow-auto flex justify-center">
              <div style={{ width: naturalW * scale, height: naturalH * scale }}>
                <div ref={canvasRef}
                  onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
                  style={{
                    width: naturalW, height: naturalH, transform: `scale(${scale})`, transformOrigin: "top left",
                    position: "relative", overflow: "hidden", background: "#fff",
                    backgroundImage: background ? `url(${background})` : undefined,
                    backgroundSize: "100% 100%", boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  {!background && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-lg">Upload a background image to begin</div>
                  )}
                  {/* participant name (sample preview) */}
                  <div style={elStyle(nameStyle, "name")} onMouseDown={(e) => onDragStart(e, "name")}>
                    Agan Prabakaran
                  </div>
                  {/* description */}
                  <div style={elStyle(descStyle, "desc")} onMouseDown={(e) => onDragStart(e, "desc")}
                    dangerouslySetInnerHTML={{ __html: renderRich(descText) }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* right: properties */}
        <div className="xl:w-72 shrink-0 bg-white rounded-xl shadow-sm p-4 space-y-4 max-h-[85vh] overflow-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Editing: {selected === "name" ? "Participant Name" : "Description"}
          </div>

          {selected === "desc" && (
            <div className="space-y-2">
              <textarea ref={descRef} value={descText} onChange={(e) => setDescText(e.target.value)} rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Description text" />
              <div className="flex flex-wrap gap-1">
                {VARIABLES.map((v) => (
                  <button key={v.token} onClick={() => setDescText((t) => t + (t && !t.endsWith(" ") ? " " : "") + v.token)}
                    className="text-xs border rounded-full px-2 py-0.5 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600">
                    + {v.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <input type="color" value={hlColor} onChange={(e) => setHlColor(e.target.value)} className="w-8 h-8 border rounded cursor-pointer" title="Highlight color" />
                <button onClick={() => applyHighlight(false)} className="text-xs flex-1 border rounded px-2 py-1.5 hover:bg-pink-50 hover:text-pink-600">
                  🖍️ Color selected text
                </button>
                <button onClick={() => applyHighlight(true)} className="text-xs border rounded px-2 py-1.5 hover:bg-slate-50" title="Color + bold">
                  <b>B</b>
                </button>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 leading-relaxed">
                Example: <i>…participated in the [[RUNNING RACE|#e11d48|b]] conducted by NIBOG…</i> — select text in the box, pick a color, tap 🖍️
              </div>
            </div>
          )}
          {selected === "name" && (
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
              The actual participant name is filled automatically for every child.
            </div>
          )}

          <div className="space-y-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-500">Position X %
                <input type="number" value={sel.x} onChange={(e) => setStyleOf({ x: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
              </label>
              <label className="text-xs text-slate-500">Position Y %
                <input type="number" value={sel.y} onChange={(e) => setStyleOf({ y: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
              </label>
              <label className="text-xs text-slate-500">Width %
                <input type="number" min={10} max={100} value={sel.max_width ?? 80} onChange={(e) => setStyleOf({ max_width: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
              </label>
              <label className="text-xs text-slate-500">Text size
                <input type="number" value={sel.font_size} onChange={(e) => setStyleOf({ font_size: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
              </label>
              <label className="text-xs text-slate-500">Color
                <input type="color" value={sel.color} onChange={(e) => setStyleOf({ color: e.target.value })} className="w-full h-8 border rounded cursor-pointer" />
              </label>
            </div>
            <label className="text-xs text-slate-500 block">Font
              <select value={sel.font_family} onChange={(e) => setStyleOf({ font_family: e.target.value })} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-0.5">
                {FONTS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
          </div>

          <div className="border-t pt-3 text-xs text-slate-400 leading-relaxed">
            <b className="text-slate-500">How it works:</b> upload your background, drag the Name & Description
            where you want, set size & font, then <b>Save Template</b>. Use it from the event Certificates page.
          </div>
        </div>
      </div>
    </div>
  );
}
