package com.vitaltrack.pro

import android.app.Application
import com.vitaltrack.pro.data.HealthRepository
import com.vitaltrack.pro.data.local.HealthDatabase
import com.vitaltrack.pro.service.GeminiService

class VitalTrackApplication : Application() {
    val database by lazy { HealthDatabase.getDatabase(this) }
    val repository by lazy { HealthRepository(database.healthDao()) }
    val geminiService by lazy { GeminiService(apiKey = BuildConfig.GEMINI_API_KEY) }
}
