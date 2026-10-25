import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import Destinations from './components/Destinations'
import Pipeline from './components/Pipeline'
import Results from './components/Results'
import { streamPlan } from './api'
import { AGENTS } from './data'

const idleStatuses = () => Object.fromEntries(AGENTS.map((a) => [a.id, 'pending']))

export default function App() {
  const [userId, setUserId] = useState('traveler')
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [statuses, setStatuses] = useState(idleStatuses)
  const [sections, setSections] = useState({})
  const [stats, setStats] = useState({ agents: 0, llmCalls: 0, duration: 0 })
  const [error, setError] = useState('')
  const abortRef = useRef(null)
  const resultsRef = useRef(null)

  const handleEvent = useCallback((event) => {
    if (event.type === 'node') {
      setSections((s) => ({ ...s, [event.node]: event.text }))
      setStats((s) => ({ ...s, agents: s.agents + 1, llmCalls: event.llm_calls }))
      // The graph is linear: when one agent finishes, the next one starts.
      setStatuses((prev) => {
        const next = { ...prev, [event.node]: 'done' }
        const following = AGENTS[AGENTS.findIndex((a) => a.id === event.node) + 1]
        if (following) next[following.id] = 'running'
        return next
      })
    } else if (event.type === 'done') {
      setStats((s) => ({ ...s, duration: event.duration, llmCalls: event.llm_calls }))
    } else if (event.type === 'error') {
      setError(event.message)
    }
  }, [])

  const generate = async () => {
    const text = query.trim()
    if (!text || loading) return

    const controller = new AbortController()
    abortRef.current = controller

    setError('')
    setSubmitted(text)
    setSections({})
    setStats({ agents: 0, llmCalls: 0, duration: 0 })
    setStatuses({ ...idleStatuses(), [AGENTS[0].id]: 'running' })
    setStarted(true)
    setLoading(true)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)

    try {
      await streamPlan({ query: text, userId, signal: controller.signal, onEvent: handleEvent })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(
          err instanceof TypeError
            ? 'Could not reach the planner API. Is the backend running on port 8010?'
            : err.message,
        )
      }
    } finally {
      setLoading(false)
      setStatuses((prev) =>
        Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v === 'running' ? 'pending' : v])),
      )
    }
  }

  const stop = () => abortRef.current?.abort()

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <span className="grain" />
      </div>

      <Header userId={userId} onUserId={setUserId} />

      <main className="shell">
        <Hero query={query} onQuery={setQuery} onSubmit={generate} onStop={stop} loading={loading} />
        <Destinations onPick={setQuery} disabled={loading} />

        <AnimatePresence>
          {error && (
            <motion.div
              className="alert"
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button onClick={() => setError('')} aria-label="Dismiss">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {started && (
          <div ref={resultsRef} className="output">
            <Pipeline statuses={statuses} failed={Boolean(error)} />
            <Results query={submitted} userId={userId} sections={sections} stats={stats} running={loading} />
          </div>
        )}
      </main>

      <footer className="footer"></footer>
    </>
  )
}
