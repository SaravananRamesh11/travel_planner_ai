import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { DESTINATIONS } from '../data'

export default function Destinations({ onPick, disabled }) {
  return (
    <section className="destinations" aria-label="Popular destinations">
      <div className="section-label">Need inspiration?</div>
      <div className="dest-grid">
        {DESTINATIONS.map((d, i) => (
          <motion.button
            key={d.name}
            type="button"
            className="dest"
            disabled={disabled}
            onClick={() => onPick(d.prompt)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 + i * 0.07 }}
            whileHover={{ y: -6 }}
          >
            <img src={d.img} alt="" loading="lazy" />
            <span className="dest-shade" />
            <span className="dest-label">
              <strong>{d.name}</strong>
              <small>
                <MapPin size={11} /> {d.country}
              </small>
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
