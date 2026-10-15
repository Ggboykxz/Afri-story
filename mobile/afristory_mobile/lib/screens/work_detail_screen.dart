import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
import '../models/chapter.dart';
import '../models/work.dart';
import '../widgets/empty_state.dart';
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
              padding: const EdgeInsets.all(AfriTokens.sp16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (w.genre.isNotEmpty)
                        _Tag(label: w.genre.toUpperCase(), bg: AfriTokens.gold.withValues(alpha: 0.16), fg: AfriTokens.gold),
                      const SizedBox(width: AfriTokens.sp6),
                      if (w.isPremium)
                        const _Tag(label: 'PREMIUM', bg: Color(0x33A52A2A), fg: AfriTokens.red),
                    ],
                  ),
                  const SizedBox(height: AfriTokens.sp12),
                  Text(w.authorName, style: AfriTokens.muted(color: AfriTokens.gold, size: 14).copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: AfriTokens.sp8),
                  Text(w.title, style: AfriTokens.display(size: 26)),
                  const SizedBox(height: AfriTokens.sp12),
                  Text(
                    w.description.isEmpty ? 'Pas encore de description.' : w.description,
                    style: AfriTokens.body(size: 15, height: 1.5),
                  ),
                  const SizedBox(height: AfriTokens.sp20),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.play_arrow_rounded, size: 20),
                          label: const Text('COMMENCER'),
                        ),
                      ),
                      const SizedBox(width: AfriTokens.sp10),
                      IconButton.filledTonal(
                        onPressed: _toggleFavorite,
                        icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, color: isFavorite ? AfriTokens.red : null),
                        tooltip: isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
                      ),
                      const SizedBox(width: AfriTokens.sp8),
                      IconButton.filledTonal(
                        onPressed: () {},
                        icon: const Icon(Icons.share_outlined),
                        tooltip: 'Partager',
                      ),
                    ],
                  ),
                  const SizedBox(height: AfriTokens.sp24),
                  Text('CHAPITRES', style: AfriTokens.label(size: 11, color: AfriTokens.onSurfaceMuted)),
                  const SizedBox(height: AfriTokens.sp8),
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
                    child: Center(child: CircularProgressIndicator(color: AfriTokens.gold)),
                  ),
                );
              }
              final chapters = snapshot.data ?? [];
              if (chapters.isEmpty) {
                return const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: AfriTokens.sp16, vertical: AfriTokens.sp24),
                    child: EmptyState(icon: Icons.menu_book_outlined, title: 'Pas de chapitre', message: 'Les chapitres arriveront bientôt.'),
                  ),
                );
              }
              return SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) {
                    final c = chapters[i];
                    return ListTile(
                      leading: CircleAvatar(
                        radius: 22,
                        backgroundColor: AfriTokens.gold.withValues(alpha: 0.18),
                        child: Text('${c.number}', style: const TextStyle(color: AfriTokens.gold, fontWeight: FontWeight.w900, fontSize: 15)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp8, vertical: AfriTokens.sp4),
                      title: Text(c.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AfriTokens.onSurfaceMuted),
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


class _Tag extends StatelessWidget {
  final String label;
  final Color bg;
  final Color fg;
  const _Tag({required this.label, required this.bg, required this.fg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: fg, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.4),
      ),
    );
  }
}
