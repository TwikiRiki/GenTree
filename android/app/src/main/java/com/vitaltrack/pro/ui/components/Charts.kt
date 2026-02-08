package com.vitaltrack.pro.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitaltrack.pro.data.model.VitalRecord

@Composable
fun VitalsChart(
    records: List<VitalRecord>,
    modifier: Modifier = Modifier,
    type: String = "BP" // "BP", "HR", "SpO2"
) {
    if (records.isEmpty()) {
        Box(modifier = modifier, contentAlignment = androidx.compose.ui.Alignment.Center) {
            Text("No data to display", color = MaterialTheme.colorScheme.outline, fontSize = 12.sp)
        }
        return
    }

    val primaryColor = when(type) {
        "BP" -> Color(0xFFEF4444)
        "HR" -> Color(0xFFFB7185)
        else -> Color(0xFF22D3EE)
    }

    val secondaryColor = Color(0xFF3B82F6) // For diastolic

    Canvas(modifier = modifier.padding(16.dp)) {
        val width = size.width
        val height = size.height
        val spacing = width / (records.size.coerceAtLeast(2) - 1).coerceAtLeast(1)

        val maxValue = when(type) {
            "BP" -> 200f
            "HR" -> 150f
            else -> 100f
        }
        val minValue = when(type) {
            "BP" -> 40f
            "HR" -> 40f
            else -> 80f
        }
        val range = maxValue - minValue

        if (type == "BP") {
            // Draw Systolic
            val sysPath = Path()
            records.forEachIndexed { i, r ->
                val x = i * spacing
                val y = height - ((r.systolic - minValue) / range) * height
                if (i == 0) sysPath.moveTo(x, y) else sysPath.lineTo(x, y)
                drawCircle(primaryColor, radius = 4.dp.toPx(), center = Offset(x, y))
            }
            drawPath(sysPath, primaryColor, style = Stroke(width = 2.dp.toPx()))

            // Draw Diastolic
            val diaPath = Path()
            records.forEachIndexed { i, r ->
                val x = i * spacing
                val y = height - ((r.diastolic - minValue) / range) * height
                if (i == 0) diaPath.moveTo(x, y) else diaPath.lineTo(x, y)
                drawCircle(secondaryColor, radius = 4.dp.toPx(), center = Offset(x, y))
            }
            drawPath(diaPath, secondaryColor, style = Stroke(width = 2.dp.toPx()))
        } else {
            val path = Path()
            records.forEachIndexed { i, r ->
                val value = if (type == "HR") r.heartRate else r.oxygenSaturation
                val x = i * spacing
                val y = height - ((value - minValue) / range) * height
                if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
                drawCircle(primaryColor, radius = 4.dp.toPx(), center = Offset(x, y))
            }
            drawPath(path, primaryColor, style = Stroke(width = 2.dp.toPx()))
        }
    }
}
