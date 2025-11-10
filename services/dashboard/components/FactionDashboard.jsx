import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, MapPin, ScrollText, Users, TrendingUp } from 'lucide-react';

const FACTION_LEGACY_API = process.env.NEXT_PUBLIC_FACTION_LEGACY_API || 'http://localhost:5700/api/faction-legacy';

/**
 * FactionDashboard - Display faction achievements and legacy
 */
export default function FactionDashboard({ faction }) {
  const [legacy, setLegacy] = useState(null);
  const [zones, setZones] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [topFactions, setTopFactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (faction) {
      fetchFactionData();
    }
  }, [faction]);

  /**
   * Fetch all faction data
   */
  const fetchFactionData = async () => {
    setLoading(true);
    try {
      // Fetch legacy data
      const legacyResponse = await axios.get(`${FACTION_LEGACY_API}/factions/${faction}`);
      setLegacy(legacyResponse.data);

      // Fetch controlled zones
      const zonesResponse = await axios.get(`${FACTION_LEGACY_API}/factions/${faction}/zones`);
      setZones(zonesResponse.data);

      // Fetch achievements
      const achievementsResponse = await axios.get(`${FACTION_LEGACY_API}/factions/${faction}/achievements`);
      setAchievements(achievementsResponse.data);

      // Fetch top factions leaderboard
      const leaderboardResponse = await axios.get(`${FACTION_LEGACY_API}/leaderboard?limit=10`);
      setTopFactions(leaderboardResponse.data);
    } catch (error) {
      console.error('Failed to fetch faction data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading faction data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!legacy) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Faction not found</p>
        </CardContent>
      </Card>
    );
  }

  const rank = topFactions.findIndex(f => f.faction === faction) + 1;

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                {legacy.faction} Legacy
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Founded by {legacy.leader?.slice(0, 10)}... • {legacy.memberCount} members
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {legacy.prestigePoints.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Prestige Points</div>
              {rank > 0 && (
                <Badge variant="outline" className="mt-2">
                  Rank #{rank}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{legacy.zonesControlled}</div>
                <div className="text-sm text-muted-foreground">Zones Controlled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{legacy.missionsCompleted}</div>
                <div className="text-sm text-muted-foreground">Missions Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ScrollText className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{legacy.loreApproved}</div>
                <div className="text-sm text-muted-foreground">Lore Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zones">Controlled Zones</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Control</CardTitle>
              <CardDescription>
                Zones under {legacy.faction} dominion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {zones.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No zones controlled yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zones.map((zone) => (
                    <Card key={zone.name} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              {zone.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Controlled for {Math.floor((Date.now() / 1000 - zone.controlStarted) / 86400)} days
                            </p>
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-1">Mission Activity</p>
                              <Progress value={zone.missionActivity} className="h-2" />
                            </div>
                          </div>
                          {zone.contested && (
                            <Badge variant="destructive">Contested</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faction Achievements</CardTitle>
              <CardDescription>
                Milestones unlocked by {legacy.faction}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No achievements unlocked yet
                </p>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-bold text-lg">{achievement.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {achievement.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Unlocked {new Date(achievement.unlockedTimestamp * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            +{achievement.prestigeReward} Prestige
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faction Leaderboard</CardTitle>
              <CardDescription>
                Top factions by prestige points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topFactions.map((f, index) => (
                  <Card
                    key={f.faction}
                    className={`border-2 ${f.faction === faction ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `#${index + 1}`}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{f.faction}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {f.zonesControlled} zones
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {f.memberCount} members
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {f.prestigePoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">prestige</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
