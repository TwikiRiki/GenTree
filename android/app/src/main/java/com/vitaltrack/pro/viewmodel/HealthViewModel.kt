package com.vitaltrack.pro.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.vitaltrack.pro.VitalTrackApplication
import com.vitaltrack.pro.data.HealthRepository
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.data.model.User
import com.vitaltrack.pro.data.model.VitalRecord
import com.vitaltrack.pro.service.GeminiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class HealthViewModel(
    private val repository: HealthRepository,
    private val geminiService: GeminiService
) : ViewModel() {

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _insights = MutableStateFlow("")
    val insights: StateFlow<String> = _insights.asStateFlow()

    private val _isGeneratingInsights = MutableStateFlow(false)
    val isGeneratingInsights: StateFlow<Boolean> = _isGeneratingInsights.asStateFlow()

    fun login(email: String, name: String?) {
        _currentUser.value = User(
            id = email,
            email = email,
            name = name ?: email.substringBefore("@")
        )
    }

    fun logout() {
        _currentUser.value = null
    }

    fun getProfiles() = _currentUser.value?.let {
        repository.getProfilesForUser(it.id, it.email)
    }

    fun saveProfile(name: String, gender: String, dob: String, bloodType: String?, notes: String?) {
        val user = _currentUser.value ?: return
        viewModelScope.launch {
            repository.saveProfile(
                HealthProfile(
                    id = UUID.randomUUID().toString(),
                    name = name,
                    gender = gender,
                    dateOfBirth = dob,
                    bloodType = bloodType,
                    notes = notes,
                    ownerId = user.id,
                    sharedWith = emptyList()
                )
            )
        }
    }

    fun shareProfile(profile: HealthProfile, email: String) {
        viewModelScope.launch {
            val updated = profile.copy(sharedWith = profile.sharedWith + email)
            repository.saveProfile(updated)
        }
    }

    fun saveRecord(profileId: String, systolic: Int, diastolic: Int, heartRate: Int, spo2: Int, notes: String?) {
        viewModelScope.launch {
            repository.saveRecord(
                VitalRecord(
                    id = UUID.randomUUID().toString(),
                    patientId = profileId,
                    timestamp = System.currentTimeMillis(),
                    systolic = systolic,
                    diastolic = diastolic,
                    heartRate = heartRate,
                    oxygenSaturation = spo2,
                    notes = notes
                )
            )
        }
    }

    fun deleteRecord(recordId: String) {
        viewModelScope.launch {
            repository.deleteRecord(recordId)
        }
    }

    fun getRecords(profileId: String) = repository.getRecordsForProfile(profileId)

    fun getLastRecord(profileId: String) = repository.getLastRecordForProfile(profileId)

    fun generateInsights(profile: HealthProfile, records: List<VitalRecord>) {
        viewModelScope.launch {
            _isGeneratingInsights.value = true
            _insights.value = geminiService.getHealthInsights(profile, records)
            _isGeneratingInsights.value = false
        }
    }

    fun clearInsights() {
        _insights.value = ""
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val application = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as VitalTrackApplication
                return HealthViewModel(
                    application.repository,
                    application.geminiService
                ) as T
            }
        }
    }
}
