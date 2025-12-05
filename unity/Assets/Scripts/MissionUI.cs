using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// MissionUI - Displays mission information and weather modifiers
/// </summary>
public class MissionUI : MonoBehaviour
{
    [Header("Weather Display")]
    public TextMeshProUGUI weatherConditionText;
    public TextMeshProUGUI temperatureText;
    public TextMeshProUGUI windSpeedText;
    public Image weatherIcon;

    [Header("Modifier Display")]
    public TextMeshProUGUI difficultyModText;
    public TextMeshProUGUI vehicleModText;
    public TextMeshProUGUI visibilityModText;
    public TextMeshProUGUI awarenessModText;

    [Header("Weather Icons")]
    public Sprite clearIcon;
    public Sprite rainIcon;
    public Sprite snowIcon;
    public Sprite fogIcon;
    public Sprite stormIcon;
    public Sprite nightIcon;

    public void UpdateWeatherDisplay(MissionWeatherModifier.WeatherData weather)
    {
        if (weather == null) return;

        // Update text
        if (weatherConditionText != null)
        {
            string emoji = GetWeatherEmoji(weather.condition);
            weatherConditionText.text = $"{emoji} {weather.condition.ToUpper()}";
        }

        if (temperatureText != null)
        {
            temperatureText.text = $"🌡️ {weather.temperature:F1}°C";
        }

        if (windSpeedText != null)
        {
            windSpeedText.text = $"💨 {weather.windSpeed:F1} m/s";
        }

        // Update icon
        if (weatherIcon != null)
        {
            weatherIcon.sprite = GetWeatherIcon(weather.condition);
        }
    }

    public void UpdateModifiers(float difficulty, float vehicle, float visibility, float awareness)
    {
        if (difficultyModText != null)
        {
            string color = difficulty > 1.0f ? "red" : "white";
            difficultyModText.text = $"<color={color}>Difficulty: x{difficulty:F2}</color>";
        }

        if (vehicleModText != null)
        {
            string color = vehicle < 1.0f ? "orange" : "white";
            vehicleModText.text = $"<color={color}>Vehicle: x{vehicle:F2}</color>";
        }

        if (visibilityModText != null)
        {
            string color = visibility < 1.0f ? "yellow" : "white";
            visibilityModText.text = $"<color={color}>Visibility: x{visibility:F2}</color>";
        }

        if (awarenessModText != null)
        {
            string color = awareness < 1.0f ? "green" : "white";
            awarenessModText.text = $"<color={color}>Stealth: x{awareness:F2}</color>";
        }
    }

    string GetWeatherEmoji(string condition)
    {
        switch (condition)
        {
            case "rain": return "☔";
            case "snow": return "❄️";
            case "fog": return "🌫️";
            case "storm": return "⛈️";
            case "night": return "🌙";
            default: return "☀️";
        }
    }

    Sprite GetWeatherIcon(string condition)
    {
        switch (condition)
        {
            case "rain": return rainIcon;
            case "snow": return snowIcon;
            case "fog": return fogIcon;
            case "storm": return stormIcon;
            case "night": return nightIcon;
            default: return clearIcon;
        }
    }
}
