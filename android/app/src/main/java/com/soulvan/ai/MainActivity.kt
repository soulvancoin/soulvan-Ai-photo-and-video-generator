package com.soulvan.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.soulvan.ai.ui.screens.*
import com.soulvan.ai.ui.theme.SoulvanAITheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SoulvanAITheme {
                SoulvanApp()
            }
        }
    }
}

@Composable
fun SoulvanApp() {
    val navController = rememberNavController()
    
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        NavHost(
            navController = navController,
            startDestination = "home"
        ) {
            composable("home") {
                HomeScreen(
                    onNavigateToGenerate = { navController.navigate("generate") },
                    onNavigateToRender = { navController.navigate("render") },
                    onNavigateToWallet = { navController.navigate("wallet") },
                    onNavigateToVoting = { navController.navigate("voting") }
                )
            }
            composable("generate") {
                GenerateScreen(onBack = { navController.popBackStack() })
            }
            composable("render") {
                RenderScreen(onBack = { navController.popBackStack() })
            }
            composable("wallet") {
                WalletScreen(onBack = { navController.popBackStack() })
            }
            composable("voting") {
                VotingScreen(onBack = { navController.popBackStack() })
            }
        }
    }
}
