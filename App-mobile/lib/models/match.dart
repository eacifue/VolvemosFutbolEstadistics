import 'player.dart';

class Match {
  final int id;
  final DateTime matchDate;
  final int? homeTeamId;
  final int? awayTeamId;
  final Team? homeTeam;
  final Team? awayTeam;
  final List<MatchPlayer> matchPlayers;
  final List<MatchEvent> events;
  final DateTime createdAt;
  final DateTime updatedAt;

  Match({
    required this.id,
    required this.matchDate,
    this.homeTeamId,
    this.awayTeamId,
    this.homeTeam,
    this.awayTeam,
    required this.matchPlayers,
    required this.events,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      id: json['id'],
      matchDate: DateTime.parse(json['matchDate']),
      homeTeamId: json['homeTeamId'],
      awayTeamId: json['awayTeamId'],
      homeTeam: json['homeTeam'] != null ? Team.fromJson(json['homeTeam']) : null,
      awayTeam: json['awayTeam'] != null ? Team.fromJson(json['awayTeam']) : null,
      matchPlayers: (json['matchPlayers'] as List<dynamic>?)
          ?.map((e) => MatchPlayer.fromJson(e))
          .toList() ?? [],
      events: (json['events'] as List<dynamic>?)
          ?.map((e) => MatchEvent.fromJson(e))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'matchDate': matchDate.toIso8601String(),
      'homeTeamId': homeTeamId,
      'awayTeamId': awayTeamId,
      'homeTeam': homeTeam?.toJson(),
      'awayTeam': awayTeam?.toJson(),
      'matchPlayers': matchPlayers.map((e) => e.toJson()).toList(),
      'events': events.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class Team {
  final int id;
  final String name;
  final String color;
  final int matchesPlayed;
  final int wins;
  final int draws;
  final int losses;
  final int goalsFor;
  final int goalsAgainst;
  final DateTime createdAt;
  final DateTime updatedAt;

  Team({
    required this.id,
    required this.name,
    required this.color,
    required this.matchesPlayed,
    required this.wins,
    required this.draws,
    required this.losses,
    required this.goalsFor,
    required this.goalsAgainst,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      id: json['id'],
      name: json['name'],
      color: json['color'],
      matchesPlayed: json['matchesPlayed'],
      wins: json['wins'],
      draws: json['draws'],
      losses: json['losses'],
      goalsFor: json['goalsFor'],
      goalsAgainst: json['goalsAgainst'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'matchesPlayed': matchesPlayed,
      'wins': wins,
      'draws': draws,
      'losses': losses,
      'goalsFor': goalsFor,
      'goalsAgainst': goalsAgainst,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class MatchPlayer {
  final int id;
  final int matchId;
  final int playerId;
  final Player player;
  final int teamId; // 1 = home, 2 = away
  final DateTime createdAt;

  MatchPlayer({
    required this.id,
    required this.matchId,
    required this.playerId,
    required this.player,
    required this.teamId,
    required this.createdAt,
  });

  factory MatchPlayer.fromJson(Map<String, dynamic> json) {
    return MatchPlayer(
      id: json['id'],
      matchId: json['matchId'],
      playerId: json['playerId'],
      player: Player.fromJson(json['player']),
      teamId: json['teamId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'matchId': matchId,
      'playerId': playerId,
      'player': player.toJson(),
      'teamId': teamId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class MatchEvent {
  final int id;
  final int matchId;
  final int playerId;
  final Player player;
  final int eventTypeId;
  final EventType? eventType;
  final int teamId;
  final DateTime createdAt;

  MatchEvent({
    required this.id,
    required this.matchId,
    required this.playerId,
    required this.player,
    required this.eventTypeId,
    this.eventType,
    required this.teamId,
    required this.createdAt,
  });

  factory MatchEvent.fromJson(Map<String, dynamic> json) {
    return MatchEvent(
      id: json['id'],
      matchId: json['matchId'],
      playerId: json['playerId'],
      player: Player.fromJson(json['player']),
      eventTypeId: json['eventTypeId'],
      eventType: json['eventType'] != null ? EventType.fromJson(json['eventType']) : null,
      teamId: json['teamId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'matchId': matchId,
      'playerId': playerId,
      'player': player.toJson(),
      'eventTypeId': eventTypeId,
      'eventType': eventType?.toJson(),
      'teamId': teamId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class EventType {
  final int id;
  final String? name;

  EventType({
    required this.id,
    this.name,
  });

  factory EventType.fromJson(Map<String, dynamic> json) {
    return EventType(
      id: json['id'],
      name: json['name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}