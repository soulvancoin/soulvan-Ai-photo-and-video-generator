# Soulvan AI ProGuard Rules

# Keep all model classes
-keep class com.soulvan.ai.data.** { *; }

# Retrofit
-keepattributes Signature
-keepattributes Exceptions
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }

# Web3j
-keep class org.web3j.** { *; }
-dontwarn org.web3j.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
