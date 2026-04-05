import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../models/player.dart';
import '../widgets/player_card.dart';

class ManagePlayersScreen extends StatefulWidget {
  const ManagePlayersScreen({super.key});

  @override
  State<ManagePlayersScreen> createState() => _ManagePlayersScreenState();
}

class _ManagePlayersScreenState extends State<ManagePlayersScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  int? _selectedPositionId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataProvider>().loadPlayers();
    });
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  void _showCreatePlayerDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Player'),
        content: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _firstNameController,
                decoration: const InputDecoration(labelText: 'First Name'),
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              TextFormField(
                controller: _lastNameController,
                decoration: const InputDecoration(labelText: 'Last Name'),
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              // For simplicity, omit position selection
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: _createPlayer,
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _createPlayer() {
    if (_formKey.currentState?.validate() ?? false) {
      final player = Player(
        id: 0, // Will be set by backend
        firstName: _firstNameController.text,
        lastName: _lastNameController.text,
        positionId: _selectedPositionId,
        goals: 0,
        assists: 0,
        matches: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      context.read<DataProvider>().createPlayer(player);
      _firstNameController.clear();
      _lastNameController.clear();
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DataProvider>();
    final players = provider.players;

    return Scaffold(
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.error != null
              ? Center(child: Text('Error: ${provider.error}'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: players.length,
                  itemBuilder: (context, index) {
                    final player = players[index];
                    return Dismissible(
                      key: Key(player.id.toString()),
                      direction: DismissDirection.endToStart,
                      background: Container(
                        color: Colors.red,
                        alignment: Alignment.centerRight,
                        padding: const EdgeInsets.only(right: 16),
                        child: const Icon(Icons.delete, color: Colors.white),
                      ),
                      onDismissed: (direction) {
                        provider.deletePlayer(player.id);
                      },
                      child: PlayerCard(player: player),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreatePlayerDialog,
        backgroundColor: const Color(0xFF0B3D2E),
        child: const Icon(Icons.add),
      ),
    );
  }
}