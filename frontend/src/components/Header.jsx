import { Plane, User } from 'lucide-react'
import { STACK } from '../data'

export default function Header({ userId, onUserId }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Plane size={18} strokeWidth={2.4} />
          </span>
          <span className="brand-name">Wanderly</span>
        </a>

        <div className="stack">
          {STACK.map((s) => (
            <span key={s} className="stack-chip">
              {s}
            </span>
          ))}
        </div>

        <label className="user-pill" title="Session ID — keeps travel history across queries">
          <User size={15} />
          <input
            value={userId}
            onChange={(e) => onUserId(e.target.value)}
            spellCheck={false}
            aria-label="User ID"
          />
        </label>
      </div>
    </header>
  )
}
