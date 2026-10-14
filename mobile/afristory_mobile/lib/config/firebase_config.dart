class FirebaseConfig {
  static const projectId = 'gen-lang-client-0232154573';
  static const apiKey = 'AIzaSyCEBDUcKFxxDofQU7eHOrCHjtgck5wWOnU';
  static const databaseId = 'ai-studio-49b28ffa-c91b-44c1-824b-ec04ee3e12d3';
  static const authDomain = 'gen-lang-client-0232154573.firebaseapp.com';
  static const storageBucket = 'gen-lang-client-0232154573.firebasestorage.app';

  static String authUrl(String endpoint) =>
      'https://identitytoolkit.googleapis.com/v1/$endpoint?key=$apiKey';

  static String secureTokenUrl() =>
      'https://securetoken.googleapis.com/v1/token?key=$apiKey';

  static String firestoreBase() =>
      'https://firestore.googleapis.com/v1/projects/$projectId/databases/$databaseId/documents';

  static String storageBase() =>
      'https://firebasestorage.googleapis.com/v0/b/$storageBucket/o';
}
