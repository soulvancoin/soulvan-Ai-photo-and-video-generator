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
                text = "Render photorealistic videos with Global Illumination and DLSS 3.5",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Text(
                text = "Quality Preset",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Fast", "Balanced", "Quality", "Ultra").forEach { quality ->
                    FilterChip(
                        selected = selectedQuality == quality,
                        onClick = { selectedQuality = quality },
                        label = { Text(quality) }
                    )
                }
            }
            
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
                    FeatureItem("✓ 8K Resolution Support")
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
                    SettingRow("Resolution", "3840x2160 (4K)")
                    SettingRow("Frame Rate", "60 FPS")
                    SettingRow("Ray Samples", "256 per pixel")
                    SettingRow("DLSS Mode", "Quality")
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
                    Text("Start Render", style = MaterialTheme.typography.titleMedium)
                }
            }
            
            if (isRendering) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                Text(
                    text = "RTX rendering in progress... Estimated: 5 minutes",
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
