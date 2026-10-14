import 'package:flutter/material.dart';

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
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 720;
        if (isWide) {
          return Scaffold(
            body: SafeArea(
              child: Row(
                children: [
                  NavigationRail(
                    selectedIndex: index,
                    onDestinationSelected: (i) => setState(() => index = i),
                    labelType: NavigationRailLabelType.all,
                    backgroundColor: const Color(0xCC0F0F0F),
                    selectedIconTheme: const IconThemeData(color: Colors.black),
                    selectedLabelTextStyle: const TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.w700),
                    indicatorColor: const Color(0xFFD4AF37),
                    destinations: const [
                      NavigationRailDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: Text('Accueil')),
                      NavigationRailDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: Text('Explorer')),
                      NavigationRailDestination(icon: Icon(Icons.bookmark_border), selectedIcon: Icon(Icons.bookmark), label: Text('Biblio')),
                      NavigationRailDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: Text('Profil')),
                    ],
                  ),
                  const VerticalDivider(width: 1),
                  Expanded(child: IndexedStack(index: index, children: pages)),
                ],
              ),
            ),
          );
        }
        return Scaffold(
          body: IndexedStack(index: index, children: pages),
          bottomNavigationBar: NavigationBar(
            selectedIndex: index,
            onDestinationSelected: (i) => setState(() => index = i),
            backgroundColor: const Color(0xCC0F0F0F),
            indicatorColor: const Color(0xFFD4AF37),
            destinations: const [
              NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Accueil'),
              NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Explorer'),
              NavigationDestination(icon: Icon(Icons.bookmark_border), selectedIcon: Icon(Icons.bookmark), label: 'Biblio'),
              NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profil'),
            ],
          ),
        );
      },
    );
  }
}
