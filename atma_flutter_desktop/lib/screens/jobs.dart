import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class Jobs extends StatelessWidget {
  const Jobs({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: FirebaseFirestore.instance.collection('jobs').snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return CircularProgressIndicator();

        var docs = snapshot.data!.docs;

        return ListView(
          children: docs.map((doc) => ListTile(
            title: Text(doc['title']),
            subtitle: Text("${doc['budget']} جنيه"),
          )).toList(),
        );
      },
    );
  }
}