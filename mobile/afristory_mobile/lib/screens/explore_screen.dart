import 'package:flutter/material.dart';

import '../models/work.dart';
import '../services/firestore_service.dart';
import '../widgets/work_card.dart';
import 'work_detail_screen.dart';

class ExploreScreen extends StatefulWidget {
  final dynamic state;
  const ExploreScreen({super.key, required this.state});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String query = '';
  late Future<List<Work>> _works;

  @override
  void initState() {
    super.initState();
    _works = FirestoreService.instance.fetchWorks(limit: 60);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Explorer')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              onChanged: (v) => setState(() => query = v.toLowerCase()),
              decoration: const InputDecoration(
                hintText: 'Rechercher une œuvre...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Work>>(
              future: _works,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37)));
                }
                var works = snapshot.data ?? [];
                if (query.isNotEmpty) {
                  works = works
                      .where((w) =>
                          w.title.toLowerCase().contains(query) ||
                          w.authorName.toLowerCase().contains(query) ||
                          w.genre.toLowerCase().contains(query))
                      .toList();
                }
                if (works.isEmpty) {
                  return const Center(child: Text('Aucun résultat'));
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
                      child: WorkCard(work: w),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
