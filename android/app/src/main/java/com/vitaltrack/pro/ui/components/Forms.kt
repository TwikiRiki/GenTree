package com.vitaltrack.pro.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.vitaltrack.pro.R

@Composable
fun ProfileFormDialog(
    onDismiss: () -> Unit,
    onSave: (String, String, String, String?, String?) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("male") }
    var dob by remember { mutableStateOf("") }
    var bloodType by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card {
            Column(modifier = Modifier.padding(16.dp).verticalScroll(rememberScrollState())) {
                Text(stringResource(R.string.new_health_profile), style = MaterialTheme.typography.headlineSmall)
                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text(stringResource(R.string.full_name)) })
                Spacer(modifier = Modifier.height(8.dp))

                // Simplified Gender selection
                Row {
                    RadioButton(selected = gender == "male", onClick = { gender = "male" })
                    Text(stringResource(R.string.male), modifier = Modifier.padding(top = 12.dp))
                    RadioButton(selected = gender == "female", onClick = { gender = "female" })
                    Text(stringResource(R.string.female), modifier = Modifier.padding(top = 12.dp))
                }

                OutlinedTextField(value = dob, onValueChange = { dob = it }, label = { Text(stringResource(R.string.dob)) })
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(value = bloodType, onValueChange = { bloodType = it }, label = { Text(stringResource(R.string.blood_type)) })
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text(stringResource(R.string.notes)) }, minLines = 3)
                Spacer(modifier = Modifier.height(24.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
                    Button(onClick = { onSave(name, gender, dob, bloodType, notes) }) { Text(stringResource(R.string.create_profile)) }
                }
            }
        }
    }
}

@Composable
fun SharingDialog(
    onDismiss: () -> Unit,
    onShare: (String) -> Unit
) {
    var email by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(stringResource(R.string.share_profile), style = MaterialTheme.typography.headlineSmall)
                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text(stringResource(R.string.share_with)) },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(24.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
                    Button(onClick = { onShare(email) }) { Text(stringResource(R.string.invite)) }
                }
            }
        }
    }
}

@Composable
fun VitalEntryDialog(
    onDismiss: () -> Unit,
    onSave: (Int, Int, Int, Int, String?) -> Unit
) {
    var systolic by remember { mutableStateOf("120") }
    var diastolic by remember { mutableStateOf("80") }
    var heartRate by remember { mutableStateOf("72") }
    var spo2 by remember { mutableStateOf("98") }
    var notes by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(stringResource(R.string.add_reading), style = MaterialTheme.typography.headlineSmall)
                Spacer(modifier = Modifier.height(16.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = systolic, onValueChange = { systolic = it }, label = { Text(stringResource(R.string.systolic)) }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = diastolic, onValueChange = { diastolic = it }, label = { Text(stringResource(R.string.diastolic)) }, modifier = Modifier.weight(1f))
                }
                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = heartRate, onValueChange = { heartRate = it }, label = { Text(stringResource(R.string.hr_short)) }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = spo2, onValueChange = { spo2 = it }, label = { Text(stringResource(R.string.spo2)) }, modifier = Modifier.weight(1f))
                }
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text(stringResource(R.string.notes)) }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(24.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
                    Button(onClick = {
                        onSave(
                            systolic.toIntOrNull() ?: 120,
                            diastolic.toIntOrNull() ?: 80,
                            heartRate.toIntOrNull() ?: 72,
                            spo2.toIntOrNull() ?: 98,
                            notes
                        )
                    }) { Text(stringResource(R.string.save_reading)) }
                }
            }
        }
    }
}
