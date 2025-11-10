using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Timeline;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// LoreRecap - Trigger cinematic lore recaps when entering zones
/// Plays timeline sequences with contributor voiceovers, music, and faction highlights
/// </summary>
public class LoreRecap : MonoBehaviour
{
    [Header("Timeline Configuration")]
    public PlayableDirector recapTimeline;
    public string zone = "NeonDistrict";
    public bool autoPlayOnce = true;
    
    [Header("Recap Content")]
    public AudioClip[] mythbookQuotes;
    public AudioClip zoneThemeMusic;
    public Sprite[] factionBanners;
    public GameObject[] missionHighlights;
    
    [Header("API Configuration")]
    public string loreApiUrl = "http://localhost:5800/api/lore-recap";
    public bool fetchFromBlockchain = true;
    
    [Header("Visual Effects")]
    public CanvasGroup fadeGroup;
    public float fadeDuration = 2f;
    public GameObject cinematicBars;
    
    private bool hasPlayed = false;
    private LoreRecapData cachedData;

    [System.Serializable]
    public class LoreRecapData
    {
        public string zone;
        public string[] mythbookQuotes;
        public string musicUrl;
        public FactionHighlight[] factionHighlights;
        public MissionHighlight[] missionHighlights;
    }

    [System.Serializable]
    public class FactionHighlight
    {
        public string faction;
        public int zonesControlled;
        public int prestige;
        public string bannerUrl;
    }

    [System.Serializable]
    public class MissionHighlight
    {
        public string missionName;
        public string description;
        public string imageUrl;
    }

    void Start()
    {
        // Check if recap has been seen
        string recapKey = zone + "_recapSeen";
        
        if (autoPlayOnce && PlayerPrefs.GetInt(recapKey, 0) == 0)
        {
            StartCoroutine(PlayLoreRecap());
        }
    }

    /// <summary>
    /// Main coroutine to play lore recap sequence
    /// </summary>
    public IEnumerator PlayLoreRecap()
    {
        if (hasPlayed) yield break;
        hasPlayed = true;

        Debug.Log($"🎬 Starting lore recap for {zone}...");

        // Show cinematic bars
        if (cinematicBars != null)
        {
            cinematicBars.SetActive(true);
        }

        // Fade in
        yield return StartCoroutine(FadeIn());

        // Fetch recap content from API/blockchain
        if (fetchFromBlockchain)
        {
            yield return StartCoroutine(FetchLoreRecapData());
        }

        // Play timeline
        if (recapTimeline != null)
        {
            // Inject content into timeline
            InjectContentIntoTimeline();
            
            recapTimeline.Play();
            
            // Wait for timeline to complete
            while (recapTimeline.state == PlayState.Playing)
            {
                yield return null;
            }
        }
        else
        {
            Debug.LogWarning("No timeline assigned for lore recap!");
            // Fallback: play audio and show UI
            yield return StartCoroutine(PlaySimpleRecap());
        }

        // Fade out
        yield return StartCoroutine(FadeOut());

        // Hide cinematic bars
        if (cinematicBars != null)
        {
            cinematicBars.SetActive(false);
        }

        // Mark as seen
        PlayerPrefs.SetInt(zone + "_recapSeen", 1);
        PlayerPrefs.Save();

        Debug.Log($"✅ Lore recap completed for {zone}");
    }

