import React, { useState, useEffect } from 'react';

// Job Submission Form Component
export function JobSubmissionForm({ apiUrl = 'http://localhost:5300' }) {
  const [form, setForm] = useState({
    scene: '',
    camera: 'MainCamera',
    format: 'EXR',
    wallet: '',
    sign: true,
    clip_embed: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const submitJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setResult({ success: true, data });
      setForm({ ...form, scene: '', camera: 'MainCamera' }); // Reset form
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-form">
      <h2>Submit Render Job</h2>
      <form onSubmit={submitJob}>
        <div className="form-group">
          <label>Scene Path:</label>
          <input
            type="text"
            value={form.scene}
            onChange={e => setForm({ ...form, scene: e.target.value })}
            placeholder="Assets/Scenes/cinematic_main.unity"
            required
          />
        </div>

        <div className="form-group">
          <label>Camera Name:</label>
          <input
            type="text"
            value={form.camera}
            onChange={e => setForm({ ...form, camera: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Wallet Address:</label>
          <input
            type="text"
            value={form.wallet}
            onChange={e => setForm({ ...form, wallet: e.target.value })}
            placeholder="0xYourWalletAddress"
            required
          />
        </div>

        <div className="form-group">
          <label>Format:</label>
          <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
            <option value="EXR">EXR</option>
            <option value="USD">USD</option>
            <option value="MP4">MP4</option>
          </select>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={form.sign}
              onChange={e => setForm({ ...form, sign: e.target.checked })}
            />
            Enable Provenance Signing
          </label>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={form.clip_embed}
              onChange={e => setForm({ ...form, clip_embed: e.target.checked })}
            />
            Generate CLIP Preview
          </label>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Job'}
        </button>
      </form>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <>
              <p>✅ Job submitted successfully!</p>
              <p>Job ID: <code>{result.data.job_id}</code></p>
            </>
          ) : (
            <p>❌ Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Job Status Viewer Component
export function JobStatusViewer({ jobId, apiUrl = 'http://localhost:5300' }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/jobs/${jobId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [jobId, apiUrl]);

  if (loading && !status) return <p>Loading job status...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!status) return <p>No job data</p>;

  return (
    <div className="job-status">
      <h3>Job Status</h3>
      <div className="status-grid">
        <div className="status-item">
          <label>Status:</label>
          <span className={`badge ${status.status}`}>{status.status}</span>
        </div>
        <div className="status-item">
          <label>Scene:</label>
          <span>{status.scene}</span>
        </div>
        <div className="status-item">
          <label>Format:</label>
          <span>{status.format}</span>
        </div>
        <div className="status-item">
          <label>Wallet:</label>
          <span className="monospace">{status.creator_wallet}</span>
        </div>
        {status.output_url && (
          <div className="status-item">
            <label>Output:</label>
            <a href={status.output_url} target="_blank" rel="noopener noreferrer">
              {status.output_url}
            </a>
          </div>
        )}
        {status.originality_score !== null && (
          <div className="status-item">
            <label>Originality:</label>
            <span className={status.originality_score > 0.7 ? 'good' : 'warning'}>
              {(status.originality_score * 100).toFixed(1)}%
            </span>
          </div>
        )}
        {status.signature && (
          <div className="status-item">
            <label>Signature:</label>
            <span className="monospace small">{status.signature.substring(0, 32)}...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// DAO Voting Component
export function DAOVoting({ jobId, userWallet, apiUrl = 'http://localhost:5300' }) {
  const [votes, setVotes] = useState(null);
  const [voting, setVoting] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!jobId) return;

    const fetchVotes = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/vote/${jobId}`);
        const data = await res.json();
        setVotes(data);
      } catch (err) {
        console.error('Failed to fetch votes:', err);
      }
    };

    fetchVotes();
    const interval = setInterval(fetchVotes, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [jobId, apiUrl]);

  const submitVote = async (voteType) => {
    if (!userWallet) {
      alert('Please connect your wallet first');
      return;
    }

    setVoting(true);

    try {
      const res = await fetch(`${apiUrl}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          wallet: userWallet,
          vote: voteType,
          reason: reason || undefined
        })
      });
      const data = await res.json();
      setVotes({ ...votes, tally: data.tally });
      setReason('');
      alert(`Vote ${voteType} recorded!`);
    } catch (err) {
      alert('Failed to submit vote: ' + err.message);
    } finally {
      setVoting(false);
    }
  };

  if (!votes) return <p>Loading votes...</p>;

  const { tally } = votes;
  const total = (tally.approve || 0) + (tally.reject || 0);

  return (
    <div className="dao-voting">
      <h3>Community Votes</h3>
      
      <div className="vote-tally">
        <div className="tally-bar">
          <div
            className="approve-bar"
            style={{ width: `${total > 0 ? ((tally.approve || 0) / total) * 100 : 0}%` }}
          >
            Approve: {tally.approve || 0}
          </div>
          <div
            className="reject-bar"
            style={{ width: `${total > 0 ? ((tally.reject || 0) / total) * 100 : 0}%` }}
          >
            Reject: {tally.reject || 0}
          </div>
        </div>
      </div>

      <div className="vote-actions">
        <textarea
          placeholder="Optional: Reason for your vote"
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={2}
        />
        <div className="vote-buttons">
          <button
            className="approve"
            onClick={() => submitVote('approve')}
            disabled={voting}
          >
            👍 Approve
          </button>
          <button
            className="reject"
            onClick={() => submitVote('reject')}
            disabled={voting}
          >
            👎 Reject
          </button>
        </div>
      </div>

      {votes.votes && votes.votes.length > 0 && (
        <div className="vote-history">
          <h4>Recent Votes</h4>
          <ul>
            {votes.votes.slice(0, 5).map((v, i) => (
              <li key={i}>
                <span className="wallet">{v.voter_wallet.substring(0, 10)}...</span>
                <span className={`vote ${v.vote}`}>{v.vote}</span>
                {v.reason && <span className="reason">"{v.reason}"</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Music Style Selector Component
export function MusicStyleSelector({ wallet, apiUrl = 'http://localhost:5300' }) {
  const [truckStyle, setTruckStyle] = useState('');
  const [mood, setMood] = useState('cinematic');
  const [result, setResult] = useState(null);

  const getStyle = async () => {
    if (!truckStyle) return;

    try {
      const res = await fetch(`${apiUrl}/api/music/style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, truck_style: truckStyle, mood })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Failed to get music style: ' + err.message);
    }
  };

  return (
    <div className="music-style">
      <h3>Music Style Mapper</h3>
      
      <div className="form-group">
        <label>Truck Style:</label>
        <input
          type="text"
          value={truckStyle}
          onChange={e => setTruckStyle(e.target.value)}
          placeholder="e.g., graffiti, chrome, matte"
        />
      </div>

      <div className="form-group">
        <label>Mood:</label>
        <select value={mood} onChange={e => setMood(e.target.value)}>
          <option value="cinematic">Cinematic</option>
          <option value="upbeat">Upbeat</option>
          <option value="ambient">Ambient</option>
          <option value="dramatic">Dramatic</option>
        </select>
      </div>

      <button onClick={getStyle}>Get Music Genre</button>

      {result && (
        <div className="style-result">
          <p><strong>Recommended Genre:</strong> {result.music_genre}</p>
          <p><strong>Track:</strong> {result.suggested_track}</p>
        </div>
      )}
    </div>
  );
}

// Music Preview Component - Audio player for generated tracks
export function MusicPreview({ trackUrl }) {
  return (
    <div className="music-preview">
      <audio controls src={trackUrl}></audio>
      <p>Preview your personalized track</p>
    </div>
  );
}

// LoadMusic Component - Fetch and display music based on wallet + truck style
export function LoadMusic({ wallet, truckStyle, apiUrl = 'http://localhost:5300' }) {
  const [trackUrl, setTrackUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wallet || !truckStyle) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/music`, {
      method: "POST",
      body: JSON.stringify({ wallet, truckStyle }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTrackUrl(data.trackUrl);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [wallet, truckStyle, apiUrl]);

  if (loading) return <p>Loading music…</p>;
  if (error) return <p className="error">Error loading music: {error}</p>;
  if (!trackUrl) return <p>No track available</p>;

  return <MusicPreview trackUrl={trackUrl} />;
}
