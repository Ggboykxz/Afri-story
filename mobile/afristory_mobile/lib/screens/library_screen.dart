import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
import '../services/firestore_service.dart';
import '../widgets/empty_state.dart';
import '../screens/work_detail_screen.dart';

class LibraryScreen extends StatefulWidget {
  final dynamic state;
  const LibraryScreen({super.key, required this.state});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> with SingleTickerProviderStateMixin {
  late final TabController controller;
  List<dynamic> favs = [];
  List<dynamic> history = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    controller = TabController(length: 2, vsync: this);
    _load();
  }

  Future<void> _load() async {
    final uid = widget.state.auth.user?.uid;
    if (uid == null) {
      if (mounted) setState(() => loading = false);
      return;
    }
    final f = await FirestoreService.instance.fetchFavorites(uid);
    final h = await FirestoreService.instance.fetchReadingHistory(uid);
    if (!mounted) return;
    setState(() {
      favs = f;
      history = h;
      loading = false;
    });
  }

  Widget _grid(List<dynamic> works, String title, String message) {
    if (loading) {
      return const Center(child: CircularProgressIndicator(color: AfriTokens.gold));
    }
    if (works.isEmpty) {
      return EmptyState(
        icon: Icons.bookmark_border,
        title: title,
        message: message,
      );
    }
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.62,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: works.length,
      itemBuilder: (context, i) {
        final w = works[i];
        return GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => WorkDetailScreen(state: widget.state, work: w)),
          ),
          child: Column(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: w.coverUrl != null && (w.coverUrl as String).isNotEmpty
                      ? Image.network(w.coverUrl, fit: BoxFit.cover)
                      : Container(color: Colors.white10),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                w.title as String,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ma bibliothèque')),
      bottomNavigationBar: TabBar(
        controller: controller,
        tabs: const [Tab(text: 'Favoris'), Tab(text: 'Historique')],
      ),
      body: TabBarView(
        controller: controller,
children: [_grid(favs, 'Aucun favori', 'Ajoutez des œuvres à vos favoris.'), _grid(history, "Pas d'historique", "Votre historique de lecture apparaîtra ici.")],
      ),
    );
  }
}
