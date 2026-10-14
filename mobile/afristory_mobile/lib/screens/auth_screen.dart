import 'package:flutter/material.dart';

import '../state/app_state.dart';

class AuthScreen extends StatefulWidget {
  final AppState state;
  const AuthScreen({super.key, required this.state});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool loginMode = true;
  bool loading = false;
  String error = '';
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final nameController = TextEditingController();

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = '';
    });
    bool ok;
    if (loginMode) {
      ok = await widget.state.auth.signIn(
        emailController.text.trim(),
        passwordController.text.trim(),
      );
    } else {
      ok = await widget.state.auth.signUp(
        nameController.text.trim().isEmpty ? 'Lecteur' : nameController.text.trim(),
        emailController.text.trim(),
        passwordController.text.trim(),
      );
    }
    if (!mounted) return;
    if (ok) {
      widget.state.change();
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      setState(() => error = widget.state.auth.error ?? 'Erreur.');
    }
    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 36),
              const Icon(Icons.auto_stories, color: Color(0xFFD4AF37), size: 56),
              const SizedBox(height: 12),
              const Text(
                'AfriStory',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Space Grotesk',
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      loginMode ? 'Connexion' : 'Inscription',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 18),
                    if (!loginMode) ...[
                      TextField(
                        controller: nameController,
                        decoration: const InputDecoration(labelText: 'Nom'),
                      ),
                      const SizedBox(height: 12),
                    ],
                    TextField(
                      controller: emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'E-mail'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Mot de passe'),
                    ),
                    if (error.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(error, style: const TextStyle(color: Color(0xFFA52A2A), fontSize: 13)),
                    ],
                    const SizedBox(height: 18),
                    ElevatedButton(
                      onPressed: loading ? null : submit,
                      child: loading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                            )
                          : Text(loginMode ? 'SE CONNECTER' : 'S\'INSCRIRE'),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => setState(() => loginMode = !loginMode),
                      child: Text(
                        loginMode ? 'Pas encore membre ? Créer un compte' : 'Déjà membre ? Se connecter',
                        style: const TextStyle(color: Color(0xFFD4AF37)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
