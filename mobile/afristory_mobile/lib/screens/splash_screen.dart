import 'package:flutter/material.dart';

import '../state/app_state.dart';

class SplashScreen extends StatefulWidget {
  final AppState state;
  const SplashScreen({super.key, required this.state});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  bool _navigating = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward();

    Future.delayed(const Duration(milliseconds: 1400), () async {
      if (!mounted || _navigating) return;
      _navigating = true;
      if (widget.state.auth.user != null) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        Navigator.pushReplacementNamed(context, '/auth');
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gold = const Color(0xFFD4AF37);
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            final t = Curves.easeOutCubic.transform(_controller.value.clamp(0.0, 1.0));
            return Opacity(
              opacity: t,
              child: Transform.scale(
                scale: 0.78 + 0.22 * t,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Transform.rotate(
                      angle: (1 - t) * -0.35,
                      child: Container(
                        width: 92,
                        height: 92,
                        decoration: BoxDecoration(
                          color: gold,
                          borderRadius: BorderRadius.circular(22),
                          boxShadow: [
                            BoxShadow(
                              color: gold.withValues(alpha: 0.35 * t),
                              blurRadius: 32,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.auto_stories, color: Color(0xFF0F0F0F), size: 48),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Transform.translate(
                      offset: Offset(0, 16 * (1 - t)),
                      child: Column(
                        children: const [
                          Text(
                            'AfriStory',
                            style: TextStyle(
                              fontFamily: 'Space Grotesk',
                              fontSize: 36,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 3,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'HISTOIRES D’AFRIQUE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFD4AF37),
                              letterSpacing: 4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 40),
                    SizedBox(
                      width: 28,
                      height: 28,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        valueColor: AlwaysStoppedAnimation(gold.withValues(alpha: t)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
