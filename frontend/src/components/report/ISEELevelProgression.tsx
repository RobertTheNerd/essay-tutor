import React from 'react'
import { ISEE_LEVELS, type ISEELevel } from '../../types/evaluation'

interface ISEELevelProgressionProps {
  currentLevel: ISEELevel
  className?: string
}

const ISEELevelProgression: React.FC<ISEELevelProgressionProps> = ({
  currentLevel,
  className = ''
}) => {
  const levels = Object.values(ISEE_LEVELS)
  
  return (
    <div className={`isee-level-progression ${className}`}>
      <div className="level-progression-header">
        <h3>ISEE Level Assessment</h3>
        <span className="current-level-indicator">
          {ISEE_LEVELS[currentLevel].name} • {ISEE_LEVELS[currentLevel].grades}
        </span>
      </div>
      
      <div className="level-progression-bar">
        <div className="gradient-background">
          {levels.map((level, index) => {
            const isActive = level.id === currentLevel
            const position = (index / (levels.length - 1)) * 100
            
            return (
              <div 
                key={level.id}
                className={`level-marker ${isActive ? 'active' : 'inactive'}`}
                style={{ left: `${position}%` }}
              >
                <div 
                  className={`level-dot ${isActive ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: isActive ? level.color : 'rgba(255,255,255,0.6)',
                    borderColor: level.color 
                  }}
                />
                <div className={`level-label ${isActive ? 'active' : ''}`}>
                  <div className="level-name">{level.name}</div>
                  <div className="level-grades">{level.grades}</div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Active level highlight */}
        <div 
          className="active-level-highlight"
          style={{
            left: `${(levels.findIndex(l => l.id === currentLevel) / (levels.length - 1)) * 100}%`,
            background: `linear-gradient(90deg, ${ISEE_LEVELS[currentLevel].color}44, ${ISEE_LEVELS[currentLevel].color}88)`
          }}
        />
      </div>
      
      <div className="progression-description">
        <span className="progression-text">
          Assessment tailored for {ISEE_LEVELS[currentLevel].grades.toLowerCase()} cognitive development and academic expectations
        </span>
      </div>
    </div>
  )
}

export default ISEELevelProgression