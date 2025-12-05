using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// FactionTuner - Load and apply faction-specific vehicle tuning kits
/// Part of Soulvan AI Competition System
/// </summary>
public class FactionTuner : MonoBehaviour
{
    [Header("Tuning Configuration")]
    [SerializeField] private string tuningKitUrl = "http://localhost:5900/api/tuning/kits";
    [SerializeField] private string faction = "NeonReapers";
    [SerializeField] private string vehicle = "SolusGT";
    [SerializeField] private bool autoLoadOnStart = true;

    [Header("Vehicle Components")]
    [SerializeField] private Rigidbody vehicleRigidbody;
    [SerializeField] private VehiclePhysics vehiclePhysics;
    [SerializeField] private WheelCollider[] wheelColliders;

    [Header("Tuning State")]
    [SerializeField] private TuningKit currentKit;
    [SerializeField] private bool tuningApplied = false;

    private const string TUNING_CACHE_KEY = "CachedTuningKit_";

    /// <summary>
    /// Tuning kit data structure
    /// </summary>
    [System.Serializable]
    public class TuningKit
    {
        public string faction;
        public string vehicle;
        public float[] torqueMap;
        public AeroProfile aeroProfile;
        public float[] gripCurve;
        public string contributor;
        public string createdAt;
    }

    [System.Serializable]
    public class AeroProfile
    {
        public float downforce;
        public float dragCoefficient;
        public float frontalArea;
    }

    [System.Serializable]
    public class TuningKitResponse
    {
        public TuningKit kit;
        public int votes;
        public bool featured;
    }

    void Start()
    {
        if (autoLoadOnStart)
        {
            LoadAndApplyTuning();
        }
    }

    /// <summary>
    /// Load tuning kit from API and apply to vehicle
    /// </summary>
    public void LoadAndApplyTuning()
    {
        StartCoroutine(LoadTuningKitCoroutine());
    }

    /// <summary>
    /// Load tuning kit from blockchain via API
    /// </summary>
    private IEnumerator LoadTuningKitCoroutine()
    {
        Debug.Log($"[FactionTuner] Loading tuning kit for {faction} - {vehicle}...");

        string url = $"{tuningKitUrl}/{faction}/{vehicle}";
        UnityWebRequest request = UnityWebRequest.Get(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"[FactionTuner] Failed to load tuning kit from API: {request.error}");
            
            // Try loading from cache
            if (TryLoadFromCache())
            {
                Debug.Log("[FactionTuner] Loaded tuning kit from cache");
                ApplyTuning();
            }
            else
            {
                Debug.LogError("[FactionTuner] No cached tuning kit available. Using default physics.");
            }
            yield break;
        }

