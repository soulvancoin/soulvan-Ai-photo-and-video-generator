using UnityEditor;
using UnityEngine;

public class RenderPipelineConfigurator : EditorWindow
{
    private string renderPipelineAssetPath = "Assets/RenderPipeline/YourRenderPipelineAsset.asset";

    [MenuItem("Soulvan/Render Pipeline Configurator")]
    public static void ShowWindow()
    {
        GetWindow<RenderPipelineConfigurator>("Render Pipeline Configurator");
    }

    private void OnGUI()
    {
        GUILayout.Label("Configure Render Pipeline", EditorStyles.boldLabel);

        renderPipelineAssetPath = EditorGUILayout.TextField("Render Pipeline Asset Path", renderPipelineAssetPath);

        if (GUILayout.Button("Apply Render Pipeline"))
        {
            ApplyRenderPipeline();
        }
    }

    private void ApplyRenderPipeline()
    {
        var renderPipelineAsset = AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(renderPipelineAssetPath);
        if (renderPipelineAsset != null)
        {
            GraphicsSettings.renderPipelineAsset = renderPipelineAsset;
            EditorUtility.SetDirty(GraphicsSettings.renderPipelineAsset);
            AssetDatabase.SaveAssets();
            Debug.Log("Render Pipeline applied successfully.");
        }
        else
        {
            Debug.LogError("Render Pipeline Asset not found at the specified path.");
        }
    }
}