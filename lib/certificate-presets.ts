import type {
  CertificateTitleStyle,
  AppreciationTextStyle,
  SignatureStyle,
  BackgroundStyle,
  CertificateField,
} from "@/types/certificate"

/**
 * NIBOG Certificate Preset Design System
 * One-click professional certificate designs. Each preset pre-configures every
 * designer step (title, appreciation text, background, signature, fields).
 */

export interface CertificatePreset {
  id: string
  label: string
  tagline: string
  type: "participation" | "winner"
  templateName: string
  templateDescription: string
  certificateTitle: string
  certificateTitleStyle: CertificateTitleStyle
  appreciationText: string
  appreciationTextStyle: AppreciationTextStyle
  backgroundStyle: BackgroundStyle & {
    ornament?: "none" | "double" | "inset"
    inner_border_color?: string
    inner_border_width?: number
    corner_ornament?: boolean
    seal?: { enabled: boolean; color?: string; text?: string; x?: number; y?: number }
    watermark?: { enabled: boolean; text?: string; color?: string; opacity?: number }
  }
  signatureStyle: SignatureStyle
  paperSize: "a4" | "letter" | "a3"
  orientation: "landscape" | "portrait"
  fields: CertificateField[]
  /** Gallery thumbnail colors */
  preview: { bg: string; border: string; title: string; accent: string }
}

const commonFields = (opts: { nameColor: string; smallColor: string; font?: string }): CertificateField[] => [
  {
    id: "preset-participant-name",
    name: "participant_name",
    type: "text",
    required: true,
    x: 50, y: 40, max_width: 76,
    font_size: 40, font_family: opts.font || "Georgia, serif",
    font_weight: "bold", color: opts.nameColor, alignment: "center",
    underline: false,
  },
  {
    id: "preset-game-name",
    name: "game_name",
    type: "text",
    required: false,
    x: 50, y: 52, max_width: 70,
    font_size: 16, font_family: opts.font || "Georgia, serif",
    font_style: "italic", color: opts.smallColor, alignment: "center",
  },
  {
    id: "preset-event-name",
    name: "event_name",
    type: "text",
    required: true,
    x: 50, y: 63, max_width: 80,
    font_size: 18, font_family: opts.font || "Georgia, serif",
    font_weight: "bold", color: opts.smallColor, alignment: "center",
  },
  {
    id: "preset-event-date",
    name: "event_date",
    type: "date",
    required: false,
    x: 32, y: 72, max_width: 40,
    font_size: 13, font_family: opts.font || "Georgia, serif",
    color: opts.smallColor, alignment: "center",
  },
  {
    id: "preset-venue-city",
    name: "city_name",
    type: "text",
    required: false,
    x: 68, y: 72, max_width: 40,
    font_size: 13, font_family: opts.font || "Georgia, serif",
    color: opts.smallColor, alignment: "center",
  },
  {
    id: "preset-cert-number",
    name: "certificate_number",
    type: "text",
    required: false,
    x: 16, y: 94, max_width: 30,
    font_size: 9, font_family: "Arial",
    color: opts.smallColor, alignment: "left",
  },
]

