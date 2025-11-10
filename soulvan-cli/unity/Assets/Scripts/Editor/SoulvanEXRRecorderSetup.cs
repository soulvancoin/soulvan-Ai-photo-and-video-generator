// Requires: Unity Recorder package (com.unity.recorder)
using UnityEditor;
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor.Recorder;
using UnityEditor.Recorder.Input;
#endif
using System.IO;

public static class SoulvanEXRRecorderSetup
{
    [MenuItem("Soulvan/Record/EXR Sequence (Manual Start)")]
    private static void RecordEXRSequence()
    {
#if !UNITY_EDITOR
        Debug.LogError("Recorder only available in editor.");
        return;
#else
        string root = "Assets/Exports/EXR";
        if (!Directory.Exists(root)) Directory.CreateDirectory(root);

        var controllerSettings = ScriptableObject.CreateInstance<RecorderControllerSettings>();
        var imageSettings = ScriptableObject.CreateInstance<ImageRecorderSettings>();
        imageSettings.name = "SoulvanEXR";
        imageSettings.Enabled = true;
        imageSettings.OutputFormat = ImageRecorderOutputFormat.EXR;
        imageSettings.CaptureAlpha = true;
        imageSettings.OutputFile = Path.Combine(root, "frame");
        imageSettings.RecordTransparency = true;

        controllerSettings.AddRecorderSettings(imageSettings);
        controllerSettings.SetRecordModeToFrameCount(120); // Default 120 frames
        controllerSettings.FrameRate = 24;

        var controller = new RecorderController(controllerSettings);
        controller.PrepareRecording();
        controller.StartRecording();

        EditorApplication.update += () =>
        {
            if (!controller.IsRecording()) return;
            if (controllerSettings.frameRateMode == FrameRateMode.Constant &&
                controllerSettings.GetRecorderSettings()[0].IsRecording() == false)
            {
                controller.StopRecording();
                Debug.Log("[EXR Recording] Completed frames. Output => " + root);
                EditorApplication.update -= null;
            }
        };
        Debug.Log("[EXR Recording] Started (120 frames @24fps).");
#endif
    }
}
