import 'package:flutter/material.dart';

import '../state/app_state.dart';

class AuthScreen extends StatefulWidget {
  final dynamic state;
  const AuthScreen({super.key, required this.state});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool loginMode = true;
  bool loading = false;
  final formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final nameController = TextEditingController();
  String? error;

  Future<void> submit() async {
    if (!(formKey.currentState?.validate() ?? false)) return;
    setState(() {
      loading = true;
      error = null;
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(loginMode ? 'Connexion réussie' : 'Compte créé avec succès')),
      );
      await Future.delayed(const Duration(milliseconds: 250));
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } else {
      setState(() => error = widget.state.auth.error ?? 'Erreur.');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error!), backgroundColor: const Color(0xFFA52A2A)),
      );
    }
    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              const Icon(Icons.auto_stories, color: Color(0xFFD4AF37), size: 64),
              const SizedBox(height: 8),
              const Text(
                'AfriStory',
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Space Grotesk', fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Form(
                  key: formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        loginMode ? 'Connexion' : 'Inscription',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      const SizedBox(height: 18),
                      if (!loginMode) ...[
                        TextFormField(
                          controller: nameController,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(labelText: 'Nom'),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Nom requis';
                            if (v.trim().length < 2) return 'Nom trop court';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                      ],
                      TextFormField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(labelText: 'E-mail'),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'E-mail requis';
                          if (!v.contains('@') || !v.contains('.')) return 'E-mail invalide';
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: passwordController,
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        decoration: const InputDecoration(labelText: 'Mot de passe'),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Mot de passe requis';
                          if (v.length < 6) return 'Minimum 6 caractères';
                          return null;
                        },
                      ),
                      if (error != null) ...[
                        const SizedBox(height: 12),
                        Text(error!, style: const TextStyle(color: Color(0xFFA52A2A), fontSize: 13)),
                      ],
                      const SizedBox(height: 18),
                      ElevatedButton(
                        onPressed: loading ? null : submit,
                        child: loading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                            : Text(loginMode ? 'SE CONNECTER' : 'S\'INSCRIRE'),
                      ),
                      const SizedBox(height: 10),
                      TextButton(
                        onPressed: loading ? null : () => setState(() => loginMode = !loginMode),
                        child: Text(
                          loginMode ? 'Pas encore membre ? Créer un compte' : 'Déjà membre ? Se connecter',
                          style: const TextStyle(color: Color(0xFFD4AF37)),
                        ),
                      ),
                      if (loginMode)
                        TextButton(
                          onPressed: () async {
                            if (emailController.text.trim().isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Saisissez votre e-mail d’abord')),
                              );
                              return;
                            }
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Réinitialisation envoyée (si le compte existe)')),
                            );
                          },
                          child: const Text('Mot de passe oublié ?', style: TextStyle(color: Colors.white54)),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
