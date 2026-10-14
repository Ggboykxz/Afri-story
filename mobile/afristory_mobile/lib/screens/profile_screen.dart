import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  final dynamic state;
  const ProfileScreen({super.key, required this.state});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final user = (widget.state as dynamic).auth.user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const CircleAvatar(
            radius: 48,
            backgroundColor: Color(0xFF3A2A1A),
            child: Icon(Icons.person, size: 48, color: Color(0xFFD4AF37)),
          ),
          const SizedBox(height: 16),
          Text(
            user?.displayName ?? 'Utilisateur',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          Text(
            user?.email ?? '',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white54),
          ),
          const SizedBox(height: 32),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Paramètres'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
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
