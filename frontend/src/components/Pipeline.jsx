import { motion } from 'framer-motion'
import { Check, FileText, Hotel, Map, Plane } from 'lucide-react'
import { AGENTS } from '../data'

const ICONS = {
  flight_agent: Plane,
  hotel_agent: Hotel,
  itinerary_agent: Map,
  final_agent: FileText,
}

// status per agent: 'pending' | 'running' | 'done'
export default function Pipeline({ statuses, failed }) {
  const doneCount = AGENTS.filter((a) => statuses[a.id] === 'done').length
  const progress = (doneCount / AGENTS.length) * 100

  return (
    <motion.section
      className="pipeline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Agent pipeline"
    >
      <div className="pipeline-head">
        <h2>Agent pipeline</h2>
        <span className="pipeline-count">
          {doneCount}/{AGENTS.length} complete
        </span>
      </div>

      <div className="progress">
        <motion.div
          className={`progress-bar ${failed ? 'is-failed' : ''}`}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>

      <ol className="steps">
        {AGENTS.map((agent, i) => {
          const status = statuses[agent.id]
          const Icon = ICONS[agent.id]
          return (
            <li key={agent.id} className={`step is-${status}`}>
              <span className="step-icon">
                {status === 'done' ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
                {status === 'running' && <span className="pulse" />}
              </span>
              <span className="step-text">
                <span className="step-num">Step {i + 1}</span>
                <strong>{agent.label}</strong>
                <small>
                  {status === 'done' ? 'Done' : status === 'running' ? agent.blurb + '…' : 'Waiting'}
                </small>
              </span>
            </li>
          )
        })}
      </ol>
    </motion.section>
  )
}
