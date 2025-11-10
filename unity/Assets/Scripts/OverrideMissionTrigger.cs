using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

/// <summary>
/// OverrideMissionTrigger - Check OverrideBranch.sol and activate override missions
/// Part of Soulvan AI Competition System
/// </summary>
public class OverrideMissionTrigger : MonoBehaviour
{
    [Header("API Configuration")]
    [SerializeField] private string overrideApiUrl = "http://localhost:6000/api/overrides";

    [Header("Mission Configuration")]
    [SerializeField] private string missionId;
    [SerializeField] private bool checkOnStart = true;
    [SerializeField] private float checkInterval = 30f;

    [Header("UI Elements")]
    [SerializeField] private GameObject overrideNotification;
    [SerializeField] private Text overrideTitle;
    [SerializeField] private Text overrideDescription;
    [SerializeField] private Button acceptButton;
    [SerializeField] private Button rejectButton;

    [Header("Mission Components")]
    [SerializeField] private GameObject standardMissionPrefab;
    [SerializeField] private GameObject overrideMissionPrefab;
    [SerializeField] private Transform missionSpawnPoint;

    [Header("State")]
    [SerializeField] private OverrideBranch currentOverride;
    [SerializeField] private bool overrideActive = false;
    [SerializeField] private bool hasCheckedThisSession = false;

    private GameObject activeMission;

    /// <summary>
    /// Override branch data
    /// </summary>
    [System.Serializable]
    public class OverrideBranch
    {
        public string missionId;
        public string overrideTitle;
        public string overrideDescription;
        public string[] prerequisites;
        public int votes;
        public bool approved;
        public string proposer;
        public string overrideUrl;
    }

    [System.Serializable]
    public class OverrideResponse
    {
        public OverrideBranch[] overrides;
        public int totalOverrides;
    }

    void Start()
    {
        if (checkOnStart)
        {
            CheckForOverrides();
        }

        // Start periodic check
        if (checkInterval > 0)
        {
            InvokeRepeating(nameof(CheckForOverrides), checkInterval, checkInterval);
        }

        // Setup button listeners
        if (acceptButton != null)
        {
            acceptButton.onClick.AddListener(AcceptOverride);
        }

        if (rejectButton != null)
        {
            rejectButton.onClick.AddListener(RejectOverride);
        }
    }

    /// <summary>
    /// Check for approved override missions
    /// </summary>
    public void CheckForOverrides()
    {
        if (string.IsNullOrEmpty(missionId))
        {
            Debug.LogWarning("[OverrideMissionTrigger] Mission ID not set");
            return;
        }

        StartCoroutine(CheckOverridesCoroutine());
    }

    private IEnumerator CheckOverridesCoroutine()
    {
        Debug.Log($"[OverrideMissionTrigger] Checking overrides for {missionId}...");

        string url = $"{overrideApiUrl}/{missionId}";
        UnityWebRequest request = UnityWebRequest.Get(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"[OverrideMissionTrigger] Failed to check overrides: {request.error}");
            yield break;
        }

        try
        {
            string json = request.downloadHandler.text;
            OverrideResponse response = JsonUtility.FromJson<OverrideResponse>(json);

            if (response.overrides != null && response.overrides.Length > 0)
            {
                // Get highest voted approved override
                OverrideBranch bestOverride = null;
                int maxVotes = 0;

                foreach (var ovr in response.overrides)
                {
                    if (ovr.approved && ovr.votes > maxVotes)
                    {
                        maxVotes = ovr.votes;
                        bestOverride = ovr;
                    }
                }

                if (bestOverride != null && !hasCheckedThisSession)
                {
                    currentOverride = bestOverride;
                    ShowOverrideNotification();
                    hasCheckedThisSession = true;
                }
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[OverrideMissionTrigger] Failed to parse overrides: {e.Message}");
        }
    }

    /// <summary>
    /// Show override notification to player
    /// </summary>
    private void ShowOverrideNotification()
    {
        if (overrideNotification == null)
        {
            Debug.LogWarning("[OverrideMissionTrigger] Override notification UI not assigned");
            return;
        }

        overrideNotification.SetActive(true);

        if (overrideTitle != null)
        {
            overrideTitle.text = $"🎯 OVERRIDE MISSION: {currentOverride.overrideTitle}";
        }

        if (overrideDescription != null)
        {
            overrideDescription.text = $"{currentOverride.overrideDescription}\n\n" +
                                        $"Community Votes: {currentOverride.votes}\n" +
                                        $"Proposed by: {currentOverride.proposer.Substring(0, 10)}...";
        }

        Debug.Log($"[OverrideMissionTrigger] 🎯 Override available: {currentOverride.overrideTitle}");
    }

