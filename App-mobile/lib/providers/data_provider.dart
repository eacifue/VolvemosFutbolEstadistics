import 'package:flutter/material.dart';
import '../models/player.dart';
import '../models/match.dart';
import '../models/player_stats.dart';
import '../models/dtos.dart';
import '../services/api_service.dart';

class DataProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Player> _players = [];
  List<Match> _matches = [];
  List<PlayerStats> _playerStats = [];
  bool _isLoading = false;
  String? _error;

  List<Player> get players => _players;
  List<Match> get matches => _matches;
  List<PlayerStats> get playerStats => _playerStats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Players
  Future<void> loadPlayers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _players = await _apiService.getPlayers();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createPlayer(Player player) async {
    try {
      final newPlayer = await _apiService.createPlayer(player);
      _players.add(newPlayer);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updatePlayer(int id, Player player) async {
    try {
      final updatedPlayer = await _apiService.updatePlayer(id, player);
      final index = _players.indexWhere((p) => p.id == id);
      if (index != -1) {
        _players[index] = updatedPlayer;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> deletePlayer(int id) async {
    try {
      await _apiService.deletePlayer(id);
      _players.removeWhere((p) => p.id == id);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Matches
  Future<void> loadMatches() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _matches = await _apiService.getMatches();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createMatch(CreateMatchDto dto) async {
    try {
      final newMatch = await _apiService.createMatch(dto);
      _matches.add(newMatch);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateMatch(int id, UpdateMatchDto dto) async {
    try {
      final updatedMatch = await _apiService.updateMatch(id, dto);
      final index = _matches.indexWhere((m) => m.id == id);
      if (index != -1) {
        _matches[index] = updatedMatch;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteMatch(int id) async {
    try {
      await _apiService.deleteMatch(id);
      _matches.removeWhere((m) => m.id == id);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Player Stats
  Future<void> loadPlayerStats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _playerStats = await _apiService.getAllPlayersStats();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Home screen combined loader
  Future<void> loadHomeData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _apiService.getMatches(),
        _apiService.getPlayers(),
        _apiService.getAllPlayersStats(),
      ]);

      _matches = results[0] as List<Match>;
      _players = results[1] as List<Player>;
      _playerStats = results[2] as List<PlayerStats>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}