package com.example.ui.screens

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DrexviaAmber
import com.example.ui.theme.DrexviaCyan
import com.example.ui.theme.DrexviaCyanDark
import com.example.ui.theme.DrexviaObsidian
import com.example.ui.theme.DrexviaSurface
import com.example.ui.theme.DrexviaSurfaceVariant
import com.example.ui.viewmodel.GameSettings

@Composable
fun SettingsView(
    settings: GameSettings,
    onSaveSettings: (GameSettings) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var graphics by remember { mutableStateOf(settings.graphicsQuality) }
    var sensitivity by remember { mutableFloatStateOf(settings.lookSensitivity) }
    var volume by remember { mutableFloatStateOf(settings.masterVolume) }
    var perspective by remember { mutableStateOf(settings.defaultPerspective) }
    var reducedHorror by remember { mutableStateOf(settings.reducedHorror) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(DrexviaObsidian, Color(0xFF0F172A), DrexviaObsidian)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = 600.dp)
                .align(Alignment.Center)
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack, modifier = Modifier.testTag("back_button")) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = DrexviaCyan
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "SYSTEM SETTINGS",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        color = DrexviaCyan
                    )
                    Text(
                        text = "ENGINE RENDERING & INPUT CALIBRATION",
                        fontSize = 9.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Graphics Preset
            SettingsSectionTitle("GRAPHICS QUALITY PRESET")
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DrexviaCyan.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("LOW", "MEDIUM", "HIGH", "ULTRA").forEach { preset ->
                        val isSelected = graphics == preset
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSelected) DrexviaCyanDark else DrexviaSurfaceVariant)
                                .border(
                                    1.dp,
                                    if (isSelected) DrexviaCyan else Color.Transparent,
                                    RoundedCornerShape(6.dp)
                                )
                                .clickable { graphics = preset }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = preset,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Touch Look Sensitivity
            SettingsSectionTitle("TOUCH LOOK SENSITIVITY (${String.format("%.1f", sensitivity)}x)")
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DrexviaCyan.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Slider(
                        value = sensitivity,
                        onValueChange = { sensitivity = it },
                        valueRange = 0.5f..2.5f,
                        steps = 20,
                        colors = SliderDefaults.colors(
                            thumbColor = DrexviaCyan,
                            activeTrackColor = DrexviaCyan
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Master Audio Volume
            SettingsSectionTitle("MASTER AUDIO VOLUME (${Math.round(volume * 100)}%)")
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DrexviaCyan.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Slider(
                        value = volume,
                        onValueChange = { volume = it },
                        valueRange = 0f..1f,
                        steps = 10,
                        colors = SliderDefaults.colors(
                            thumbColor = DrexviaAmber,
                            activeTrackColor = DrexviaAmber
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Camera Perspective
            SettingsSectionTitle("DEFAULT CAMERA PERSPECTIVE")
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DrexviaCyan.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("1ST PERSON", "3RD PERSON").forEach { p ->
                        val isSelected = perspective == p
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSelected) DrexviaCyanDark else DrexviaSurfaceVariant)
                                .border(
                                    1.dp,
                                    if (isSelected) DrexviaCyan else Color.Transparent,
                                    RoundedCornerShape(6.dp)
                                )
                                .clickable { perspective = p }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = p,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Reduced Horror / Comfort Mode
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DrexviaCyan.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "REDUCED HORROR MODE",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Softens rapid camera distortion and heartbeat pulsing for players sensitive to intense jump scares.",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 13.sp
                        )
                    }
                    Switch(
                        checked = reducedHorror,
                        onCheckedChange = { reducedHorror = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = DrexviaCyan,
                            checkedTrackColor = DrexviaCyanDark
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = {
                    onSaveSettings(
                        settings.copy(
                            graphicsQuality = graphics,
                            lookSensitivity = sensitivity,
                            masterVolume = volume,
                            defaultPerspective = perspective,
                            reducedHorror = reducedHorror
                        )
                    )
                    onBack()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DrexviaCyanDark)
            ) {
                Text(
                    text = "SAVE CALIBRATION & EXIT",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
private fun SettingsSectionTitle(title: String) {
    Text(
        text = title,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = DrexviaCyan,
        modifier = Modifier.padding(bottom = 6.dp)
    )
}
