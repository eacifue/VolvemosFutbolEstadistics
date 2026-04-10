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
                var homeGoals = CountGoalsForTeam(match.Events, match.HomeTeamId);
                var awayGoals = CountGoalsForTeam(match.Events, match.AwayTeamId);

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
                    HomeGoals = CountGoalsForTeam(m.Events, m.HomeTeamId),
                    AwayGoals = CountGoalsForTeam(m.Events, m.AwayTeamId),
                    Winner = CountGoalsForTeam(m.Events, m.HomeTeamId) > CountGoalsForTeam(m.Events, m.AwayTeamId)
                        ? "Home"
                        : CountGoalsForTeam(m.Events, m.AwayTeamId) > CountGoalsForTeam(m.Events, m.HomeTeamId)
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
                .Take(3)
                .Join(_context.Players,
                    x => x.PlayerId,
                    p => p.Id,
                    (x, p) => new TopPlayerDto
                    {
                        PlayerId = p.Id,
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        Goals = x.Goals,
                        Assists = 0
                    })
                .ToListAsync();

            var topAssists = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => e.EventTypeId == AssistEventTypeId)
                .GroupBy(e => e.PlayerId)
                .Select(g => new { PlayerId = g.Key, Assists = g.Count() })
                .OrderByDescending(x => x.Assists)
                .Take(3)
                .Join(_context.Players,
                    x => x.PlayerId,
                    p => p.Id,
                    (x, p) => new TopPlayerDto
                    {
                        PlayerId = p.Id,
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        Goals = 0,
                        Assists = x.Assists
                    })
                .ToListAsync();

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
                TeamComparison = teamComparison
            };
        }

        private static int CountGoalsForTeam(IEnumerable<MatchEvent> events, int? teamId)
        {
            if (!teamId.HasValue)
            {
                return 0;
            }

            return events.Count(e => e.EventTypeId == GoalEventTypeId && e.TeamId == teamId.Value);
        }
    }
}