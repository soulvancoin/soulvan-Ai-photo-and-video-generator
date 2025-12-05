# Soulvan Dashboard (React Components)

React components for the Soulvan contributor dashboard.

## Components

### JobSubmissionForm
Form for submitting Unity render jobs to the API.

```jsx
import { JobSubmissionForm } from './components';

<JobSubmissionForm apiUrl="http://localhost:5300" />
```

### JobStatusViewer
Real-time job status display with auto-refresh.

```jsx
import { JobStatusViewer } from './components';

<JobStatusViewer jobId="uuid" apiUrl="http://localhost:5300" />
```

### DAOVoting
Community voting interface with tally visualization.

```jsx
import { DAOVoting } from './components';

<DAOVoting 
  jobId="uuid" 
  userWallet="0xYourAddress" 
  apiUrl="http://localhost:5300" 
/>
```

### MusicStyleSelector
Truck style to music genre mapper.

```jsx
import { MusicStyleSelector } from './components';

<MusicStyleSelector wallet="0xYourAddress" apiUrl="http://localhost:5300" />
```

## Full Application Example

```jsx
import React, { useState } from 'react';
import {
  JobSubmissionForm,
  JobStatusViewer,
  DAOVoting,
  MusicStyleSelector
} from './components';

function App() {
  const [activeJobId, setActiveJobId] = useState(null);
  const [userWallet, setUserWallet] = useState('0xDEMO123');

  return (
    <div className="app">
      <header>
        <h1>Soulvan AI Studio</h1>
        <input
          type="text"
          value={userWallet}
          onChange={e => setUserWallet(e.target.value)}
          placeholder="Connect Wallet"
        />
      </header>

      <div className="dashboard">
        <section className="panel">
          <JobSubmissionForm />
        </section>

        {activeJobId && (
          <>
            <section className="panel">
              <JobStatusViewer jobId={activeJobId} />
            </section>

            <section className="panel">
              <DAOVoting jobId={activeJobId} userWallet={userWallet} />
            </section>
          </>
        )}

        <section className="panel">
          <MusicStyleSelector wallet={userWallet} />
        </section>
      </div>
    </div>
  );
}

export default App;
```

## Styling

Basic CSS for components:

```css
.job-form, .job-status, .dao-voting, .music-style {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.badge.pending { background: #ffc107; color: #000; }
.badge.running { background: #17a2b8; color: #fff; }
.badge.completed { background: #28a745; color: #fff; }
.badge.failed { background: #dc3545; color: #fff; }

.vote-tally {
  margin: 20px 0;
}

.tally-bar {
  display: flex;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
}

.approve-bar {
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reject-bar {
  background: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Integration

### With Next.js

```bash
npm install
# Add components to pages/dashboard.jsx
```

### With Create React App

```bash
npx create-react-app soulvan-dashboard
cd soulvan-dashboard
# Copy components.jsx to src/
npm start
```

### With Vite

```bash
npm create vite@latest soulvan-dashboard -- --template react
cd soulvan-dashboard
npm install
# Copy components.jsx to src/
npm run dev
```

## API Requirements

Ensure these services are running:

- DAO Voting API: `http://localhost:5300`
- CLIP Provenance: `http://localhost:5200`

## Environment Variables

Create `.env` for API URLs:

```
REACT_APP_API_URL=http://localhost:5300
REACT_APP_CLIP_URL=http://localhost:5200
```

## Production Deployment

- Build: `npm run build`
- Serve static files via Nginx/Caddy
- Enable CORS on backend services
- Use HTTPS for all API calls
- Add wallet authentication (MetaMask integration)
