import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../models/player.dart';
import '../widgets/player_card.dart';

class PlayersScreen extends StatefulWidget {
  const PlayersScreen({super.key});

  @override
  State<PlayersScreen> createState() => _PlayersScreenState();
}

class _PlayersScreenState extends State<PlayersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataProvider>().loadPlayers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DataProvider>();
    final players = provider.players;

    if (provider.isLoading) {
      return const SafeArea(
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (provider.error != null) {
      return SafeArea(
        child: Center(child: Text('Error: ${provider.error}')),
      );
    }

    return SafeArea(
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: players.length,
        itemBuilder: (context, index) {
          final player = players[index];
          return PlayerCard(player: player);
        },
      ),
    );
  }
}