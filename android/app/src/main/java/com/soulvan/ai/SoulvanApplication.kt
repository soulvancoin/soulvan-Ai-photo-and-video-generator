package com.soulvan.ai

import android.app.Application

class SoulvanApplication : Application() {
    
    companion object {
        // Default API endpoints (users can configure these in settings)
        const val DEFAULT_CLIP_API = "http://10.0.2.2:5200" // Android emulator localhost
        const val DEFAULT_DAO_API = "http://10.0.2.2:5300"
        const val DEFAULT_NVIDIA_API = "http://10.0.2.2:5400"
        
        // For real devices, use actual server URL
        const val PRODUCTION_API_BASE = "https://api.soulvan.ai"
    }
    
    override fun onCreate() {
        super.onCreate()
        // Initialize app-wide configurations here
    }
}
