import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/data_provider.dart';
import '../models/match.dart';
import '../models/player.dart';
import '../services/api_service.dart';
import '../models/dtos.dart';

class ManageMatchesScreen extends StatefulWidget {
  const ManageMatchesScreen({super.key});

  @override
  State<ManageMatchesScreen> createState() => _ManageMatchesScreenState();
}

class _ManageMatchesScreenState extends State<ManageMatchesScreen> {
  final _apiService = ApiService();
  List<Match> _matches = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadMatches();
  }

  Future<void> _loadMatches() async {
    setState(() => _isLoading = true);
    try {
      _matches = await _apiService.getMatches();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading matches: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showCreateMatchDialog() {
    showDialog(
      context: context,
      builder: (context) => const CreateMatchDialog(),
    ).then((_) => _loadMatches());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _matches.length,
              itemBuilder: (context, index) {
                final match = _matches[index];
                return MatchCard(match: match, onUpdate: _loadMatches);
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateMatchDialog,
        backgroundColor: const Color(0xFF0B3D2E),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class CreateMatchDialog extends StatefulWidget {
  const CreateMatchDialog({super.key});

  @override
  State<CreateMatchDialog> createState() => _CreateMatchDialogState();
}

class _CreateMatchDialogState extends State<CreateMatchDialog> {
  final _formKey = GlobalKey<FormState>();
  DateTime _selectedDate = DateTime.now();
  int? _homeTeamId;
  int? _awayTeamId;
  List<int> _whiteTeamPlayers = [];
  List<int> _blackTeamPlayers = [];

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DataProvider>();
    final players = provider.players;

    return AlertDialog(
      title: const Text('Create Match'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text(DateFormat('yyyy-MM-dd').format(_selectedDate)),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (date != null) {
                    setState(() => _selectedDate = date);
                  }
                },
              ),
              // For simplicity, assume teams are fixed or selected from a list
              // Here, I'll use dummy team IDs
              const Text('Home Team: White (ID: 1)'),
              const Text('Away Team: Black (ID: 2)'),
              const SizedBox(height: 16),
              const Text('Assign Players to White Team:'),
              Wrap(
                children: players.map((player) {
                  final isSelected = _whiteTeamPlayers.contains(player.id);
                  return FilterChip(
                    label: Text('${player.firstName} ${player.lastName}'),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _whiteTeamPlayers.add(player.id);
                          _blackTeamPlayers.remove(player.id);
                        } else {
                          _whiteTeamPlayers.remove(player.id);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              const Text('Assign Players to Black Team:'),
              Wrap(
                children: players.map((player) {
                  final isSelected = _blackTeamPlayers.contains(player.id);
                  return FilterChip(
                    label: Text('${player.firstName} ${player.lastName}'),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _blackTeamPlayers.add(player.id);
                          _whiteTeamPlayers.remove(player.id);
                        } else {
                          _blackTeamPlayers.remove(player.id);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _createMatch,
          child: const Text('Create'),
        ),
      ],
    );
  }

  void _createMatch() async {
    if (_formKey.currentState?.validate() ?? false) {
      final dto = CreateMatchDto(
        matchDate: _selectedDate,
        homeTeamId: 1, // White
        awayTeamId: 2, // Black
        matchPlayers: [
          ..._whiteTeamPlayers.map((id) => CreateMatchPlayerDto(playerId: id, teamId: 1)),
          ..._blackTeamPlayers.map((id) => CreateMatchPlayerDto(playerId: id, teamId: 2)),
        ],
      );
      try {
        await ApiService().createMatch(dto);
        Navigator.of(context).pop();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating match: $e')),
        );
      }
    }
  }
}

class MatchCard extends StatelessWidget {
  final Match match;
  final VoidCallback onUpdate;

  const MatchCard({super.key, required this.match, required this.onUpdate});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              DateFormat('yyyy-MM-dd').format(match.matchDate),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0B3D2E),
              ),
            ),
            const SizedBox(height: 8),
            Text('Home: ${match.homeTeam?.name ?? 'Unknown'}'),
            Text('Away: ${match.awayTeam?.name ?? 'Unknown'}'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _showAddEventDialog(context, match.id, 1),
                    child: const Text('Add Home Event'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _showAddEventDialog(context, match.id, 2),
                    child: const Text('Add Away Event'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddEventDialog(BuildContext context, int matchId, int teamId) {
    showDialog(
      context: context,
      builder: (context) => AddEventDialog(matchId: matchId, teamId: teamId, onUpdate: onUpdate),
    );
  }
}

class AddEventDialog extends StatefulWidget {
  final int matchId;
  final int teamId;
  final VoidCallback onUpdate;

  const AddEventDialog({
    super.key,
    required this.matchId,
    required this.teamId,
    required this.onUpdate,
  });

  @override
  State<AddEventDialog> createState() => _AddEventDialogState();
}

class _AddEventDialogState extends State<AddEventDialog> {
  int? _selectedPlayerId;
  int? _selectedEventTypeId; // 1 = Goal, 2 = Assist

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DataProvider>();
    final players = provider.players;

    return AlertDialog(
      title: const Text('Add Match Event'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<int>(
            value: _selectedPlayerId,
            items: players.map((player) {
              return DropdownMenuItem(
                value: player.id,
                child: Text('${player.firstName} ${player.lastName}'),
              );
            }).toList(),
            onChanged: (value) => setState(() => _selectedPlayerId = value),
            decoration: const InputDecoration(labelText: 'Player'),
          ),
          DropdownButtonFormField<int>(
            value: _selectedEventTypeId,
            items: const [
              DropdownMenuItem(value: 1, child: Text('Goal')),
              DropdownMenuItem(value: 2, child: Text('Assist')),
            ],
            onChanged: (value) => setState(() => _selectedEventTypeId = value),
            decoration: const InputDecoration(labelText: 'Event Type'),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _addEvent,
          child: const Text('Add'),
        ),
      ],
    );
  }

  void _addEvent() async {
    if (_selectedPlayerId != null && _selectedEventTypeId != null) {
      final event = MatchEvent(
        id: 0,
        matchId: widget.matchId,
        playerId: _selectedPlayerId!,
        player: Player(id: _selectedPlayerId!, firstName: '', lastName: '', goals: 0, assists: 0, matches: 0, createdAt: DateTime.now(), updatedAt: DateTime.now()), // Dummy
        eventTypeId: _selectedEventTypeId!,
        teamId: widget.teamId,
        createdAt: DateTime.now(),
      );
      try {
        await ApiService().createMatchEvent(event);
        widget.onUpdate();
        Navigator.of(context).pop();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding event: $e')),
        );
      }
    }
  }
}