    /// <summary>
    /// Accept override mission
    /// </summary>
    public void AcceptOverride()
    {
        if (currentOverride == null)
        {
            Debug.LogWarning("[OverrideMissionTrigger] No override to accept");
            return;
        }

        Debug.Log($"[OverrideMissionTrigger] ✅ Accepting override: {currentOverride.overrideTitle}");

        // Hide notification
        if (overrideNotification != null)
        {
            overrideNotification.SetActive(false);
        }

        // Load override mission
        LoadOverrideMission();

        overrideActive = true;
    }

    /// <summary>
    /// Reject override mission (play standard)
    /// </summary>
    public void RejectOverride()
    {
        Debug.Log("[OverrideMissionTrigger] ❌ Rejecting override - playing standard mission");

        // Hide notification
        if (overrideNotification != null)
        {
            overrideNotification.SetActive(false);
        }

        // Load standard mission
        LoadStandardMission();

        overrideActive = false;
    }

    /// <summary>
    /// Load override mission content
    /// </summary>
    private void LoadOverrideMission()
    {
        // Destroy current mission
        if (activeMission != null)
        {
            Destroy(activeMission);
        }

        if (overrideMissionPrefab != null)
        {
            Vector3 spawnPos = missionSpawnPoint != null ? missionSpawnPoint.position : Vector3.zero;
            Quaternion spawnRot = missionSpawnPoint != null ? missionSpawnPoint.rotation : Quaternion.identity;

            activeMission = Instantiate(overrideMissionPrefab, spawnPos, spawnRot);
            activeMission.name = $"Override_{missionId}";

            // Configure mission with override data
            ConfigureOverrideMission(activeMission);

            Debug.Log($"[OverrideMissionTrigger] Override mission loaded");
        }
        else
        {
            Debug.LogWarning("[OverrideMissionTrigger] Override mission prefab not assigned - loading from URL");
            StartCoroutine(LoadMissionFromUrl(currentOverride.overrideUrl));
        }
    }

    /// <summary>
    /// Load standard mission content
    /// </summary>
    private void LoadStandardMission()
    {
        // Destroy current mission
        if (activeMission != null)
        {
            Destroy(activeMission);
        }

        if (standardMissionPrefab != null)
        {
            Vector3 spawnPos = missionSpawnPoint != null ? missionSpawnPoint.position : Vector3.zero;
            Quaternion spawnRot = missionSpawnPoint != null ? missionSpawnPoint.rotation : Quaternion.identity;

            activeMission = Instantiate(standardMissionPrefab, spawnPos, spawnRot);
            activeMission.name = $"Standard_{missionId}";

            Debug.Log($"[OverrideMissionTrigger] Standard mission loaded");
        }
        else
        {
            Debug.LogError("[OverrideMissionTrigger] Standard mission prefab not assigned");
        }
    }

    /// <summary>
    /// Configure override mission with custom data
    /// </summary>
    private void ConfigureOverrideMission(GameObject mission)
    {
        // Add override metadata component
        OverrideMissionMetadata metadata = mission.AddComponent<OverrideMissionMetadata>();
        metadata.missionId = currentOverride.missionId;
        metadata.overrideTitle = currentOverride.overrideTitle;
        metadata.overrideDescription = currentOverride.overrideDescription;
        metadata.proposer = currentOverride.proposer;
        metadata.votes = currentOverride.votes;

        // Apply visual effects
        ApplyOverrideEffects(mission);

        Debug.Log($"[OverrideMissionTrigger] Mission configured with override data");
    }

    /// <summary>
    /// Apply visual effects for override missions
    /// </summary>
    private void ApplyOverrideEffects(GameObject mission)
    {
        // Add glowing effect
        Light overrideLight = mission.AddComponent<Light>();
        overrideLight.color = new Color(1.0f, 0.5f, 0.0f); // Orange glow
        overrideLight.intensity = 2.0f;
        overrideLight.range = 20.0f;
        overrideLight.type = LightType.Point;

        // Add particle effect
        GameObject particleObj = new GameObject("OverrideParticles");
        particleObj.transform.SetParent(mission.transform);
        particleObj.transform.localPosition = Vector3.zero;

        ParticleSystem particles = particleObj.AddComponent<ParticleSystem>();
        var main = particles.main;
        main.startColor = new Color(1.0f, 0.5f, 0.0f);
        main.startSize = 0.3f;
        main.startLifetime = 2.0f;
        main.maxParticles = 50;

        var emission = particles.emission;
        emission.rateOverTime = 20;

        Debug.Log("[OverrideMissionTrigger] Override visual effects applied");
    }

