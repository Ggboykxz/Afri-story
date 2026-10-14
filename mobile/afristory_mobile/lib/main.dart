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
          builder: (context, child) {
            final media = MediaQuery.of(context);
            final scale = media.textScaler.scale(1.0).clamp(0.85, 1.25);
            return MediaQuery(
              data: media.copyWith(textScaler: TextScaler.linear(scale)),
              child: child!,
            );
          },
          initialRoute: '/splash',
          routes: {
            '/splash': (_) => SplashScreen(state: widget.state),
            '/auth': (_) => AuthScreen(state: widget.state),
            '/home': (_) => HomeShell(state: widget.state),
          },
        );
      },
    );
  }
}
