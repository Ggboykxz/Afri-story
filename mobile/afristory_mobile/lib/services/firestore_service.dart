import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/firebase_config.dart';
import '../models/chapter.dart';
import '../models/work.dart';
import '../services/auth_service.dart';

class FirestoreService {
  FirestoreService._();
  static final FirestoreService instance = FirestoreService._();

  String _authHeader() {
    final token = AuthService.instance.user?.idToken;
    if (token == null) return '';
    return 'Bearer $token';
  }

  Future<List<Work>> fetchWorks({int limit = 30, String? genre}) async {
    final headers = <String, String>{};
    final auth = _authHeader();
    if (auth.isNotEmpty) headers['Authorization'] = auth;

    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/works?pageSize=$limit');
    final res = await http.get(uri, headers: headers);
    if (res.statusCode != 200) return [];
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final docs = body['documents'] as List? ?? [];
    final result = <Work>[];
    for (final d in docs) {
      final doc = d as Map<String, dynamic>;
      final id = doc['name'].toString().split('/').last;
      final fields = (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {};
      final work = Work.fromFirestore(id, fields);
      if (work.status == 'published' ||
          work.status == 'completed' ||
          work.status.isEmpty) {
        result.add(work);
      }
    }
    result.sort((a, b) => b.views.compareTo(a.views));
    if (genre != null && genre.isNotEmpty) {
      return result
          .where((w) => w.genre.toLowerCase() == genre.toLowerCase())
          .toList();
    }
    return result;
  }

  Future<Work?> getWork(String id) async {
    final headers = <String, String>{};
    final auth = _authHeader();
    if (auth.isNotEmpty) headers['Authorization'] = auth;
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/works/$id');
    final res = await http.get(uri, headers: headers);
    if (res.statusCode != 200) return null;
    final doc = jsonDecode(res.body) as Map<String, dynamic>;
    final idName = doc['name'].toString().split('/').last;
    final fields = (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {};
    return Work.fromFirestore(idName, fields);
  }

  Future<List<Chapter>> fetchChapters(String workId) async {
    final headers = <String, String>{};
    final auth = _authHeader();
    if (auth.isNotEmpty) headers['Authorization'] = auth;
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/works/$workId/chapters');
    final res = await http.get(uri, headers: headers);
    if (res.statusCode != 200) return [];
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final docs = body['documents'] as List? ?? [];
    final result = <Chapter>[];
    for (final d in docs) {
      final doc = d as Map<String, dynamic>;
      final id = doc['name'].toString().split('/').last;
      final fields = (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {};
      result.add(Chapter.fromFirestore(id, workId, fields));
    }
    result.sort((a, b) => a.number.compareTo(b.number));
    return result;
  }
}
