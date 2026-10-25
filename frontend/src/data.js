export const AGENTS = [
  { id: 'flight_agent', label: 'Flights', blurb: 'Searching live routes' },
  { id: 'hotel_agent', label: 'Hotels', blurb: 'Finding places to stay' },
  { id: 'itinerary_agent', label: 'Itinerary', blurb: 'Drafting day by day' },
  { id: 'final_agent', label: 'Final plan', blurb: 'Polishing everything' },
]

export const DESTINATIONS = [
  {
    name: 'Tokyo',
    country: 'Japan',
    prompt: 'Plan a 7-day Japan trip covering Tokyo and Kyoto with flights, hotels and sightseeing under ₹2 lakhs',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=75',
  },
  {
    name: 'Paris',
    country: 'France',
    prompt: 'Plan a romantic 5-day Paris trip with flights, boutique hotels and must-see sights',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=75',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    prompt: 'Plan a 10-day Bali backpacking trip with flights, budget stays and beaches',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=75',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    prompt: 'Plan a long weekend in Dubai with flights, hotels and top attractions',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=75',
  },
  {
    name: 'Rome',
    country: 'Italy',
    prompt: 'Plan a 6-day Rome trip with flights, central hotels and a food and history itinerary',
    img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=700&q=75',
  },
]

export const SUGGESTIONS = [
  '7-day Japan under ₹2L',
  'Paris trip for 5 days',
  'Dubai weekend trip',
  'Bali backpacking 10 days',
]

export const STACK = ['LangGraph', 'Groq', 'PostgreSQL', 'Tavily', 'AviationStack']
