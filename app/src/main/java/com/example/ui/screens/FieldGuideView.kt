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
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults.SecondaryIndicator
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.data.db.entities.LoreLogEntity
import com.example.ui.theme.DrexviaAmber
import com.example.ui.theme.DrexviaCrimson
import com.example.ui.theme.DrexviaCyan
import com.example.ui.theme.DrexviaObsidian
import com.example.ui.theme.DrexviaSurface
import com.example.ui.theme.DrexviaSurfaceVariant

@Composable
fun FieldGuideView(
    loreLogs: List<LoreLogEntity>,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("BESTIARY", "TACTICAL SURVIVAL", "RESEARCH ARCHIVES")

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
                .padding(top = 16.dp, start = 16.dp, end = 16.dp)
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
                        text = "SURVIVAL CODEX",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        color = DrexviaCyan
                    )
                    Text(
                        text = "SOUMYA CHUNARY STUDIOS THREAT CLASSIFICATION",
                        fontSize = 9.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Tab Selector
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = DrexviaSurface,
                contentColor = DrexviaCyan,
                indicator = { tabPositions ->
                    SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = DrexviaCyan
                    )
                }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selectedTab == index) DrexviaCyan else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Scrollable Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 24.dp)
            ) {
                when (selectedTab) {
                    0 -> BestiarySection()
                    1 -> TacticalSurvivalSection()
                    2 -> ResearchArchivesSection(loreLogs)
                }
            }
        }
    }
}

@Composable
private fun BestiarySection() {
    CreatureCard(
        name = "THE HOLLOW",
        threatLevel = "EXTREME",
        color = DrexviaCrimson,
        desc = "Mutated biological research subjects. They possess extreme muscular resilience and long elongated claws. While blind in darkness, they react instantaneously to flashlight beams and unsuppressed gunfire.",
        tactics = "Aim for center mass or head. Use crouched stealth or attach the Tactical Suppressor [T] to bypass patrols."
    )

    Spacer(modifier = Modifier.height(12.dp))

    CreatureCard(
        name = "THE CRAWLER",
        threatLevel = "HIGH",
        color = DrexviaAmber,
        desc = "Quadrupedal agile stalkers capable of moving through ventilation ducts and low dense brush. Rapid burst movement.",
        tactics = "Keep distance and utilize shotgun buckshot or high fire-rate bursts before they close into melee range."
    )

    Spacer(modifier = Modifier.height(12.dp))

    CreatureCard(
        name = "THE SCREAMER",
        threatLevel = "CRITICAL HAZARD",
        color = Color(0xFFA855F7),
        desc = "Emits a deafening infrasonic vocal pulse that paralyzes the nervous system and summons nearby Hollow swarms.",
        tactics = "Prioritize eliminating immediately upon visual contact before it triggers its alert screech."
    )

    Spacer(modifier = Modifier.height(12.dp))

    CreatureCard(
        name = "THE BIO-GOLIATH (TITAN)",
        threatLevel = "APEX TITAN",
        color = Color(0xFFDC2626),
        desc = "Sub-Level 2 Bio-Dome mutated behemoth armored with hardened keratin bone plates. Inflicts devastating shockwaves.",
        tactics = "Deploy M26 Proximity Mines and Auto-Turrets. Maintain sprint distance and aim for glowing cranial weak points."
    )

    Spacer(modifier = Modifier.height(12.dp))

    CreatureCard(
        name = "THE VEIL",
        threatLevel = "APEX ENTITY",
        color = Color(0xFF38BDF8),
        desc = "Camouflaged entity using active optical refraction in thick fog. Only visible by the distortion of background light and glowing ocular sensors.",
        tactics = "Engage Night Vision Optics [NVG] and watch for ground foliage movement and sudden audio silence."
    )
}

@Composable
private fun CreatureCard(
    name: String,
    threatLevel: String,
    color: Color,
    desc: String,
    tactics: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, color.copy(alpha = 0.35f), RoundedCornerShape(10.dp)),
        colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = name,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black,
                    color = color,
                    letterSpacing = 1.sp
                )
                Text(
                    text = threatLevel,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = color,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier
                        .background(color.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = desc,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 15.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DrexviaSurfaceVariant.copy(alpha = 0.6f), RoundedCornerShape(6.dp))
                    .padding(8.dp),
                verticalAlignment = Alignment.Top
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Tactics",
                    tint = DrexviaAmber,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "TACTICAL NOTE: $tactics",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = DrexviaAmber,
                    lineHeight = 13.sp
                )
            }
        }
    }
}

