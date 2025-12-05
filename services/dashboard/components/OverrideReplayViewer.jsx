import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * OverrideReplayViewer - Video player for mission replays with view tracking
 * Part of Soulvan AI Competition System
 */

const REPLAY_API_URL = process.env.REACT_APP_REPLAY_API_URL || 'http://localhost:5800/api/replays';

export const OverrideReplayViewer = () => {
  const [replays, setReplays] = useState([]);
  const [selectedReplay, setSelectedReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState('all');
  const [viewTracked, setViewTracked] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    loadReplays();
  }, [selectedMission]);

  useEffect(() => {
    if (selectedReplay && !viewTracked) {
      trackView(selectedReplay.missionId);
      setViewTracked(true);
    }
  }, [selectedReplay]);

  const loadReplays = async () => {
    setLoading(true);
    try {
      const url =
        selectedMission === 'all'
          ? `${REPLAY_API_URL}/all?limit=50`
          : `${REPLAY_API_URL}/${selectedMission}`;

      const response = await axios.get(url);
      setReplays(response.data.replays || []);
    } catch (error) {
      console.error('Failed to load replays:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (missionId) => {
    try {
      await axios.post(`${REPLAY_API_URL}/view/${missionId}`);
      console.log('View tracked for', missionId);
      
      // Reload replays to get updated view counts
      loadReplays();
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const selectReplay = (replay) => {
    setSelectedReplay(replay);
    setViewTracked(false);
  };

  const getReplayUrl = (replay) => {
    // Convert IPFS URL to gateway URL
    return replay.replayUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFeaturedBadge = (replay) => {
    if (replay.featured) {
      return <span className="featured-badge">⭐ FEATURED</span>;
    }
    if (replay.views >= 80) {
      return <span className="trending-badge">🔥 TRENDING</span>;
    }
    return null;
  };

  return (
    <div className="replay-viewer">
      <div className="viewer-header">
        <h1>🎬 Mission Replay Theater</h1>
        <p className="subtitle">Watch epic community mission replays</p>
      </div>

      <div className="filter-section">
        <label>Filter by Mission:</label>
        <select value={selectedMission} onChange={(e) => setSelectedMission(e.target.value)}>
          <option value="all">All Missions</option>
          <option value="night_chase">Night Chase</option>
          <option value="tokyo_drift">Tokyo Drift</option>
          <option value="mythic_heist">Mythic Heist</option>
          <option value="faction_war">Faction War</option>
          <option value="storm_escape">Storm Escape</option>
        </select>
      </div>

      <div className="viewer-layout">
        <div className="video-section">
          {selectedReplay ? (
            <div className="video-container">
              <video
                ref={videoRef}
                controls
                autoPlay
                className="replay-video"
                src={getReplayUrl(selectedReplay)}
              >
                Your browser does not support the video tag.
              </video>
              
              <div className="video-info">
                <h2>{selectedReplay.missionId.replace(/_/g, ' ').toUpperCase()}</h2>
                <div className="info-row">
                  <span>👤 {formatAddress(selectedReplay.contributor)}</span>
                  <span>👁️ {selectedReplay.views} views</span>
                  <span>⭐ {selectedReplay.score} pts</span>
                </div>
                <div className="info-row">
                  <span>📅 {formatDate(selectedReplay.timestamp)}</span>
                  {getFeaturedBadge(selectedReplay)}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a replay to watch</p>
              <span className="icon">🎥</span>
            </div>
          )}
        </div>

        <div className="replays-list">
          <h3>Available Replays ({replays.length})</h3>
          
          {loading ? (
            <div className="loading">Loading replays...</div>
          ) : (
            <div className="replays-scroll">
              {replays.length === 0 ? (
                <div className="no-replays">
                  <p>No replays found for this mission.</p>
                </div>
              ) : (
                replays.map((replay) => (
                  <div
                    key={replay.missionId + replay.contributor}
                    className={`replay-item ${selectedReplay?.missionId === replay.missionId ? 'active' : ''}`}
                    onClick={() => selectReplay(replay)}
                  >
                    <div className="replay-thumbnail">
                      <span className="play-icon">▶</span>
                      {replay.featured && <span className="featured-star">⭐</span>}
                    </div>
                    
                    <div className="replay-details">
                      <div className="replay-mission">
                        {replay.missionId.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="replay-meta">
                        <span>👤 {formatAddress(replay.contributor)}</span>
                      </div>
                      <div className="replay-stats">
                        <span>👁️ {replay.views}</span>
                        <span>⭐ {replay.score}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .replay-viewer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
          color: #ffffff;
        }

        .viewer-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .viewer-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #ff0080, #ff8c00);
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
          color: #ff0080;
        }

        .filter-section select {
          padding: 8px 15px;
          border-radius: 5px;
          border: 1px solid #ff0080;
          background: rgba(0, 0, 0, 0.3);
          color: #fff;
          font-size: 1rem;
        }

        .viewer-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 20px;
        }

        .video-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 15px;
          overflow: hidden;
        }

        .video-container {
          width: 100%;
        }

        .replay-video {
          width: 100%;
          height: 600px;
          background: #000;
          object-fit: contain;
        }

        .video-info {
          padding: 20px;
          background: rgba(255, 0, 128, 0.1);
        }

        .video-info h2 {
          margin: 0 0 15px 0;
          color: #ff0080;
        }

        .info-row {
          display: flex;
          gap: 20px;
          margin-bottom: 10px;
          color: #ddd;
        }

        .featured-badge,
        .trending-badge {
          padding: 5px 10px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .featured-badge {
          background: linear-gradient(135deg, #ffd700, #ffaa00);
          color: #000;
        }

        .trending-badge {
          background: linear-gradient(135deg, #ff6600, #ff3300);
          color: #fff;
        }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 600px;
          color: #666;
        }

        .no-selection .icon {
          font-size: 5rem;
          margin-top: 20px;
        }

        .replays-list {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 15px;
          padding: 20px;
          max-height: 900px;
          overflow: hidden;
        }

        .replays-list h3 {
          margin: 0 0 15px 0;
          color: #ff0080;
          border-bottom: 2px solid rgba(255, 0, 128, 0.3);
          padding-bottom: 10px;
        }

        .loading {
          text-align: center;
          color: #ff0080;
          padding: 50px;
        }

        .no-replays {
          text-align: center;
          color: #666;
          padding: 50px 20px;
        }

        .replays-scroll {
          max-height: 800px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .replays-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .replays-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 0, 128, 0.5);
          border-radius: 4px;
        }

        .replay-item {
          display: flex;
          gap: 15px;
          padding: 15px;
          margin-bottom: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .replay-item:hover {
          background: rgba(255, 0, 128, 0.1);
          border-color: rgba(255, 0, 128, 0.5);
          transform: translateX(5px);
        }

        .replay-item.active {
          background: rgba(255, 0, 128, 0.2);
          border-color: #ff0080;
        }

        .replay-thumbnail {
          position: relative;
          width: 80px;
          height: 60px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .play-icon {
          font-size: 1.5rem;
          color: #ff0080;
        }

        .featured-star {
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 1rem;
        }

        .replay-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .replay-mission {
          font-weight: bold;
          color: #fff;
          font-size: 0.95rem;
        }

        .replay-meta,
        .replay-stats {
          display: flex;
          gap: 15px;
          font-size: 0.85rem;
          color: #aaa;
        }

        @media (max-width: 1200px) {
          .viewer-layout {
            grid-template-columns: 1fr;
          }

          .replays-list {
            max-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default OverrideReplayViewer;
