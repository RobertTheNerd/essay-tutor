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
  const description = getPerformanceDescription(score)
  
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
        <div style={{ position: 'relative', marginBottom: '.5rem' }}>
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
        </div>
        
        {/* Level Labels */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'flex-start', 
          marginBottom: '2rem',
          position: 'relative' 
        }}>
          {performanceLevels.map((perfLevel) => (
            <div 
              key={perfLevel.id}
              style={{ 
                textAlign: 'center',
                opacity: perfLevel.id <= currentLevel ? 1 : 0.6,
                transition: 'all 0.3s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Text label first */}
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: perfLevel.id === currentLevel ? '700' : '500',
                color: perfLevel.color,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                {perfLevel.name}
              </div>
              
              {/* Triangle indicator below text for current level */}
              {perfLevel.id === currentLevel && (
                <div 
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: `12px solid ${perfLevel.color}`,
                    filter: `drop-shadow(0 2px 4px ${perfLevel.glowColor})`,
                    transition: 'all 0.3s ease'
                  }} 
                />
              )}
              
              {/* Empty space for non-current levels to maintain alignment */}
              {perfLevel.id !== currentLevel && (
                <div style={{ height: '12px' }} />
              )}
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