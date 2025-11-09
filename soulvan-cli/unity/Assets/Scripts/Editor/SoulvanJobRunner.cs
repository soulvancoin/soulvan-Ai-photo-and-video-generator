// Headless entry point: -batchmode -nographics -executeMethod SoulvanJobRunner.Run --config /abs/path/job.json
// Requires: com.unity.formats.usd & com.unity.recorder if using EXR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using System.IO;
#if UNITY_2021_3_OR_NEWER
using Unity.Formats.USD;
#endif

public static class SoulvanJobRunner
{
    [System.Serializable]
    private class JobConfig
    {
        public string scene;
        public string camera;
        public string output;
        public string format;      // "USD" or "EXR"
        public bool sign;
        public bool clip_embed;
    }

    public static void Run()
    {
        string[] args = System.Environment.GetCommandLineArgs();
        int idx = System.Array.IndexOf(args, "--config");
        if (idx < 0 || idx + 1 >= args.Length)
        {
            Debug.LogError("Missing --config <path>");
            return;
        }
        string configPath = args[idx + 1];
        if (!File.Exists(configPath))
        {
            Debug.LogError("Config file not found: " + configPath);
            return;
        }

        var job = JsonUtility.FromJson<JobConfig>(File.ReadAllText(configPath));
        if (string.IsNullOrEmpty(job.scene))
        {
            Debug.LogError("Job config missing scene property.");
            return;
        }

        var opened = EditorSceneManager.OpenScene(job.scene);
        Debug.Log("[JobRunner] Opened scene: " + opened.path);

        Camera cam = null;
        if (!string.IsNullOrEmpty(job.camera))
        {
            var camGO = GameObject.Find(job.camera);
            cam = camGO ? camGO.GetComponent<Camera>() : null;
            if (cam == null) Debug.LogWarning("Camera not found: " + job.camera);
        }

        if (job.format == "USD")
        {
#if UNITY_2021_3_OR_NEWER
            if (string.IsNullOrEmpty(job.output)) job.output = "Exports/USD/job.usd";
            var dir = Path.GetDirectoryName(job.output);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            UsdExporter exporter = ScriptableObject.CreateInstance<UsdExporter>();
            exporter.Scene = opened;
            exporter.ExportFile = job.output;
            exporter.ExportTransforms = true;
            exporter.ExportMaterials = true;
            exporter.ExportMeshes = true;
            exporter.ExportCameras = true;
            exporter.ExportLights = true;
            exporter.Export();
            Object.DestroyImmediate(exporter);
            File.WriteAllText(job.output + ".meta.json",
                JsonUtility.ToJson(new Meta { wallet = ReadWallet(), createdAt = System.DateTime.UtcNow.ToString("o") }, true));
            Debug.Log("[JobRunner] USD exported: " + job.output);
#else
            Debug.LogError("USD Exporter package not installed.");
#endif
        }
        else if (job.format == "EXR")
        {
            // For headless EXR capture you need a render automation strategy (RenderTexture + Camera.Render)
            // Placeholder: capture single frame
            if (cam == null) cam = Camera.main;
            if (cam == null) Debug.LogError("No camera for EXR capture.");
            else
            {
                if (string.IsNullOrEmpty(job.output)) job.output = "Exports/EXR/job";
                var dir = Path.GetDirectoryName(job.output);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                var rt = new RenderTexture(2048, 2048, 24, RenderTextureFormat.ARGBFloat);
                cam.targetTexture = rt;
                cam.Render();
                RenderTexture.active = rt;

                Texture2D tex = new Texture2D(rt.width, rt.height, TextureFormat.RGBAFloat, false, true);
                tex.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0);
                tex.Apply();
                cam.targetTexture = null;
                RenderTexture.active = null;
                rt.Release();

                var exrBytes = tex.EncodeToEXR(Texture2D.EXRFlags.OutputAsFloat | Texture2D.EXRFlags.CompressZIP);
                File.WriteAllBytes(job.output + "_0001.exr", exrBytes);
                Debug.Log("[JobRunner] EXR frame written: " + job.output + "_0001.exr");
            }
        }
        else
        {
            Debug.LogError("Unknown format: " + job.format);
        }

        if (job.clip_embed)
        {
            // Placeholder: export a JPEG for CLIP embedding service upload
            var previewPath = "Exports/preview_clip.jpg";
            Directory.CreateDirectory("Exports");
            var tex = new Texture2D(256, 256);
            File.WriteAllBytes(previewPath, tex.EncodeToJPG());
            Debug.Log("[JobRunner] CLIP preview generated: " + previewPath);
        }

        if (job.sign)
        {
            // Placeholder: call provenance-signer
            CallSigner(job.output);
        }

        Debug.Log("[JobRunner] Completed job.");
    }

    private static void CallSigner(string artifactBasePath)
    {
        var url = System.Environment.GetEnvironmentVariable("PROVENANCE_SIGNER_URL") ?? "http://localhost:4100/sign";
        var payload = "{\"artifact\":\"" + artifactBasePath + "\",\"wallet\":\"" + ReadWallet() + "\"}";
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("curl", "-s -X POST " + url + " -H \"Content-Type: application/json\" -d '" + payload + "'")
        {
            CreateNoWindow = true
        });
        Debug.Log("[JobRunner] Sign request sent.");
    }

    private static string ReadWallet()
    {
        var path = "Assets/Resources/soulvan_identity.json";
        if (File.Exists(path))
        {
            var json = File.ReadAllText(path);
            var w = JsonUtility.FromJson<Wallet>(json);
            return w.walletAddress;
        }
        return "unknown-wallet";
    }

    [System.Serializable] private class Wallet { public string walletAddress; }
    [System.Serializable] private class Meta { public string wallet; public string createdAt; }
}
