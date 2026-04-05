import 'package:dio/dio.dart';
import '../models/player.dart';
import '../models/match.dart';
import '../models/player_stats.dart';
import '../models/dtos.dart';

class ApiService {
  final Dio _dio;

  ApiService()
      : _dio = Dio(
          BaseOptions(
            baseUrl: 'http://10.0.2.2:5186/api', // Use host IP for web app
            connectTimeout: const Duration(seconds: 5),
            receiveTimeout: const Duration(seconds: 5),
          ),
        );

  // Players
  Future<List<Player>> getPlayers() async {
    final response = await _dio.get('/players');
    return (response.data as List).map((json) => Player.fromJson(json)).toList();
  }

  Future<Player> getPlayer(int id) async {
    final response = await _dio.get('/players/$id');
    return Player.fromJson(response.data);
  }

  Future<Player> createPlayer(Player player) async {
    final response = await _dio.post('/players', data: player.toJson());
    return Player.fromJson(response.data);
  }

  Future<Player> updatePlayer(int id, Player player) async {
    final response = await _dio.put('/players/$id', data: player.toJson());
    return Player.fromJson(response.data);
  }

  Future<void> deletePlayer(int id) async {
    await _dio.delete('/players/$id');
  }

  Future<List<PlayerStats>> getAllPlayersStats() async {
    final response = await _dio.get('/players/stats');
    return (response.data as List).map((json) => PlayerStats.fromJson(json)).toList();
  }

  Future<PlayerStats> getPlayerStats(int id) async {
    final response = await _dio.get('/players/$id/stats');
    return PlayerStats.fromJson(response.data);
  }

  // Matches
  Future<List<Match>> getMatches() async {
    final response = await _dio.get('/matches');
    return (response.data as List).map((json) => Match.fromJson(json)).toList();
  }

  Future<Match> getMatch(int id) async {
    final response = await _dio.get('/matches/$id');
    return Match.fromJson(response.data);
  }

  Future<Match> createMatch(CreateMatchDto dto) async {
    final response = await _dio.post('/matches', data: dto.toJson());
    return Match.fromJson(response.data);
  }

  Future<Match> updateMatch(int id, UpdateMatchDto dto) async {
    final response = await _dio.put('/matches/$id', data: dto.toJson());
    return Match.fromJson(response.data);
  }

  Future<void> deleteMatch(int id) async {
    await _dio.delete('/matches/$id');
  }

  // Match Players
  Future<List<MatchPlayer>> getMatchPlayers(int matchId) async {
    final response = await _dio.get('/matchplayers/match/$matchId');
    return (response.data as List).map((json) => MatchPlayer.fromJson(json)).toList();
  }

  Future<MatchPlayer> addPlayerToMatch(MatchPlayer matchPlayer) async {
    final response = await _dio.post('/matchplayers', data: matchPlayer.toJson());
    return MatchPlayer.fromJson(response.data);
  }

  Future<void> removePlayerFromMatch(int matchId, int playerId) async {
    await _dio.delete('/matchplayers/$matchId/$playerId');
  }

  // Match Events
  Future<List<MatchEvent>> getMatchEvents(int matchId) async {
    final response = await _dio.get('/matchevents/match/$matchId');
    return (response.data as List).map((json) => MatchEvent.fromJson(json)).toList();
  }

  Future<MatchEvent> createMatchEvent(MatchEvent event) async {
    final response = await _dio.post('/matchevents', data: event.toJson());
    return MatchEvent.fromJson(response.data);
  }

  Future<MatchEvent> updateMatchEvent(int id, MatchEvent event) async {
    final response = await _dio.put('/matchevents/$id', data: event.toJson());
    return MatchEvent.fromJson(response.data);
  }

  Future<void> deleteMatchEvent(int id) async {
    await _dio.delete('/matchevents/$id');
  }

  Future<void> deleteMatchEvents(int matchId) async {
    await _dio.delete('/matchevents/match/$matchId');
  }
}