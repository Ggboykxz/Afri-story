import 'package:flutter/material.dart';

class LibraryScreen extends StatelessWidget {
  final dynamic state;
  const LibraryScreen({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ma bibliothèque')),
      body: const Center(
        child: Text(
          'Vos lectures et favoris apparaîtront ici.\nFonctionnalité en cours de connexion.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white54),
        ),
      ),
    );
  }
}
