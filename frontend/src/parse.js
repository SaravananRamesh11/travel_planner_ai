// Agent outputs are plain text; turn the structured ones into card data.
// Both parsers return [] when the text doesn't match so callers can fall back to markdown.

export function parseFlights(text) {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const field = (name) => block.match(new RegExp(`${name}:\\s*(.+)`))?.[1]?.trim()
      return {
        airline: field('Airline'),
        from: field('Departure'),
        to: field('Arrival'),
        status: field('Status'),
      }
    })
    .filter((f) => f.airline && f.from && f.to)
}

export function parseHotels(text) {
  if (!text) return []
  return text
    .split(/\n(?=\s*\d+\.\s)/)
    .map((block) => {
      const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean)
      const title = lines[0]?.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')
      const url = lines.find((l) => /^https?:\/\//.test(l))
      const description = lines.filter((l, i) => i > 0 && l !== url).join(' ')
      return { title, url, description }
    })
    .filter((h) => h.title && h.url)
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function buildMarkdown({ query, userId, sections, llmCalls }) {
  return `# Travel Plan
**Query:** ${query}
**Generated:** ${new Date().toLocaleString()}
**User ID:** ${userId}

---

## Flight Information
${sections.flight_agent || 'N/A'}

---

## Hotel Information
${sections.hotel_agent || 'N/A'}

---

## Itinerary
${sections.itinerary_agent || 'N/A'}

---

## Final Travel Plan
${sections.final_agent || 'N/A'}

---
*LLM Calls: ${llmCalls}*
`
}
