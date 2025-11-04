import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | NIBOG - New India Baby Olympic Games",
  description: "Learn how NIBOG collects, uses, and protects your personal information.",
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
