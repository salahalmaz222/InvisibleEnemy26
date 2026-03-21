import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final db = FirebaseFirestore.instance;

  Future addCourse() async {
    await db.collection('courses').add({
      "title": "تعلم MERN",
      "level": "متوسط"
    });
  }

  Future addJob() async {
    await db.collection('jobs').add({
      "title": "Flutter Developer",
      "budget": 3000
    });
  }
}