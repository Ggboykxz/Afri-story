import 'dart:async';

import 'package:flutter/material.dart';

/// Grille avec entrée en cascade : chaque élément apparaît avec un
/// fade + slide + scale décalé dans le temps.
class StaggeredGrid extends StatefulWidget {
  final int itemCount;
  final Widget Function(BuildContext, int) itemBuilder;
  final int crossAxisCount;
  final double childAspectRatio;
  final EdgeInsets padding;
  final Duration itemDelay;

  const StaggeredGrid({
    super.key,
    required this.itemCount,
    required this.itemBuilder,
    this.crossAxisCount = 2,
    this.childAspectRatio = 0.62,
    this.padding = const EdgeInsets.all(12),
    this.itemDelay = const Duration(milliseconds: 45),
  });

  @override
  State<StaggeredGrid> createState() => _StaggeredGridState();
}

class _StaggeredGridState extends State<StaggeredGrid> {
  final Set<int> _visible = {};
  Timer? _timer;
  int _next = 0;

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void didUpdateWidget(StaggeredGrid oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.itemCount != widget.itemCount) {
      _timer?.cancel();
      _visible.clear();
      _next = 0;
      _start();
    }
  }

  void _start() {
    _timer?.cancel();
    _timer = Timer.periodic(widget.itemDelay, (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_next >= widget.itemCount) {
        timer.cancel();
        return;
      }
      setState(() {
        _visible.add(_next);
        _next++;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: widget.padding,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: widget.crossAxisCount,
        childAspectRatio: widget.childAspectRatio,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: widget.itemCount,
      itemBuilder: (context, i) {
        final shown = _visible.contains(i);
        return AnimatedOpacity(
          opacity: shown ? 1 : 0,
          duration: const Duration(milliseconds: 340),
          curve: Curves.easeOutCubic,
          child: AnimatedSlide(
            offset: shown ? Offset.zero : const Offset(0, 0.12),
            duration: const Duration(milliseconds: 380),
            curve: Curves.easeOutCubic,
            child: AnimatedScale(
              scale: shown ? 1 : 0.94,
              duration: const Duration(milliseconds: 380),
              curve: Curves.easeOutBack,
              child: widget.itemBuilder(context, i),
            ),
          ),
        );
      },
    );
  }
}
