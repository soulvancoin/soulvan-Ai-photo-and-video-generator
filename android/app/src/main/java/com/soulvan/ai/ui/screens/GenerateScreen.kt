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
fun GenerateScreen(onBack: () -> Unit) {
    var prompt by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }
    var selectedStyle by remember { mutableStateOf("Ultra Photorealistic") }
    var selectedResolution by remember { mutableStateOf("8K Ultra") }
    var enableAIEnhancement by remember { mutableStateOf(true) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Image Generation") },
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
                text = "Create with NVIDIA Picasso",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            OutlinedTextField(
                value = prompt,
                onValueChange = { prompt = it },
                label = { Text("Describe your image") },
                placeholder = { Text("A photorealistic portrait of...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp),
                maxLines = 6
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
                listOf("8K Ultra", "4K", "2K", "1080p").forEach { resolution ->
                    FilterChip(
                        selected = selectedResolution == resolution,
                        onClick = { selectedResolution = resolution },
                        label = { Text(resolution) }
                    )
                }
            }
            
            Text(
                text = "Style",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Ultra Photorealistic", "Cinematic", "Artistic", "Technical").forEach { style ->
                    FilterChip(
                        selected = selectedStyle == style,
                        onClick = { selectedStyle = style },
                        label = { Text(style) }
                    )
                }
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "AI Detail Enhancement",
                    style = MaterialTheme.typography.bodyLarge
                )
                Switch(
                    checked = enableAIEnhancement,
                    onCheckedChange = { enableAIEnhancement = it }
                )
            }
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "⚙️ Generation Settings",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    when (selectedResolution) {
                        "8K Ultra" -> {
                            Text("Resolution: 7680x4320 (33.2MP)", style = MaterialTheme.typography.bodySmall)
                            Text("Samples: 512 (Ultra Quality)", style = MaterialTheme.typography.bodySmall)
                            Text("Est. Time: 45-60 seconds", style = MaterialTheme.typography.bodySmall)
                        }
                        "4K" -> {
                            Text("Resolution: 3840x2160 (8.3MP)", style = MaterialTheme.typography.bodySmall)
                            Text("Samples: 384 (High Quality)", style = MaterialTheme.typography.bodySmall)
                            Text("Est. Time: 20-30 seconds", style = MaterialTheme.typography.bodySmall)
                        }
                        "2K" -> {
                            Text("Resolution: 2560x1440 (3.7MP)", style = MaterialTheme.typography.bodySmall)
                            Text("Samples: 256 (Good Quality)", style = MaterialTheme.typography.bodySmall)
                            Text("Est. Time: 10-15 seconds", style = MaterialTheme.typography.bodySmall)
                        }
                        else -> {
                            Text("Resolution: 1920x1080 (2.1MP)", style = MaterialTheme.typography.bodySmall)
                            Text("Samples: 128 (Fast)", style = MaterialTheme.typography.bodySmall)
                            Text("Est. Time: 5-10 seconds", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                    Text("Model: Picasso XL v1.0", style = MaterialTheme.typography.bodySmall)
                    if (enableAIEnhancement) {
                        Text("✨ AI Enhancement: Active", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            
            if (selectedResolution == "8K Ultra") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text("💎", style = MaterialTheme.typography.headlineMedium)
                        Column {
                            Text(
                                text = "8K Ultra Mode",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Maximum quality with adaptive AI rendering. Produces cinema-grade 33.2 megapixel images.",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }
            }
            
            Button(
                onClick = { isGenerating = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = prompt.isNotBlank() && !isGenerating
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Generating...")
                } else {
                    Text("Generate Image", style = MaterialTheme.typography.titleMedium)
                }
            }
            
            if (isGenerating) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                Text(
                    text = "NVIDIA AI is creating your ${selectedResolution} image...",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
