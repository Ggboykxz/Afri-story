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

  Map<String, String> _headers() {
    final h = <String, String>{'Content-Type': 'application/json'};
    final auth = _authHeader();
    if (auth.isNotEmpty) h['Authorization'] = auth;
    return h;
  }

  Future<List<Work>> fetchWorks({int limit = 60, String? genre}) async {
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/works?pageSize=$limit');
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode != 200) return [];
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final docs = body['documents'] as List? ?? [];
    final result = <Work>[];
    for (final d in docs) {
      final doc = d as Map<String, dynamic>;
      final id = doc['name'].toString().split('/').last;
      final fields = (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {};
      final work = Work.fromFirestore(id, fields);
      if (work.status.isEmpty || work.status == 'published' || work.status == 'completed') {
        if (genre == null || genre.isEmpty || work.genre.toLowerCase() == genre.toLowerCase()) {
          result.add(work);
        }
      }
    }
    result.sort((a, b) => b.views.compareTo(a.views));
    return result;
  }

  Future<Work?> getWork(String id) async {
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/works/$id');
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode != 200) return null;
    final doc = jsonDecode(res.body) as Map<String, dynamic>;
    final fields = (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {};
    return Work.fromFirestore(id, fields);
  }

  Future<List<Chapter>> fetchChapters(String workId) async {
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/works/$workId/chapters?pageSize=100');
    final res = await http.get(uri, headers: _headers());
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

  // ---- User profile helpers ----

  dynamic _decodeValue(dynamic v) {
    if (v is! Map) return v;
    if (v['stringValue'] != null) return v['stringValue'];
    if (v['integerValue'] != null) return int.tryParse(v['integerValue'].toString()) ?? 0;
    if (v['doubleValue'] != null) return v['doubleValue'];
    if (v['booleanValue'] != null) return v['booleanValue'] == true;
    if (v['timestampValue'] != null) return v['timestampValue'];
    if (v['nullValue'] != null) return null;
    if (v['arrayValue'] != null) {
      final values = v['arrayValue']['values'] as List? ?? [];
      return values.map(_decodeValue).toList();
    }
    if (v['mapValue'] != null) {
      final fields = v['mapValue']['fields'] as Map? ?? {};
      return _decodeFields(fields.cast<String, dynamic>());
    }
    return v.toString();
  }

  Map<String, dynamic> _decodeFields(Map<String, dynamic> fields) {
    return fields.map((k, v) => MapEntry(k, _decodeValue(v)));
  }

  Future<Map<String, dynamic>?> getUser(String uid) async {
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/users/$uid');
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode != 200) return null;
    final doc = jsonDecode(res.body) as Map<String, dynamic>;
    final fields = (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {};
    return _decodeFields(fields);
  }

  Future<void> ensureUser(String uid, String email, String displayName) async {
    final existing = await getUser(uid);
    if (existing != null) return;
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/users?documentId=$uid');
    final res = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({
        'fields': _encodeFields({
          'userId': uid,
          'email': email,
          'displayName': displayName,
          'photoURL': '',
          'coverURL': '',
          'role': 'reader',
          'afriCoins': 100,
          'badges': <String>[],
          'following': <String>[],
          'favorites': <String>[],
          'createdAt': DateTime.now().toUtc().toIso8601String(),
          'bio': '',
        })
      }),
    );
    // best effort
  }

  Future<void> updateUser(String uid, Map<String, dynamic> updates) async {
    final fields = _encodeFields(updates);
    final mask = updates.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/users/$uid?$mask');
    await http.patch(uri, headers: _headers(), body: jsonEncode({'fields': fields}));
  }

  Future<List<Work>> fetchFavorites(String uid) async {
    final user = await getUser(uid);
    final ids = (user?['favorites'] as List?)?.cast<String>() ?? <String>[];
    final result = <Work>[];
    for (final id in ids) {
      final w = await getWork(id);
      if (w != null) result.add(w);
    }
    return result;
  }

  Future<void> toggleFavorite(String uid, String workId, bool add) async {
    final user = await getUser(uid);
    final favs = ((user?['favorites'] as List?)?.cast<String>() ?? <String>[]).toSet();
    if (add) favs.add(workId); else favs.remove(workId);
    await updateUser(uid, {'favorites': favs.toList()});
  }

  Future<List<Work>> fetchReadingHistory(String uid) async {
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/users/$uid/reading_history?pageSize=30');
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode != 200) return [];
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final docs = body['documents'] as List? ?? [];
    final ids = docs.map((d) => (d as Map)['name'].toString().split('/').last).toList();
    final result = <Work>[];
    for (final id in ids) {
      final w = await getWork(id);
      if (w != null) result.add(w);
    }
    return result;
  }

  Future<void> recordReading(String uid, String workId, int chapterNumber) async {
    final uri = Uri.parse('${FirebaseConfig.firestoreBase()}/users/$uid/reading_history?documentId=$workId');
    await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({
        'fields': _encodeFields({
          'workId': workId,
          'chapterNumber': chapterNumber,
          'lastReadAt': DateTime.now().toUtc().toIso8601String(),
        })
      }),
    );
  }

  // ---- encode helper ----

  Map<String, dynamic> _encodeFields(Map<String, dynamic> data) {
    final out = <String, dynamic>{};
    data.forEach((k, v) {
      if (v is String) out[k] = {'stringValue': v};
      else if (v is int) out[k] = {'integerValue': v.toString()};
      else if (v is double) out[k] = {'doubleValue': v};
      else if (v is bool) out[k] = {'booleanValue': v};
      else if (v is List) {
        out[k] = {'arrayValue': {'values': v.map((e) => _encodeScalar(e)).toList()}};
      } else if (v == null) {
        out[k] = {'nullValue': null};
      } else {
        out[k] = {'stringValue': v.toString()};
      }
    });
    return out;
  }

  Map<String, dynamic> _encodeScalar(dynamic v) {
    if (v is String) return {'stringValue': v};
    if (v is int) return {'integerValue': v.toString()};
    if (v is bool) return {'booleanValue': v};
    if (v is double) return {'doubleValue': v};
    return {'stringValue': v.toString()};
  }
}
