package com.vitaltrack.pro.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Blue600 = Color(0xFF2563EB)
private val Blue700 = Color(0xFF1D4ED8)
private val Slate50 = Color(0xFFF8FAFC)
private val Slate800 = Color(0xFF1E293B)

private val LightColorScheme = lightColorScheme(
    primary = Blue600,
    onPrimary = Color.White,
    secondary = Blue700,
    background = Slate50,
    surface = Color.White,
    onSurface = Slate800,
)

@Composable
fun VitalTrackProTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        // Just for simplicity, we use light scheme for both for now, matching web app
        LightColorScheme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
