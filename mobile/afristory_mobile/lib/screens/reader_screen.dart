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
  late int currentIndex;

  @override
  void initState() {
    super.initState();
    currentIndex = widget.index;
    _recordReading();
  }

  Future<void> _recordReading() async {
    try {
      final dynamic auth = (widget.state as dynamic).auth;
      final uid = auth?.user?.uid as String?;
      if (uid == null) return;
      final c = widget.chapters[currentIndex];
      await FirestoreService.instance.recordReading(uid, widget.work.id, c.number);
    } catch (_) {}
  }

  Chapter get chapter => widget.chapters[currentIndex];

  void goNext() {
    if (currentIndex < widget.chapters.length - 1) {
      setState(() => currentIndex++);
    }
  }

  void goPrev() {
    if (currentIndex > 0) {
      setState(() => currentIndex--);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = chapter.pages;
    return Scaffold(
      appBar: AppBar(title: Text('${widget.work.title} — Ch. ${chapter.number}')),
      body: Column(
        children: [
          Expanded(
            child: (pages.isEmpty)
                ? const Center(child: Text('Aucune page disponible'))
                : ListView.builder(
                    itemCount: pages.length,
                    itemBuilder: (context, i) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: InteractiveViewer(
                          minScale: 1,
                          maxScale: 3,
                          child: Image.network(
                            pages[i],
                            width: double.infinity,
                            fit: BoxFit.fitWidth,
                            loadingBuilder: (context, child, progress) {
                              if (progress == null) return child;
                              return Container(
                                height: 300,
                                color: Colors.white10,
                                child: const Center(child: CircularProgressIndicator(color: AfriTokens.gold)),
                              );
                            },
                            errorBuilder: (context, _, __) => Container(
                              height: 200,
                              color: Colors.white10,
                              child: const Center(child: Icon(Icons.broken_image, color: Colors.white30)),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          SafeArea(
            child: Row(
              children: [
                IconButton(
                  onPressed: currentIndex > 0 ? goPrev : null,
                  icon: const Icon(Icons.skip_previous),
                  tooltip: 'Précédent',
                ),
                Expanded(
                  child: Center(
                    child: Text(
                      'Ch. ${chapter.number} / ${widget.chapters.length}',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                IconButton(
                  onPressed: currentIndex < widget.chapters.length - 1 ? goNext : null,
                  icon: const Icon(Icons.skip_next),
                  tooltip: 'Suivant',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
