import 'package:flutter/material.dart';

class AppTheme {
  static const _gold = Color(0xFFD4AF37);
  static const _black = Color(0xFF0F0F0F);
  static const _offWhite = Color(0xFFF5F5DC);

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: _black,
        colorScheme: const ColorScheme.dark(
          primary: _gold,
          secondary: _gold,
          surface: Color(0xFF1A1A1A),
          error: Color(0xFFA52A2A),
          onPrimary: _black,
          onSurface: _offWhite,
        ),
        fontFamily: 'Outfit',
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontWeight: FontWeight.w900, color: Colors.white),
          headlineMedium: TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
          titleMedium: TextStyle(fontWeight: FontWeight.w700, color: Colors.white),
          bodyMedium: TextStyle(color: _offWhite),
          bodySmall: TextStyle(color: Color(0xFF999999)),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xCC0F0F0F),
          elevation: 0,
          centerTitle: false,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: _gold,
            foregroundColor: _black,
            minimumSize: const Size.fromHeight(48),
            textStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.2),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withValues(alpha: 0.05),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Colors.white24),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _gold, width: 1.5),
          ),
        ),
      );
}
