import React, { useState, useEffect, useCallback } from 'react';
import { Play, ExternalLink, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * YouTubeVideos Component
 * Fetches and displays YouTube videos related to a city/location.
 *
 * Strategy:
 *   1. If VITE_YOUTUBE_API_KEY is set → use YouTube Data API v3 for curated results
 *   2. Otherwise → show embedded YouTube search (no API key needed)
 *
 * Props:
 *   - cityName (string): the city to search videos for
 *   - apiKey (string, optional): YouTube Data API v3 key
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const YouTubeVideos = ({ cityName }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchVideos = useCallback(async (city) => {
    if (!city) return;
    if (!YOUTUBE_API_KEY) {
      // No API key — we'll use the embedded search fallback
      setVideos([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const query = encodeURIComponent(`${city} travel weather vlog`);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${query}&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Unable to load videos right now.');
      }

      const data = await response.json();
      const clips = (data.items || [])
        .map((item) => ({
          id: item?.id?.videoId,
          title: item?.snippet?.title,
          channel: item?.snippet?.channelTitle,
          thumbnail: item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url,
          publishedAt: item?.snippet?.publishedAt,
        }))
        .filter((clip) => clip.id);

      setVideos(clips);
    } catch (err) {
      setError(err.message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cityName) {
      fetchVideos(cityName);
      setActiveVideo(null);
    }
  }, [cityName, fetchVideos]);

  // Format relative time
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
    return `${Math.floor(seconds / 31536000)}y ago`;
  };

  if (!cityName) return null;

  // ─── No API Key Fallback: Embedded YouTube Search ───
  if (!YOUTUBE_API_KEY) {
    const searchQuery = encodeURIComponent(`${cityName} travel weather`);
    return (
      <div
        className="glass"
        style={{
          padding: '0',
          background: 'rgba(15, 23, 42, 0.45)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem 0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(239,68,68,0.3)'
            }}>
              <Play size={16} color="#f87171" fill="#f87171" />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: 'Outfit, sans-serif',
                color: '#e2e8f0'
              }}>
                Explore {cityName}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.65rem',
                color: '#64748b',
                fontWeight: '600',
              }}>
                Travel & weather videos from YouTube
              </p>
            </div>
          </div>
          <a
            href={`https://www.youtube.com/results?search_query=${searchQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.7rem',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              fontSize: '0.65rem',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} /> More on YouTube
          </a>
        </div>

        {/* Embedded YouTube Search Results */}
        <div style={{ margin: '0 1rem 1.25rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <iframe
            src={`https://www.youtube.com/embed?listType=search&list=${searchQuery}`}
            title={`YouTube videos about ${cityName}`}
            style={{ border: '0', width: '100%', height: '320px' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div style={{ padding: '0 1.5rem 1rem' }}>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.65rem', fontWeight: '500' }}>
            💡 Add <code style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem' }}>VITE_YOUTUBE_API_KEY</code> to your .env file for curated video thumbnails
          </p>
        </div>
      </div>
    );
  }

  // ─── With API Key: Rich Video Grid ───
  return (
    <div
      className="glass"
      style={{
        padding: '0',
        background: 'rgba(15, 23, 42, 0.45)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
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
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239,68,68,0.3)'
          }}>
            <Play size={16} color="#f87171" fill="#f87171" />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '700',
              fontFamily: 'Outfit, sans-serif',
              color: '#e2e8f0'
            }}>
              Explore {cityName}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.65rem',
              color: '#64748b',
              fontWeight: '600',
            }}>
              Curated travel & weather videos
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => fetchVideos(cityName)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.7rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(30,41,59,0.6)',
              color: '#94a3b8',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={12} className={loading ? 'spinning' : ''} /> Refresh
          </button>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(cityName + ' travel weather')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.7rem',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              fontSize: '0.65rem',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} /> More
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 1rem 1.25rem' }}>
        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '3rem 0',
            color: '#64748b',
            fontSize: '0.85rem'
          }}>
            <Loader2 size={18} className="spinning" /> Finding videos for {cityName}…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '0.75rem',
            color: '#fb923c',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Active Video Player */}
        {activeVideo && !loading && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#000'
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: '0' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
              {activeVideo.title}
            </p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>
              {activeVideo.channel} {activeVideo.publishedAt && `· ${timeAgo(activeVideo.publishedAt)}`}
            </p>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && videos.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            {videos.map((clip) => (
              <div
                key={clip.id}
                onClick={() => setActiveVideo(clip)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: activeVideo?.id === clip.id
                    ? '2px solid rgba(239,68,68,0.6)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  transition: 'all 0.2s',
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0f172a' }}>
                  {clip.thumbnail ? (
                    <img
                      src={clip.thumbnail}
                      alt={clip.title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Play size={32} color="#475569" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    opacity: activeVideo?.id === clip.id ? 0 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(239,68,68,0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                    }}>
                      <Play size={16} color="white" fill="white" />
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: '0.6rem 0.75rem' }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {clip.title}
                  </p>
                  <p style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.6rem',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    {clip.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && !error && videos.length === 0 && (
          <p style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
            No videos found for {cityName} — try searching a different location.
          </p>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideos;