    /// <summary>
    /// Load mission from IPFS URL
    /// </summary>
    private IEnumerator LoadMissionFromUrl(string url)
    {
        Debug.Log($"[OverrideMissionTrigger] Loading mission from {url}...");

        // Convert IPFS URL to gateway URL
        string gatewayUrl = url.Replace("ipfs://", "https://ipfs.io/ipfs/");

        UnityWebRequest request = UnityWebRequest.Get(gatewayUrl);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"[OverrideMissionTrigger] Failed to load mission: {request.error}");
            yield break;
        }

        // Parse mission data
        string missionJson = request.downloadHandler.text;
        Debug.Log($"[OverrideMissionTrigger] Mission data loaded: {missionJson.Length} bytes");

        // TODO: Parse and instantiate mission based on JSON data
    }

    /// <summary>
    /// Check if prerequisites are met
    /// </summary>
    public bool CheckPrerequisites(string[] prerequisites)
    {
        if (prerequisites == null || prerequisites.Length == 0)
        {
            return true; // No prerequisites
        }

        foreach (var prereq in prerequisites)
        {
            if (!IsMissionCompleted(prereq))
            {
                Debug.Log($"[OverrideMissionTrigger] Prerequisite not met: {prereq}");
                return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Check if mission is completed (from PlayerPrefs or API)
    /// </summary>
    private bool IsMissionCompleted(string missionId)
    {
        string key = $"Mission_{missionId}_Completed";
        return PlayerPrefs.GetInt(key, 0) == 1;
    }

    /// <summary>
    /// Propose new override branch
    /// </summary>
    public void ProposeOverride(string overrideTitle, string overrideDescription, string overrideUrl)
    {
        StartCoroutine(ProposeOverrideCoroutine(overrideTitle, overrideDescription, overrideUrl));
    }

    private IEnumerator ProposeOverrideCoroutine(string title, string description, string url)
    {
        Debug.Log($"[OverrideMissionTrigger] Proposing override: {title}");

        WWWForm form = new WWWForm();
        form.AddField("missionId", missionId);
        form.AddField("overrideTitle", title);
        form.AddField("overrideDescription", description);
        form.AddField("overrideUrl", url);

        UnityWebRequest request = UnityWebRequest.Post($"{overrideApiUrl}/propose", form);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"[OverrideMissionTrigger] Failed to propose override: {request.error}");
            yield break;
        }

        Debug.Log("[OverrideMissionTrigger] ✅ Override proposed successfully!");
    }

    /// <summary>
    /// Vote for override
    /// </summary>
    public void VoteForOverride(string overrideMissionId)
    {
        StartCoroutine(VoteCoroutine(overrideMissionId));
    }

    private IEnumerator VoteCoroutine(string overrideMissionId)
    {
        Debug.Log($"[OverrideMissionTrigger] Voting for override: {overrideMissionId}");

        WWWForm form = new WWWForm();
        form.AddField("missionId", overrideMissionId);

        UnityWebRequest request = UnityWebRequest.Post($"{overrideApiUrl}/vote", form);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"[OverrideMissionTrigger] Failed to vote: {request.error}");
            yield break;
        }

        Debug.Log("[OverrideMissionTrigger] ✅ Vote recorded!");
    }

    void OnDestroy()
    {
        CancelInvoke();
    }
}

/// <summary>
/// Override mission metadata component
/// </summary>
public class OverrideMissionMetadata : MonoBehaviour
{
    public string missionId;
    public string overrideTitle;
    public string overrideDescription;
    public string proposer;
    public int votes;

    void OnGUI()
    {
        GUI.Box(new Rect(10, 120, 250, 80), "Override Mission Active");
        GUI.Label(new Rect(20, 140, 230, 20), $"Title: {overrideTitle}");
        GUI.Label(new Rect(20, 160, 230, 20), $"Votes: {votes}");
        GUI.Label(new Rect(20, 180, 230, 20), $"By: {proposer?.Substring(0, 10)}...");
    }
}
