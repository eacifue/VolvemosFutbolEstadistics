import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/match.dart';
import '../models/player.dart';
import '../providers/data_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataProvider>().loadHomeData();
    });
  }

  String _cutString(String value, [int length = 20]) {
    if (value.length <= length) return value;
    return '${value.substring(0, length)}...';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DataProvider>();

    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.error != null) {
      return Center(child: Text('Error: ${provider.error}'));
    }

    final matches = provider.matches.toList()
      ..sort((a, b) => b.matchDate.compareTo(a.matchDate));
    final lastMatches = matches.take(3).toList();

    final players = provider.players;
    final playerStats = provider.playerStats;

    final topGoals = playerStats.toList()
      ..sort((a, b) => b.goals.compareTo(a.goals));
    final topAssists = playerStats.toList()
      ..sort((a, b) => b.assists.compareTo(a.assists));

    Player? findPlayer(int id) {
      try {
        return players.firstWhere((p) => p.id == id);
      } catch (_) {
        return null;
      }
    }

    final totalMatches = matches.length;
    int whiteWins = 0;
    int blackWins = 0;
    int whiteGoals = 0;
    int blackGoals = 0;

    for (final match in matches) {
      final home = _computeScore(match, true);
      final away = _computeScore(match, false);
      whiteGoals += home;
      blackGoals += away;
      if (home > away) {
        whiteWins++;
      } else if (away > home) {
        blackWins++;
      }
    }

    final whiteTeamName = matches.isNotEmpty ? (matches.first.homeTeam?.name ?? 'White') : 'White';
    final blackTeamName = matches.isNotEmpty ? (matches.first.awayTeam?.name ?? 'Black') : 'Black';

    return SafeArea(
    child : RefreshIndicator(
      onRefresh: provider.loadHomeData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            sectionTitle('Last Matches'),
            ...lastMatches.map((m) => MatchCard(
                  match: m,
                  homeTeamLabel: whiteTeamName,
                  awayTeamLabel: blackTeamName,
                  homeScore: _computeScore(m, true),
                  awayScore: _computeScore(m, false),
                )),
            const SizedBox(height: 16),

            sectionTitle('Top Players'),
            TopPlayersList(
              title: 'Top 3 Goals',
              players: topGoals.take(3).map((stat) {
                final player = findPlayer(stat.playerId);
                final name = player != null ? '${player.firstName} ${player.lastName}' : 'Unknown';
                return StatItem(name: _cutString(name), value: stat.goals.toString());
              }).toList(),
            ),
            const SizedBox(height: 12),
            TopPlayersList(
              title: 'Top 3 Assists',
              players: topAssists.take(3).map((stat) {
                final player = findPlayer(stat.playerId);
                final name = player != null ? '${player.firstName} ${player.lastName}' : 'Unknown';
                return StatItem(name: _cutString(name), value: stat.assists.toString());
              }).toList(),
            ),
            const SizedBox(height: 16),

            sectionTitle('Comparativa de Equipos'),
            TeamComparisonSection(
              whiteTeamName: whiteTeamName,
              blackTeamName: blackTeamName,
              totalMatches: totalMatches,
              whiteWins: whiteWins,
              blackWins: blackWins,
              draws: totalMatches - whiteWins - blackWins,
              whiteGoals: whiteGoals,
              blackGoals: blackGoals,
            ),
          ],
        ),
      ),
    ),
    );
  }

  int _computeScore(Match match, bool home) {
    final teamId = home ? match.homeTeamId : match.awayTeamId;
    if (teamId == null) return 0;
    final goals = match.events.where((event) {
      final type = event.eventType?.name?.toLowerCase() ?? '';
      return event.teamId == teamId && type.contains('gol');
    }).length;
    return goals;
  }

  Widget sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}

class MatchCard extends StatelessWidget {
  final Match match;
  final String homeTeamLabel;
  final String awayTeamLabel;
  final int homeScore;
  final int awayScore;

  const MatchCard({
    super.key,
    required this.match,
    required this.homeTeamLabel,
    required this.awayTeamLabel,
    required this.homeScore,
    required this.awayScore,
  });

