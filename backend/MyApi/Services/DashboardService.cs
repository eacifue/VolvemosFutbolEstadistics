using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOs.Dashboard;
using MyApi.Models;

namespace MyApi.Services
{
    public class DashboardService : IDashboardService
    {
        private const int GoalEventTypeId = 1;
        private const int AssistEventTypeId = 2;
        private const int OwnGoalEventTypeId = 3;
        private const int WhiteTeamId = 1;
        private const int BlackTeamId = 2;

        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            var matches = await _context.Matches
                .AsNoTracking()
                .Include(m => m.Events)
                    .ThenInclude(e => e.Player)
                .Include(m => m.Events)
                    .ThenInclude(e => e.EventType)
                .OrderByDescending(m => m.MatchDate)
                .ToListAsync();

            var whiteTeamWins = 0;
            var blackTeamWins = 0;
            var draws = 0;
            var whiteGoalsFor = 0;
            var blackGoalsFor = 0;
            var whiteGoalsAgainst = 0;
            var blackGoalsAgainst = 0;
            var whiteLosses = 0;
            var blackLosses = 0;

            foreach (var match in matches)
            {
                var score = CountGoalsForMatch(match.Events, match.HomeTeamId, match.AwayTeamId);
                var homeGoals = score.HomeGoals;
                var awayGoals = score.AwayGoals;

                if (match.HomeTeamId == WhiteTeamId)
                {
                    whiteGoalsFor += homeGoals;
                    whiteGoalsAgainst += awayGoals;
                }

                if (match.AwayTeamId == WhiteTeamId)
                {
                    whiteGoalsFor += awayGoals;
                    whiteGoalsAgainst += homeGoals;
                }

                if (match.HomeTeamId == BlackTeamId)
                {
                    blackGoalsFor += homeGoals;
                    blackGoalsAgainst += awayGoals;
                }

                if (match.AwayTeamId == BlackTeamId)
                {
                    blackGoalsFor += awayGoals;
                    blackGoalsAgainst += homeGoals;
                }

                if (homeGoals > awayGoals)
                {
                    if (match.HomeTeamId == WhiteTeamId)
                    {
                        whiteTeamWins++;
                    }
                    else if (match.HomeTeamId == BlackTeamId)
                    {
                        blackTeamWins++;
                    }

                    if (match.AwayTeamId == WhiteTeamId)
                    {
                        whiteLosses++;
                    }
                    else if (match.AwayTeamId == BlackTeamId)
                    {
                        blackLosses++;
                    }
                }
                else if (awayGoals > homeGoals)
                {
                    if (match.AwayTeamId == WhiteTeamId)
                    {
                        whiteTeamWins++;
                    }
                    else if (match.AwayTeamId == BlackTeamId)
                    {
                        blackTeamWins++;
                    }

                    if (match.HomeTeamId == WhiteTeamId)
                    {
                        whiteLosses++;
                    }
                    else if (match.HomeTeamId == BlackTeamId)
                    {
                        blackLosses++;
                    }
                }
                else
                {
                    draws++;
                }
            }

            var recentMatches = matches
                .Take(3)
                .Select(m => new RecentMatchDto
                {
                    Id = m.Id,
                    MatchDate = m.MatchDate,
                    HomeTeamId = m.HomeTeamId,
                    AwayTeamId = m.AwayTeamId,
                    Events = m.Events
                        .Select(e => new MatchEventSummaryDto
                        {
                            Id = e.Id,
                            PlayerId = e.PlayerId,
                            PlayerFullName = e.Player == null ? string.Empty : e.Player.FirstName + " " + e.Player.LastName,
                            EventTypeId = e.EventTypeId,
                            EventTypeName = e.EventType == null ? string.Empty : e.EventType.Name ?? string.Empty,
                            TeamId = e.TeamId
                        })
                        .ToList(),
                    HomeGoals = CountGoalsForTeam(m.Events, m.HomeTeamId, m.AwayTeamId),
                    AwayGoals = CountGoalsForTeam(m.Events, m.AwayTeamId, m.HomeTeamId),
                    Winner = CountGoalsForTeam(m.Events, m.HomeTeamId, m.AwayTeamId) > CountGoalsForTeam(m.Events, m.AwayTeamId, m.HomeTeamId)
                        ? "Home"
                        : CountGoalsForTeam(m.Events, m.AwayTeamId, m.HomeTeamId) > CountGoalsForTeam(m.Events, m.HomeTeamId, m.AwayTeamId)
                            ? "Away"
                            : "Draw"
                })
                .ToList();

