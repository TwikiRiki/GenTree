package com.vitaltrack.pro.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.data.model.VitalRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface HealthDao {
    @Query("SELECT * FROM health_profiles WHERE ownerId = :userId OR sharedWith LIKE '%' || :userEmail || '%'")
    fun getProfilesForUser(userId: String, userEmail: String): Flow<List<HealthProfile>>

    @Query("SELECT * FROM health_profiles WHERE id = :profileId")
    suspend fun getProfileById(profileId: String): HealthProfile?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveProfile(profile: HealthProfile)

    @Query("SELECT * FROM vital_records WHERE patientId = :profileId ORDER BY timestamp ASC")
    fun getRecordsForProfile(profileId: String): Flow<List<VitalRecord>>

    @Query("SELECT * FROM vital_records WHERE patientId = :profileId ORDER BY timestamp DESC LIMIT 1")
    fun getLastRecordForProfile(profileId: String): Flow<VitalRecord?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveRecord(record: VitalRecord)

    @Query("DELETE FROM vital_records WHERE id = :recordId")
    suspend fun deleteRecord(recordId: String)
}
