import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | NIBOG - New India Baby Olympic Games",
  description: "Read the terms and conditions for participating in NIBOG events and using our platform.",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
