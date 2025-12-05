using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System;

/// <summary>
/// MissionWeatherModifier - Dynamically adjusts mission parameters based on real-world weather
/// Integrates with weather APIs to create realistic environmental challenges
/// </summary>
public class MissionWeatherModifier : MonoBehaviour
{
    [Header("Mission Configuration")]
    public string zone = "NeonDistrict";
    public Mission mission;
    
    [Header("Weather API")]
    public string weatherApiUrl = "http://localhost:5500/api/weather";
    public float updateInterval = 300f; // 5 minutes
    
    [Header("Modifier Settings")]
    [Range(0f, 2f)]
    public float difficultyMultiplier = 1.0f;
    
    [Range(0f, 2f)]
    public float vehicleHandlingMultiplier = 1.0f;
    
    [Range(0f, 1f)]
    public float visibilityMultiplier = 1.0f;
    
    [Range(0f, 2f)]
    public float enemyAwarenessMultiplier = 1.0f;

    // Weather state
    private WeatherData currentWeather;
    private float nextUpdateTime;

    [System.Serializable]
    public class WeatherData
    {
        public string condition;      // "clear", "rain", "snow", "fog", "storm", "night"
        public float temperature;     // Celsius
        public float windSpeed;       // m/s
        public float humidity;        // 0-100%
        public float visibility;      // meters
        public bool isNight;          // Day/night cycle
        public float precipitation;   // mm/hour
    }

    void Start()
    {
        if (mission == null)
        {
            Debug.LogError("Mission reference not set on MissionWeatherModifier!");
            return;
        }

        // Initial weather fetch
        StartCoroutine(FetchWeatherAndApplyModifiers());
    }

    void Update()
    {
        // Periodic weather updates
        if (Time.time >= nextUpdateTime)
        {
            StartCoroutine(FetchWeatherAndApplyModifiers());
            nextUpdateTime = Time.time + updateInterval;
        }
    }

