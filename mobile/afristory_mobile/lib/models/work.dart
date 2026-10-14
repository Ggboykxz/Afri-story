class Work {
  final String id;
  final String title;
  final String authorName;
  final String description;
  final String? coverUrl;
  final String type;
  final bool isPremium;
  final int views;
  final int likes;
  final String status;
  final String genre;

  Work({
    required this.id,
    required this.title,
    required this.authorName,
    required this.description,
    this.coverUrl,
    this.type = 'webtoon',
    this.isPremium = false,
    this.views = 0,
    this.likes = 0,
    this.status = 'published',
    this.genre = '',
  });

  factory Work.fromFirestore(String id, Map<String, dynamic> f) {
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

    return Work(
      id: id,
      title: pickString('title', 'Sans titre'),
      authorName: pickString('authorName', pickString('author', 'Auteur')),
      description: pickString('description'),
      coverUrl: pickString('coverUrl', pickString('coverURL')),
      type: pickString('type', 'webtoon'),
      isPremium: pickBool('isPremium'),
      views: pickInt('views'),
      likes: pickInt('likes'),
      status: pickString('status', 'published'),
      genre: pickString('genre', pickString('category')),
    );
  }
}
