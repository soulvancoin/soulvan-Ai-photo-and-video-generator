package com.soulvan.ai.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

// Soulvan Brand Colors
val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)

val SoulvanPrimary = Color(0xFF6366F1) // Indigo
val SoulvanSecondary = Color(0xFF8B5CF6) // Purple
val SoulvanAccent = Color(0xFFEC4899) // Pink

val DarkColorScheme = darkColorScheme(
    primary = SoulvanPrimary,
    secondary = SoulvanSecondary,
    tertiary = SoulvanAccent,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFFE0E0E0),
    onSurface = Color(0xFFE0E0E0)
)

val LightColorScheme = lightColorScheme(
    primary = SoulvanPrimary,
    secondary = SoulvanSecondary,
    tertiary = SoulvanAccent,
    background = Color(0xFFFFFBFE),
    surface = Color(0xFFFFFBFE),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F)
)
