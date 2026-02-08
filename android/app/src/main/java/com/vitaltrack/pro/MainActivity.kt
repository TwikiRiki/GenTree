package com.vitaltrack.pro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import android.widget.Toast
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.data.model.VitalRecord
import com.vitaltrack.pro.ui.components.ProfileFormDialog
import com.vitaltrack.pro.ui.components.SharingDialog
import com.vitaltrack.pro.ui.components.VitalEntryDialog
import com.vitaltrack.pro.ui.screens.DashboardScreen
import com.vitaltrack.pro.ui.screens.LoginScreen
import com.vitaltrack.pro.ui.screens.ProfileDetailScreen
import com.vitaltrack.pro.ui.theme.VitalTrackProTheme
import com.vitaltrack.pro.viewmodel.HealthViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: HealthViewModel by viewModels { HealthViewModel.Factory }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            VitalTrackProTheme {
                val navController = rememberNavController()
                val currentUser by viewModel.currentUser.collectAsState()

                var showProfileForm by remember { mutableStateOf(false) }
                var showVitalFormProfileId by remember { mutableStateOf<String?>(null) }
                var showSharingProfile by remember { mutableStateOf<HealthProfile?>(null) }

                LaunchedEffect(currentUser) {
                    if (currentUser == null) {
                        navController.navigate("login") {
                            popUpTo(0)
                        }
                    } else if (navController.currentDestination?.route == "login") {
                        navController.navigate("dashboard") {
                            popUpTo("login") { inclusive = true }
                        }
                    }
                }

                NavHost(navController = navController, startDestination = if (currentUser == null) "login" else "dashboard") {
                    composable("login") {
                        LoginScreen { email, name -> viewModel.login(email, name) }
                    }
                    composable("dashboard") {
                        DashboardScreen(
                            viewModel = viewModel,
                            onSelectProfile = { id -> navController.navigate("profile/$id") },
                            onAddProfile = { showProfileForm = true }
                        )
                    }
                    composable("profile/{profileId}") { backStackEntry ->
                        val profileId = backStackEntry.arguments?.getString("profileId") ?: return@composable
                        val profiles by viewModel.getProfiles()?.collectAsState(initial = emptyList()) ?: remember { mutableStateOf(emptyList()) }
                        val records by viewModel.getRecords(profileId).collectAsState(initial = emptyList())
                        val profile = profiles.find { it.id == profileId }

                        ProfileDetailScreen(
                            profileId = profileId,
                            viewModel = viewModel,
                            onBack = { navController.popBackStack() },
                            onAddRecord = { showVitalFormProfileId = profileId },
                            onShare = { showSharingProfile = profile },
                            onExport = {
                                profile?.let { p ->
                                    exportCsv(p, records)
                                }
                            }
                        )
                    }
                }

                if (showProfileForm) {
                    ProfileFormDialog(
                        onDismiss = { showProfileForm = false },
                        onSave = { name, gender, dob, bt, notes ->
                            viewModel.saveProfile(name, gender, dob, bt, notes)
                            showProfileForm = false
                        }
                    )
                }

                showVitalFormProfileId?.let { profileId ->
                    VitalEntryDialog(
                        onDismiss = { showVitalFormProfileId = null },
                        onSave = { s, d, hr, spo2, notes ->
                            viewModel.saveRecord(profileId, s, d, hr, spo2, notes)
                            showVitalFormProfileId = null
                        }
                    )
                }

                showSharingProfile?.let { profile ->
                    SharingDialog(
                        onDismiss = { showSharingProfile = null },
                        onShare = { email ->
                            viewModel.shareProfile(profile, email)
                            showSharingProfile = null
                            Toast.makeText(this@MainActivity, "Shared with $email", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }

    private fun exportCsv(profile: HealthProfile, records: List<VitalRecord>) {
        val headers = "Timestamp,Systolic,Diastolic,Heart Rate,Oxygen Saturation,Notes"
        val rows = records.joinToString("\n") { r ->
            "${r.timestamp},${r.systolic},${r.diastolic},${r.heartRate},${r.oxygenSaturation},\"${r.notes ?: ""}\""
        }
        val csv = "$headers\n$rows"
        // In real app: save to file and open share intent
        // For this demo: just show a toast with row count
        Toast.makeText(this, "Exported ${records.size} records to CSV (simulated)", Toast.LENGTH_LONG).show()
    }
}
