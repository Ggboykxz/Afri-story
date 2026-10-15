import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/auth_screen.dart';
import 'screens/home_shell.dart';
import 'screens/splash_screen.dart';
import 'state/app_state.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0F0F0F),
  ));
  final state = AppState();
  await state.init();
  runApp(AfriStoryApp(state: state));
}

/// Transition personnalisée : fade + slide vertical + léger scale.
Route<T> _buildRoute<T>(RouteSettings settings, Widget child) {
  return PageRouteBuilder<T>(
    settings: settings,
    transitionDuration: const Duration(milliseconds: 320),
    reverseTransitionDuration: const Duration(milliseconds: 240),
    pageBuilder: (_, __, ___) => child,
    transitionsBuilder: (_, animation, __, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      );
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.035),
            end: Offset.zero,
          ).animate(curved),
          child: ScaleTransition(
            scale: Tween(begin: 0.985, end: 1.0).animate(curved),
            child: child,
          ),
        ),
      );
    },
  );
}

class AfriStoryApp extends StatefulWidget {
  final AppState state;
  const AfriStoryApp({super.key, required this.state});

  @override
  State<AfriStoryApp> createState() => _AfriStoryAppState();
}

class _AfriStoryAppState extends State<AfriStoryApp> {
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.state,
      builder: (context, _) {
        return MaterialApp(
          title: 'AfriStory',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.dark,
          themeMode: ThemeMode.dark,
          builder: (context, child) {
            final media = MediaQuery.of(context);
            final scale = media.textScaler.scale(1.0).clamp(0.85, 1.25);
            return MediaQuery(
              data: media.copyWith(textScaler: TextScaler.linear(scale)),
              child: child!,
            );
          },
          initialRoute: '/splash',
          onGenerateRoute: (settings) => _buildRoute(
            settings,
            _buildPage(settings, widget.state),
          ),
        );
      },
    );
  }

  Widget _buildPage(RouteSettings settings, AppState state) {
    switch (settings.name) {
      case '/splash':
        return SplashScreen(state: state);
      case '/auth':
        return AuthScreen(state: state);
      case '/home':
        return HomeShell(state: state);
      default:
        return SplashScreen(state: state);
    }
  }
}
