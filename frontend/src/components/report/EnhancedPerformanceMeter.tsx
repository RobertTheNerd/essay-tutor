import React from 'react'
import { 
  getPerformanceDescription,
  ISEE_LEVELS,
  type ISEELevel 
} from '../../types/evaluation'

interface EnhancedPerformanceMeterProps {
  score: number
  level: ISEELevel
  className?: string
}

const EnhancedPerformanceMeter: React.FC<EnhancedPerformanceMeterProps> = ({
  score,
  level,
  className = ''
}) => {
  const levelInfo = ISEE_LEVELS[level]
  const currentLevel = Math.round(score)
  const description = getPerformanceDescription(score, level)
  
  // Calculate position for the score indicator (0-100%)
  const scorePosition = ((score - 1) / 3) * 100
  
  // Performance level definitions with modern gradients
  const performanceLevels = [
    {
      id: 1,
      name: 'Beginning',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
      glowColor: 'rgba(245, 158, 11, 0.3)'
    },
    {
      id: 2,
      name: 'Developing',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
      bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      glowColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      id: 3,
      name: 'Proficient',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      glowColor: 'rgba(16, 185, 129, 0.3)'
    },
    {
      id: 4,
      name: 'Advanced',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      glowColor: 'rgba(139, 92, 246, 0.3)'
    }
  ]
  
  return (
    <div className={`enhanced-performance-meter ${className}`} style={{ background: 'white', borderRadius: '16px', padding: '2rem 1.5rem', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: '500' }}>
            Overall Performance
          </h3>
        </div>
      </div>

      {/* Modern Performance Meter */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        
        {/* Gradient Progress Bar */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          {/* Background track */}
          <div style={{ 
            height: '24px', 
            background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)', 
            borderRadius: '50px',
            padding: '2px',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Progress segments */}
            <div style={{ display: 'flex', height: '100%', borderRadius: '50px', overflow: 'hidden' }}>
              {performanceLevels.map((perfLevel, index) => {
                const isFilled = true
                const isPartiallyFilled = perfLevel.id === currentLevel && score % 1 !== 0
                const fillPercentage = isPartiallyFilled ? (score % 1) * 100 : 100
                
                return (
                  <div 
                    key={perfLevel.id}
                    style={{
                      flex: 1,
                      position: 'relative',
                      background: isFilled ? perfLevel.gradient : 'transparent'
                    }}
                  >
                    {/* Partial fill for current segment */}
                    {isPartiallyFilled && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${fillPercentage}%`,
                        background: perfLevel.gradient,
                        borderRadius: index === 0 ? '50px 0 0 50px' : index === performanceLevels.length - 1 ? '0 50px 50px 0' : '0'
                      }} />
                    )}
                    
                    {/* gradient for filled segments */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                      }} />
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Floating score indicator */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: `${Math.max(2, Math.min(98, scorePosition))}%`,
            transform: 'translateX(-50%)',
            width: '40px',
            height: '40px',
            background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '700',
            boxShadow: `0 6px 20px ${levelInfo.color}60, 0 0 0 4px white`,
            border: '2px solid white',
            zIndex: 10
          }}>
          </div>
        </div>
        
        {/* Level Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          {performanceLevels.map((perfLevel) => (
            <div 
              key={perfLevel.id}
              style={{ 
                textAlign: 'center',
                opacity: perfLevel.id <= currentLevel ? 1 : 0.6,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: perfLevel.id <= currentLevel ? perfLevel.gradient : '#e5e7eb',
                margin: '0 auto 0.5rem auto',
                boxShadow: perfLevel.id <= currentLevel ? `0 3px 8px ${perfLevel.glowColor}` : 'none',
                transition: 'all 0.3s ease'
              }} />
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: perfLevel.id === currentLevel ? '700' : '500',
                color: perfLevel.id === currentLevel ? perfLevel.color : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {perfLevel.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Performance Description */}
      <div style={{
        textAlign: 'center',
        fontSize: '1rem',
        color: '#4b5563',
        lineHeight: '1.6',
        fontStyle: 'italic',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          background: `radial-gradient(circle at 20% 80%, ${levelInfo.color} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${levelInfo.color} 0%, transparent 50%)`
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {description}
        </div>
      </div>

      {/* Add shimmer animation */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  )
}

export default EnhancedPerformanceMeter