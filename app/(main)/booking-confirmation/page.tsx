import type { Metadata } from "next"
import BookingConfirmationClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Booking Confirmation | NIBOG",
  description: "Your booking has been confirmed",
}

export default function BookingConfirmationPage() {
  return <BookingConfirmationClientPage />
}
