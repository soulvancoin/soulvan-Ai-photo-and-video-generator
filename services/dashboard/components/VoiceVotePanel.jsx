import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ThumbsUp, CheckCircle, Mic, Play } from 'lucide-react';

const VOICE_VOTE_API = process.env.NEXT_PUBLIC_VOICE_VOTE_API || 'http://localhost:5600/api/voice-vote';

interface Script {
  scriptId: number;
  character: string;
  zone: string;
  line: string;
  author: string;
  votes: number;
  approved: boolean;
  timestamp: number;
  audioUrl: string;
}

/**
 * VoiceVotePanel - Submit and vote on voiceover scripts
 */
export default function VoiceVotePanel({ scriptId }: { scriptId?: number }) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  // New script form
  const [character, setCharacter] = useState('');
  const [zone, setZone] = useState('');
  const [line, setLine] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (scriptId) {
      fetchScript(scriptId);
    } else {
      fetchScripts();
    }
  }, [scriptId]);

  /**
   * Fetch single script
   */
  const fetchScript = async (id: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${VOICE_VOTE_API}/scripts/${id}`);
      setSelectedScript(response.data);
    } catch (error) {
      console.error('Failed to fetch script:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load script',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all pending scripts
   */
  const fetchScripts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${VOICE_VOTE_API}/scripts?status=pending`);
      setScripts(response.data);
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load scripts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vote for a script
   */
  const vote = async (id: number) => {
    setVoting(true);
    try {
      const response = await axios.post(`${VOICE_VOTE_API}/scripts/${id}/vote`);
      
      toast({
        title: '✅ Vote Cast',
        description: `You voted for script #${id}. Total votes: ${response.data.votes}`,
      });

      // Refresh data
      if (scriptId) {
        await fetchScript(id);
      } else {
        await fetchScripts();
      }
    } catch (error: any) {
      console.error('Failed to vote:', error);
      toast({
        title: '❌ Vote Failed',
        description: error.response?.data?.message || 'Failed to cast vote',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  /**
   * Submit new script
   */
  const submitScript = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!character || !zone || !line) {
      toast({
        title: '⚠️ Missing Fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${VOICE_VOTE_API}/scripts`, {
        character,
        zone,
        line,
      });

      toast({
        title: '✅ Script Submitted',
        description: `Your voiceover script has been submitted! Script ID: ${response.data.scriptId}`,
      });

      // Reset form
      setCharacter('');
      setZone('');
      setLine('');

      // Refresh scripts
      await fetchScripts();
    } catch (error: any) {
      console.error('Failed to submit script:', error);
      toast({
        title: '❌ Submission Failed',
        description: error.response?.data?.message || 'Failed to submit script',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Play audio preview
   */
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  /**
   * Render single script view
   */
  if (selectedScript) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voiceover Script #{selectedScript.scriptId}</span>
            {selectedScript.approved && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Approved
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {selectedScript.character} • {selectedScript.zone}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-lg italic">"{selectedScript.line}"</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-bold">{selectedScript.votes}</span>
              <span className="text-muted-foreground">votes</span>
            </div>

            {selectedScript.audioUrl && (
              <Button
                variant="outline"
                onClick={() => playAudio(selectedScript.audioUrl)}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Play Recording
              </Button>
            )}
          </div>

          {!selectedScript.approved && (
            <Button
              onClick={() => vote(selectedScript.scriptId)}
              disabled={voting}
              className="w-full"
              size="lg"
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              {voting ? 'Voting...' : `Vote for Voiceover #${selectedScript.scriptId}`}
            </Button>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Author: {selectedScript.author.slice(0, 10)}...</p>
            <p>Submitted: {new Date(selectedScript.timestamp * 1000).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Render script list view
   */
  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Submit New Script */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-6 h-6" />
            Submit Voiceover Script
          </CardTitle>
          <CardDescription>
            Write character dialogue for community voting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitScript} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="character">Character</Label>
                <Input
                  id="character"
                  placeholder="e.g., Neon Reaper"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  placeholder="e.g., NeonDistrict"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="line">Voice Line</Label>
              <Textarea
                id="line"
                placeholder="Enter character dialogue (max 500 characters)"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-sm text-muted-foreground text-right">
                {line.length}/500
              </p>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              <Mic className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Script'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Scripts */}
      <Card>
        <CardHeader>
          <CardTitle>Community Scripts</CardTitle>
          <CardDescription>
            Vote for scripts to be approved for voiceover recording
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading scripts...</p>
          ) : scripts.length === 0 ? (
            <p className="text-center text-muted-foreground">No pending scripts</p>
          ) : (
            <div className="space-y-4">
              {scripts.map((script) => (
                <Card key={script.scriptId} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{script.character}</Badge>
                          <Badge variant="secondary">{script.zone}</Badge>
                          {script.approved && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg mb-3 italic">"{script.line}"</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {script.votes} votes
                          </span>
                          <span>Script #{script.scriptId}</span>
                        </div>
                      </div>
                      {!script.approved && (
                        <Button
                          onClick={() => vote(script.scriptId)}
                          disabled={voting}
                          variant="outline"
                          size="sm"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Vote
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
