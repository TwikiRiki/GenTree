package com.vitaltrack.pro.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitaltrack.pro.R
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.data.model.VitalRecord
import com.vitaltrack.pro.ui.components.VitalsChart
import com.vitaltrack.pro.viewmodel.HealthViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileDetailScreen(
    profileId: String,
    viewModel: HealthViewModel,
    onBack: () -> Unit,
    onAddRecord: () -> Unit,
    onShare: () -> Unit,
    onExport: () -> Unit
) {
    var profile by remember { mutableStateOf<HealthProfile?>(null) }
    val records by viewModel.getRecords(profileId).collectAsState(initial = emptyList())
    val insights by viewModel.insights.collectAsState()
    val isGeneratingInsights by viewModel.isGeneratingInsights.collectAsState()

    LaunchedEffect(profileId) {
        // Simple way to get profile, in real app would be flow from repo
        // but here we just grab it once as it doesn't change often
        // Actually repo has Flow for records, let's just use records flow and get profile separately
    }

    // Getting profile manually since we don't have a flow for single profile yet
    val profiles by viewModel.getProfiles()?.collectAsState(initial = emptyList()) ?: remember { mutableStateOf(emptyList()) }
    profile = profiles.find { it.id == profileId }

    if (profile == null) return

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(profile!!.name, fontWeight = FontWeight.Bold)
                        Text("${profile!!.gender.capitalize()} • DOB: ${profile!!.dateOfBirth}", fontSize = 12.sp)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = onExport) {
                        Text(stringResource(R.string.export_csv), fontSize = 12.sp)
                    }
                    TextButton(onClick = onShare) {
                        Text(stringResource(R.string.share_profile), fontSize = 12.sp)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddRecord) {
                Icon(Icons.Default.Add, contentDescription = stringResource(R.string.add_reading))
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            item {
                HealthInsightsCard(
                    insights = insights,
                    isGenerating = isGeneratingInsights,
                    onAnalyze = { viewModel.generateInsights(profile!!, records) }
                )
            }

            item {
                Text(stringResource(R.string.vital_trends), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Spacer(modifier = Modifier.height(16.dp))

                Text("Blood Pressure", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                Card(modifier = Modifier.fillMaxWidth().height(150.dp)) {
                    VitalsChart(records = records, modifier = Modifier.fillMaxSize(), type = "BP")
                }

                Spacer(modifier = Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Heart Rate", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Card(modifier = Modifier.fillMaxWidth().height(100.dp)) {
                            VitalsChart(records = records, modifier = Modifier.fillMaxSize(), type = "HR")
                        }
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("SpO2", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Card(modifier = Modifier.fillMaxWidth().height(100.dp)) {
                            VitalsChart(records = records, modifier = Modifier.fillMaxSize(), type = "SpO2")
                        }
                    }
                }
            }

            item {
                Text(stringResource(R.string.reading_history), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }

            items(records.reversed()) { record ->
                RecordItem(record) { viewModel.deleteRecord(record.id) }
            }
        }
    }
}

@Composable
fun HealthInsightsCard(insights: String, isGenerating: Boolean, onAnalyze: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFDBEAFE))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(stringResource(R.string.health_insights), fontWeight = FontWeight.Bold, color = Color(0xFF1E40AF))
                TextButton(onClick = onAnalyze, enabled = !isGenerating) {
                    Text(if (isGenerating) stringResource(R.string.analyzing) else stringResource(R.string.refresh_ai), fontSize = 12.sp)
                }
            }

            if (insights.isNotEmpty()) {
                Text(insights, fontSize = 14.sp, color = Color(0xFF1E3A8A))
            } else {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)) {
                    Text(stringResource(R.string.ai_insights_desc), fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = onAnalyze, enabled = !isGenerating) {
                        Text(stringResource(R.string.analyze_trends))
                    }
                }
            }
        }
    }
}

@Composable
fun RecordItem(record: VitalRecord, onDelete: () -> Unit) {
    val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(dateFormat.format(Date(record.timestamp)), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.outline)
                IconButton(onClick = onDelete, modifier = Modifier.size(16.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.outline)
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                VitalValue("BP", "${record.systolic}/${record.diastolic}")
                VitalValue("HR", "${record.heartRate}")
                VitalValue("SpO2", "${record.oxygenSaturation}%")
            }
            if (!record.notes.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text("\"${record.notes}\"", fontSize = 11.sp, fontStyle = FontStyle.Italic, color = MaterialTheme.colorScheme.outline)
            }
        }
    }
}

@Composable
fun VitalValue(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 10.sp, color = MaterialTheme.colorScheme.outline)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
}
