package com.vitaltrack.pro.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String
)

@Serializable
@Entity(tableName = "health_profiles")
data class HealthProfile(
    @PrimaryKey val id: String,
    val name: String,
    val gender: String, // "male", "female", "other"
    val dateOfBirth: String,
    val bloodType: String? = null,
    val notes: String? = null,
    val ownerId: String,
    val sharedWith: List<String> = emptyList()
)

@Serializable
@Entity(tableName = "vital_records")
data class VitalRecord(
    @PrimaryKey val id: String,
    val patientId: String,
    val timestamp: Long,
    val systolic: Int,
    val diastolic: Int,
    val heartRate: Int,
    val oxygenSaturation: Int,
    val notes: String? = null
)
