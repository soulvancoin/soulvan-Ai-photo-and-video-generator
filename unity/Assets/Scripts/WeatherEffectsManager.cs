using UnityEngine;

/// <summary>
/// WeatherEffectsManager - Controls visual weather effects in the scene
/// Manages particle systems, skybox, lighting, and post-processing
/// </summary>
public class WeatherEffectsManager : MonoBehaviour
{
    [Header("Particle Systems")]
    public ParticleSystem rainParticles;
    public ParticleSystem snowParticles;
    public ParticleSystem fogParticles;
    public ParticleSystem stormParticles;

    [Header("Lighting")]
    public Light directionalLight;
    public float clearLightIntensity = 1.0f;
    public float stormLightIntensity = 0.4f;
    public float nightLightIntensity = 0.2f;

    [Header("Skybox")]
    public Material clearSkybox;
    public Material cloudySkybox;
    public Material stormySkybox;
    public Material nightSkybox;

    [Header("Post-Processing")]
    public UnityEngine.Rendering.Volume postProcessVolume;
    public float fogDensity = 0.0f;

    private string currentCondition = "clear";

    void Start()
    {
        // Disable all particle systems initially
        DisableAllParticles();
    }

    public void SetWeatherCondition(string condition)
    {
        if (currentCondition == condition) return;
        
        currentCondition = condition;
        DisableAllParticles();

        switch (condition)
        {
            case "rain":
                ApplyRain();
                break;
            case "snow":
                ApplySnow();
                break;
            case "fog":
                ApplyFog();
                break;
            case "storm":
                ApplyStorm();
                break;
            case "night":
                ApplyNight();
                break;
            default:
                ApplyClear();
                break;
        }
    }

    void ApplyRain()
    {
        if (rainParticles != null) rainParticles.Play();
        if (directionalLight != null) directionalLight.intensity = 0.7f;
        if (cloudySkybox != null) RenderSettings.skybox = cloudySkybox;
        SetFogDensity(0.01f);
    }

    void ApplySnow()
    {
        if (snowParticles != null) snowParticles.Play();
        if (directionalLight != null) directionalLight.intensity = 0.8f;
        if (cloudySkybox != null) RenderSettings.skybox = cloudySkybox;
        SetFogDensity(0.015f);
    }

    void ApplyFog()
    {
        if (fogParticles != null) fogParticles.Play();
        if (directionalLight != null) directionalLight.intensity = 0.6f;
        SetFogDensity(0.05f);
    }

    void ApplyStorm()
    {
        if (stormParticles != null) stormParticles.Play();
        if (directionalLight != null) directionalLight.intensity = stormLightIntensity;
        if (stormySkybox != null) RenderSettings.skybox = stormySkybox;
        SetFogDensity(0.02f);
    }

    void ApplyNight()
    {
        if (directionalLight != null)
        {
            directionalLight.intensity = nightLightIntensity;
            directionalLight.color = new Color(0.5f, 0.5f, 0.7f); // Moonlight tint
        }
        if (nightSkybox != null) RenderSettings.skybox = nightSkybox;
        SetFogDensity(0.005f);
    }

    void ApplyClear()
    {
        if (directionalLight != null)
        {
            directionalLight.intensity = clearLightIntensity;
            directionalLight.color = Color.white;
        }
        if (clearSkybox != null) RenderSettings.skybox = clearSkybox;
        SetFogDensity(0.0f);
    }

    void DisableAllParticles()
    {
        if (rainParticles != null) rainParticles.Stop();
        if (snowParticles != null) snowParticles.Stop();
        if (fogParticles != null) fogParticles.Stop();
        if (stormParticles != null) stormParticles.Stop();
    }

    void SetFogDensity(float density)
    {
        fogDensity = density;
        RenderSettings.fogDensity = density;
        RenderSettings.fog = density > 0;
    }
}
