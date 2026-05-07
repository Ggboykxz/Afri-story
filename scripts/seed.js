import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = getFirestore(config.firestoreDatabaseId);

const SAMPLE_WORKS = [
  { title: 'Les Gardiens du Sahel', description: 'Aventure épique au Sahara', author: 'Moussa Artiste', authorId: 'sample_artist_1', type: 'WEBTOON', category: 'Action', status: 'published', isPro: true, views: 15420, likes: 892 },

  { title: "L'Amour à Lagos", description: 'Romance moderne à Lagos', author: 'Ada Beauty', authorId: 'sample_artist_2', type: 'WEBTOON', category: 'Romance', status: 'published', isPro: true, views: 23450, likes: 1234 },

  { title: 'Les Mystères d\'Abidjan', description: 'Thriller à Abidjan', author: 'Koffi Writer', authorId: 'sample_artist_3', type: 'BD', category: 'Mystère', status: 'published', isPro: false, views: 8750, likes: 445 },

  { title: 'Yoruba Tales', description: 'Contes traditionnels yoruba', author: 'Olumide Art', authorId: 'sample_artist_4', type: 'ROMAN', category: 'Historique', status: 'published', isPro: false, views: 12300, likes: 678 },

  { title: 'Cyber Kumasi', description: 'Sci-Fi à Kumasi', author: 'Kwame Tech', authorId: 'sample_artist_5', type: 'WEBTOON', category: 'Sci-Fi', status: 'published', isPro: true, views: 18900, likes: 956 },

  { title: 'Roots & Routes', description: 'Histoire de immigration', author: 'Fatou Story', authorId: 'sample_artist_6', type: 'ROMAN', category: 'Historique', status: 'published', isPro: false, views: 9800, likes: 534 },

  { title: 'Sunu Story', description: 'Vie quotidienne au Sénégal', author: 'Mamadou Photo', authorId: 'sample_artist_7', type: 'BD', category: 'Slice of Life', status: 'published', isPro: false, views: 6540, likes: 321 },

  { title: 'Dragon de Atlas', description: 'Dragon au Maroc', author: 'Hicham Art', authorId: 'sample_artist_8', type: 'WEBTOON', category: 'Fantaisie', status: 'published', isPro: true, views: 22100, likes: 1567 }
];

const SAMPLE_USERS = [
  { userId: 'sample_artist_1', email: 'moussa@example.com', displayName: 'Moussa Artiste', role: 'artist_pro', afriCoins: 500 },
  { userId: 'sample_artist_2', email: 'ada@example.com', displayName: 'Ada Beauty', role: 'artist_pro', afriCoins: 320 },
  { userId: 'sample_artist_3', email: 'koffi@example.com', displayName: 'Koffi Writer', role: 'artist_draft', afriCoins: 50 },
  { userId: 'sample_artist_4', email: 'olumide@example.com', displayName: 'Olumide Art', role: 'artist_draft', afriCoins: 45 },
  { userId: 'sample_artist_5', email: 'kwame@example.com', displayName: 'Kwame Tech', role: 'artist_pro', afriCoins: 780 },
  { userId: 'sample_artist_6', email: 'fatou@example.com', displayName: 'Fatou Story', role: 'reader', afriCoins: 100 },
  { userId: 'sample_artist_7', email: 'mamadou@example.com', displayName: 'Mamadou Photo', role: 'reader', afriCoins: 25 },
  { userId: 'sample_artist_8', email: 'hicham@example.com', displayName: 'Hicham Art', role: 'artist_pro', afriCoins: 1200 },
];

const FORUM_CATEGORIES = [
  { id: 'webtoons', name: 'Webtoons & BD', description: 'Discutez de vos œuvres préférées', topicCount: 156 },
  { id: 'artists', name: 'Espace Artistes', description: 'Partagez vos techniques', topicCount: 89 },
  { id: 'theories', name: 'Théories & Lore', description: 'Partagez vos théories', topicCount: 234 },
  { id: 'general', name: 'Général', description: 'Pour tout le reste', topicCount: 312 },
];

async function seed() {
  console.log('Seeding AfriStory...');
  
  for (const user of SAMPLE_USERS) {
    await setDoc(doc(db, 'users', user.userId), { ...user, badges: [], createdAt: new Date(), following: [], favorites: [] });
    console.log('User:', user.displayName);
  }

  for (const work of SAMPLE_WORKS) {
    await addDoc(collection(db, 'works'), { ...work, createdAt: new Date() });
    console.log('Work:', work.title);
  }

  for (const cat of FORUM_CATEGORIES) {
    await setDoc(doc(db, 'forum_categories', cat.id), cat);
    console.log('Category:', cat.name);
  }

  console.log('Done!');
}

seed().catch(console.error);