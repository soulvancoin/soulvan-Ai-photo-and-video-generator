import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * TuningLeaderboard - Show top faction tuning kits with rankings
 * Part of Soulvan AI Competition System
 */

const TUNING_API_URL = process.env.REACT_APP_TUNING_API_URL || 'http://localhost:5900/api/tuning';

interface TuningKit {
  kitId: string;
  faction: string;
  vehicle: string;
  contributor: string;
  votes: number;
  featured: boolean;
  downloadCount: number;
  createdAt: string;
  url: string;
}

interface TuningStats {
  peakTorque: number;
  downforce: number;
  maxGrip: number;
  dragCoefficient: number;
}

export const TuningLeaderboard: React.FC = () => {
  const [kits, setKits] = useState<TuningKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaction, setSelectedFaction] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'downloads'>('votes');

  const factions = ['NeonReapers', 'ShadowSyndicate', 'IronCollective'];
  const vehicles = ['SolusGT', 'VisionGT', 'NeonDrifter', 'PhantomRider', 'RazorEdge', 'StormChaser'];

  useEffect(() => {
    loadKits();
  }, [selectedFaction, selectedVehicle, sortBy]);

  const loadKits = async () => {
    setLoading(true);
    try {
      let url = `${TUNING_API_URL}/kits?limit=50&sortBy=${sortBy}`;
      
      if (selectedFaction !== 'all') {
        url += `&faction=${selectedFaction}`;
      }
      
      if (selectedVehicle !== 'all') {
        url += `&vehicle=${selectedVehicle}`;
      }

      const response = await axios.get(url);
      setKits(response.data.kits || []);
    } catch (error) {
      console.error('Failed to load tuning kits:', error);
    } finally {
      setLoading(false);
    }
  };

  const voteForKit = async (kitId: string) => {
    try {
      await axios.post(`${TUNING_API_URL}/kits/vote/${kitId}`);
      loadKits(); // Reload to get updated votes
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const downloadKit = async (kitId: string, url: string) => {
    try {
      // Convert IPFS URL to gateway URL
      const gatewayUrl = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
      window.open(gatewayUrl, '_blank');

      // Track download
      await axios.post(`${TUNING_API_URL}/kits/download/${kitId}`);
      loadKits();
    } catch (error) {
      console.error('Failed to download kit:', error);
    }
  };

  const getFactionColor = (faction: string) => {
    switch (faction) {
      case 'NeonReapers':
        return '#00f5ff';
      case 'ShadowSyndicate':
        return '#aa00ff';
      case 'IronCollective':
        return '#ff6600';
      default:
        return '#ffffff';
    }
  };

  const getFactionIcon = (faction: string) => {
    switch (faction) {
      case 'NeonReapers':
        return '⚡';
      case 'ShadowSyndicate':
        return '🌙';
      case 'IronCollective':
        return '⚙️';
      default:
        return '🏎️';
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="tuning-leaderboard">
      <div className="leaderboard-header">
        <h1>🏎️ Faction Tuning Leaderboard</h1>
        <p className="subtitle">Top community-created vehicle tuning kits</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Faction:</label>
          <select value={selectedFaction} onChange={(e) => setSelectedFaction(e.target.value)}>
            <option value="all">All Factions</option>
            {factions.map((f) => (
              <option key={f} value={f}>
                {getFactionIcon(f)} {f}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Vehicle:</label>
          <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
            <option value="all">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'votes' | 'downloads')}>
            <option value="votes">Most Voted</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : (
        <div className="leaderboard-table">
          {kits.length === 0 ? (
            <div className="no-kits">
              <p>No tuning kits found. Create one to lead the leaderboard!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Faction</th>
                  <th>Vehicle</th>
                  <th>Contributor</th>
                  <th>Votes</th>
                  <th>Downloads</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kits.map((kit, index) => (
                  <tr key={kit.kitId} className={kit.featured ? 'featured-row' : ''}>
                    <td className="rank-cell">
                      <span className="rank-badge">{getRankBadge(index)}</span>
                    </td>
                    <td>
                      <span
                        className="faction-badge"
                        style={{ color: getFactionColor(kit.faction) }}
                      >
                        {getFactionIcon(kit.faction)} {kit.faction}
                      </span>
                    </td>
                    <td className="vehicle-cell">{kit.vehicle}</td>
                    <td className="contributor-cell">
                      {formatAddress(kit.contributor)}
                    </td>
                    <td className="votes-cell">
                      <button
                        className="vote-btn"
                        onClick={() => voteForKit(kit.kitId)}
                      >
                        👍 {kit.votes}
                      </button>
                    </td>
                    <td className="downloads-cell">📥 {kit.downloadCount}</td>
                    <td className="date-cell">{formatDate(kit.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        className="download-btn"
                        onClick={() => downloadKit(kit.kitId, kit.url)}
                      >
                        ⬇ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx>{`
        .tuning-leaderboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #ffffff;
        }

        .leaderboard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .leaderboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #00f5ff, #ff6600);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #aaa;
        }

        .filters-section {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-group label {
          font-weight: bold;
          color: #00f5ff;
        }

        .filter-group select {
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

        .leaderboard-table {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 15px;
          overflow: hidden;
        }

        .no-kits {
          text-align: center;
          padding: 50px;
          font-size: 1.2rem;
          color: #aaa;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: rgba(0, 245, 255, 0.1);
        }

        th {
          padding: 15px;
          text-align: left;
          font-weight: bold;
          color: #00f5ff;
          border-bottom: 2px solid rgba(0, 245, 255, 0.3);
        }

        tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.3s;
        }

        tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        tbody tr.featured-row {
          background: rgba(255, 215, 0, 0.1);
        }

        td {
          padding: 15px;
        }

        .rank-cell {
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
        }

        .faction-badge {
          font-weight: bold;
          font-size: 1rem;
        }

        .vote-btn,
        .download-btn {
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .vote-btn {
          background: linear-gradient(135deg, #00f5ff, #0088ff);
          color: #fff;
        }

        .vote-btn:hover {
          box-shadow: 0 5px 15px rgba(0, 245, 255, 0.5);
          transform: translateY(-2px);
        }

        .download-btn {
          background: linear-gradient(135deg, #ff6600, #ff3300);
          color: #fff;
        }

        .download-btn:hover {
          box-shadow: 0 5px 15px rgba(255, 102, 0, 0.5);
          transform: translateY(-2px);
        }

        .contributor-cell,
        .vehicle-cell,
        .date-cell {
          color: #ddd;
        }

        .downloads-cell {
          color: #ff6600;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default TuningLeaderboard;