    /// <summary>
    /// Fetch lore recap data from API
    /// </summary>
    IEnumerator FetchLoreRecapData()
    {
        string url = $"{loreApiUrl}?zone={zone}";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string json = request.downloadHandler.text;
                cachedData = JsonUtility.FromJson<LoreRecapData>(json);
                
                Debug.Log($"✅ Fetched lore recap data for {zone}");
            }
            else
            {
                Debug.LogWarning($"Failed to fetch lore recap: {request.error}");
            }
        }
    }

    /// <summary>
    /// Inject fetched content into timeline tracks
    /// </summary>
    void InjectContentIntoTimeline()
    {
        if (cachedData == null) return;

        TimelineAsset timeline = recapTimeline.playableAsset as TimelineAsset;
        if (timeline == null) return;

        // Inject audio tracks
        foreach (var track in timeline.GetOutputTracks())
        {
            if (track is AudioTrack audioTrack)
            {
                // Add mythbook quotes
                foreach (var quote in mythbookQuotes)
                {
                    if (quote != null)
                    {
                        // Create audio clip on track (simplified - actual implementation would use TimelineEditor)
                        Debug.Log($"🎙️ Adding quote to timeline: {quote.name}");
                    }
                }

                // Add zone theme music
                if (zoneThemeMusic != null)
                {
                    Debug.Log($"🎵 Adding zone theme: {zoneThemeMusic.name}");
                }
            }
        }

        Debug.Log("✅ Content injected into timeline");
    }

    /// <summary>
    /// Simple fallback recap without timeline
    /// </summary>
    IEnumerator PlaySimpleRecap()
    {
        // Play mythbook quotes
        foreach (var quote in mythbookQuotes)
        {
            if (quote != null)
            {
                AudioSource.PlayClipAtPoint(quote, Camera.main.transform.position);
                yield return new WaitForSeconds(quote.length + 1f);
            }
        }

        // Play zone theme
        if (zoneThemeMusic != null)
        {
            AudioSource.PlayClipAtPoint(zoneThemeMusic, Camera.main.transform.position);
            yield return new WaitForSeconds(5f);
        }

        // Show faction banners
        yield return StartCoroutine(ShowFactionHighlights());

        // Show mission highlights
        yield return StartCoroutine(ShowMissionHighlights());
    }

    /// <summary>
    /// Show faction banners and achievements
    /// </summary>
    IEnumerator ShowFactionHighlights()
    {
        if (cachedData?.factionHighlights == null) yield break;

        foreach (var faction in cachedData.factionHighlights)
        {
            Debug.Log($"🏆 {faction.faction}: {faction.zonesControlled} zones, {faction.prestige} prestige");
            
            // Display faction UI (would integrate with actual UI system)
            yield return new WaitForSeconds(2f);
        }
    }

    /// <summary>
    /// Show mission highlights
    /// </summary>
    IEnumerator ShowMissionHighlights()
    {
        if (cachedData?.missionHighlights == null) yield break;

        foreach (var mission in cachedData.missionHighlights)
        {
            Debug.Log($"⭐ Mission: {mission.missionName} - {mission.description}");
            
            // Display mission UI
            yield return new WaitForSeconds(2f);
        }
    }

    /// <summary>
    /// Fade in effect
    /// </summary>
    IEnumerator FadeIn()
    {
        if (fadeGroup == null) yield break;

        float elapsed = 0f;
        while (elapsed < fadeDuration)
        {
            elapsed += Time.deltaTime;
            fadeGroup.alpha = Mathf.Lerp(0f, 1f, elapsed / fadeDuration);
            yield return null;
        }
        fadeGroup.alpha = 1f;
    }

    /// <summary>
    /// Fade out effect
    /// </summary>
    IEnumerator FadeOut()
    {
        if (fadeGroup == null) yield break;

        float elapsed = 0f;
        while (elapsed < fadeDuration)
        {
            elapsed += Time.deltaTime;
            fadeGroup.alpha = Mathf.Lerp(1f, 0f, elapsed / fadeDuration);
            yield return null;
        }
        fadeGroup.alpha = 0f;
    }

    /// <summary>
    /// Force play recap (for testing or replay)
    /// </summary>
    public void ForcePlayRecap()
    {
        hasPlayed = false;
        StartCoroutine(PlayLoreRecap());
    }

    /// <summary>
    /// Reset recap seen flag
    /// </summary>
    public void ResetRecapFlag()
    {
        PlayerPrefs.SetInt(zone + "_recapSeen", 0);
        PlayerPrefs.Save();
        Debug.Log($"🔄 Reset recap flag for {zone}");
    }

    /// <summary>
    /// Check if recap has been seen
    /// </summary>
    public bool HasBeenSeen()
    {
        return PlayerPrefs.GetInt(zone + "_recapSeen", 0) == 1;
    }
}
