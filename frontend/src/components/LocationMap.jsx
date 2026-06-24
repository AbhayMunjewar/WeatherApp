import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Maximize2, Minimize2 } from 'lucide-react';

/**
 * LocationMap Component
 * Shows an interactive OpenStreetMap embed for the given coordinates.
 * Falls back to a Google Maps embed link if the user prefers.
 * No API key required.
 *
 * Props:
 *   - lat (number): latitude
 *   - lon (number): longitude
 *   - cityName (string): display name for the location
 *   - country (string): country code (optional)
 */
const LocationMap = ({ lat, lon, cityName, country }) => {
  const [expanded, setExpanded] = useState(false);
  const [mapType, setMapType] = useState('street'); // 'street' | 'satellite'

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return null;
  }

  // OpenStreetMap embed URL (completely free, no API key)
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.08},${lat - 0.05},${lon + 0.08},${lat + 0.05}&layer=mapnik&marker=${lat},${lon}`;

  // Google Maps link (for "Open in Google Maps" button)
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}&z=13`;
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${lat},${lon}&z=11&output=embed`;

  const mapHeight = expanded ? '480px' : '280px';

  return (
    <div
      className="glass"
      style={{
        padding: '0',
        background: 'rgba(15, 23, 42, 0.45)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem 0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(59,130,246,0.3)'
          }}>
            <MapPin size={16} color="#60a5fa" />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '700',
              fontFamily: 'Outfit, sans-serif',
              color: '#e2e8f0'
            }}>
              Location Map
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.65rem',
              color: '#64748b',
              fontWeight: '600',
              letterSpacing: '0.3px'
            }}>
              {cityName}{country ? `, ${country}` : ''} — {lat.toFixed(4)}, {lon.toFixed(4)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {/* Map type toggle */}
          <button
            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(30,41,59,0.6)',
              color: '#94a3b8',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {mapType === 'street' ? '🛰 Satellite' : '🗺 Street'}
          </button>
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(30,41,59,0.6)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{
        margin: '0.75rem 1rem 0',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'height 0.3s ease'
      }}>
        <iframe
          src={mapType === 'satellite' ? googleMapsEmbedUrl : osmEmbedUrl}
          title="Location Map"
          style={{
            border: '0',
            width: '100%',
            height: mapHeight,
            transition: 'height 0.3s ease',
            filter: 'saturate(0.85) contrast(1.1)',
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.75rem 1.5rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <p style={{
          margin: 0,
          color: '#475569',
          fontSize: '0.7rem',
          fontWeight: '500',
          maxWidth: '60%'
        }}>
          📍 Pin dropped near {cityName}. Zoom to explore nearby points of interest.
        </p>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            color: '#60a5fa',
            fontSize: '0.7rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
        >
          <ExternalLink size={12} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
};

export default LocationMap;
