package com.vitaltrack.pro.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitaltrack.pro.R
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.viewmodel.HealthViewModel
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: HealthViewModel,
    onSelectProfile: (String) -> Unit,
    onAddProfile: () -> Unit
) {
    val profiles by viewModel.getProfiles()?.collectAsState(initial = emptyList()) ?: remember { mutableStateOf(emptyList()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.dashboard_title), fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = viewModel::logout) {
                        Text(stringResource(R.string.sign_out), color = MaterialTheme.colorScheme.error)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddProfile) {
                Icon(Icons.Default.Add, contentDescription = stringResource(R.string.add_profile))
            }
        }
    ) { padding ->
        if (profiles.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(stringResource(R.string.no_profiles))
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(profiles) { profile ->
                    ProfileCard(profile, viewModel) { onSelectProfile(profile.id) }
                }
            }
        }
    }
}

@Composable
fun ProfileCard(profile: HealthProfile, viewModel: HealthViewModel, onClick: () -> Unit) {
    val lastRecord by viewModel.getLastRecord(profile.id).collectAsState(initial = null)
    val age = try {
        val year = profile.dateOfBirth.split("-").first().toInt()
        Calendar.getInstance().get(Calendar.YEAR) - year
    } catch (e: Exception) { 0 }

    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = MaterialTheme.shapes.extraLarge,
                    color = MaterialTheme.colorScheme.primaryContainer,
                    modifier = Modifier.size(48.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(profile.name.take(1).uppercase(), fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(profile.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("${profile.gender.capitalize()} • $age Yrs", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(12.dp))

            if (lastRecord != null) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    VitalSummaryItem(stringResource(R.string.latest_bp), "${lastRecord!!.systolic}/${lastRecord!!.diastolic}", "mmHg")
                    VitalSummaryItem(stringResource(R.string.heart_rate), "${lastRecord!!.heartRate}", "bpm")
                    VitalSummaryItem(stringResource(R.string.spo2), "${lastRecord!!.oxygenSaturation}", "%")
                }
            } else {
                Text(stringResource(R.string.no_entries), modifier = Modifier.align(Alignment.CenterHorizontally), color = MaterialTheme.colorScheme.outline)
            }
        }
    }
}

@Composable
fun VitalSummaryItem(label: String, value: String, unit: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 10.sp, color = MaterialTheme.colorScheme.outline)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        Text(unit, fontSize = 10.sp, color = MaterialTheme.colorScheme.outline)
    }
}

fun String.capitalize() = this.replaceFirstChar { it.uppercase() }
