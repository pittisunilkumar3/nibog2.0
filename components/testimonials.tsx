import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

// Mock data - in a real app, this would come from an API
const testimonials = [
  {
    id: "1",
    name: "Harikrishna",
    avatar: "/images/baby-crawling.jpg",
    city: "Hyderabad",
    rating: 5,
    comment:
      "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    eventName: "Baby Crawling",
  },
  {
    id: "2",
    name: "Durga Prasad",
    avatar: "/images/baby-walker.jpg",
    city: "Bangalore",
    rating: 5,
    comment:
      "New India Baby Olympic games has been a great experience for my kids. They love competing with other kids and showing off their skills, and it's been great for their hand-eye coordination and fine motor skills. I love that they're learning important life skills like teamwork and sportsmanship while they're having fun.",
    eventName: "Baby Walker",
  },
  {
    id: "3",
    name: "Srujana",
    avatar: "/images/running-race.jpg",
    city: "Vizag",
    rating: 4,
    comment:
      "My kids love participating in games. It's been great for their problem-solving skills, as they get to tackle different challenges and puzzles. They've also developed their critical thinking skills.",
    eventName: "Running Race",
  },
]

export default function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="overflow-hidden">
          <CardContent className="relative p-6">
            <Quote className="absolute right-4 top-4 h-8 w-8 opacity-10" />
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{testimonial.name}</h4>
                <p className="text-xs text-muted-foreground">{testimonial.city}</p>
              </div>
            </div>
            <div className="mt-2 flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{testimonial.comment}</p>
            <p className="mt-2 text-xs font-medium">Event: {testimonial.eventName}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
