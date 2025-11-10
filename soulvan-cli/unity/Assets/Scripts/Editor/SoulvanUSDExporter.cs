// Requires: com.unity.formats.usd package installed (Unity Package Manager)
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
#if UNITY_2021_3_OR_NEWER
using Unity.Formats.USD;
#endif
using System.IO;

public static class SoulvanUSDExporter
{
    [MenuItem("Soulvan/Export/All Scenes -> USD")]
    private static void ExportAllScenes()
    {
#if !UNITY_2021_3_OR_NEWER
        Debug.LogError("USD Exporter package not found. Install com.unity.formats.usd.");
        return;
#else
        string[] sceneGuids = AssetDatabase.FindAssets("t:Scene");
        if (sceneGuids.Length == 0)
        {
            Debug.LogWarning("No scenes found to export.");
            return;
        }

        string root = "Assets/Exports/USD";
        if (!Directory.Exists(root)) Directory.CreateDirectory(root);

        foreach (var guid in sceneGuids)
        {
            var scenePath = AssetDatabase.GUIDToAssetPath(guid);
            var sceneName = Path.GetFileNameWithoutExtension(scenePath);
            var exportPath = Path.Combine(root, sceneName + ".usd");

            var scene = EditorSceneManager.OpenScene(scenePath);
            UsdExporter exporter = ScriptableObject.CreateInstance<UsdExporter>();
            exporter.ExportFile = exportPath;
            exporter.ExportMaterials = true;
            exporter.ExportMeshes = true;
            exporter.ExportLights = true;
            exporter.ExportCameras = true;
            exporter.ExportTransforms = true;

            exporter.Scene = scene;
            exporter.Export();
            Object.DestroyImmediate(exporter);

            // Minimal provenance metadata layer (custom text file alongside USD)
            File.WriteAllText(Path.Combine(root, sceneName + ".meta.json"),
                JsonUtility.ToJson(new USDMeta
                {
                    scene = sceneName,
                    wallet = GetWalletIdentity(),
                    exportedAt = System.DateTime.UtcNow.ToString("o")
                }, true));

            Debug.Log($"[USD Export] {sceneName} -> {exportPath}");
        }
        AssetDatabase.Refresh();
#endif
    }

    private static string GetWalletIdentity()
    {
        // Reads Resources/soulvan_identity.json if created by CLI wallet:link
        var path = "Assets/Resources/soulvan_identity.json";
        if (File.Exists(path))
        {
            return JsonUtility.FromJson<WalletFile>(File.ReadAllText(path)).walletAddress;
        }
        return "unknown-wallet";
    }

    [System.Serializable] private class WalletFile { public string walletAddress; }
    [System.Serializable] private class USDMeta { public string scene; public string wallet; public string exportedAt; }
}
