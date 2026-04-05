class Player {
  final int id;
  final String firstName;
  final String lastName;
  final int? positionId;
  final Position? position;
  final int goals;
  final int assists;
  final int matches;
  final DateTime createdAt;
  final DateTime updatedAt;

  Player({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.positionId,
    this.position,
    required this.goals,
    required this.assists,
    required this.matches,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      positionId: json['positionId'],
      position: json['position'] != null ? Position.fromJson(json['position']) : null,
      goals: json['goals'],
      assists: json['assists'],
      matches: json['matches'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'positionId': positionId,
      'position': position?.toJson(),
      'goals': goals,
      'assists': assists,
      'matches': matches,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class Position {
  final int id;
  final String? name;

  Position({
    required this.id,
    this.name,
  });

  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(
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