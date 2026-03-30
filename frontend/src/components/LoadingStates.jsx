import React from 'react';

/**
 * LoadingSkeletons Component
 * Shows skeleton UI while data is loading
 */

const WeatherSkeleton = () => (
  <div
    style={{
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}
  >
    {/* Hero Section Skeleton */}
    <div
      style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '1.5rem',
        padding: '2rem',
        marginBottom: '2rem',
        minHeight: '300px'
      }}
    >
      {/* Skeleton bars */}
      <div
        style={{
          height: '40px',
          background: 'rgba(71, 85, 105, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem',
          width: '70%'
        }}
      />
      <div
        style={{
          height: '60px',
          background: 'rgba(71, 85, 105, 0.3)',
          borderRadius: '8px',
          marginBottom: '2rem',
          width: '100%'
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem'
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '100px',
              background: 'rgba(71, 85, 105, 0.3)',
              borderRadius: '8px'
            }}
          />
        ))}
      </div>
    </div>

    {/* Forecast Section Skeleton */}
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          height: '24px',
          background: 'rgba(71, 85, 105, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem',
          width: '40%'
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '120px',
              background: 'rgba(71, 85, 105, 0.3)',
              borderRadius: '8px'
            }}
          />
        ))}
      </div>
    </div>

    <style>{`
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `}</style>
  </div>
);

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeMap = {
    small: { diameter: '32px', fontSize: '0.7rem' },
    medium: { diameter: '48px', fontSize: '0.85rem' },
    large: { diameter: '64px', fontSize: '1rem' }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: dimensions.diameter,
          height: dimensions.diameter,
          border: '3px solid rgba(139, 92, 246, 0.2)',
          borderTop: '3px solid #a78bfa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <p
          style={{
            fontSize: dimensions.fontSize,
            color: '#94a3b8',
            margin: 0,
            fontWeight: '500'
          }}
        >
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export { WeatherSkeleton, LoadingSpinner };
