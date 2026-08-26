package com.example.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DrexviaAmber
import com.example.ui.theme.DrexviaCrimson
import com.example.ui.theme.DrexviaCyan
import com.example.ui.theme.DrexviaObsidian
import com.example.ui.theme.DrexviaSurface
import com.example.ui.theme.DrexviaSurfaceVariant
import com.example.ui.viewmodel.Screen

@Composable
fun MainMenuView(
    onNavigate: (Screen) -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "titleGlow")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glowAlpha"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        DrexviaObsidian,
                        Color(0xFF0D1322),
                        Color(0xFF04060A)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = 540.dp)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Hazard Tag & Warning Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(DrexviaCrimson.copy(alpha = 0.15f))
                    .border(1.dp, DrexviaCrimson.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(DrexviaCrimson)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "BIOHAZARD CONTAINMENT BREACH // SECTOR 09",
                    color = DrexviaCrimson,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Main Title
            Text(
                text = "DREXVIA",
                fontSize = 44.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 8.sp,
                color = DrexviaCyan,
                modifier = Modifier
                    .alpha(glowAlpha)
                    .testTag("app_title")
            )

            Text(
                text = "SURVIVAL HORROR // OPEN WORLD 3D",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Text(
                text = "DEVELOPED BY SOUMYA CHUNARY STUDIOS",
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.5.sp,
                color = DrexviaAmber.copy(alpha = 0.9f),
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Primary Action: Launch Mission
            MenuCardButton(
                title = "LAUNCH PROLOGUE MISSION",
                subtitle = "Station Omega-9: Signal in the Mist",
                icon = Icons.Default.PlayArrow,
                accentColor = DrexviaCyan,
                testTag = "play_mission_button",
                onClick = { onNavigate(Screen.GAMEPLAY) }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Secondary Action: Survival Mode
            MenuCardButton(
                title = "SURVIVAL MODE (ENDLESS)",
                subtitle = "Survive the infected perimeter at night",
                icon = Icons.Default.Security,
                accentColor = DrexviaCrimson,
                testTag = "survival_mode_button",
                onClick = { onNavigate(Screen.GAMEPLAY) }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Operator Dossier (Profile & Stats)
            MenuCardButton(
                title = "OPERATOR DOSSIER",
                subtitle = "Combat record, bio-monitor & weapon licenses",
                icon = Icons.Default.Person,
                accentColor = DrexviaAmber,
                testTag = "profile_button",
                onClick = { onNavigate(Screen.PROFILE) }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Survival Codex (Field Guide & Lore)
            MenuCardButton(
                title = "SURVIVAL CODEX & BESTIARY",
                subtitle = "Incident logs, creature weaknesses & crafting recipes",
                icon = Icons.Default.Book,
                accentColor = Color(0xFF10B981),
                testTag = "guide_button",
                onClick = { onNavigate(Screen.FIELD_GUIDE) }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Settings
            MenuCardButton(
                title = "SYSTEM SETTINGS",
                subtitle = "Graphics, touch sensitivity & audio levels",
                icon = Icons.Default.Settings,
                accentColor = Color(0xFF94A3B8),
                testTag = "settings_button",
                onClick = { onNavigate(Screen.SETTINGS) }
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Footer version & engine info
            Text(
                text = "DREXVIA v1.0.0 (Phase 1 Foundation) • 3D WebGL / Jetpack Compose",
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
private fun MenuCardButton(
    title: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: Color,
    testTag: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, accentColor.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .testTag(testTag),
        colors = CardDefaults.cardColors(
            containerColor = DrexviaSurface.copy(alpha = 0.85f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(accentColor.copy(alpha = 0.15f))
                    .border(1.dp, accentColor.copy(alpha = 0.4f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = accentColor,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 14.sp
                )
            }
        }
    }
}
