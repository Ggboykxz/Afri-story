import 'dart:async';

import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
import '../models/work.dart';
import '../services/firestore_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/staggered_grid.dart';
import '../widgets/work_card.dart';
import 'work_detail_screen.dart';

const _genres = [
  'Action',
  'Romance',
  'Fantasy',
  'Comédie',
  'Drame',
  'Horreur',
  'Sci-Fi',
  'Aventure',
];

class ExploreScreen extends StatefulWidget {
  final dynamic state;
  const ExploreScreen({super.key, required this.state});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String query = '';
  String? selectedGenre;
  Timer? _debounce;
  late Future<List<Work>> _works;

  @override
  void initState() {
    super.initState();
    _works = FirestoreService.instance.fetchWorks(limit: 80);
  }

  void _search(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() => query = value.toLowerCase());
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Explorer')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOut,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                boxShadow: query.isNotEmpty
                    ? [BoxShadow(color: AfriTokens.gold.withValues(alpha: 0.15), blurRadius: 16)]
                    : null,
              ),
              child: TextField(
                textInputAction: TextInputAction.search,
                onChanged: _search,
                decoration: const InputDecoration(
                  hintText: 'Rechercher une œuvre...',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 46,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: const Text('Tous'),
                    selected: selectedGenre == null,
                    onSelected: (_) => setState(() => selectedGenre = null),
                  ),
                ),
                for (final g in _genres)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(g),
                      selected: selectedGenre == g,
                      onSelected: (_) => setState(() => selectedGenre = (selectedGenre == g ? null : g)),
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Work>>(
              future: _works,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AfriTokens.gold));
                }
                if (snapshot.hasError) {
                  return EmptyState(icon: Icons.wifi_off, title: 'Erreur', message: snapshot.error.toString());
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
                if (selectedGenre != null) {
                  works = works.where((w) => w.genre.toLowerCase() == selectedGenre!.toLowerCase()).toList();
                }
                if (works.isEmpty) {
                  return const EmptyState(icon: Icons.search_off, title: 'Aucun résultat', message: 'Essayez d’autres mots-clés.');
                }
                return RefreshIndicator(
                  onRefresh: () async {
                    setState(() => _works = FirestoreService.instance.fetchWorks(limit: 80));
                    await _works;
                  },
                  color: AfriTokens.gold,
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
          ),
        ],
      ),
    );
  }
}
