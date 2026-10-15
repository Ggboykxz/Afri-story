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
  bool isFavorite = false;

  @override
  void initState() {
    super.initState();
    _chapters = FirestoreService.instance.fetchChapters(widget.work.id);
    _loadFavorite();
  }

  Future<void> _loadFavorite() async {
    final uid = widget.state.auth.user?.uid;
    if (uid == null) return;
    final profile = await FirestoreService.instance.getUser(uid);
    final favs = (profile?['favorites'] as List?)?.cast<String>() ?? <String>[];
    if (mounted) setState(() => isFavorite = favs.contains(widget.work.id));
  }

  Future<void> _toggleFavorite() async {
    final uid = widget.state.auth.user?.uid;
    if (uid == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Connectez-vous pour favoriser')));
      return;
    }
    await FirestoreService.instance.toggleFavorite(uid, widget.work.id, !isFavorite);
    if (mounted) {
      setState(() => isFavorite = !isFavorite);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris')),
      );
    }
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
            actions: [
              IconButton(
                onPressed: _toggleFavorite,
                icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, color: Colors.white),
                tooltip: 'Favori',
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: Text(w.title, style: const TextStyle(fontWeight: FontWeight.w900)),
              background: (w.coverUrl != null && w.coverUrl!.isNotEmpty)
                  ? Hero(
                      tag: 'work-cover-${w.id}',
                      child: Image.network(w.coverUrl!, fit: BoxFit.cover),
                    )
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
                          builder: (_) => ReaderScreen(
                            state: widget.state,
                            work: w,
                            chapters: chapters,
                            index: i,
                          ),
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
