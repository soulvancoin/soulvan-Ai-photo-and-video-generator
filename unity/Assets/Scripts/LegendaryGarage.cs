using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

/// <summary>
/// LegendaryGarage - Check LegendaryUnlock.sol and spawn exclusive vehicles
/// Part of Soulvan AI Competition System
/// </summary>
public class LegendaryGarage : MonoBehaviour
{
    [Header("API Configuration")]
    [SerializeField] private string prestigeApiUrl = "http://localhost:6000/api/prestige";
    [SerializeField] private string unlockApiUrl = "http://localhost:6000/api/unlocks";

    [Header("Player Wallet")]
    [SerializeField] private string playerWallet = "0x0000000000000000000000000000000000000000";

    [Header("Vehicle Prefabs")]
    [SerializeField] private GameObject solusGtMythicPrefab;
    [SerializeField] private GameObject visionGtShadowPrefab;
    [SerializeField] private GameObject neonDrifterIronPrefab;
    [SerializeField] private GameObject phantomRiderSpectrePrefab;
    [SerializeField] private GameObject razorEdgeTempestPrefab;
    [SerializeField] private GameObject stormChaserVortexPrefab;

    [Header("Spawn Configuration")]
    [SerializeField] private Transform garageSpawnPoint;
    [SerializeField] private Transform[] showcasePositions;
    [SerializeField] private bool autoLoadOnStart = true;

    [Header("UI Elements")]
    [SerializeField] private Text prestigeText;
    [SerializeField] private Text unlocksText;
    [SerializeField] private GameObject lockIcon;
    [SerializeField] private GameObject unlockNotification;

    [Header("State")]
    [SerializeField] private List<LegendaryVehicle> unlockedVehicles = new List<LegendaryVehicle>();
    [SerializeField] private int currentPrestige = 0;
    [SerializeField] private GameObject currentlySpawnedVehicle;

    private Dictionary<string, GameObject> vehiclePrefabs;

    /// <summary>
    /// Legendary vehicle data
    /// </summary>
    [System.Serializable]
    public class LegendaryVehicle
    {
        public string vehicleId;
        public string vehicleName;
        public int requiredPrestige;
        public string faction;
        public bool isUnlocked;
        public string claimedAt;
    }

    [System.Serializable]
    public class PrestigeResponse
    {
        public int prestige;
        public int tier;
        public int missionCount;
        public string faction;
    }

    [System.Serializable]
    public class UnlocksResponse
    {
        public LegendaryVehicle[] unlocked;
        public LegendaryVehicle[] available;
    }

    void Start()
    {
        InitializeVehiclePrefabs();
        
        if (autoLoadOnStart)
        {
            LoadPlayerProgress();
        }
    }

    /// <summary>
    /// Initialize vehicle prefab dictionary
    /// </summary>
    private void InitializeVehiclePrefabs()
    {
        vehiclePrefabs = new Dictionary<string, GameObject>
        {
            { "SolusGT_Mythic", solusGtMythicPrefab },
            { "VisionGT_Shadow", visionGtShadowPrefab },
            { "NeonDrifter_Iron", neonDrifterIronPrefab },
            { "PhantomRider_Spectre", phantomRiderSpectrePrefab },
            { "RazorEdge_Tempest", razorEdgeTempestPrefab },
            { "StormChaser_Vortex", stormChaserVortexPrefab }
        };
    }

    /// <summary>
    /// Load player prestige and unlocks
    /// </summary>
    public void LoadPlayerProgress()
    {
        StartCoroutine(LoadProgressCoroutine());
    }

    private IEnumerator LoadProgressCoroutine()
    {
        Debug.Log("[LegendaryGarage] Loading player progress...");

        // Load prestige
        yield return StartCoroutine(LoadPrestigeCoroutine());

        // Load unlocks
        yield return StartCoroutine(LoadUnlocksCoroutine());

        // Display showcase
        DisplayUnlockedVehicles();
    }

    /// <summary>
    /// Load player prestige from FactionPrestige.sol
    /// </summary>
    private IEnumerator LoadPrestigeCoroutine()
    {
        string url = $"{prestigeApiUrl}/{playerWallet}";
        UnityWebRequest request = UnityWebRequest.Get(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"[LegendaryGarage] Failed to load prestige: {request.error}");
            yield break;
        }

