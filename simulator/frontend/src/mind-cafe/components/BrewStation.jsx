import { motion } from 'framer-motion';

const MAX_SELECT = 3;

export default function BrewStation({ customer, selected, onToggle, onServe, ingredients, isSelf }) {
  const canServe = selected.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-lg"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{customer.avatar}</div>
        {isSelf ? (
          <>
            <p className="font-serif text-xl mb-1" style={{ color: '#2c1a0e' }}>What do you need?</p>
            <p className="font-mono text-xs" style={{ color: 'rgba(92,60,30,0.55)' }}>
              Brew yourself something honest.
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-base mb-1" style={{ color: '#2c1a0e' }}>
              What does {customer.name} need?
            </p>
            <p className="font-mono text-xs" style={{ color: 'rgba(92,60,30,0.5)' }}>
              Choose up to {MAX_SELECT} ingredients
            </p>
          </>
        )}
      </div>

      {/* Ingredient grid */}
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {ingredients.map(ing => {
          const isSelected = selected.includes(ing.id);
          const isDisabled = !isSelected && selected.length >= MAX_SELECT;

          return (
            <motion.button
              key={ing.id}
              onClick={() => !isDisabled && onToggle(ing.id)}
              whileHover={!isDisabled ? { scale: 1.06, y: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className="flex flex-col items-center gap-1.5 py-3 px-2 transition-all"
              style={{
                background: isSelected ? ing.color + '28' : 'rgba(255,255,255,0.55)',
                border: isSelected
                  ? `2px solid ${ing.dark}`
                  : '1px solid rgba(92,60,30,0.2)',
                opacity: isDisabled ? 0.35 : 1,
                boxShadow: isSelected ? `0 0 12px ${ing.color}33` : 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="text-2xl leading-none">{ing.emoji}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide leading-tight text-center"
                style={{ color: isSelected ? ing.dark : 'rgba(92,60,30,0.55)' }}>
                {ing.label}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ing.dark }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected display */}
      <div className="flex items-center justify-center gap-2 mb-6 min-h-[32px]">
        {selected.length === 0 ? (
          <p className="font-mono text-xs" style={{ color: 'rgba(92,60,30,0.35)' }}>
            Nothing selected yet
          </p>
        ) : (
          selected.map(id => {
            const ing = ingredients.find(i => i.id === id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-2.5 py-1"
                style={{ background: ing.color + '22', border: `1px solid ${ing.dark}55` }}
              >
                <span className="text-sm">{ing.emoji}</span>
                <span className="font-mono text-[10px]" style={{ color: ing.dark }}>{ing.label}</span>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Ingredient descriptions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
          {selected.map(id => {
            const ing = ingredients.find(i => i.id === id);
            return (
              <span key={id} className="font-mono text-[10px] italic" style={{ color: 'rgba(92,60,30,0.5)' }}>
                {ing.emoji} {ing.desc}
              </span>
            );
          })}
        </div>
      )}

      {/* Serve button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={canServe ? { scale: 1.04 } : {}}
          whileTap={canServe ? { scale: 0.97 } : {}}
          onClick={canServe ? onServe : undefined}
          className="px-10 py-4 font-mono text-sm uppercase tracking-widest transition-all"
          style={{
            background: canServe ? '#2c1a0e' : 'rgba(92,60,30,0.06)',
            border: canServe ? '1px solid #2c1a0e' : '1px solid rgba(92,60,30,0.18)',
            color: canServe ? '#fef3c7' : 'rgba(92,60,30,0.3)',
            cursor: canServe ? 'pointer' : 'not-allowed',
          }}
        >
          ☕ Serve
        </motion.button>
      </div>
    </motion.div>
  );
}
