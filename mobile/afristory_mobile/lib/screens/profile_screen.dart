import 'package:flutter/material.dart';

import '../core/design_tokens.dart';
import '../services/firestore_service.dart';
import '../state/app_state.dart';

class ProfileScreen extends StatefulWidget {
  final dynamic state;
  const ProfileScreen({super.key, required this.state});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final uid = widget.state.auth.user?.uid;
    if (uid != null) {
      profile = await FirestoreService.instance.getUser(uid);
    }
    if (mounted) setState(() => loading = false);
  }

  Future<void> _edit() async {
    final user = widget.state.auth.user;
    if (user == null) return;
    final nameCtrl = TextEditingController(text: (profile?['displayName'] as String?) ?? user.displayName ?? '');
    final bioCtrl = TextEditingController(text: (profile?['bio'] as String?) ?? '');
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: AfriTokens.sp20,
          right: AfriTokens.sp20,
          top: AfriTokens.sp20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Modifier le profil', style: AfriTokens.heading(size: 20)),
            const SizedBox(height: AfriTokens.sp16),
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: "Nom d'affichage")),
            const SizedBox(height: AfriTokens.sp12),
            TextField(controller: bioCtrl, decoration: const InputDecoration(labelText: 'Bio'), maxLines: 3),
            const SizedBox(height: AfriTokens.sp24),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('ENREGISTRER'),
            ),
            const SizedBox(height: AfriTokens.sp12),
          ],
        ),
      ),
    );
    if (ok == true && mounted) {
      await FirestoreService.instance.updateUser(user.uid, {
        'displayName': nameCtrl.text.trim(),
        'bio': bioCtrl.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profil mis à jour')));
        _load();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.state.auth.user;
    final isGuest = profile?['isGuest'] == true;
    final displayName = (profile?['displayName'] as String?) ?? user?.displayName ?? 'Utilisateur';
    final bio = (profile?['bio'] as String?) ?? '';
    final favorites = (profile?['favorites'] as List?)?.length ?? 0;
    final afriCoins = profile?['afriCoins'] ?? 0;
    final role = (profile?['role'] as String?) ?? 'reader';
    final history = (profile?['readingHistory'] as List?)?.length ?? 0;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 120,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: AfriTokens.sp16, bottom: 10),
              title: Text(displayName, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.white)),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF2A1A10), Color(0xFF0F0F0F)],
                  ),
                ),
              ),
            ),
            actions: [
              if (isGuest)
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.upgrade_rounded),
                  tooltip: 'Devenir membre',
                ),
            ],
          ),
          SliverToBoxAdapter(
            child: loading
                ? const Padding(padding: EdgeInsets.all(80), child: Center(child: CircularProgressIndicator(color: AfriTokens.gold)))
                : Padding(
                    padding: const EdgeInsets.all(AfriTokens.sp16),
                    child: Column(
                      children: [
                        // Avatar + stat badge
                        Stack(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: [BoxShadow(color: AfriTokens.gold.withValues(alpha: 0.25), blurRadius: 24, offset: const Offset(0, 6))],
                              ),
                              child: CircleAvatar(
                                radius: 52,
                                backgroundColor: AfriTokens.surfaceRaised,
                                child: Text(
                                  displayName.isNotEmpty ? displayName[0].toUpperCase() : '?',
                                  style: AfriTokens.display(size: 40, color: AfriTokens.gold),
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 4,
                              right: 4,
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AfriTokens.gold,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: AfriTokens.black, width: 2),
                                ),
                                child: const Icon(Icons.edit, size: 12, color: Colors.black),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AfriTokens.sp14),
                        Text(displayName, textAlign: TextAlign.center, style: AfriTokens.heading(size: 22)),
                        const SizedBox(height: AfriTokens.sp4),
                        Text(
                          user?.email ?? 'Mode invité',
                          textAlign: TextAlign.center,
                          style: AfriTokens.muted(size: 13),
                        ),
                        if (bio.isNotEmpty) ...[
                          const SizedBox(height: AfriTokens.sp10),
                          Text(bio, textAlign: TextAlign.center, style: AfriTokens.body(size: 14).copyWith(color: AfriTokens.onSurfaceMuted, height: 1.5)),
                        ],
                        const SizedBox(height: AfriTokens.sp12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp12, vertical: AfriTokens.sp4),
                          decoration: BoxDecoration(
                            color: (isGuest ? Colors.white10 : AfriTokens.gold.withValues(alpha: 0.15)),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: (isGuest ? AfriTokens.onSurfaceMuted : AfriTokens.gold).withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            isGuest ? 'MODE INVITÉ' : role.toUpperCase().replaceAll('_', ' '),
                            style: AfriTokens.label(size: 10, color: isGuest ? AfriTokens.onSurfaceMuted : AfriTokens.gold),
                          ),
                        ),
                        const SizedBox(height: AfriTokens.sp24),
                        // Stats
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: AfriTokens.sp16),
                          decoration: BoxDecoration(
                            color: AfriTokens.surface,
                            borderRadius: BorderRadius.circular(AfriTokens.radiusMd),
                            border: Border.all(color: AfriTokens.divider),
                          ),
                          child: Row(
                            children: [
                              _Stat(label: 'AfriCoins', value: '$afriCoins', icon: Icons.monetization_on_rounded),
                              _Stat(label: 'Favoris', value: '$favorites', icon: Icons.favorite_rounded),
                              _Stat(label: 'Lus', value: '$history', icon: Icons.menu_book_rounded),
                            ],
                          ),
                        ),
                        const SizedBox(height: AfriTokens.sp24),
                        // Actions
                        _Section(label: 'Compte'),
                        _ActionTile(icon: Icons.edit_rounded, title: 'Modifier le profil', onTap: _edit),
                        _ActionTile(icon: Icons.notifications_none_rounded, title: 'Notifications', onTap: () {}),
                        _ActionTile(icon: Icons.language_rounded, title: 'Langue', trailing: 'Français', onTap: () {}),
                        _ActionTile(icon: Icons.dark_mode_outlined, title: 'Apparence', trailing: 'Sombre', onTap: () {}),
                        const SizedBox(height: AfriTokens.sp16),
                        _Section(label: 'Informations'),
                        _ActionTile(icon: Icons.info_outline_rounded, title: 'À propos', onTap: () {}),
                        _ActionTile(icon: Icons.help_outline_rounded, title: 'FAQ', onTap: () {}),
                        _ActionTile(icon: Icons.article_outlined, title: 'CGU & Confidentialité', onTap: () {}),
                        const SizedBox(height: AfriTokens.sp24),
                        // Upgrade guest CTA
                        if (isGuest) ...[
                          Container(
                            padding: const EdgeInsets.all(AfriTokens.sp16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0x33D4AF37), Color(0x11D4AF37)]),
                              borderRadius: BorderRadius.circular(AfriTokens.radiusMd),
                              border: Border.all(color: AfriTokens.gold.withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.upgrade_rounded, color: AfriTokens.gold),
                                const SizedBox(width: AfriTokens.sp12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Devenir membre', style: AfriTokens.heading(size: 16)),
                                      Text('Synchronisez vos données et monétisez.', style: AfriTokens.muted(size: 12)),
                                    ],
                                  ),
                                ),
                                TextButton(onPressed: () => Navigator.pushNamed(context, '/auth'), child: const Text('Créer')),
                              ],
                            ),
                          ),
                          const SizedBox(height: AfriTokens.sp24),
                        ],
                        // Logout
                        _ActionTile(
                          icon: Icons.logout_rounded,
                          title: 'Déconnexion',
                          color: AfriTokens.red,
                          onTap: () async {
                            await (widget.state as dynamic).auth.signOut();
                            (widget.state as dynamic).change();
                            if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/auth', (_) => false);
                          },
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _Stat({required this.label, required this.value, required this.icon});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: AfriTokens.gold, size: 20),
          const SizedBox(height: 6),
          Text(value, style: AfriTokens.heading(size: 20).copyWith(color: AfriTokens.gold)),
          const SizedBox(height: 2),
          Text(label, style: AfriTokens.muted(size: 11)),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String label;
  const _Section({required this.label});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: AfriTokens.sp8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(label.toUpperCase(), style: AfriTokens.label(size: 10, color: AfriTokens.onSurfaceMuted, spacing: 2.0)),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? trailing;
  final Color? color;
  final VoidCallback onTap;
  const _ActionTile({required this.icon, required this.title, this.trailing, this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AfriTokens.onSurface;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AfriTokens.radiusSm),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AfriTokens.sp8, vertical: AfriTokens.sp12),
          child: Row(
            children: [
              Icon(icon, size: 20, color: color ?? AfriTokens.gold),
              const SizedBox(width: AfriTokens.sp14),
              Expanded(child: Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: c))),
              if (trailing != null)
                Text(trailing!, style: const TextStyle(color: AfriTokens.onSurfaceMuted, fontSize: 13)),
              Icon(Icons.chevron_right_rounded, size: 20, color: AfriTokens.onSurfaceMuted),
            ],
          ),
        ),
      ),
    );
  }
}
