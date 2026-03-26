import React, { useMemo } from 'react';

/**
 * WeatherBackground Component
 * Features:
 * - Dynamic background gradients based on weather condition
 * - Smooth transitions
 * - Time-aware theming (day/night)
 * - Rain effect overlay (optional)
 */

const WeatherBackground = ({ weatherCondition, isDaytime = true, isRaining = false }) => {
  const getBackgroundStyle = useMemo(() => {
    const condition = (weatherCondition || '').toLowerCase();
    let baseGradient = '';
    let accentColor = '';

    // Determine if it's day or night
    if (!isDaytime) {
      // Night backgrounds
      if (condition.includes('rain') || condition.includes('drizzle')) {
        baseGradient = 'linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #1a1d2e 100%)';
      } else if (condition.includes('cloud')) {
        baseGradient = 'linear-gradient(135deg, #0a0f1f 0%, #1a2442 50%, #0f1829 100%)';
      } else if (condition.includes('clear') || condition.includes('sunny')) {
        baseGradient = 'linear-gradient(135deg, #0d1b3d 0%, #1a2d52 50%, #0f1f3f 100%)';
      } else if (condition.includes('snow')) {
        baseGradient = 'linear-gradient(135deg, #1a2d4d 0%, #2e4a6f 50%, #1a2d4d 100%)';
      } else {
        // Default night
        baseGradient = 'linear-gradient(135deg, #0f172a 0%, #1a2640 100%)';
      }
    } else {
      // Day backgrounds
      if (condition.includes('rain') || condition.includes('drizzle')) {
        // Dark rainy background
        baseGradient = 'linear-gradient(135deg, #334155 0%, #475569 50%, #1e293b 100%)';
        accentColor = 'rgba(100, 116, 139, 0.3)';
      } else if (condition.includes('cloud') || condition.includes('overcast')) {
        // Soft grey/blue gradient
        baseGradient = 'linear-gradient(135deg, #64748b 0%, #78909c 50%, #546e7a 100%)';
        accentColor = 'rgba(148, 163, 184, 0.2)';
      } else if (condition.includes('clear') || condition.includes('sunny')) {
        // Bright sunny gradient
        baseGradient = 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)';
        accentColor = 'rgba(255, 193, 7, 0.1)';
      } else if (condition.includes('snow')) {
        // Cold snowy gradient
        baseGradient = 'linear-gradient(135deg, #e0f4ff 0%, #b3e5fc 50%, #81d4fa 100%)';
        accentColor = 'rgba(255, 255, 255, 0.2)';
      } else if (condition.includes('mist') || condition.includes('fog')) {
        // Foggy gradient
        baseGradient = 'linear-gradient(135deg, #a8b5c9 0%, #bac4d9 50%, #a8b5c9 100%)';
        accentColor = 'rgba(255, 255, 255, 0.15)';
      } else if (condition.includes('thunder') || condition.includes('storm')) {
        // Stormy gradient
        baseGradient = 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #3730a3 100%)';
        accentColor = 'rgba(139, 92, 246, 0.2)';
      } else {
        // Default day
        baseGradient = 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
      }
    }

    return { baseGradient, accentColor };
  }, [weatherCondition, isDaytime]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: getBackgroundStyle.baseGradient,
        zIndex: -1,
        transition: 'background 1s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Rain effect overlay */}
      {isRaining && isDaytime && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.05) 2px,
              rgba(255, 255, 255, 0.05) 4px
            )`,
            animation: 'rainFlow 0.5s linear infinite',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Accent overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: getBackgroundStyle.accentColor,
          pointerEvents: 'none',
          transition: 'background 0.6s ease'
        }}
      />

      <style>{`
        @keyframes rainFlow {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(100%);
          }
        }

        @keyframes fadeInBg {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherBackground;