        try
        {
            string json = request.downloadHandler.text;
            PrestigeResponse response = JsonUtility.FromJson<PrestigeResponse>(json);
            
            currentPrestige = response.prestige;
            
            if (prestigeText != null)
            {
                prestigeText.text = $"Prestige: {currentPrestige} (Tier {response.tier})";
            }

            Debug.Log($"[LegendaryGarage] Prestige loaded: {currentPrestige}");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[LegendaryGarage] Failed to parse prestige: {e.Message}");
        }
    }

    /// <summary>
    /// Load unlocked vehicles from LegendaryUnlock.sol
    /// </summary>
    private IEnumerator LoadUnlocksCoroutine()
    {
        string url = $"{unlockApiUrl}/{playerWallet}";
        UnityWebRequest request = UnityWebRequest.Get(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"[LegendaryGarage] Failed to load unlocks: {request.error}");
            yield break;
        }

        try
        {
            string json = request.downloadHandler.text;
            UnlocksResponse response = JsonUtility.FromJson<UnlocksResponse>(json);
            
            unlockedVehicles.Clear();
            unlockedVehicles.AddRange(response.unlocked);

            if (unlocksText != null)
            {
                unlocksText.text = $"Unlocked: {unlockedVehicles.Count}/6 Legendary Vehicles";
            }

            Debug.Log($"[LegendaryGarage] Unlocked vehicles: {unlockedVehicles.Count}");

            // Check for new unlocks
            foreach (var available in response.available)
            {
                if (currentPrestige >= available.requiredPrestige)
                {
                    Debug.Log($"[LegendaryGarage] 🎉 {available.vehicleName} is now available to claim!");
                    ShowUnlockNotification(available.vehicleName);
                }
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[LegendaryGarage] Failed to parse unlocks: {e.Message}");
        }
    }

    /// <summary>
    /// Claim legendary vehicle
    /// </summary>
    public void ClaimVehicle(string vehicleId)
    {
        StartCoroutine(ClaimVehicleCoroutine(vehicleId));
    }

    private IEnumerator ClaimVehicleCoroutine(string vehicleId)
    {
        Debug.Log($"[LegendaryGarage] Claiming {vehicleId}...");

        string url = $"{unlockApiUrl}/claim";
        WWWForm form = new WWWForm();
        form.AddField("vehicleId", vehicleId);

        UnityWebRequest request = UnityWebRequest.Post(url, form);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"[LegendaryGarage] Failed to claim vehicle: {request.error}");
            yield break;
        }

        Debug.Log($"[LegendaryGarage] ✅ {vehicleId} claimed!");
        
        // Reload progress
        LoadPlayerProgress();
    }

    /// <summary>
    /// Spawn legendary vehicle in garage
    /// </summary>
    public void SpawnVehicle(string vehicleId)
    {
        // Check if vehicle is unlocked
        bool isUnlocked = unlockedVehicles.Exists(v => v.vehicleId == vehicleId);
        
        if (!isUnlocked)
        {
            Debug.LogWarning($"[LegendaryGarage] Vehicle {vehicleId} is not unlocked");
            ShowLockIcon();
            return;
        }

        // Destroy current vehicle
        if (currentlySpawnedVehicle != null)
        {
            Destroy(currentlySpawnedVehicle);
        }

        // Spawn new vehicle
        if (vehiclePrefabs.ContainsKey(vehicleId))
        {
            GameObject prefab = vehiclePrefabs[vehicleId];
            
            if (prefab != null)
            {
                Vector3 spawnPos = garageSpawnPoint != null ? garageSpawnPoint.position : Vector3.zero;
                Quaternion spawnRot = garageSpawnPoint != null ? garageSpawnPoint.rotation : Quaternion.identity;
                
                currentlySpawnedVehicle = Instantiate(prefab, spawnPos, spawnRot);
                
                Debug.Log($"[LegendaryGarage] Spawned {vehicleId}");

                // Apply legendary effects
                ApplyLegendaryEffects(currentlySpawnedVehicle, vehicleId);
            }
            else
            {
                Debug.LogError($"[LegendaryGarage] Prefab for {vehicleId} is null");
            }
        }
        else
        {
            Debug.LogError($"[LegendaryGarage] No prefab found for {vehicleId}");
        }
    }

    /// <summary>
    /// Apply legendary visual effects
    /// </summary>
    private void ApplyLegendaryEffects(GameObject vehicle, string vehicleId)
    {
        // Add particle effects
        ParticleSystem particles = vehicle.GetComponentInChildren<ParticleSystem>();
        
        if (particles == null)
        {
            GameObject particleObj = new GameObject("LegendaryParticles");
            particleObj.transform.SetParent(vehicle.transform);
            particleObj.transform.localPosition = Vector3.up * 0.5f;
            
            particles = particleObj.AddComponent<ParticleSystem>();
        }

        // Configure legendary glow
        var main = particles.main;
        main.startColor = GetFactionColor(vehicleId);
        main.startSize = 0.2f;
        main.startLifetime = 1.0f;
        main.maxParticles = 100;

        var emission = particles.emission;
        emission.rateOverTime = 50;

        Debug.Log($"[LegendaryGarage] Applied legendary effects to {vehicleId}");
    }

    /// <summary>
    /// Get faction color for vehicle
    /// </summary>
    private Color GetFactionColor(string vehicleId)
    {
        if (vehicleId.Contains("Mythic") || vehicleId.Contains("Spectre"))
            return new Color(0.0f, 1.0f, 1.0f); // Cyan for NeonReapers
        
        if (vehicleId.Contains("Shadow") || vehicleId.Contains("Vortex"))
            return new Color(0.5f, 0.0f, 1.0f); // Purple for ShadowSyndicate
        
        if (vehicleId.Contains("Iron") || vehicleId.Contains("Tempest"))
            return new Color(1.0f, 0.5f, 0.0f); // Orange for IronCollective

        return Color.white;
    }

    /// <summary>
    /// Display unlocked vehicles in showcase
    /// </summary>
    private void DisplayUnlockedVehicles()
    {
        if (showcasePositions == null || showcasePositions.Length == 0)
        {
            return;
        }

        for (int i = 0; i < unlockedVehicles.Count && i < showcasePositions.Length; i++)
        {
            LegendaryVehicle vehicle = unlockedVehicles[i];
            Transform position = showcasePositions[i];

            if (vehiclePrefabs.ContainsKey(vehicle.vehicleId))
            {
                GameObject prefab = vehiclePrefabs[vehicle.vehicleId];
                
                if (prefab != null)
                {
                    GameObject showcase = Instantiate(prefab, position.position, position.rotation);
                    showcase.name = vehicle.vehicleId + "_Showcase";
                    
                    // Disable physics for showcase
                    Rigidbody rb = showcase.GetComponent<Rigidbody>();
                    if (rb != null) rb.isKinematic = true;

                    // Add slow rotation
                    showcase.AddComponent<ShowcaseRotator>();
                }
            }
        }

        Debug.Log($"[LegendaryGarage] Displayed {unlockedVehicles.Count} vehicles in showcase");
    }

    /// <summary>
    /// Show unlock notification
    /// </summary>
    private void ShowUnlockNotification(string vehicleName)
    {
        if (unlockNotification != null)
        {
            unlockNotification.SetActive(true);
            
            Text notifText = unlockNotification.GetComponentInChildren<Text>();
            if (notifText != null)
            {
                notifText.text = $"🎉 {vehicleName} UNLOCKED!";
            }

            StartCoroutine(HideNotificationAfterDelay(3.0f));
        }
    }

    /// <summary>
    /// Show lock icon
    /// </summary>
    private void ShowLockIcon()
    {
        if (lockIcon != null)
        {
            lockIcon.SetActive(true);
            StartCoroutine(HideNotificationAfterDelay(2.0f, lockIcon));
        }
    }

    private IEnumerator HideNotificationAfterDelay(float delay, GameObject target = null)
    {
        yield return new WaitForSeconds(delay);
        
        if (target != null)
        {
            target.SetActive(false);
        }
        else if (unlockNotification != null)
        {
            unlockNotification.SetActive(false);
        }
    }

    /// <summary>
    /// Check if vehicle is unlocked
    /// </summary>
    public bool IsVehicleUnlocked(string vehicleId)
    {
        return unlockedVehicles.Exists(v => v.vehicleId == vehicleId);
    }

    /// <summary>
    /// Get required prestige for vehicle
    /// </summary>
    public int GetRequiredPrestige(string vehicleId)
    {
        // Prestige requirements from LegendaryUnlock.sol
        switch (vehicleId)
        {
            case "SolusGT_Mythic": return 1000;
            case "VisionGT_Shadow": return 1000;
            case "NeonDrifter_Iron": return 2000;
            case "PhantomRider_Spectre": return 2000;
            case "RazorEdge_Tempest": return 5000;
            case "StormChaser_Vortex": return 5000;
            default: return 10000;
        }
    }
}

/// <summary>
/// Showcase rotator component
/// </summary>
public class ShowcaseRotator : MonoBehaviour
{
    [SerializeField] private float rotationSpeed = 20f;

    void Update()
    {
        transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
    }
}
