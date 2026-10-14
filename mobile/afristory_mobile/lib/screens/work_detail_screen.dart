import 'package:flutter/material.dart';

import '../models/chapter.dart';
import '../models/work.dart';
import '../services/firestore_service.dart';
import 'reader_screen.dart';

class WorkDetailScreen extends StatefulWidget {
  final dynamic state;
  final Work work;
  const WorkDetailScreen({super.key, required this.state, required this.work});

  @override
  State<WorkDetailScreen> createState() => _WorkDetailScreenState();
}

class _WorkDetailScreenState extends State<WorkDetailScreen> {
  late Future<List<Chapter>> _chapters;

  @override
  void initState() {
    super.initState();
    _chapters = FirestoreService.instance.fetchChapters(widget.work.id);
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.work;
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 360,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(w.title, style: const TextStyle(fontWeight: FontWeight.w900)),
              background: (w.coverUrl != null && w.coverUrl!.isNotEmpty)
                  ? Image.network(w.coverUrl!, fit: BoxFit.cover)
                  : Container(color: const Color(0xFF1A1A1A)),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    w.authorName,
                    style: const TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(w.description.isEmpty ? 'Aucune description.' : w.description),
                  const SizedBox(height: 16),
                  const Text(
                    'Chapitres',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ),
          FutureBuilder<List<Chapter>>(
            future: _chapters,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37))),
                  ),
                );
              }
              final chapters = snapshot.data ?? [];
              if (chapters.isEmpty) {
                return const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('Aucun chapitre'),
                  ),
                );
              }
              return SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) {
                    final c = chapters[i];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: const Color(0xFFD4AF37),
                        child: Text('${c.number}', style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
                      ),
                      title: Text(c.title),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ReaderScreen(state: widget.state, work: w, chapter: c),
                        ),
                      ),
                    );
                  },
                  childCount: chapters.length,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
