class PlayerStats {
  final int playerId;
  final int goals;
  final int assists;
  final int matches;

  PlayerStats({
    required this.playerId,
    required this.goals,
    required this.assists,
    required this.matches,
  });

  factory PlayerStats.fromJson(Map<String, dynamic> json) {
    return PlayerStats(
      playerId: json['playerId'],
      goals: json['goals'],
      assists: json['assists'],
      matches: json['matches'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'playerId': playerId,
      'goals': goals,
      'assists': assists,
      'matches': matches,
    };
  }
}