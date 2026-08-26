package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DrexviaColorScheme = darkColorScheme(
    primary = DrexviaCyan,
    onPrimary = DrexviaObsidian,
    primaryContainer = DrexviaCyanDark,
    onPrimaryContainer = DrexviaTextPrimary,
    secondary = DrexviaAmber,
    onSecondary = DrexviaObsidian,
    error = DrexviaCrimson,
    onError = DrexviaTextPrimary,
    errorContainer = DrexviaCrimsonDark,
    background = DrexviaObsidian,
    onBackground = DrexviaTextPrimary,
    surface = DrexviaSurface,
    onSurface = DrexviaTextPrimary,
    surfaceVariant = DrexviaSurfaceVariant,
    onSurfaceVariant = DrexviaTextSecondary
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DrexviaColorScheme,
        typography = Typography,
        content = content
    )
}

