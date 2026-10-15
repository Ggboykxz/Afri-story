// Tokens de design AfriStory V2 — fondation UX commune (HIG + UI-UX Pro Max).
// Tous les composants et écrans s'appuient sur cette classe pour garantir
// cohérence du rythme 4/8dp, du type scale, des ombres et des mouvements.

import 'package:flutter/material.dart';

@immutable
class AfriTokens {
  // --- Espacement (rythme 4/8dp) ---
  static const double sp2 = 2; // 2dp   micro
  static const double sp4 = 4; // 4dp
  static const double sp6 = 6;
  static const double sp8 = 8;
  static const double sp10 = 10;
  static const double sp12 = 12;
  static const double sp14 = 14;
  static const double sp16 = 16;
  static const double sp20 = 20;
  static const double sp24 = 24;
  static const double sp32 = 32;
  static const double sp40 = 40;
  static const double sp48 = 48;
  static const double sp64 = 64;

  // --- Rayons ---
  static const double radiusXs = 6;
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 22;
  static const double radiusFull = 999;

  // --- Cibles tactiles ---
  static const double touchMin = 44; // min iOS/Android ≥ 44pt/48dp

  // --- Élévation (ombre) ---
  static const double elev0 = 0;
  static const double elev1 = 2;
  static const double elev2 = 6;
  static const double elev3 = 12;

  // --- Durées / courbes partagées ---
  static const Duration dInstant = Duration(milliseconds: 80);
  static const Duration dFast = Duration(milliseconds: 120);
  static const Duration dNormal = Duration(milliseconds: 200);
  static const Duration dSlow = Duration(milliseconds: 320);
  static const Duration dEntrance = Duration(milliseconds: 380);

  static const Curve cPressed = Curves.easeOutQuart;
  static const Curve cEmphasis = Curves.easeOutBack;
  static const Curve cLinear = Curves.linear;
  static const Curve cStandard = Curves.easeOutCubic;
  static const Curve cEnter = Curves.easeOutExpo;
  static const Curve cExit = Curves.easeInCubic;

  // --- Opacités ---
  static const double opacitySubtle = 0.06;
  static const double opacitySoft = 0.12;
  static const double opacityMedium = 0.32;
  static const double opacityStroke = 0.18;

  // --- Couleurs de marque (identité conservée) ---
  static const Color gold = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFE8C96A);
  static const Color goldDeep = Color(0xFFB79528);
  static const Color brown = Color(0xFF5C4033);
  static const Color red = Color(0xFFA52A2A);
  static const Color green = Color(0xFF2E8B57);
  static const Color black = Color(0xFF0F0F0F);
  static const Color charcoal = Color(0xFF1A1A1A);
  static const Color surface = Color(0xFF18181A);
  static const Color surfaceRaised = Color(0xFF242426);
  static const Color onSurface = Color(0xFFF2F2F2);
  static const Color onSurfaceMuted = Color(0xFFB8B8BE);
  static const Color divider = Color(0x26FFFFFF);

  // --- Échelle typographique (mobile : def 17pt, min 11pt) ---
  static const double type11 = 11;
  static const double type13 = 13;
  static const double type15 = 15;
  static const double type17 = 17;
  static const double type20 = 20;
  static const double type24 = 24;
  static const double type28 = 28;
  static const double type34 = 34;

  // Text styles de base.
  static TextStyle display({Color color = onSurface, double size = type34}) =>
      TextStyle(fontFamily: 'Space Grotesk', fontSize: size, fontWeight: FontWeight.w900, color: color, letterSpacing: -0.4, height: 1.05);

  static TextStyle heading({Color color = onSurface, double size = type20, double height = 1.2}) =>
      TextStyle(fontFamily: 'Space Grotesk', fontSize: size, fontWeight: FontWeight.w800, color: color, height: height);

  static TextStyle body({Color color = onSurface, double size = type15, FontWeight weight = FontWeight.w500, double height = 1.45}) =>
      TextStyle(fontSize: size, fontWeight: weight, color: color, height: height);

  static TextStyle muted({Color color = onSurfaceMuted, double size = type13}) =>
      TextStyle(fontSize: size, color: color, height: 1.35);

  static TextStyle label({Color color = onSurfaceMuted, double size = type11, double spacing = 1.6}) =>
      TextStyle(fontSize: size, fontWeight: FontWeight.w900, color: color, letterSpacing: spacing);
}

// Helper ombre
BoxShadow afriShadow({double blur = AfriTokens.elev2, double y = 4, Color color = Colors.black}) =>
    BoxShadow(color: color.withValues(alpha: AfriTokens.opacityMedium), blurRadius: blur, offset: Offset(0, y));