@Composable
private fun TacticalSurvivalSection() {
    SurvivalTipCard(
        title = "TACTICAL ARSENAL & WEAPONS",
        content = "• M9 Pistol (Slot 1): Fast semi-automatic sidearm with high precision.\n• Remington 870 Shotgun (Slot 2): 8-pellet buckshot spread with devastating stopping power against Crawlers.\n• AK-47 Assault Carbine (Slot 3): Full-automatic 30-round rifle for suppression.\n• M26 Proximity Laser Mine (Slot 4): Placeable defensive explosive trap dealing 280 AoE damage.\n• Combat Knife [V]: Rapid close-quarters melee slash.\n• Tactical Suppressor [T]: Eliminates gunshot alert sound for silent takedowns."
    )

    Spacer(modifier = Modifier.height(10.dp))

    SurvivalTipCard(
        title = "NVG OPTICS & HAZMAT RESPIRATOR",
        content = "• Night Vision Optics [NVG] (Key [N]): Enhances low-light visibility with high-contrast phosphor amplification.\n• Hazmat Gas Mask (Key [G]): Essential for entering Sub-Level 2 Bio-Dome. Protects lungs against lethal airborne bio-spores. Keep an eye on your Filter gauge!"
    )

    Spacer(modifier = Modifier.height(10.dp))

    SurvivalTipCard(
        title = "AUTO-DEFENSE TURRET & FIELD CRAFTING",
        content = "Synthesize vital equipment in your Backpack [TAB]:\n• Auto-Defense Sentry Turret [X]: Scrap Metal (x3) + Gunpowder (x2) + Battery (x2) -> Autonomous rapid-fire turret\n• Advanced Trauma Kit: Cloth (x2) + Antiseptic (x1) -> 100% HP & Cures Infection\n• Adrenaline Syringe: Antiseptic (x1) + Scrap Metal (x1) -> +30% Speed & Infinite Stamina\n• Proximity Laser Mine: Scrap Metal (x2) + Gunpowder (x1) + Battery (x1)\n• Hazmat Respirator Filter: Cloth (x2) + Antiseptic (x1)"
    )

    Spacer(modifier = Modifier.height(10.dp))

    SurvivalTipCard(
        title = "CCTV SURVEILLANCE & MULTI-BRANCHING ENDINGS",
        content = "• CCTV Security Network (Key [C]): Access live security camera feeds across Gate, Substation, Mainframe, Vault Alpha, and Helipad.\n• Dynamic Weather: Dynamic rain and lightning illumination cycles with rolling thunder audio.\n• Multi-Branching Endings: At the Climax Console, choose between Ending A (Extraction with Virus Cure), Ending B (Protocol Omega Self-Destruct), or Ending C (Vault Alpha Lockdown).\n• Endless Horde Survival Arena: Survive escalating mutated waves with airdrop supply crates!"
    )
}

@Composable
private fun SurvivalTipCard(title: String, content: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, DrexviaCyan.copy(alpha = 0.25f), RoundedCornerShape(8.dp)),
        colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = DrexviaCyan,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = content,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 15.sp
            )
        }
    }
}

@Composable
private fun ResearchArchivesSection(logs: List<LoreLogEntity>) {
    if (logs.isEmpty()) {
        Text(
            text = "No classified documents discovered yet. Explore Station Omega-9 to recover audio diaries and research drives.",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    } else {
        logs.forEach { log ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
                    .border(
                        1.dp,
                        if (log.isDiscovered) DrexviaAmber.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.08f),
                        RoundedCornerShape(8.dp)
                    ),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = if (log.isDiscovered) log.title else "[CLASSIFIED RECORD]",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (log.isDiscovered) DrexviaAmber else Color.Gray
                        )
                        Text(
                            text = log.logId,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = DrexviaCyan
                        )
                    }

                    if (log.isDiscovered) {
                        Text(
                            text = "AUTHOR: ${log.author} // ${log.timestamp}",
                            fontSize = 9.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                        Text(
                            text = log.content,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 15.sp
                        )
                    } else {
                        Text(
                            text = "Locate data terminals or scattered datapads in Sector Omega-9 to decrypt this document.",
                            fontSize = 11.sp,
                            color = Color.Gray,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }
        }
    }
}