            var topScorers = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => e.EventTypeId == GoalEventTypeId)
                .GroupBy(e => e.PlayerId)
                .Select(g => new { PlayerId = g.Key, Goals = g.Count() })
                .OrderByDescending(x => x.Goals)
                .Take(5)
                .Join(_context.Players,
                    x => x.PlayerId,
                    p => p.Id,
                    (x, p) => new TopPlayerDto
                    {
                        PlayerId = p.Id,
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        TeamName = string.Empty,
                        Goals = x.Goals,
                        Assists = 0,
                        OwnGoals = 0
                    })
                .ToListAsync();

            var topAssists = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => e.EventTypeId == AssistEventTypeId)
                .GroupBy(e => e.PlayerId)
                .Select(g => new { PlayerId = g.Key, Assists = g.Count() })
                .OrderByDescending(x => x.Assists)
                .Take(5)
                .Join(_context.Players,
                    x => x.PlayerId,
                    p => p.Id,
                    (x, p) => new TopPlayerDto
                    {
                        PlayerId = p.Id,
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        TeamName = string.Empty,
                        Goals = 0,
                        Assists = x.Assists,
                        OwnGoals = 0
                    })
                .ToListAsync();

            var teamNamesById = await _context.Teams
                .AsNoTracking()
                .ToDictionaryAsync(t => t.Id, t => t.Name);

            var topOwnGoalRows = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => e.EventTypeId == OwnGoalEventTypeId)
                .GroupBy(e => e.PlayerId)
                .Select(g => new
                {
                    PlayerId = g.Key,
                    OwnGoals = g.Count(),
                    TeamId = g.OrderByDescending(e => e.CreatedAt).Select(e => e.TeamId).FirstOrDefault()
                })
                .OrderByDescending(x => x.OwnGoals)
                .Take(5)
                .ToListAsync();

            var topOwnGoalPlayerIds = topOwnGoalRows.Select(x => x.PlayerId).Distinct().ToList();
            var playersById = await _context.Players
                .AsNoTracking()
                .Where(p => topOwnGoalPlayerIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var topOwnGoals = topOwnGoalRows
                .Where(x => playersById.ContainsKey(x.PlayerId))
                .Select(x =>
                {
                    var player = playersById[x.PlayerId];
                    teamNamesById.TryGetValue(x.TeamId, out var teamName);

                    return new TopPlayerDto
                    {
                        PlayerId = player.Id,
                        FirstName = player.FirstName,
                        LastName = player.LastName,
                        TeamName = teamName ?? "Equipo",
                        Goals = 0,
                        Assists = 0,
                        OwnGoals = x.OwnGoals
                    };
                })
                .ToList();

            var matchResultsById = matches
                .ToDictionary(
                    m => m.Id,
                    m =>
                    {
                        var score = CountGoalsForMatch(m.Events, m.HomeTeamId, m.AwayTeamId);

                        if (score.HomeGoals == score.AwayGoals)
                        {
                            return new { WinnerTeamId = (int?)null, LoserTeamId = (int?)null };
                        }

                        return score.HomeGoals > score.AwayGoals
                            ? new { WinnerTeamId = m.HomeTeamId, LoserTeamId = m.AwayTeamId }
                            : new { WinnerTeamId = m.AwayTeamId, LoserTeamId = m.HomeTeamId };
                    });

            var matchIds = matchResultsById.Keys.ToList();
            var matchPlayers = await _context.MatchPlayers
                .AsNoTracking()
                .Where(mp => matchIds.Contains(mp.MatchId))
                .Select(mp => new { mp.PlayerId, mp.MatchId, mp.TeamId })
                .ToListAsync();

            var winnerRows = matchPlayers
                .Where(mp =>
                    matchResultsById.TryGetValue(mp.MatchId, out var result)
                    && result.WinnerTeamId.HasValue
                    && mp.TeamId == result.WinnerTeamId.Value)
                .GroupBy(mp => mp.PlayerId)
                .Select(g => new { PlayerId = g.Key, Wins = g.Count() })
                .OrderByDescending(x => x.Wins)
                .ThenBy(x => x.PlayerId)
                .Take(5)
                .ToList();

            var loserRows = matchPlayers
                .Where(mp =>
                    matchResultsById.TryGetValue(mp.MatchId, out var result)
                    && result.LoserTeamId.HasValue
                    && mp.TeamId == result.LoserTeamId.Value)
                .GroupBy(mp => mp.PlayerId)
                .Select(g => new { PlayerId = g.Key, Losses = g.Count() })
                .OrderByDescending(x => x.Losses)
                .ThenBy(x => x.PlayerId)
                .Take(5)
                .ToList();

            var topWlPlayerIds = winnerRows
                .Select(x => x.PlayerId)
                .Concat(loserRows.Select(x => x.PlayerId))
                .Distinct()
                .ToList();

            var wlPlayersById = await _context.Players
                .AsNoTracking()
                .Where(p => topWlPlayerIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var topWinners = winnerRows
                .Where(x => wlPlayersById.ContainsKey(x.PlayerId))
                .Select(x =>
                {
                    var player = wlPlayersById[x.PlayerId];

                    return new TopPlayerDto
                    {
                        PlayerId = player.Id,
                        FirstName = player.FirstName,
                        LastName = player.LastName,
                        TeamName = string.Empty,
                        Goals = 0,
                        Assists = 0,
                        OwnGoals = 0,
                        Wins = x.Wins,
                        Losses = 0
                    };
                })
                .ToList();

            var topLosers = loserRows
                .Where(x => wlPlayersById.ContainsKey(x.PlayerId))
                .Select(x =>
                {
                    var player = wlPlayersById[x.PlayerId];

                    return new TopPlayerDto
                    {
                        PlayerId = player.Id,
                        FirstName = player.FirstName,
                        LastName = player.LastName,
                        TeamName = string.Empty,
                        Goals = 0,
                        Assists = 0,
                        OwnGoals = 0,
                        Wins = 0,
                        Losses = x.Losses
                    };
                })
                .ToList();

            var teamMeta = await _context.Teams
                .AsNoTracking()
                .Where(t => t.Id == WhiteTeamId || t.Id == BlackTeamId)
                .ToDictionaryAsync(t => t.Id, t => new { t.Name, t.Color });

            var teamComparison = new List<TeamStatsDto>
            {
                new TeamStatsDto
                {
                    Id = WhiteTeamId,
                    Name = teamMeta.TryGetValue(WhiteTeamId, out var white) ? white.Name : "Equipo Blanco",
                    Color = teamMeta.TryGetValue(WhiteTeamId, out white) ? white.Color : "#ffffff",
                    MatchesPlayed = whiteTeamWins + whiteLosses + draws,
                    Wins = whiteTeamWins,
                    Draws = draws,
                    Losses = whiteLosses,
                    GoalsFor = whiteGoalsFor,
                    GoalsAgainst = whiteGoalsAgainst
                },
                new TeamStatsDto
                {
                    Id = BlackTeamId,
                    Name = teamMeta.TryGetValue(BlackTeamId, out var black) ? black.Name : "Equipo Negro",
                    Color = teamMeta.TryGetValue(BlackTeamId, out black) ? black.Color : "#111111",
                    MatchesPlayed = blackTeamWins + blackLosses + draws,
                    Wins = blackTeamWins,
                    Draws = draws,
                    Losses = blackLosses,
                    GoalsFor = blackGoalsFor,
                    GoalsAgainst = blackGoalsAgainst
                }
            };

            return new DashboardDto
            {
                TotalMatches = matches.Count,
                WhiteTeamWins = whiteTeamWins,
                BlackTeamWins = blackTeamWins,
                Draws = draws,
                WhiteGoalsFor = whiteGoalsFor,
                BlackGoalsFor = blackGoalsFor,
                GoalDifference = whiteGoalsFor - blackGoalsFor,
                RecentMatches = recentMatches,
                TopScorers = topScorers,
                TopAssists = topAssists,
                TopOwnGoals = topOwnGoals,
                TopWinners = topWinners,
                TopLosers = topLosers,
                TeamComparison = teamComparison
            };
        }

        private static int CountGoalsForTeam(IEnumerable<MatchEvent> events, int? teamId, int? opponentTeamId)
        {
            if (!teamId.HasValue)
            {
                return 0;
            }

            var goals = events.Count(e => e.EventTypeId == GoalEventTypeId && e.TeamId == teamId.Value);

            if (opponentTeamId.HasValue)
            {
                goals += events.Count(e => e.EventTypeId == OwnGoalEventTypeId && e.TeamId == opponentTeamId.Value);
            }

            return goals;
        }

        private static (int HomeGoals, int AwayGoals) CountGoalsForMatch(
            IEnumerable<MatchEvent> events,
            int? homeTeamId,
            int? awayTeamId)
        {
            var homeGoals = CountGoalsForTeam(events, homeTeamId, awayTeamId);
            var awayGoals = CountGoalsForTeam(events, awayTeamId, homeTeamId);
            return (homeGoals, awayGoals);
        }
    }
}