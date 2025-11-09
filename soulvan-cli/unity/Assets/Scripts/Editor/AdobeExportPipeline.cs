using UnityEditor;
using UnityEngine;

public class AdobeExportPipeline : EditorWindow
{
    private string exportPath = "Exports/Adobe";
    private string projectName = "SoulvanProject";

    [MenuItem("Soulvan/Export to Adobe")]
    public static void ShowWindow()
    {
        GetWindow<AdobeExportPipeline>("Adobe Export Pipeline");
    }

    private void OnGUI()
    {
        GUILayout.Label("Export Settings", EditorStyles.boldLabel);
        projectName = EditorGUILayout.TextField("Project Name", projectName);
        exportPath = EditorGUILayout.TextField("Export Path", exportPath);

        if (GUILayout.Button("Export"))
        {
            ExportToAdobe();
        }
    }

    private void ExportToAdobe()
    {
        // Implement the export logic here
        Debug.Log($"Exporting {projectName} to {exportPath}");
        // Add your export logic, file handling, and integration with Adobe tools here
    }
}