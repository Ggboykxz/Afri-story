import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
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
      body: RefreshIndicator(
        color: AfriTokens.gold,
        displacement: 40,
        onRefresh: () async {
          setState(() => _works = FirestoreService.instance.fetchWorks(limit: 40));
          await _works;
        },
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          slivers: [
            SliverAppBar(
              pinned: true,
              elevation: 0,
              scrolledUnderElevation: 0,
              backgroundColor: AfriTokens.black.withValues(alpha: 0.7),
              surfaceTintColor: Colors.transparent,
              title: Row(
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: AfriTokens.gold,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(color: AfriTokens.gold.withValues(alpha: 0.28), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: const Icon(Icons.auto_stories, color: Colors.black, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Text('AfriStory', style: AfriTokens.display(size: 20).copyWith(letterSpacing: 1)),
                ],
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_none_rounded),
                  tooltip: 'Notifications',
                  onPressed: () {},
                ),
              ],
            ),
            FutureBuilder<List<Work>>(
              future: _works,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: AfriTokens.gold)));
                }
                if (snapshot.hasError) {
                  return SliverFillRemaining(child: EmptyState(icon: Icons.wifi_off, title: 'Erreur', message: snapshot.error.toString()));
                }
                final works = snapshot.data ?? [];
                if (works.isEmpty) {
                  return SliverFillRemaining(child: EmptyState(icon: Icons.menu_book_outlined, title: 'Aucune œuvre', message: 'Publiez la première histoire.'));
                }
                final featured = works.first;
                final rest = works.skip(1).toList();
                return SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: AfriTokens.sp24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // --- Hero : une œuvre dominante ---
                        Padding(
                          padding: const EdgeInsets.fromLTRB(AfriTokens.sp16, AfriTokens.sp8, AfriTokens.sp16, AfriTokens.sp20),
                          child: _FeaturedCard(work: featured, state: widget.state),
                        ),
                        // --- Section titre ---
                        Padding(
                          padding: const EdgeInsets.fromLTRB(AfriTokens.sp16, 0, AfriTokens.sp16, AfriTokens.sp12),
                          child: Row(
                            children: [
                              Text('Découvrir', style: AfriTokens.heading(size: 20)),
                              const SizedBox(width: AfriTokens.sp8),
                              Container(
                                padding: const EdgeInsets.all(5),
                                decoration: BoxDecoration(
                                  color: AfriTokens.gold.withValues(alpha: AfriTokens.opacitySoft),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(Icons.auto_awesome, size: 12, color: AfriTokens.gold),
                              ),
                              const Spacer(),
                              TextButton(onPressed: () {}, child: const Text('Tout voir')),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp16),
                          child: StaggeredGrid(
                            itemCount: rest.length,
                            itemBuilder: (context, i) {
                              final w = rest[i];
                              return WorkCard(
                                work: w,
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => WorkDetailScreen(state: widget.state, work: w)),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FeaturedCard extends StatefulWidget {
  final Work work;
  final dynamic state;
  const _FeaturedCard({required this.work, required this.state});

  @override
  State<_FeaturedCard> createState() => _FeaturedCardState();
}

class _FeaturedCardState extends State<_FeaturedCard> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    final w = widget.work;
    return GestureDetector(
      onTapDown: (_) => setState(() => _scale = 0.985),
      onTapUp: (_) => setState(() => _scale = 1.0),
      onTapCancel: () => setState(() => _scale = 1.0),
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => WorkDetailScreen(state: widget.state, work: w)),
      ),
      child: AnimatedScale(
        scale: _scale,
        duration: AfriTokens.dFast,
        curve: AfriTokens.cPressed,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AfriTokens.radiusLg),
          child: Container(
            height: 340,
            decoration: BoxDecoration(
              boxShadow: [BoxShadow(color: AfriTokens.gold.withValues(alpha: 0.18), blurRadius: 28, offset: const Offset(0, 12))],
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                Hero(
                  tag: 'work-cover-${w.id}',
                  child: (w.coverUrl != null && w.coverUrl!.isNotEmpty)
                      ? Image.network(w.coverUrl!, fit: BoxFit.cover)
                      : Container(color: AfriTokens.charcoal),
                ),
                // Gradient pour lisibilité
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Color(0x22000000), Color(0xDD000000)],
                      stops: [0.45, 0.65, 1.0],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(AfriTokens.sp20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp10, vertical: AfriTokens.sp4),
                        decoration: BoxDecoration(
                          color: AfriTokens.gold,
                          borderRadius: BorderRadius.circular(AfriTokens.radiusFull),
                        ),
                        child: const Text('À LA UNE', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.6)),
                      ),
                      const Spacer(),
                      Text(w.title, style: AfriTokens.display(size: 26).copyWith(color: Colors.white), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: AfriTokens.sp4),
                      Text(w.authorName, style: AfriTokens.body(color: Colors.white70, size: 14)),
                      const SizedBox(height: AfriTokens.sp16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.play_arrow_rounded, size: 18),
                              label: const Text('LIRE'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AfriTokens.gold,
                                foregroundColor: Colors.black,
                                minimumSize: const Size(0, 44),
                              ),
                            ),
                          ),
                          const SizedBox(width: AfriTokens.sp10),
                          IconButton(
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.white.withValues(alpha: 0.18),
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () {},
                            icon: const Icon(Icons.favorite_border_rounded),
                            tooltip: 'Favori',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
