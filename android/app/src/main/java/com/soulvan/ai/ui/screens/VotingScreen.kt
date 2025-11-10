package com.soulvan.ai.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.ThumbDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VotingScreen(onBack: () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DAO Voting") },
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
                text = "Active Proposals",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = "Vote on platform upgrades and new features",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            ProposalCard(
                id = "#001",
                title = "Upgrade to NVIDIA Edify 3D v2.0",
                description = "New version offers 40% faster 3D model generation with improved quality",
                votesFor = 2547,
                votesAgainst = 342,
                deadline = "2 days remaining"
            )
            
            ProposalCard(
                id = "#002",
                title = "Enable 16K Resolution Rendering",
                description = "Add support for 16K video output with enhanced RTX features",
                votesFor = 1823,
                votesAgainst = 567,
                deadline = "5 days remaining"
            )
            
            ProposalCard(
                id = "#003",
                title = "Music Generation Integration",
                description = "Integrate AI music generation for video soundtracks",
                votesFor = 3102,
                votesAgainst = 198,
                deadline = "1 day remaining"
            )
        }
    }
}

@Composable
fun ProposalCard(
    id: String,
    title: String,
    description: String,
    votesFor: Int,
    votesAgainst: Int,
    deadline: String
) {
    var hasVoted by remember { mutableStateOf(false) }
    val totalVotes = votesFor + votesAgainst
    val approvalPercentage = (votesFor.toFloat() / totalVotes * 100).toInt()
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = id,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = deadline,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            // Vote progress
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Approval: $approvalPercentage%",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${totalVotes} votes",
                        style = MaterialTheme.typography.labelMedium
                    )
                }
                LinearProgressIndicator(
                    progress = { approvalPercentage / 100f },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            
            if (!hasVoted) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { hasVoted = true },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.ThumbUp, null, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Vote For")
                    }
                    OutlinedButton(
                        onClick = { hasVoted = true },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.ThumbDown, null, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Vote Against")
                    }
                }
            } else {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer
                    )
                ) {
                    Text(
                        text = "✓ You voted on this proposal",
                        modifier = Modifier.padding(12.dp),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