        try
        {
            string json = request.downloadHandler.text;
            TuningKitResponse response = JsonUtility.FromJson<TuningKitResponse>(json);
            currentKit = response.kit;

            // Cache for offline use
            CacheTuningKit(json);

            Debug.Log($"[FactionTuner] Tuning kit loaded successfully! Votes: {response.votes}");
            ApplyTuning();
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[FactionTuner] Failed to parse tuning kit: {e.Message}");
        }
    }

    /// <summary>
    /// Apply tuning kit to vehicle physics
    /// </summary>
    private void ApplyTuning()
    {
        if (currentKit == null)
        {
            Debug.LogWarning("[FactionTuner] No tuning kit to apply");
            return;
        }

        Debug.Log($"[FactionTuner] Applying {currentKit.faction} tuning to {currentKit.vehicle}...");

        // Apply torque curve
        if (currentKit.torqueMap != null && currentKit.torqueMap.Length > 0)
        {
            ApplyTorqueCurve(currentKit.torqueMap);
        }

        // Apply aero profile
        if (currentKit.aeroProfile != null)
        {
            ApplyAeroProfile(currentKit.aeroProfile);
        }

        // Apply grip curve
        if (currentKit.gripCurve != null && currentKit.gripCurve.Length > 0)
        {
            ApplyGripCurve(currentKit.gripCurve);
        }

        tuningApplied = true;
        Debug.Log($"[FactionTuner] ✅ Tuning applied! Contributor: {currentKit.contributor}");
    }

    /// <summary>
    /// Apply torque curve from tuning kit
    /// </summary>
    private void ApplyTorqueCurve(float[] torqueMap)
    {
        if (vehiclePhysics == null)
        {
            Debug.LogWarning("[FactionTuner] VehiclePhysics component not assigned");
            return;
        }

        // Create AnimationCurve from torque map
        AnimationCurve torqueCurve = new AnimationCurve();
        
        for (int i = 0; i < torqueMap.Length; i++)
        {
            float rpm = i * 500f; // RPM steps
            float torque = torqueMap[i];
            torqueCurve.AddKey(rpm, torque);
        }

        vehiclePhysics.engineTorqueCurve = torqueCurve;
        Debug.Log($"[FactionTuner] Applied torque curve with {torqueMap.Length} data points");
    }

    /// <summary>
    /// Apply aerodynamic profile
    /// </summary>
    private void ApplyAeroProfile(AeroProfile aero)
    {
        if (vehicleRigidbody == null)
        {
            Debug.LogWarning("[FactionTuner] Rigidbody not assigned");
            return;
        }

        // Apply downforce (simulated as downward force at speed)
        if (vehiclePhysics != null)
        {
            vehiclePhysics.downforceMultiplier = aero.downforce / 250f; // Normalize to 250 base
            vehiclePhysics.dragCoefficient = aero.dragCoefficient;
        }

        // Adjust rigidbody drag
        vehicleRigidbody.drag = aero.dragCoefficient * aero.frontalArea * 0.1f;

        Debug.Log($"[FactionTuner] Applied aero: Downforce={aero.downforce}, Drag={aero.dragCoefficient}");
    }

    /// <summary>
    /// Apply grip curve to wheels
    /// </summary>
    private void ApplyGripCurve(float[] gripCurve)
    {
        if (wheelColliders == null || wheelColliders.Length == 0)
        {
            Debug.LogWarning("[FactionTuner] No wheel colliders assigned");
            return;
        }

        // Store grip curve for runtime application
        if (vehiclePhysics != null)
        {
            vehiclePhysics.gripCurve = gripCurve;
        }

        // Apply base grip multiplier
        float baseGrip = gripCurve[0];
        
        foreach (var wheel in wheelColliders)
        {
            if (wheel != null)
            {
                WheelFrictionCurve forwardFriction = wheel.forwardFriction;
                WheelFrictionCurve sidewaysFriction = wheel.sidewaysFriction;

                forwardFriction.stiffness *= baseGrip;
                sidewaysFriction.stiffness *= baseGrip;

                wheel.forwardFriction = forwardFriction;
                wheel.sidewaysFriction = sidewaysFriction;
            }
        }

        Debug.Log($"[FactionTuner] Applied grip curve to {wheelColliders.Length} wheels");
    }

    /// <summary>
    /// Cache tuning kit for offline use
    /// </summary>
    private void CacheTuningKit(string json)
    {
        string cacheKey = TUNING_CACHE_KEY + faction + "_" + vehicle;
        PlayerPrefs.SetString(cacheKey, json);
        PlayerPrefs.Save();
        Debug.Log($"[FactionTuner] Tuning kit cached: {cacheKey}");
    }

    /// <summary>
    /// Try loading tuning kit from cache
    /// </summary>
    private bool TryLoadFromCache()
    {
        string cacheKey = TUNING_CACHE_KEY + faction + "_" + vehicle;
        
        if (PlayerPrefs.HasKey(cacheKey))
        {
            string json = PlayerPrefs.GetString(cacheKey);
            
            try
            {
                TuningKitResponse response = JsonUtility.FromJson<TuningKitResponse>(json);
                currentKit = response.kit;
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[FactionTuner] Failed to load from cache: {e.Message}");
            }
        }

        return false;
    }

    /// <summary>
    /// Manually set tuning kit (for testing)
    /// </summary>
    public void SetTuningKit(TuningKit kit)
    {
        currentKit = kit;
        ApplyTuning();
    }

    /// <summary>
    /// Reset to default physics
    /// </summary>
    public void ResetToDefaults()
    {
        Debug.Log("[FactionTuner] Resetting to default vehicle physics...");
        
        if (vehiclePhysics != null)
        {
            vehiclePhysics.ResetToDefaults();
        }

        tuningApplied = false;
    }

    /// <summary>
    /// Get current tuning stats
    /// </summary>
    public string GetTuningStats()
    {
        if (currentKit == null)
        {
            return "No tuning kit applied";
        }

        float peakTorque = 0f;
        if (currentKit.torqueMap != null && currentKit.torqueMap.Length > 0)
        {
            foreach (var torque in currentKit.torqueMap)
            {
                if (torque > peakTorque) peakTorque = torque;
            }
        }

        float maxGrip = 0f;
        if (currentKit.gripCurve != null && currentKit.gripCurve.Length > 0)
        {
            foreach (var grip in currentKit.gripCurve)
            {
                if (grip > maxGrip) maxGrip = grip;
            }
        }

        return $"Faction: {currentKit.faction}\n" +
               $"Vehicle: {currentKit.vehicle}\n" +
               $"Peak Torque: {peakTorque:F0} Nm\n" +
               $"Downforce: {currentKit.aeroProfile?.downforce:F0} kg\n" +
               $"Max Grip: {maxGrip:F2}\n" +
               $"Contributor: {currentKit.contributor?.Substring(0, 10)}...";
    }

    void OnGUI()
    {
        if (tuningApplied && currentKit != null)
        {
            GUI.Box(new Rect(10, 10, 200, 100), "Tuning Active");
            GUI.Label(new Rect(20, 30, 180, 20), $"Faction: {currentKit.faction}");
            GUI.Label(new Rect(20, 50, 180, 20), $"Vehicle: {currentKit.vehicle}");
            GUI.Label(new Rect(20, 70, 180, 20), $"By: {currentKit.contributor?.Substring(0, 10)}...");
        }
    }
}

/// <summary>
/// Simple vehicle physics component (extend as needed)
/// </summary>
public class VehiclePhysics : MonoBehaviour
{
    public AnimationCurve engineTorqueCurve;
    public float downforceMultiplier = 1.0f;
    public float dragCoefficient = 0.28f;
    public float[] gripCurve;

    public void ResetToDefaults()
    {
        downforceMultiplier = 1.0f;
        dragCoefficient = 0.28f;
        
        // Default torque curve
        engineTorqueCurve = AnimationCurve.EaseInOut(0, 0, 8000, 450);
    }
}
