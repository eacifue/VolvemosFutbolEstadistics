import 'package:flutter/material.dart';
import 'manage_matches_screen.dart';
import 'manage_players_screen.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Container(
            color: const Color(0xFF0B3D2E),
            child: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Manage Matches'),
                Tab(text: 'Manage Players'),
              ],
              indicatorColor: const Color(0xFFD4AF37),
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: const [
                ManageMatchesScreen(),
                ManagePlayersScreen(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}