import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Hotel,
  Map,
  Plane,
  PlaneTakeoff,
  Sparkles,
} from 'lucide-react'
import Markdown from './Markdown'
import { buildMarkdown, hostOf, parseFlights, parseHotels } from '../parse'

const TABS = [
  { id: 'final_agent', label: 'Final plan', icon: Sparkles },
  { id: 'flight_agent', label: 'Flights', icon: Plane },
  { id: 'hotel_agent', label: 'Hotels', icon: Hotel },
  { id: 'itinerary_agent', label: 'Itinerary', icon: Map },
]

function FlightCards({ text }) {
  const flights = useMemo(() => parseFlights(text), [text])
  if (!flights.length) return text ? <Markdown>{text}</Markdown> : <Empty label="No flight data returned." />
  return (
    <div className="flight-grid">
      {flights.map((f, i) => (
        <article key={i} className="ticket">
          <header>
            <span className="airline">{f.airline}</span>
            {f.status && <span className={`badge badge-${f.status}`}>{f.status}</span>}
          </header>
          <div className="route">
            <div>
              <small>From</small>
              <strong>{f.from}</strong>
            </div>
            <div className="route-line">
              <span />
              <PlaneTakeoff size={18} />
              <span />
            </div>
            <div>
              <small>To</small>
              <strong>{f.to}</strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function HotelCards({ text }) {
  const hotels = useMemo(() => parseHotels(text), [text])
  if (!hotels.length) return text ? <Markdown>{text}</Markdown> : <Empty label="No hotel data returned." />
  return (
    <div className="hotel-grid">
      {hotels.map((h, i) => (
        <a key={i} className="hotel" href={h.url} target="_blank" rel="noreferrer">
          <span className="hotel-rank">{i + 1}</span>
          <div className="hotel-body">
            <strong>{h.title}</strong>
            <p>{h.description}</p>
            <span className="hotel-link">
              {hostOf(h.url)} <ExternalLink size={12} />
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}

function Empty({ label }) {
  return <p className="empty">{label}</p>
}

export default function Results({ query, userId, sections, stats, running }) {
  const [tab, setTab] = useState('final_agent')
  const [copied, setCopied] = useState(false)

  const markdown = buildMarkdown({ query, userId, sections, llmCalls: stats.llmCalls })
  const available = (id) => Boolean(sections[id])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sections.final_agent || markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `travel_plan_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.section
      className="results"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results-head">
        <div>
          <span className="section-label">Your trip</span>
          <h2 className="results-title">{query}</h2>
        </div>
        <div className="actions">
          <button className="btn" onClick={copy} disabled={!available('final_agent')}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy plan'}
          </button>
          <button className="btn btn-primary" onClick={download} disabled={running}>
            <Download size={16} /> Download .md
          </button>
        </div>
      </div>

      <div className="stats">
        <Stat icon={FileText} value={stats.agents} label="Agents run" />
        <Stat icon={Sparkles} value={stats.llmCalls} label="LLM calls" />
        <Stat icon={Clock} value={stats.duration ? `${stats.duration}s` : '—'} label="Time taken" />
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            {label}
            {available(id) && <span className="tab-dot" />}
          </button>
        ))}
      </div>

      <div className="panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {!available(tab) ? (
              <Skeleton running={running} />
            ) : tab === 'flight_agent' ? (
              <FlightCards text={sections[tab]} />
            ) : tab === 'hotel_agent' ? (
              <HotelCards text={sections[tab]} />
            ) : (
              <Markdown>{sections[tab]}</Markdown>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="stat">
      <span className="stat-icon">
        <Icon size={18} />
      </span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  )
}

function Skeleton({ running }) {
  if (!running) return <Empty label="Nothing here yet." />
  return (
    <div className="skeleton" aria-label="Loading">
      <span style={{ width: '62%' }} />
      <span style={{ width: '94%' }} />
      <span style={{ width: '88%' }} />
      <span style={{ width: '71%' }} />
    </div>
  )
}
