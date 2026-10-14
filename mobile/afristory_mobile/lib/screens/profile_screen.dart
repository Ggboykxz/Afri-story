import 'package:flutter/material.dart';

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

  @override
  Widget build(BuildContext context) {
    final user = widget.state.auth.user;
    final displayName = (profile?['displayName'] as String?) ?? user?.displayName ?? 'Utilisateur';
    final bio = (profile?['bio'] as String?) ?? '';
    final favorites = (profile?['favorites'] as List?)?.length ?? 0;
    final afriCoins = profile?['afriCoins'] ?? 0;
    final role = (profile?['role'] as String?) ?? 'reader';

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37)))
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                const CircleAvatar(
                  radius: 48,
                  backgroundColor: Color(0xFF3A2A1A),
                  child: Icon(Icons.person, size: 48, color: Color(0xFFD4AF37)),
                ),
                const SizedBox(height: 16),
                Text(
                  displayName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white54),
                ),
                if (bio.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(bio, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)),
                ],
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _Stat(label: 'AfriCoins', value: '$afriCoins'),
                    _Stat(label: 'Favoris', value: '$favorites'),
                    _Stat(label: 'Rôle', value: role.toUpperCase()),
                  ],
                ),
                const SizedBox(height: 32),
                ListTile(
                  leading: const Icon(Icons.edit),
                  title: const Text('Modifier le profil'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    final controller = TextEditingController(text: bio);
                    final nameCtrl = TextEditingController(text: displayName);
                    final ok = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        backgroundColor: const Color(0xFF1A1A1A),
                        title: const Text('Modifier'),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nom')),
                            const SizedBox(height: 8),
                            TextField(controller: controller, decoration: const InputDecoration(labelText: 'Bio'), maxLines: 3),
                          ],
                        ),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
                          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Enregistrer')),
                        ],
                      ),
                    );
                    if (ok == true && user != null) {
                      await FirestoreService.instance.updateUser(user.uid, {
                        'displayName': nameCtrl.text.trim(),
                        'bio': controller.text.trim(),
                      });
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profil mis à jour')));
                        _load();
                      }
                    }
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.logout, color: Color(0xFFA52A2A)),
                  title: const Text('Déconnexion', style: TextStyle(color: Color(0xFFA52A2A))),
                  onTap: () async {
                    await (widget.state as dynamic).auth.signOut();
                    (widget.state as dynamic).change();
                    if (!mounted) return;
                    Navigator.pushNamedAndRemoveUntil(context, '/auth', (_) => false);
                  },
                ),
              ],
            ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  const _Stat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFFD4AF37))),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
      ],
    );
  }
}