  @override
  Widget build(BuildContext context) {
    // Compute variables at start of build
    final formatDate = _formatMatchDate(match.matchDate);
    
    final goalEvents = match.events.where((event) {
      final type = event.eventType?.name?.toLowerCase() ?? '';
      return type.contains('gol');
    }).toList();

    final assistEvents = match.events.where((event) {
      final type = event.eventType?.name?.toLowerCase() ?? '';
      return type.contains('asistencia') || type.contains('assist');
    }).toList();

    final homeGoals = goalEvents.where((e) => e.teamId == match.homeTeamId).toList();
    final awayGoals = goalEvents.where((e) => e.teamId == match.awayTeamId).toList();
    final homeAssists = assistEvents.where((e) => e.teamId == match.homeTeamId).toList();
    final awayAssists = assistEvents.where((e) => e.teamId == match.awayTeamId).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF172c22),
              const Color(0xFF1d3f30),
            ],
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
          border: Border.all(
            color: const Color(0xFFd4af37).withOpacity(0.15),
            width: 1,
          ),
        ),
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              MatchHeader(
                date: formatDate,
                homeTeamLabel: homeTeamLabel,
                awayTeamLabel: awayTeamLabel,
              ),
              const SizedBox(height: 16),
              ScoreSection(
                homeTeamLabel: homeTeamLabel,
                awayTeamLabel: awayTeamLabel,
                homeScore: homeScore,
                awayScore: awayScore,
              ),
              const SizedBox(height: 16),
              MatchEventsSection(
                homeTeamLabel: homeTeamLabel,
                awayTeamLabel: awayTeamLabel,
                homeGoals: homeGoals,
                awayGoals: awayGoals,
                homeAssists: homeAssists,
                awayAssists: awayAssists,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatMatchDate(DateTime date) {
    final local = date.toLocal();
    return '${local.day}/${local.month}/${local.year} - ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }
}

class EventList extends StatelessWidget {
  final List<MatchEvent> events;
  final int? homeTeamId;
  final int? awayTeamId;

  const EventList({super.key, required this.events, required this.homeTeamId, required this.awayTeamId});

  String _teamLabel(int teamId) {
    if (homeTeamId != null && teamId == homeTeamId) {
      return 'White';
    }
    if (awayTeamId != null && teamId == awayTeamId) {
      return 'Black';
    }
    return 'Unknown';
  }

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) {
      return const Text('No goals or assists for this match.', style: TextStyle(color: Colors.white70));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: events.map((event) {
        final type = event.eventType?.name ?? 'Event';
        final name = '${event.player.firstName} ${event.player.lastName}';
        final teamLabel = _teamLabel(event.teamId);

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 2.0),
          child: Text(
            '$type: $name ($teamLabel)',
            style: const TextStyle(color: Colors.white),
          ),
        );
      }).toList(),
    );
  }
}

class TopPlayersList extends StatelessWidget {
  final String title;
  final List<StatItem> players;

