import 'package:flutter/material.dart';

import '../models/work.dart';

class WorkCard extends StatefulWidget {
  final Work work;
  final VoidCallback? onTap;
  const WorkCard({super.key, required this.work, this.onTap});

  @override
  State<WorkCard> createState() => _WorkCardState();
}

class _WorkCardState extends State<WorkCard> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _scale = 0.955),
      onTapUp: (_) => setState(() => _scale = 1.0),
      onTapCancel: () => setState(() => _scale = 1.0),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 130),
        curve: Curves.easeOutBack,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Hero(
                tag: 'work-cover-${widget.work.id}',
                child: _cover(context),
              ),
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
                    widget.work.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
              ),
              if (widget.work.isPremium)
                const Positioned(
                  top: 6,
                  right: 6,
                  child: _PremiumBadge(),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _cover(BuildContext context) {
    final url = widget.work.coverUrl ?? '';
    if (url.isEmpty) {
      return Container(color: Colors.white10, child: const Icon(Icons.book, color: Colors.white30, size: 40));
    }
    return Image.network(
      url,
      fit: BoxFit.cover,
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Container(color: Colors.white10);
      },
      errorBuilder: (context, _, _) => Container(
        color: Colors.white10,
        child: const Icon(Icons.broken_image, color: Colors.white30),
      ),
    );
  }
}

class _PremiumBadge extends StatelessWidget {
  const _PremiumBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFD4AF37),
        borderRadius: BorderRadius.circular(999),
      ),
      child: const Text(
        'PRO',
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.black),
      ),
    );
  }
}
