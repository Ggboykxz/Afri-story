import 'dart:async';

import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
import '../models/chapter.dart';
import '../models/work.dart';
import '../services/firestore_service.dart';

class ReaderScreen extends StatefulWidget {
  final dynamic state;
  final Work work;
  final List<Chapter> chapters;
  final int index;
  const ReaderScreen({
    super.key,
    required this.state,
    required this.work,
    required this.chapters,
    required this.index,
  });

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  late int _current;
  bool _uiVisible = true;
  Timer? _hideTimer;
  double _zoom = 1.0;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _current = widget.index;
    _pageController = PageController(initialPage: _current);
    _recordReading();
    _scheduleHide();
  }

  @override
  void dispose() {
    _hideTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _recordReading() async {
    try {
      final uid = (widget.state as dynamic).auth?.user?.uid as String?;
      if (uid == null) return;
      final c = widget.chapters[_current];
      await FirestoreService.instance.recordReading(uid, widget.work.id, c.number);
    } catch (_) {}
  }

  Chapter get _chapter => widget.chapters[_current];

  void _scheduleHide() {
    _hideTimer?.cancel();
    _hideTimer = Timer(const Duration(seconds: 3), () {
      if (mounted && _uiVisible) setState(() => _uiVisible = false);
    });
  }

  void _toggleUi() {
    setState(() => _uiVisible = !_uiVisible);
    if (_uiVisible) _scheduleHide();
  }

  void _changeChapter(int delta) {
    final next = _current + delta;
    if (next < 0 || next >= widget.chapters.length) return;
    setState(() {
      _current = next;
      _uiVisible = true;
    });
    _pageController.jumpToPage(next);
    _recordReading();
    _scheduleHide();
  }

  void _resetZoom() => setState(() => _zoom = 1.0);

  @override
  Widget build(BuildContext context) {
    final progress = (_current + 1) / widget.chapters.length;
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _toggleUi,
        onDoubleTap: () => setState(() => _zoom = _zoom == 1.0 ? 2.0 : 1.0),
        child: Stack(
          children: [
            // Pages
            InteractiveViewer(
              scaleEnabled: _zoom > 1.0,
              minScale: 1.0,
              maxScale: 4.0,
              child: PageView.builder(
                controller: _pageController,
                itemCount: widget.chapters.length,
                onPageChanged: (i) {
                  setState(() => _current = i);
                  _recordReading();
                },
                itemBuilder: (context, i) {
                  final c = widget.chapters[i];
                  if (c.pages.isEmpty) {
                    return const Center(child: Text('Page vide', style: TextStyle(color: Colors.white38)));
                  }
                  return ListView.separated(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: c.pages.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 6),
                    itemBuilder: (context, j) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Image.network(
                          c.pages[j],
                          fit: BoxFit.fitWidth,
                          loadingBuilder: (context, child, progress) {
                            if (progress == null) return child;
                            return Container(
                              height: 300,
                              color: AfriTokens.charcoal,
                              child: Center(
                                child: CircularProgressIndicator(
                                  color: AfriTokens.gold,
                                  value: progress.expectedTotalBytes != null
                                      ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                                      : null,
                                ),
                              ),
                            );
                          },
                          errorBuilder: (_, __, ___) => Container(
                            height: 180,
                            color: AfriTokens.charcoal,
                            child: const Center(child: Icon(Icons.broken_image, color: AfriTokens.onSurfaceMuted, size: 40)),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),

            // Top bar
            AnimatedPositioned(
              duration: AfriTokens.dNormal,
              curve: AfriTokens.cStandard,
              top: _uiVisible ? 0 : -70,
              left: 0,
              right: 0,
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0xDD000000), Colors.transparent],
                  ),
                ),
                child: SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(AfriTokens.sp16, AfriTokens.sp12, AfriTokens.sp16, AfriTokens.sp8),
                    child: Row(
                      children: [
                        IconButton(
                          style: IconButton.styleFrom(backgroundColor: AfriTokens.charcoal.withValues(alpha: 0.7)),
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.close_rounded, color: Colors.white),
                          tooltip: 'Fermer',
                        ),
                        const SizedBox(width: AfriTokens.sp12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                widget.work.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15),
                              ),
                              Text(
                                'Chapitre ${_chapter.number}',
                                style: const TextStyle(color: AfriTokens.gold, fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          style: IconButton.styleFrom(backgroundColor: AfriTokens.charcoal.withValues(alpha: 0.7)),
                          onPressed: _resetZoom,
                          icon: Icon(_zoom == 1.0 ? Icons.zoom_in : Icons.zoom_out, color: Colors.white),
                          tooltip: _zoom == 1.0 ? 'Agrandir' : 'Réinitialiser le zoom',
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Bottom bar
            AnimatedPositioned(
              duration: AfriTokens.dNormal,
              curve: AfriTokens.cStandard,
              bottom: _uiVisible ? 0 : -100,
              left: 0,
              right: 0,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [Color(0xDD000000), Colors.transparent],
                  ),
                ),
                child: SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(AfriTokens.sp12, AfriTokens.sp12, AfriTokens.sp12, AfriTokens.sp8),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp8),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(999),
                            child: LinearProgressIndicator(
                              value: progress,
                              minHeight: 3,
                              color: AfriTokens.gold,
                              backgroundColor: Colors.white12,
                            ),
                          ),
                        ),
                        const SizedBox(height: AfriTokens.sp10),
                        Row(
                          children: [
                            IconButton(
                              style: IconButton.styleFrom(backgroundColor: AfriTokens.charcoal.withValues(alpha: 0.7)),
                              onPressed: _current > 0 ? () => _changeChapter(-1) : null,
                              icon: const Icon(Icons.skip_previous_rounded, color: Colors.white),
                              tooltip: 'Précédent',
                            ),
                            Expanded(
                              child: Center(
                                child: Text(
                                  'Chap. ${_chapter.number} / ${widget.chapters.length}  •  tap pour cacher',
                                  style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                                ),
                              ),
                            ),
                            IconButton(
                              style: IconButton.styleFrom(backgroundColor: AfriTokens.charcoal.withValues(alpha: 0.7)),
                              onPressed: _current < widget.chapters.length - 1 ? () => _changeChapter(1) : null,
                              icon: const Icon(Icons.skip_next_rounded, color: Colors.white),
                              tooltip: 'Suivant',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
