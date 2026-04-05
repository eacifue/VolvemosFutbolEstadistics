// DTOs for API requests

class CreateMatchDto {
  final DateTime matchDate;
  final int homeTeamId;
  final int awayTeamId;
  final List<CreateMatchPlayerDto> matchPlayers;

  CreateMatchDto({
    required this.matchDate,
    required this.homeTeamId,
    required this.awayTeamId,
    required this.matchPlayers,
  });

  Map<String, dynamic> toJson() {
    return {
      'matchDate': matchDate.toIso8601String(),
      'homeTeamId': homeTeamId,
      'awayTeamId': awayTeamId,
      'matchPlayers': matchPlayers.map((e) => e.toJson()).toList(),
    };
  }
}

class CreateMatchPlayerDto {
  final int playerId;
  final int teamId;

  CreateMatchPlayerDto({
    required this.playerId,
    required this.teamId,
  });

  Map<String, dynamic> toJson() {
    return {
      'playerId': playerId,
      'teamId': teamId,
    };
  }
}

class UpdateMatchDto {
  final DateTime? matchDate;
  final int? homeTeamId;
  final int? awayTeamId;

  UpdateMatchDto({
    this.matchDate,
    this.homeTeamId,
    this.awayTeamId,
  });

  Map<String, dynamic> toJson() {
    return {
      'matchDate': matchDate?.toIso8601String(),
      'homeTeamId': homeTeamId,
      'awayTeamId': awayTeamId,
    };
  }
}