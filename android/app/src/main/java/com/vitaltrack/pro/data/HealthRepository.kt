package com.vitaltrack.pro.data

import com.vitaltrack.pro.data.local.HealthDao
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.data.model.VitalRecord
import kotlinx.coroutines.flow.Flow

class HealthRepository(private val healthDao: HealthDao) {
    fun getProfilesForUser(userId: String, userEmail: String): Flow<List<HealthProfile>> =
        healthDao.getProfilesForUser(userId, userEmail)

    suspend fun getProfileById(profileId: String): HealthProfile? =
        healthDao.getProfileById(profileId)

    suspend fun saveProfile(profile: HealthProfile) =
        healthDao.saveProfile(profile)

    fun getRecordsForProfile(profileId: String): Flow<List<VitalRecord>> =
        healthDao.getRecordsForProfile(profileId)

    fun getLastRecordForProfile(profileId: String): Flow<VitalRecord?> =
        healthDao.getLastRecordForProfile(profileId)

    suspend fun saveRecord(record: VitalRecord) =
        healthDao.saveRecord(record)

    suspend fun deleteRecord(recordId: String) =
        healthDao.deleteRecord(recordId)
}
