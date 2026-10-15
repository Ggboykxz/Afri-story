import 'package:flutter/material.dart';

import '../core/design_tokens.dart';

class AppTheme {
  static ThemeData get dark {
    final textTheme = const TextTheme(
      displayLarge: TextStyle(fontFamily: 'Space Grotesk', fontSize: 34, fontWeight: FontWeight.w900, height: 1.05, letterSpacing: -0.4, color: AfriTokens.onSurface),
      displayMedium: TextStyle(fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: FontWeight.w900, height: 1.08, letterSpacing: -0.3, color: AfriTokens.onSurface),
      headlineMedium: TextStyle(fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: FontWeight.w800, height: 1.15, color: AfriTokens.onSurface),
      headlineSmall: TextStyle(fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: FontWeight.w800, height: 1.2, color: AfriTokens.onSurface),
      titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, height: 1.25, color: AfriTokens.onSurface),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, height: 1.3, color: AfriTokens.onSurface),
      titleSmall: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, height: 1.35, color: AfriTokens.onSurface),
      bodyLarge: TextStyle(fontSize: 17, fontWeight: FontWeight.w500, height: 1.45, color: AfriTokens.onSurface),
      bodyMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, height: 1.45, color: AfriTokens.onSurface),
      bodySmall: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, height: 1.4, color: AfriTokens.onSurfaceMuted),
      labelLarge: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, height: 1.2, letterSpacing: 1.4, color: AfriTokens.onSurface),
      labelMedium: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, height: 1.2, letterSpacing: 1.8, color: AfriTokens.onSurfaceMuted),
      labelSmall: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, height: 1.2, letterSpacing: 0.8, color: AfriTokens.onSurfaceMuted),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AfriTokens.black,
      splashFactory: InkSparkle.splashFactory,
      splashColor: AfriTokens.gold.withValues(alpha: 0.16),
      highlightColor: AfriTokens.gold.withValues(alpha: 0.08),
      colorScheme: const ColorScheme.dark(
        primary: AfriTokens.gold,
        onPrimary: Colors.black,
        secondary: AfriTokens.goldLight,
        onSecondary: Colors.black,
        tertiary: AfriTokens.green,
        error: AfriTokens.red,
        onError: Colors.white,
        surface: AfriTokens.surface,
        onSurface: AfriTokens.onSurface,
        outline: AfriTokens.divider,
        outlineVariant: AfriTokens.divider,
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        centerTitle: false,
        titleTextStyle: TextStyle(fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: FontWeight.w900, color: AfriTokens.onSurface),
        iconTheme: IconThemeData(color: AfriTokens.onSurface),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AfriTokens.black.withValues(alpha: 0.88),
        indicatorColor: AfriTokens.gold.withValues(alpha: 0.22),
        elevation: 0,
        shadowColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        height: 64,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final sel = states.contains(WidgetState.selected);
          return TextStyle(
            fontSize: 11,
            fontWeight: sel ? FontWeight.w900 : FontWeight.w600,
            color: sel ? AfriTokens.gold : AfriTokens.onSurfaceMuted,
            letterSpacing: sel ? 1.2 : 0.6,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final sel = states.contains(WidgetState.selected);
          return IconThemeData(
            size: 24,
            color: sel ? AfriTokens.gold : AfriTokens.onSurfaceMuted,
          );
        }),
      ),
      cardTheme: CardThemeData(
        color: AfriTokens.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AfriTokens.radiusMd),
          side: const BorderSide(color: AfriTokens.divider),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.06),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfriTokens.radiusSm),
          borderSide: const BorderSide(color: AfriTokens.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfriTokens.radiusSm),
          borderSide: const BorderSide(color: AfriTokens.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfriTokens.radiusSm),
          borderSide: const BorderSide(color: AfriTokens.gold, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfriTokens.radiusSm),
          borderSide: const BorderSide(color: AfriTokens.red, width: 1.4),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp16, vertical: AfriTokens.sp16),
        hintStyle: const TextStyle(color: AfriTokens.onSurfaceMuted, fontSize: 15),
        labelStyle: const TextStyle(color: AfriTokens.onSurfaceMuted, fontSize: 13, fontWeight: FontWeight.w600),
        floatingLabelStyle: const TextStyle(color: AfriTokens.gold, fontSize: 13, fontWeight: FontWeight.w700),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AfriTokens.gold,
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp20, vertical: AfriTokens.sp16),
          minimumSize: const Size(44, 44),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfriTokens.radiusSm)),
          textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 1.4),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AfriTokens.gold,
          minimumSize: const Size(44, 44),
          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp12, vertical: AfriTokens.sp8),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.8),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AfriTokens.onSurface,
          side: const BorderSide(color: AfriTokens.divider),
          minimumSize: const Size(44, 44),
          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp20, vertical: AfriTokens.sp16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfriTokens.radiusSm)),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.8),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white.withValues(alpha: 0.06),
        selectedColor: AfriTokens.gold.withValues(alpha: 0.22),
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AfriTokens.onSurface),
        secondaryLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AfriTokens.gold),
        padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp12, vertical: AfriTokens.sp6),
        side: const BorderSide(color: AfriTokens.divider),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfriTokens.radiusFull)),
        brightness: Brightness.dark,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AfriTokens.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AfriTokens.radiusLg),
          side: const BorderSide(color: AfriTokens.divider),
        ),
        titleTextStyle: const TextStyle(fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: FontWeight.w800, color: AfriTokens.onSurface),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AfriTokens.surfaceRaised,
        contentTextStyle: const TextStyle(color: AfriTokens.onSurface, fontSize: 14, fontWeight: FontWeight.w500),
        actionTextColor: AfriTokens.gold,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfriTokens.radiusSm)),
        behavior: SnackBarBehavior.floating,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      dividerTheme: const DividerThemeData(color: AfriTokens.divider, thickness: 1, space: 1),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: AfriTokens.surface,
        modalBackgroundColor: AfriTokens.surface,
        elevation: 0,
        modalElevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AfriTokens.radiusLg)),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: AfriTokens.gold),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AfriTokens.gold,
        foregroundColor: Colors.black,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfriTokens.radiusMd)),
      ),
      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }
}
