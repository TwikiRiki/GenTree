package com.vitaltrack.pro.service

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.vitaltrack.pro.data.model.HealthProfile
import com.vitaltrack.pro.data.model.VitalRecord
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class GeminiService(apiKey: String) {
    private val generativeModel = GenerativeModel(
        modelName = "gemini-2.0-flash",
        apiKey = apiKey
    )

    suspend fun getHealthInsights(profile: HealthProfile, records: List<VitalRecord>): String {
        val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
        val recordSummary = records.joinToString("\n") { r ->
            "Date: ${dateFormat.format(Date(r.timestamp))}, BP: ${r.systolic}/${r.diastolic} mmHg, HR: ${r.heartRate} bpm, SpO2: ${r.oxygenSaturation}%"
        }

        val prompt = """
            Analyze the following health data for a patient and provide brief, helpful insights or trends based on their history.

            Patient Info:
            - Name: ${profile.name}
            - Gender: ${profile.gender}
            - Date of Birth: ${profile.dateOfBirth}
            - Blood Type: ${profile.bloodType ?: "Unknown"}
            - Additional Notes: ${profile.notes ?: "None"}

            Recent Vital Records:
            $recordSummary

            Please provide:
            1. A short summary of the observed trends in the vitals.
            2. Identification of any values that are outside typical healthy ranges (e.g., Blood Pressure > 140/90, SpO2 < 95%).
            3. A concluding reminder to consult a healthcare professional for clinical advice.

            Format the response as clear, concise paragraphs. Do not use Markdown headers, just simple formatting.
        """.trimIndent()

        return try {
            val response = generativeModel.generateContent(prompt)
            response.text ?: "No insights could be generated at this time."
        } catch (e: Exception) {
            e.printStackTrace()
            "Failed to generate health insights using AI."
        }
    }
}