  const TopPlayersList({super.key, required this.title, required this.players});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF172c22),
            const Color(0xFF1d3f30),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFd4af37).withOpacity(0.1),
          width: 1,
        ),
      ),
      padding: const EdgeInsets.all(14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFFd4af37),
              fontSize: 15,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          ...players.indexed.map((item) {
            final index = item.$1 + 1;
            final player = item.$2;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [
                              const Color(0xFF0b3d2e),
                              const Color(0xFF172c22),
                            ],
                          ),
                        ),
                        child: Center(
                          child: Text(
                            index.toString(),
                            style: const TextStyle(
                              color: Color(0xFFd4af37),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Flexible(
                        child: Text(
                          player.name,
                          style: const TextStyle(
                            color: Color(0xFFe3f1e8),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00c853).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          player.value,
                          style: const TextStyle(
                            color: Color(0xFF00c853),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
          if (players.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                'No data available',
                style: TextStyle(
                  color: Color(0xFFa8b8ac),
                  fontSize: 13,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class StatItem {
  final String name;
  final String value;

  StatItem({required this.name, required this.value});
}

class MatchHeader extends StatelessWidget {
  final String date;
  final String homeTeamLabel;
  final String awayTeamLabel;

  const MatchHeader({
    super.key,
    required this.date,
    required this.homeTeamLabel,
    required this.awayTeamLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          date,
          style: const TextStyle(
            color: Color(0xFFa8b8ac),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF00c853),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Text(
            'FINALIZADO',
            style: TextStyle(
              color: Color(0xFF030403),
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }
}

class ScoreSection extends StatelessWidget {
  final String homeTeamLabel;
  final String awayTeamLabel;
  final int homeScore;
  final int awayScore;

  const ScoreSection({
    super.key,
    required this.homeTeamLabel,
    required this.awayTeamLabel,
    required this.homeScore,
    required this.awayScore,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      mainAxisSize: MainAxisSize.max,
      children: [
        Expanded(
          child: TeamScoreBlock(
            teamName: homeTeamLabel,
            score: homeScore,
            isHome: true,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'VS',
                style: TextStyle(
                  color: const Color(0xFFa8b8ac).withOpacity(0.8),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: TeamScoreBlock(
            teamName: awayTeamLabel,
            score: awayScore,
            isHome: false,
          ),
        ),
      ],
    );
  }
}

class TeamScoreBlock extends StatelessWidget {
  final String teamName;
  final int score;
  final bool isHome;

  const TeamScoreBlock({
    super.key,
    required this.teamName,
    required this.score,
    required this.isHome,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isHome ? const Color(0xFF0b3d2e) : const Color(0xFF1a1a1a),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isHome
                  ? const Color(0xFFd4af37).withOpacity(0.2)
                  : const Color(0xFF444444).withOpacity(0.5),
              width: 1,
            ),
          ),
          child: Text(
            teamName,
            style: const TextStyle(
              color: Color(0xFFe3f1e8),
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          score.toString(),
          style: const TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.bold,
            color: Color(0xFFe3f1e8),
          ),
        ),
      ],
    );
  }
}

class MatchEventsSection extends StatelessWidget {
  final String homeTeamLabel;
  final String awayTeamLabel;
  final List<MatchEvent> homeGoals;
  final List<MatchEvent> awayGoals;
  final List<MatchEvent> homeAssists;
  final List<MatchEvent> awayAssists;

  const MatchEventsSection({
    super.key,
    required this.homeTeamLabel,
    required this.awayTeamLabel,
    required this.homeGoals,
    required this.awayGoals,
    required this.homeAssists,
    required this.awayAssists,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1d3f30).withOpacity(0.8),
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.all(14.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: _TeamEventsColumn(
                  teamName: homeTeamLabel,
                  goals: homeGoals,
                  assists: homeAssists,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _TeamEventsColumn(
                  teamName: awayTeamLabel,
                  goals: awayGoals,
                  assists: awayAssists,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TeamEventsColumn extends StatelessWidget {
  final String teamName;
  final List<MatchEvent> goals;
  final List<MatchEvent> assists;

  const _TeamEventsColumn({
    required this.teamName,
    required this.goals,
    required this.assists,
  });

  @override
  Widget build(BuildContext context) {
    final goalPlayerNames = goals.map((e) => '${e.player.firstName} ${e.player.lastName}').toList();
    final assistPlayerNames = assists.map((e) => '${e.player.firstName} ${e.player.lastName}').toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          teamName,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Color(0xFFE8F2E1),
            letterSpacing: 0.3,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 10),
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  'Goles: ${goalPlayerNames.isNotEmpty ? goalPlayerNames.join(', ') : '-'}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFB2C1B4),
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  'Asistencias: ${assistPlayerNames.isNotEmpty ? assistPlayerNames.join(', ') : '-'}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFB2C1B4),
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class StatsSummary extends StatelessWidget {
  final Map<String, String> stats;

  const StatsSummary({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF172c22),
            const Color(0xFF1d3f30),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFd4af37).withOpacity(0.1),
          width: 1,
        ),
      ),
      padding: const EdgeInsets.all(14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: stats.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  entry.key,
                  style: const TextStyle(
                    color: Color(0xFFa8b8ac),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  entry.value,
                  style: const TextStyle(
                    color: Color(0xFFe3f1e8),
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class TeamComparisonSection extends StatelessWidget {
  final String whiteTeamName;
  final String blackTeamName;
  final int totalMatches;
  final int whiteWins;
  final int blackWins;
  final int draws;
  final int whiteGoals;
  final int blackGoals;

  const TeamComparisonSection({
    super.key,
    required this.whiteTeamName,
    required this.blackTeamName,
    required this.totalMatches,
    required this.whiteWins,
    required this.blackWins,
    required this.draws,
    required this.whiteGoals,
    required this.blackGoals,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 600;
        return Column(
          children: [
            if (isWide)
              Row(
                children: [
                  Expanded(
                    child: TeamStatsCard(
                      teamName: whiteTeamName,
                      matchesPlayed: totalMatches,
                      wins: whiteWins,
                      draws: draws,
                      losses: blackWins,
                      goalsFor: whiteGoals,
                      goalsAgainst: blackGoals,
                      goalDifference: whiteGoals - blackGoals,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TeamStatsCard(
                      teamName: blackTeamName,
                      matchesPlayed: totalMatches,
                      wins: blackWins,
                      draws: draws,
                      losses: whiteWins,
                      goalsFor: blackGoals,
                      goalsAgainst: whiteGoals,
                      goalDifference: blackGoals - whiteGoals,
                    ),
                  ),
                ],
              )
            else
              Column(
                children: [
                  TeamStatsCard(
                    teamName: whiteTeamName,
                    matchesPlayed: totalMatches,
                    wins: whiteWins,
                    draws: draws,
                    losses: blackWins,
                    goalsFor: whiteGoals,
                    goalsAgainst: blackGoals,
                    goalDifference: whiteGoals - blackGoals,
                  ),
                  const SizedBox(height: 16),
                  TeamStatsCard(
                    teamName: blackTeamName,
                    matchesPlayed: totalMatches,
                    wins: blackWins,
                    draws: draws,
                    losses: whiteWins,
                    goalsFor: blackGoals,
                    goalsAgainst: whiteGoals,
                    goalDifference: blackGoals - whiteGoals,
                  ),
                ],
              ),
          ],
        );
      },
    );
  }
}

class TeamStatsCard extends StatelessWidget {
  final String teamName;
  final int matchesPlayed;
  final int wins;
  final int draws;
  final int losses;
  final int goalsFor;
  final int goalsAgainst;
  final int goalDifference;

  const TeamStatsCard({
    super.key,
    required this.teamName,
    required this.matchesPlayed,
    required this.wins,
    required this.draws,
    required this.losses,
    required this.goalsFor,
    required this.goalsAgainst,
    required this.goalDifference,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1d3f30),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            teamName,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 1,
            color: Colors.white.withOpacity(0.3),
          ),
          const SizedBox(height: 16),
          // Stats Grid
          Row(
            children: [
              Expanded(
                child: StatBox(
                  value: matchesPlayed.toString(),
                  label: 'PARTIDOS JUGADOS',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: StatBox(
                  value: wins.toString(),
                  label: 'VICTORIAS',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: StatBox(
                  value: draws.toString(),
                  label: 'EMPATES',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: StatBox(
                  value: losses.toString(),
                  label: 'DERROTAS',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Bottom Stats
          StatsRow(
            goalsFor: goalsFor,
            goalsAgainst: goalsAgainst,
            goalDifference: goalDifference,
          ),
        ],
      ),
    );
  }
}

class StatBox extends StatelessWidget {
  final String value;
  final String label;

  const StatBox({
    super.key,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0B3D2E), // Deep green
            Color(0xFF00C853), // Bright green
          ],
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF071904), // Dark text on bright background
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Color(0xFF071904), // Dark text
              letterSpacing: 0.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class StatsRow extends StatelessWidget {
  final int goalsFor;
  final int goalsAgainst;
  final int goalDifference;

  const StatsRow({
    super.key,
    required this.goalsFor,
    required this.goalsAgainst,
    required this.goalDifference,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Expanded(child: _buildStat('$goalsFor', 'GOLES A FAVOR')),
        Expanded(child: _buildStat('$goalsAgainst', 'GOLES EN CONTRA')),
        Expanded(child: _buildStat('${goalDifference >= 0 ? '+' : ''}$goalDifference', 'DIFERENCIA DE GOLES')),
      ],
    );
  }

  Widget _buildStat(String value, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: Colors.grey.shade600,
            letterSpacing: 0.5,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