export const CERTIFICATE_PRESETS: CertificatePreset[] = [
  {
    id: "royal-gold",
    label: "Royal Gold & Navy",
    tagline: "Regal double-frame with gold accents — the classic award look",
    type: "participation",
    templateName: "Royal Gold Participation Certificate",
    templateDescription: "Premium navy and gold certificate with ornamental double frame and seal",
    certificateTitle: "CERTIFICATE OF PARTICIPATION",
    certificateTitleStyle: {
      x: 50, y: 12, max_width: 86,
      font_size: 34, font_family: "Georgia, serif", font_weight: "bold",
      color: "#d4af37", alignment: "center",
      letter_spacing: 4, text_transform: "uppercase",
    },
    appreciationText: "This certificate is proudly presented to",
    appreciationTextStyle: {
      text: "This certificate is proudly presented to",
      x: 50, y: 26, max_width: 70,
      font_size: 15, font_family: "Georgia, serif", font_style: "italic",
      color: "#e8d9b5", alignment: "center",
    },
    backgroundStyle: {
      type: "solid", solid_color: "#16213e",
      border_enabled: true, border_color: "#d4af37", border_width: 6, border_style: "solid",
      ornament: "double", inner_border_color: "#d4af37", inner_border_width: 1,
      corner_ornament: true,
      seal: { enabled: true, color: "#d4af37", text: "NIBOG", x: 85, y: 85 },
      watermark: { enabled: true, text: "NIBOG", color: "#ffffff", opacity: 0.04 },
    },
    signatureStyle: {
      x: 78, y: 88, signature_type: "text", text: "Authorized Signature",
      font_family: "Georgia, serif", font_size: 14, color: "#e8d9b5",
    },
    paperSize: "a4",
    orientation: "landscape",
    fields: commonFields({ nameColor: "#f5e6c8", smallColor: "#c9b98a" }),
    preview: { bg: "#16213e", border: "#d4af37", title: "#d4af37", accent: "#e8d9b5" },
  },
  {
    id: "modern-gradient",
    label: "Modern NIBOG Gradient",
    tagline: "Bold purple-pink gradient matching NIBOG brand",
    type: "participation",
    templateName: "Modern Gradient Participation Certificate",
    templateDescription: "Vibrant purple to pink gradient with clean modern typography",
    certificateTitle: "CERTIFICATE OF PARTICIPATION",
    certificateTitleStyle: {
      x: 50, y: 12, max_width: 88,
      font_size: 32, font_family: "Arial", font_weight: "bold",
      color: "#ffffff", alignment: "center",
      letter_spacing: 3, text_transform: "uppercase",
    },
    appreciationText: "is awarded to",
    appreciationTextStyle: {
      text: "This certificate is awarded to",
      x: 50, y: 26, max_width: 70,
      font_size: 15, font_family: "Arial",
      color: "#f3e8ff", alignment: "center",
    },
    backgroundStyle: {
      type: "gradient", gradient_colors: ["#6d28d9", "#db2777"], gradient_direction: "diagonal",
      border_enabled: true, border_color: "#ffffff", border_width: 3, border_style: "solid",
      ornament: "none",
      seal: { enabled: true, color: "#ffffff", text: "★", x: 85, y: 85 },
      watermark: { enabled: true, text: "NIBOG", color: "#ffffff", opacity: 0.05 },
    },
    signatureStyle: {
      x: 78, y: 88, signature_type: "text", text: "Authorized Signature",
      font_family: "Arial", font_size: 14, color: "#ffffff",
    },
    paperSize: "a4",
    orientation: "landscape",
    fields: commonFields({ nameColor: "#ffffff", smallColor: "#f3e8ff", font: "Arial" }),
    preview: { bg: "linear-gradient(135deg,#6d28d9,#db2777)", border: "#ffffff", title: "#ffffff", accent: "#f3e8ff" },
  },
  {
    id: "pastel-baby",
    label: "Pastel Baby Bliss",
    tagline: "Soft pastel charm — perfect for little champions",
    type: "participation",
    templateName: "Pastel Baby Participation Certificate",
    templateDescription: "Gentle pastel certificate with playful styling for baby events",
    certificateTitle: "CERTIFICATE OF PARTICIPATION",
    certificateTitleStyle: {
      x: 50, y: 12, max_width: 88,
      font_size: 30, font_family: "Arial", font_weight: "bold",
      color: "#9d174d", alignment: "center",
      letter_spacing: 2, text_transform: "uppercase",
    },
    appreciationText: "🎀 This certificate goes to 🎀",
    appreciationTextStyle: {
      text: "This certificate goes to",
      x: 50, y: 26, max_width: 70,
      font_size: 15, font_family: "Arial",
      color: "#9d174d", alignment: "center",
    },
    backgroundStyle: {
      type: "solid", solid_color: "#fff5f7",
      border_enabled: true, border_color: "#f9a8d4", border_width: 8, border_style: "solid",
      ornament: "inset", inner_border_color: "#fbcfe8", inner_border_width: 2,
      corner_ornament: true,
      seal: { enabled: true, color: "#ec4899", text: "★", x: 85, y: 85 },
    },
    signatureStyle: {
      x: 78, y: 88, signature_type: "text", text: "With Love, NIBOG",
      font_family: "Arial", font_size: 14, color: "#9d174d",
    },
    paperSize: "a4",
    orientation: "landscape",
    fields: commonFields({ nameColor: "#be185d", smallColor: "#a15590", font: "Arial" }),
    preview: { bg: "#fff5f7", border: "#f9a8d4", title: "#9d174d", accent: "#be185d" },
  },
  {
    id: "champion-gold",
    label: "Champion Winner",
    tagline: "Deep amber trophy style for winners and toppers",
    type: "winner",
    templateName: "Champion Winner Certificate",
    templateDescription: "Winner certificate with rich amber tones and trophy styling",
    certificateTitle: "🏆 WINNER 🏆",
    certificateTitleStyle: {
      x: 50, y: 12, max_width: 88,
      font_size: 36, font_family: "Georgia, serif", font_weight: "bold",
      color: "#fde68a", alignment: "center",
      letter_spacing: 4, text_transform: "uppercase",
    },
    appreciationText: "1st Place — Champion of",
    appreciationTextStyle: {
      text: "This champion trophy is awarded to",
      x: 50, y: 26, max_width: 70,
      font_size: 15, font_family: "Georgia, serif", font_style: "italic",
      color: "#fef3c7", alignment: "center",
    },
    backgroundStyle: {
      type: "gradient", gradient_colors: ["#78350f", "#b45309"], gradient_direction: "vertical",
      border_enabled: true, border_color: "#fde68a", border_width: 6, border_style: "double",
      ornament: "double", inner_border_color: "#fde68a", inner_border_width: 1,
      seal: { enabled: true, color: "#fde68a", text: "★", x: 85, y: 85 },
      watermark: { enabled: true, text: "★", color: "#ffffff", opacity: 0.05 },
    },
    signatureStyle: {
      x: 78, y: 88, signature_type: "text", text: "Authorized Signature",
      font_family: "Georgia, serif", font_size: 14, color: "#fef3c7",
    },
    paperSize: "a4",
    orientation: "landscape",
    fields: commonFields({ nameColor: "#fffbeb", smallColor: "#fde68a" }),
    preview: { bg: "linear-gradient(180deg,#78350f,#b45309)", border: "#fde68a", title: "#fde68a", accent: "#fffbeb" },
  },
  {
    id: "classic-minimal",
    label: "Classic Minimal",
    tagline: "Clean white with a single elegant rule — timeless",
    type: "participation",
    templateName: "Classic Minimal Participation Certificate",
    templateDescription: "Minimalist white certificate with refined typography",
    certificateTitle: "Certificate of Participation",
    certificateTitleStyle: {
      x: 50, y: 12, max_width: 88,
      font_size: 30, font_family: "Georgia, serif", font_weight: "normal",
      color: "#111827", alignment: "center",
      letter_spacing: 1, text_transform: "capitalize",
    },
    appreciationText: "This certificate is presented to",
    appreciationTextStyle: {
      text: "This certificate is presented to",
      x: 50, y: 26, max_width: 70,
      font_size: 14, font_family: "Georgia, serif", font_style: "italic",
      color: "#4b5563", alignment: "center",
    },
    backgroundStyle: {
      type: "solid", solid_color: "#ffffff",
      border_enabled: true, border_color: "#111827", border_width: 2, border_style: "solid",
      ornament: "none",
    },
    signatureStyle: {
      x: 78, y: 88, signature_type: "text", text: "Authorized Signature",
      font_family: "Georgia, serif", font_size: 14, color: "#111827",
    },
    paperSize: "a4",
    orientation: "landscape",
    fields: commonFields({ nameColor: "#111827", smallColor: "#4b5563" }),
    preview: { bg: "#ffffff", border: "#111827", title: "#111827", accent: "#4b5563" },
  },
  {
    id: "formal-classic",
    label: "Formal Academic",
    tagline: "Ivory and maroon double-frame — traditional award",
    type: "winner",
    templateName: "Formal Academic Certificate",
    templateDescription: "Traditional ivory certificate with maroon and navy formal frame",
    certificateTitle: "CERTIFICATE OF ACHIEVEMENT",
    certificateTitleStyle: {
      x: 50, y: 12, max_width: 86,
      font_size: 32, font_family: "Georgia, serif", font_weight: "bold",
      color: "#7f1d1d", alignment: "center",
      letter_spacing: 3, text_transform: "uppercase",
    },
    appreciationText: "This honour is bestowed upon",
    appreciationTextStyle: {
      text: "This honour is bestowed upon",
      x: 50, y: 26, max_width: 70,
      font_size: 15, font_family: "Georgia, serif", font_style: "italic",
      color: "#312e81", alignment: "center",
    },
    backgroundStyle: {
      type: "solid", solid_color: "#fdf8ee",
      border_enabled: true, border_color: "#7f1d1d", border_width: 8, border_style: "double",
      ornament: "double", inner_border_color: "#312e81", inner_border_width: 1,
      corner_ornament: true,
      seal: { enabled: true, color: "#7f1d1d", text: "NIBOG", x: 85, y: 85 },
      watermark: { enabled: true, text: "NIBOG", color: "#7f1d1d", opacity: 0.03 },
    },
    signatureStyle: {
      x: 78, y: 88, signature_type: "text", text: "Authorized Signature",
      font_family: "Georgia, serif", font_size: 14, color: "#312e81",
    },
    paperSize: "a4",
    orientation: "landscape",
    fields: commonFields({ nameColor: "#1f2937", smallColor: "#312e81" }),
    preview: { bg: "#fdf8ee", border: "#7f1d1d", title: "#7f1d1d", accent: "#312e81" },
  },
]
