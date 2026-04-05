using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOs.Dashboard;
using MyApi.Mappers;

namespace MyApi.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            var recentMatches = await _context.Matches
                .OrderByDescending(m => m.MatchDate)
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
                    HomeGoals = m.Events.Count(e => e.EventTypeId == 1 && e.TeamId == 1),
                    AwayGoals = m.Events.Count(e => e.EventTypeId == 1 && e.TeamId == 2),
                    Winner = m.Events.Count(e => e.EventTypeId == 1 && e.TeamId == 1) > m.Events.Count(e => e.EventTypeId == 1 && e.TeamId == 2)
                        ? "Home"
                        : m.Events.Count(e => e.EventTypeId == 1 && e.TeamId == 2) > m.Events.Count(e => e.EventTypeId == 1 && e.TeamId == 1)
                            ? "Away"
                            : "Draw"
                })
                .ToListAsync();

            var topScorers = await _context.MatchEvents
                .Where(e => e.EventTypeId == 1)
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
                        Assists = p.Assists
                    })
                .ToListAsync();

            var topAssists = await _context.MatchEvents
                .Where(e => e.EventTypeId == 2)
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
                        Goals = p.Goals,
                        Assists = x.Assists
                    })
                .ToListAsync();

            var teamComparison = await _context.Teams
                .Select(t => new TeamStatsDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color,
                    MatchesPlayed = t.MatchesPlayed,
                    Wins = t.Wins,
                    Draws = t.Draws,
                    Losses = t.Losses,
                    GoalsFor = t.GoalsFor,
                    GoalsAgainst = t.GoalsAgainst
                })
                .ToListAsync();

            return DashboardMapper.ToDto(recentMatches, topScorers, topAssists, teamComparison);
        }
    }
}