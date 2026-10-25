import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Sparkles, Square } from 'lucide-react'
import { SUGGESTIONS } from '../data'

export default function Hero({ query, onQuery, onSubmit, onStop, loading }) {
  const ref = useRef(null)

  // Grow the textarea with its content, up to a cap.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`
  }, [query])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <section className="hero">
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="eyebrow">
          <Sparkles size={14} /> 
        </span>
        <h1>
          Where to next?
          <br />
          <em>Let the agents plan it.</em>
        </h1>
        <p className="lede">
          Describe your trip in plain words. We search flights and hotels, draft a day-by-day
          itinerary, and hand you a polished plan — in under a minute.
        </p>
      </motion.div>

      <motion.form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <textarea
          ref={ref}
          rows={2}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          placeholder="e.g. Plan a complete 7-day Japan trip including flights, hotels and sightseeing under ₹2 lakhs"
          aria-label="Describe your trip"
        />
        <div className="composer-bar">
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button type="button" key={s} className="suggestion" onClick={() => onQuery(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
          {loading ? (
            <button type="button" className="cta cta-stop" onClick={onStop}>
              <Loader2 size={18} className="spin" />
              <span>Planning…</span>
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button type="submit" className="cta" disabled={!query.trim()}>
              <span>Generate plan</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </motion.form>
    </section>
  )
}
