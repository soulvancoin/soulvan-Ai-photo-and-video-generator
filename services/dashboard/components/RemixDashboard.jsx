import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * RemixDashboard - Display top trailer remixes with voting
 * Part of Soulvan AI Competition System
 */

const REMIX_API_URL = process.env.REACT_APP_REMIX_API_URL || 'http://localhost:5700/api/remixes';

interface Remix {
  remixId: string;
  originalTrailer: string;
  title: string;
  description: string;
  remixUrl: string;
  remixer: string;
  votes: number;
  featured: boolean;
  approved: boolean;
  createdAt: string;
}

export const RemixDashboard: React.FC = () => {
  const [remixes, setRemixes] = useState<Remix[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<string>('all');
  const [playingRemix, setPlayingRemix] = useState<string | null>(null);

  useEffect(() => {
    loadRemixes();
  }, [selectedTrailer]);

  const loadRemixes = async () => {
    setLoading(true);
    try {
      const url = selectedTrailer === 'all'
        ? `${REMIX_API_URL}/all?limit=20`
        : `${REMIX_API_URL}/${selectedTrailer}?limit=20`;

      const response = await axios.get(url);
      setRemixes(response.data.remixes || []);
    } catch (error) {
      console.error('Failed to load remixes:', error);
    } finally {
      setLoading(false);
    }
  };

  const voteForRemix = async (remixId: string) => {
    try {
      await axios.post(`${REMIX_API_URL}/vote/${remixId}`);
      loadRemixes(); // Reload to get updated votes
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const playRemix = (remixId: string, remixUrl: string) => {
    setPlayingRemix(remixId);
    // Convert IPFS URL to gateway URL
    const gatewayUrl = remixUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    window.open(gatewayUrl, '_blank');
  };

  const getStatusBadge = (remix: Remix) => {
    if (remix.featured) {
      return <span className="badge featured">⭐ FEATURED</span>;
    }
    if (remix.approved) {
      return <span className="badge approved">✅ APPROVED</span>;
    }
    return <span className="badge pending">⏳ PENDING</span>;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="remix-dashboard">
      <div className="dashboard-header">
        <h1>🎬 Trailer Remix Competition</h1>
        <p className="subtitle">Top community remixes - Vote for your favorites!</p>
      </div>

      <div className="filter-section">
        <label>Filter by Trailer:</label>
        <select value={selectedTrailer} onChange={(e) => setSelectedTrailer(e.target.value)}>
          <option value="all">All Trailers</option>
          <option value="trailer_001">Official Launch Trailer</option>
          <option value="trailer_002">Faction Wars Trailer</option>
          <option value="trailer_003">Mythic Loop Reveal</option>
          <option value="trailer_004">Cinematic Showcase</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading remixes...</div>
      ) : (
        <div className="remixes-grid">
          {remixes.length === 0 ? (
            <div className="no-remixes">
              <p>No remixes found. Be the first to submit one!</p>
            </div>
          ) : (
            remixes.map((remix) => (
              <div key={remix.remixId} className="remix-card">
                <div className="card-header">
                  <h3>{remix.title}</h3>
                  {getStatusBadge(remix)}
                </div>

                <div className="card-body">
                  <p className="description">{remix.description}</p>

                  <div className="metadata">
                    <div className="meta-item">
                      <span className="label">Original:</span>
                      <span className="value">{remix.originalTrailer}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Remixer:</span>
                      <span className="value">{formatAddress(remix.remixer)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Submitted:</span>
                      <span className="value">{formatDate(remix.createdAt)}</span>
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      className="btn-play"
                      onClick={() => playRemix(remix.remixId, remix.remixUrl)}
                    >
                      ▶ Play Remix
                    </button>
                    <button
                      className="btn-vote"
                      onClick={() => voteForRemix(remix.remixId)}
                    >
                      👍 Vote ({remix.votes})
                    </button>
                  </div>

                  {remix.votes >= 50 && (
                    <div className="milestone-banner featured-milestone">
                      🌟 Featured at 50 votes!
                    </div>
                  )}
                  {remix.votes >= 10 && remix.votes < 50 && (
                    <div className="milestone-banner approved-milestone">
                      ✅ Approved at 10 votes!
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .remix-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: #ffffff;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #00f5ff, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #aaa;
        }

        .filter-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 30px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .filter-section label {
          font-weight: bold;
        }

        .filter-section select {
          padding: 8px 15px;
          border-radius: 5px;
          border: 1px solid #00f5ff;
          background: rgba(0, 0, 0, 0.3);
          color: #fff;
          font-size: 1rem;
        }

        .loading {
          text-align: center;
          font-size: 1.2rem;
          color: #00f5ff;
          margin-top: 50px;
        }

        .remixes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .no-remixes {
          text-align: center;
          padding: 50px;
          font-size: 1.2rem;
          color: #aaa;
        }

        .remix-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 245, 255, 0.3);
          border-radius: 15px;
          padding: 20px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .remix-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 245, 255, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #00f5ff;
        }

        .badge {
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .badge.featured {
          background: linear-gradient(135deg, #ffd700, #ffaa00);
          color: #000;
        }

        .badge.approved {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
        }

        .badge.pending {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .card-body .description {
          color: #ddd;
          margin-bottom: 15px;
          line-height: 1.6;
        }

        .metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
        }

        .meta-item .label {
          color: #888;
          font-weight: bold;
        }

        .meta-item .value {
          color: #fff;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .btn-play,
        .btn-vote {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-play {
          background: linear-gradient(135deg, #ff00ff, #aa00ff);
          color: #fff;
        }

        .btn-play:hover {
          box-shadow: 0 5px 15px rgba(255, 0, 255, 0.5);
          transform: translateY(-2px);
        }

        .btn-vote {
          background: linear-gradient(135deg, #00f5ff, #0088ff);
          color: #fff;
        }

        .btn-vote:hover {
          box-shadow: 0 5px 15px rgba(0, 245, 255, 0.5);
          transform: translateY(-2px);
        }

        .milestone-banner {
          margin-top: 15px;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
        }

        .featured-milestone {
          background: linear-gradient(135deg, #ffd700, #ffaa00);
          color: #000;
        }

        .approved-milestone {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default RemixDashboard;