    /// <summary>
    /// Fetch weather data from API and apply modifiers
    /// </summary>
    IEnumerator FetchWeatherAndApplyModifiers()
    {
        string url = $"{weatherApiUrl}?zone={zone}";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;
                currentWeather = JsonUtility.FromJson<WeatherData>(jsonResponse);
                
                ApplyWeatherModifiers(currentWeather);
                
                Debug.Log($"Weather updated for {zone}: {currentWeather.condition}");
            }
            else
            {
                Debug.LogWarning($"Failed to fetch weather: {request.error}");
                
                // Fallback to default clear weather
                currentWeather = new WeatherData
                {
                    condition = "clear",
                    temperature = 20f,
                    windSpeed = 5f,
                    humidity = 50f,
                    visibility = 10000f,
                    isNight = false,
                    precipitation = 0f
                };
                
                ApplyWeatherModifiers(currentWeather);
            }
        }
    }

    /// <summary>
    /// Apply weather-based modifications to mission parameters
    /// </summary>
    void ApplyWeatherModifiers(WeatherData weather)
    {
        // Reset multipliers
        difficultyMultiplier = 1.0f;
        vehicleHandlingMultiplier = 1.0f;
        visibilityMultiplier = 1.0f;
        enemyAwarenessMultiplier = 1.0f;

        // Rain modifiers
        if (weather.condition == "rain")
        {
            difficultyMultiplier += 0.3f;
            vehicleHandlingMultiplier *= 0.85f;
            visibilityMultiplier *= 0.8f;
            enemyAwarenessMultiplier *= 0.9f; // Enemies slightly less aware
            
            mission.difficulty += 1;
            mission.vehicleHandling *= vehicleHandlingMultiplier;
            mission.visibility *= visibilityMultiplier;
            
            ApplyVisualEffects("rain");
            Debug.Log("☔ Rain: +Difficulty, -VehicleHandling, -Visibility");
        }
        
        // Snow modifiers
        else if (weather.condition == "snow")
        {
            difficultyMultiplier += 0.5f;
            vehicleHandlingMultiplier *= 0.7f;
            visibilityMultiplier *= 0.6f;
            enemyAwarenessMultiplier *= 0.8f;
            
            mission.difficulty += 2;
            mission.vehicleHandling *= vehicleHandlingMultiplier;
            mission.visibility *= visibilityMultiplier;
            
            ApplyVisualEffects("snow");
            Debug.Log("❄️ Snow: ++Difficulty, --VehicleHandling, --Visibility");
        }
        
        // Fog modifiers
        else if (weather.condition == "fog")
        {
            visibilityMultiplier *= 0.4f;
            enemyAwarenessMultiplier *= 0.7f;
            
            mission.visibility *= visibilityMultiplier;
            mission.enemyDetectionRange *= enemyAwarenessMultiplier;
            
            ApplyVisualEffects("fog");
            Debug.Log("🌫️ Fog: ---Visibility, Stealth bonus");
        }
        
        // Storm modifiers
        else if (weather.condition == "storm")
        {
            difficultyMultiplier += 0.8f;
            vehicleHandlingMultiplier *= 0.6f;
            visibilityMultiplier *= 0.5f;
            enemyAwarenessMultiplier *= 0.75f;
            
            mission.difficulty += 3;
            mission.vehicleHandling *= vehicleHandlingMultiplier;
            mission.visibility *= visibilityMultiplier;
            
            ApplyVisualEffects("storm");
            Debug.Log("⛈️ Storm: +++Difficulty, --VehicleHandling, --Visibility");
        }
        
        // Night modifiers
        else if (weather.isNight)
        {
            difficultyMultiplier += 0.2f;
            visibilityMultiplier *= 0.5f;
            enemyAwarenessMultiplier *= 0.85f;
            
            mission.difficulty += 1;
            mission.visibility *= visibilityMultiplier;
            mission.enemyDetectionRange *= enemyAwarenessMultiplier;
            
            ApplyVisualEffects("night");
            Debug.Log("🌙 Night: +Difficulty, --Visibility, Stealth advantage");
        }
        
        // Clear weather (default)
        else
        {
            ApplyVisualEffects("clear");
            Debug.Log("☀️ Clear: Normal conditions");
        }

        // Temperature effects
        if (weather.temperature < 0f)
        {
            // Freezing: slower movement
            mission.playerMoveSpeed *= 0.9f;
            Debug.Log("🥶 Freezing: -10% movement speed");
        }
        else if (weather.temperature > 35f)
        {
            // Hot: stamina drain
            mission.staminaDrainRate *= 1.15f;
            Debug.Log("🥵 Hot: +15% stamina drain");
        }

        // Wind effects
        if (weather.windSpeed > 15f)
        {
            // High wind: affects projectiles
            mission.projectileAccuracy *= 0.85f;
            Debug.Log("💨 High Wind: -15% projectile accuracy");
        }

        // Update mission UI
        UpdateMissionUI();
    }

    /// <summary>
    /// Apply visual weather effects (particle systems, skybox, lighting)
    /// </summary>
    void ApplyVisualEffects(string condition)
    {
        // Find weather effects manager
        WeatherEffectsManager effectsManager = FindObjectOfType<WeatherEffectsManager>();
        
        if (effectsManager != null)
        {
            effectsManager.SetWeatherCondition(condition);
        }
        else
        {
            Debug.LogWarning("WeatherEffectsManager not found in scene");
        }
    }

    /// <summary>
    /// Update mission UI with weather modifiers
    /// </summary>
    void UpdateMissionUI()
    {
        MissionUI missionUI = FindObjectOfType<MissionUI>();
        
        if (missionUI != null)
        {
            missionUI.UpdateWeatherDisplay(currentWeather);
            missionUI.UpdateModifiers(
                difficultyMultiplier,
                vehicleHandlingMultiplier,
                visibilityMultiplier,
                enemyAwarenessMultiplier
            );
        }
    }

    /// <summary>
    /// Get current weather data
    /// </summary>
    public WeatherData GetCurrentWeather()
    {
        return currentWeather;
    }

    /// <summary>
    /// Force weather update
    /// </summary>
    public void ForceWeatherUpdate()
    {
        StartCoroutine(FetchWeatherAndApplyModifiers());
    }

    void OnGUI()
    {
        // Debug display
        if (currentWeather != null && Application.isEditor)
        {
            GUILayout.BeginArea(new Rect(10, 10, 300, 200));
            GUILayout.Box("Weather Modifiers");
            GUILayout.Label($"Zone: {zone}");
            GUILayout.Label($"Condition: {currentWeather.condition}");
            GUILayout.Label($"Temperature: {currentWeather.temperature:F1}°C");
            GUILayout.Label($"Wind: {currentWeather.windSpeed:F1} m/s");
            GUILayout.Label($"Visibility: {currentWeather.visibility:F0}m");
            GUILayout.Label($"Difficulty: x{difficultyMultiplier:F2}");
            GUILayout.Label($"Vehicle Handling: x{vehicleHandlingMultiplier:F2}");
            GUILayout.Label($"Visibility: x{visibilityMultiplier:F2}");
            GUILayout.EndArea();
        }
    }
}

/// <summary>
/// Mission data structure
/// </summary>
[System.Serializable]
public class Mission
{
    public string missionId;
    public string missionName;
    public int difficulty = 1;
    public float vehicleHandling = 1.0f;
    public float visibility = 1.0f;
    public float playerMoveSpeed = 1.0f;
    public float staminaDrainRate = 1.0f;
    public float projectileAccuracy = 1.0f;
    public float enemyDetectionRange = 1.0f;
}
