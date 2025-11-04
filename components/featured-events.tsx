import { AnimatePresence } from "framer-motion"

const STORAGE_KEY = 'nibog_saved_events'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Heart } from "lucide-react"

// Mock data - in a real app, this would come from an API

