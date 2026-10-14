import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../models/work.dart';

class WorkCard extends StatelessWidget {
  final Work work;
  const WorkCard({super.key, required this.work});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (work.coverUrl != null && work.coverUrl!.isNotEmpty)
            CachedNetworkImage(
              imageUrl: work.coverUrl!,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(color: Colors.white10),
              errorWidget: (_, __, ___) => Container(
                color: Colors.white10,
                child: const Icon(Icons.broken_image, color: Colors.white30),
              ),
            )
          else
            Container(color: Colors.white10, child: const Icon(Icons.book, color: Colors.white30, size: 40)),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xCC000000)],
                ),
              ),
              child: Text(
                work.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
