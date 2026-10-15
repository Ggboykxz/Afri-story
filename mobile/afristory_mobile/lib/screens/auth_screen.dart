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

  Future<void> _guest() async {
    setState(() {
      loading = true;
      error = null;
    });
    final ok = await widget.state.auth.signInAsGuest();
    if (!mounted) return;
    if (ok) {
      widget.state.change();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bienvenue en mode invité !')),
      );
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.state.auth.error ?? 'Erreur invité.'),
          backgroundColor: const Color(0xFFA52A2A),
        ),
      );
    }
    setState(() => loading = false);
  }

  Future<void> _reset() async {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Saisissez votre e-mail d’abord')),
      );
      return;
    }
    final ok = await widget.state.auth.sendPasswordReset(email);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok
            ? 'Lien de réinitialisation envoyé'
            : (widget.state.auth.error ?? 'Erreur')),
      ),
    );
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
                          onPressed: loading ? null : _reset,
                          child: const Text('Mot de passe oublié ?', style: TextStyle(color: Colors.white54)),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),
              _GuestButton(loading: loading, onPressed: _guest),
            ],
          ),
        ),
      ),
    );
  }
}

class _GuestButton extends StatefulWidget {
  final bool loading;
  final VoidCallback onPressed;
  const _GuestButton({required this.loading, required this.onPressed});

  @override
  State<_GuestButton> createState() => _GuestButtonState();
}

class _GuestButtonState extends State<_GuestButton> {
  double _scale = 1.0;

  void _onTapDown(TapDownDetails _) => setState(() => _scale = 0.96);
  void _onTapUp(TapUpDetails _) => setState(() => _scale = 1.0);
  void _onTapCancel() => setState(() => _scale = 1.0);

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: _scale,
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOutBack,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTapDown: _onTapDown,
          onTapUp: _onTapUp,
          onTapCancel: _onTapCancel,
          onTap: widget.loading ? null : widget.onPressed,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.5), width: 1.5),
              color: Colors.white.withValues(alpha: 0.03),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.explore_outlined, color: Color(0xFFD4AF37), size: 20),
                const SizedBox(width: 10),
                Text(
                  widget.loading ? 'CONNEXION...' : 'CONTINUER EN INVITÉ',
                  style: const TextStyle(
                    color: Color(0xFFD4AF37),
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                    letterSpacing: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
