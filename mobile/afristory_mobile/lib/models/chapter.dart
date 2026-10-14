class Chapter {
  final String id;
  final String workId;
  final int number;
  final String title;
  final List<String> pages;
  final bool isPremium;

  Chapter({
    required this.id,
    required this.workId,
    required this.number,
    required this.title,
    this.pages = const [],
    this.isPremium = false,
  });

  factory Chapter.fromFirestore(String id, String workId, Map<String, dynamic> f) {
    String pickString(String key, [String fallback = '']) {
      final v = f[key];
      if (v == null) return fallback;
      if (v is Map && v['stringValue'] != null) return v['stringValue'] as String;
      return v.toString();
    }
    int pickInt(String key, [int fallback = 0]) {
      final v = f[key];
      if (v == null) return fallback;
      if (v is Map && v['integerValue'] != null) return int.tryParse(v['integerValue'].toString()) ?? fallback;
      return int.tryParse(v.toString()) ?? fallback;
    }
    bool pickBool(String key, [bool fallback = false]) {
      final v = f[key];
      if (v == null) return fallback;
      if (v is Map && v['booleanValue'] != null) return v['booleanValue'] == true;
      return v.toString().toLowerCase() == 'true';
    }
    List<String> pickStringArray(String key) {
      final v = f[key];
      if (v == null) return const [];
      if (v is Map && v['arrayValue'] != null) {
        final values = v['arrayValue']['values'] as List? ?? const [];
        return values
            .map((e) {
              if (e is Map && e['stringValue'] != null) return e['stringValue'] as String;
              return e.toString();
            })
            .toList();
      }
      return const [];
    }

    return Chapter(
      id: id,
      workId: workId,
      number: pickInt('number', 1),
      title: pickString('title', 'Chapitre $id'),
      pages: pickStringArray('pages').isNotEmpty
          ? pickStringArray('pages')
          : pickStringArray('images'),
      isPremium: pickBool('isPremium'),
    );
  }
}
