import 'package:flutter/material.dart';

import '../models/work.dart';
import '../services/firestore_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/staggered_grid.dart';
import '../widgets/work_card.dart';
import 'work_detail_screen.dart';

class HomeTab extends StatefulWidget {
  final dynamic state;
  const HomeTab({super.key, required this.state});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  late Future<List<Work>> _works;

  @override
  void initState() {
    super.initState();
    _works = FirestoreService.instance.fetchWorks(limit: 40);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AfriStory', style: TextStyle(fontFamily: 'Space Grotesk', fontWeight: FontWeight.w900)),
      ),
      body: FutureBuilder<List<Work>>(
        future: _works,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37)));
          }
          final works = snapshot.data ?? [];
          if (snapshot.hasError) {
            return EmptyState(
              icon: Icons.wifi_off,
              title: 'Erreur',
              message: snapshot.error.toString(),
            );
          }
          if (works.isEmpty) {
            return const EmptyState(
              icon: Icons.library_books_outlined,
              title: 'Aucune œuvre',
              message: 'Découvrez bientôt nos contenus.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              setState(() => _works = FirestoreService.instance.fetchWorks(limit: 40));
              await _works;
            },
            color: const Color(0xFFD4AF37),
            child: StaggeredGrid(
              itemCount: works.length,
              itemBuilder: (context, i) {
                final w = works[i];
                return WorkCard(
                  work: w,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => WorkDetailScreen(state: widget.state, work: w)),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
