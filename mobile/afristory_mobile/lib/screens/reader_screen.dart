import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../models/chapter.dart';
import '../models/work.dart';

class ReaderScreen extends StatelessWidget {
  final dynamic state;
  final Work work;
  final Chapter chapter;
  const ReaderScreen({super.key, required this.state, required this.work, required this.chapter});

  @override
  Widget build(BuildContext context) {
    final pages = chapter.pages;
    return Scaffold(
      appBar: AppBar(title: Text('${work.title} — Ch. ${chapter.number}')),
      body: pages.isEmpty
          ? const Center(child: Text('Aucune page disponible'))
          : ListView.builder(
              itemCount: pages.length,
              itemBuilder: (context, i) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: CachedNetworkImage(
                    imageUrl: pages[i],
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                    placeholder: (_,  _) => Container(
                      height: 300,
                      color: Colors.white10,
                      child: const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37))),
                    ),
                    errorWidget: (_,  _,  __) => Container(
                      height: 200,
                      color: Colors.white10,
                      child: const Center(child: Icon(Icons.broken_image, color: Colors.white30)),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
