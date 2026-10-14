import 'package:flutter/material.dart';

import '../services/auth_service.dart';

class AppState extends ChangeNotifier {
  AppState() {
    _auth = AuthService.instance;
  }
  late final AuthService _auth;
  AuthService get auth => _auth;

  bool _loading = true;
  bool get loading => _loading;

  Future<void> init() async {
    await _auth.init();
    await Future.delayed(const Duration(milliseconds: 400));
    _loading = false;
    notifyListeners();
  }

  void change() => notifyListeners();
}
