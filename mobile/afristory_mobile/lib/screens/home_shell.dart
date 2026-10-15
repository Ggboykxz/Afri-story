import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
import '../state/app_state.dart';
import 'explore_screen.dart';
import 'home_tab.dart';
import 'library_screen.dart';
import 'profile_screen.dart';

class HomeShell extends StatefulWidget {
  final AppState state;
  const HomeShell({super.key, required this.state});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeTab(state: widget.state),
      ExploreScreen(state: widget.state),
      LibraryScreen(state: widget.state),
      ProfileScreen(state: widget.state),
    ];
    return LayoutBuilder(
      builder: (context, cs) {
        final isWide = cs.maxWidth >= 720;
        if (isWide) {
          return Scaffold(
            body: Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    border: Border(right: BorderSide(color: AfriTokens.divider)),
                  ),
                  child: NavigationRail(
                    selectedIndex: index,
                    onDestinationSelected: (i) => setState(() => index = i),
                    labelType: NavigationRailLabelType.all,
                    backgroundColor: AfriTokens.black.withValues(alpha: 0.9),
                    indicatorColor: AfriTokens.gold.withValues(alpha: 0.18),
                    selectedIconTheme: const IconThemeData(color: AfriTokens.gold, size: 22),
                    unselectedIconTheme: IconThemeData(color: AfriTokens.onSurfaceMuted.withValues(alpha: 0.8)),
                    selectedLabelTextStyle: const TextStyle(color: AfriTokens.gold, fontWeight: FontWeight.w800, fontSize: 12),
                    unselectedLabelTextStyle: const TextStyle(color: AfriTokens.onSurfaceMuted, fontWeight: FontWeight.w500, fontSize: 12),
                    destinations: const [
                      NavigationRailDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: Text('Accueil')),
                      NavigationRailDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore_rounded), label: Text('Explorer')),
                      NavigationRailDestination(icon: Icon(Icons.bookmark_border), selectedIcon: Icon(Icons.bookmark_rounded), label: Text('Biblio')),
                      NavigationRailDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person_rounded), label: Text('Profil')),
                    ],
                  ),
                ),
                Expanded(child: IndexedStack(index: index, children: pages)),
              ],
            ),
          );
        }
        return Scaffold(
          body: IndexedStack(index: index, children: pages),
          extendBody: true,
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              color: AfriTokens.black.withValues(alpha: 0.75),
              border: Border(top: BorderSide(color: AfriTokens.divider)),
            ),
            child: SafeArea(
              child: NavigationBar(
                selectedIndex: index,
                onDestinationSelected: (i) => setState(() => index = i),
                backgroundColor: Colors.transparent,
                indicatorColor: AfriTokens.gold.withValues(alpha: 0.18),
                height: 62,
                destinations: [
                  NavigationDestination(
                    icon: Icon(index == 0 ? Icons.home_rounded : Icons.home_outlined),
                    label: 'Accueil',
                  ),
                  NavigationDestination(
                    icon: Icon(index == 1 ? Icons.explore_rounded : Icons.explore_outlined),
                    label: 'Explorer',
                  ),
                  NavigationDestination(
                    icon: Icon(index == 2 ? Icons.bookmark_rounded : Icons.bookmark_border),
                    label: 'Bibli',
                  ),
                  NavigationDestination(
                    icon: Icon(index == 3 ? Icons.person_rounded : Icons.person_outline),
                    label: 'Profil',
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
