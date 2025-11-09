package com.soulvan.ai.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RenderScreen(onBack: () -> Unit) {
    var isRendering by remember { mutableStateOf(false) }
    var selectedQuality by remember { mutableStateOf("Ultra") }
    var selectedResolution by remember { mutableStateOf("8K") }
    var enableAdaptiveQuality by remember { mutableStateOf(true) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("RTX Rendering") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "NVIDIA RTX Path Tracing",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = "Render photorealistic videos with 8K resolution, Global Illumination and DLSS 3.5",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Text(
                text = "Resolution",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("8K", "4K", "2K", "1080p").forEach { resolution ->
                    FilterChip(
                        selected = selectedResolution == resolution,
                        onClick = { selectedResolution = resolution },
                        label = { Text(resolution) }
                    )
                }
            }
            
            Text(
                text = "Quality Preset",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Ultra", "Cinematic", "Balanced", "Performance").forEach { quality ->
                    FilterChip(
                        selected = selectedQuality == quality,
                        onClick = { selectedQuality = quality },
                        label = { Text(quality) }
                    )
                }
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Adaptive Quality",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "AI-powered real-time optimization",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Switch(
                    checked = enableAdaptiveQuality,
                    onCheckedChange = { enableAdaptiveQuality = it }
                )
            }
            
            if (selectedResolution == "8K") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "💎 8K Ultra Features",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        FeatureItem("✓ 7680x4320 Resolution")
                        FeatureItem("✓ DLSS 3.5 with Frame Generation")
                        FeatureItem("✓ Ray Reconstruction Technology")
                        FeatureItem("✓ RTX Global Illumination")
                        FeatureItem("✓ Neural Radiance Cache 2.0")
                        FeatureItem("✓ OptiX AI Denoiser Pro")
                        FeatureItem("✓ Adaptive Quality System")
                    }
                }
            } else {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "🎨 Render Features",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        FeatureItem("✓ RTX Global Illumination")
                        FeatureItem("✓ DLSS 3.5 Ray Reconstruction")
                        FeatureItem("✓ Neural Radiance Cache")
                        FeatureItem("✓ OptiX AI Denoiser")
                    }
                }
            }
            
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Current Settings",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    when (selectedResolution) {
                        "8K" -> {
                            SettingRow("Resolution", "7680x4320 (33.2MP)")
                            SettingRow("Ray Samples", when(selectedQuality) {
                                "Ultra" -> "512 per pixel"
                                "Cinematic" -> "384 per pixel"
                                "Balanced" -> "256 per pixel"
                                else -> "128 per pixel"
                            })
                        }
                        "4K" -> {
                            SettingRow("Resolution", "3840x2160 (8.3MP)")
                            SettingRow("Ray Samples", "256 per pixel")
                        }
                        "2K" -> {
                            SettingRow("Resolution", "2560x1440 (3.7MP)")
                            SettingRow("Ray Samples", "192 per pixel")
                        }
                        else -> {
                            SettingRow("Resolution", "1920x1080 (2.1MP)")
                            SettingRow("Ray Samples", "128 per pixel")
                        }
                    }
                    SettingRow("Frame Rate", "60 FPS")
                    SettingRow("Ray Depth", when(selectedQuality) {
                        "Ultra" -> "16 bounces"
                        "Cinematic" -> "14 bounces"
                        "Balanced" -> "12 bounces"
                        else -> "10 bounces"
                    })
                    SettingRow("DLSS Mode", when(selectedQuality) {
                        "Ultra" -> "Quality"
                        "Cinematic" -> "Balanced"
                        "Balanced" -> "Balanced"
                        else -> "Performance"
                    })
                    if (enableAdaptiveQuality) {
                        SettingRow("Adaptive Quality", "✨ Enabled")
                    }
                }
            }
            
            Button(
                onClick = { isRendering = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = !isRendering
            ) {
                if (isRendering) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Rendering...")
                } else {
                    Text("Start ${selectedResolution} Render", style = MaterialTheme.typography.titleMedium)
                }
            }
            
            if (isRendering) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                Text(
                    text = "${selectedResolution} RTX rendering in progress... ${if (enableAdaptiveQuality) "Adaptive quality active" else "Fixed quality"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun FeatureItem(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium
    )
}

@Composable
fun SettingRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium
        )
    }
}
