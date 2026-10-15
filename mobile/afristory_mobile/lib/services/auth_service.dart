import 'dart:convert';

import 'package:http/http.dart' as http;
import '../config/firebase_config.dart';
import 'firestore_service.dart';

class AuthUser {
  final String uid;
  final String email;
  final String? displayName;
  String? idToken;
  String? refreshToken;
  AuthUser({
    required this.uid,
    required this.email,
    this.displayName,
    this.idToken,
    this.refreshToken,
  });

  Map<String, dynamic> toJson() => {
        'uid': uid,
        'email': email,
        'displayName': displayName,
        'idToken': idToken,
        'refreshToken': refreshToken,
      };

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        uid: json['uid'] as String,
        email: json['email'] as String,
        displayName: json['displayName'] as String?,
        idToken: json['idToken'] as String?,
        refreshToken: json['refreshToken'] as String?,
      );
}

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  AuthUser? user;
  String? error;

  Future<void> init() async {}

  Future<bool> signIn(String email, String password) async {
    error = null;
    try {
      final res = await http.post(
        Uri.parse(FirebaseConfig.authUrl('accounts:signInWithPassword')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'returnSecureToken': true,
        }),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        error = data['error']?['message'] ?? 'Erreur de connexion.';
        return false;
      }
      user = AuthUser(
        uid: data['localId'] as String,
        email: data['email'] as String,
        displayName: data['displayName'] as String? ?? (data['email'] as String).split('@').first,
        idToken: data['idToken'] as String?,
        refreshToken: data['refreshToken'] as String?,
      );
      await _persist();
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    }
  }

  Future<bool> signUp(String name, String email, String password) async {
    error = null;
    try {
      final res = await http.post(
        Uri.parse(FirebaseConfig.authUrl('accounts:signUp')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'returnSecureToken': true,
        }),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        error = data['error']?['message'] ?? 'Erreur inscription.';
        return false;
      }
      user = AuthUser(
        uid: data['localId'] as String,
        email: data['email'] as String,
        displayName: name,
        idToken: data['idToken'] as String?,
        refreshToken: data['refreshToken'] as String?,
      );
      try { await FirestoreService.instance.ensureUser(user!.uid, user!.email, name); } catch (_) {}
      await _persist();
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    }
  }

  Future<void> refreshToken() async {
    if (user?.refreshToken == null) return;
    try {
      final res = await http.post(
        Uri.parse(FirebaseConfig.secureTokenUrl()),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'grant_type=refresh_token&refresh_token=${user!.refreshToken}',
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode == 200) {
        user!.idToken = data['id_token'] as String?;
        user!.refreshToken = data['refresh_token'] as String?;
        await _persist();
      } else {
        await signOut();
      }
    } catch (_) {
      await signOut();
    }
  }

  Future<bool> signInAsGuest() async {
    error = null;
    try {
      final res = await http.post(
        Uri.parse(FirebaseConfig.authUrl('accounts:signUp')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'returnSecureToken': true}),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        error = data['error']?['message'] ?? 'Connexion invité impossible.';
        return false;
      }
      final uid = data['localId'] as String;
      user = AuthUser(
        uid: uid,
        email: '',
        displayName: 'Invité',
        idToken: data['idToken'] as String?,
        refreshToken: data['refreshToken'] as String?,
      );
      try {
        await FirestoreService.instance.ensureGuestUser(uid);
      } catch (_) {
        // best effort - guest browsing works even if profile write fails
      }
      await _persist();
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    }
  }

  Future<void> signOut() async {
    user = null;
  }

  Future<bool> sendPasswordReset(String email) async {
    error = null;
    try {
      final res = await http.post(
        Uri.parse(FirebaseConfig.authUrl('accounts:sendOobCode')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'requestType': 'PASSWORD_RESET', 'email': email}),
      );
      if (res.statusCode == 200) return true;
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      error = data['error']?['message'] ?? 'Erreur.';
      return false;
    } catch (e) {
      error = e.toString();
      return false;
    }
  }

  Future<void> _persist() async {}
}
