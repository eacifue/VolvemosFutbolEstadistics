using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;
using MyApi.DTOs;

namespace MyApi.Services
{

    public class MatchService : IMatchService
    {
        private readonly ApplicationDbContext _context;

        public MatchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Match>> GetAllMatchesAsync()
        {
            return await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.MatchPlayers).ThenInclude(mp => mp.Player).ThenInclude(p => p.Position)
                .Include(m => m.Events).ThenInclude(e => e.Player).ThenInclude(p => p.Position)
                .Include(m => m.Events).ThenInclude(e => e.EventType)
                .OrderByDescending(m => m.MatchDate)
                .ToListAsync();
        }

        public async Task<Match> GetMatchByIdAsync(int id)
        {
            return await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.MatchPlayers).ThenInclude(mp => mp.Player).ThenInclude(p => p.Position)
                .Include(m => m.Events).ThenInclude(e => e.Player).ThenInclude(p => p.Position)
                .Include(m => m.Events).ThenInclude(e => e.EventType)
                .FirstOrDefaultAsync(m => m.Id == id);
        }
        public async Task<Match> CreateMatchAsync(CreateMatchDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var newMatch = new Match
            {
                MatchDate = dto.MatchDate,
                HomeTeamId = dto.HomeTeamId,
                AwayTeamId = dto.AwayTeamId
            };

            _context.Matches.Add(newMatch);
            await _context.SaveChangesAsync();
            return newMatch;
        }

        public async Task<Match?> UpdateMatchAsync(int id, UpdateMatchDto dto)
        {
            var existingMatch = await _context.Matches.FindAsync(id);
            if (existingMatch == null)
                return null;

            if (dto.MatchDate.HasValue) existingMatch.MatchDate = dto.MatchDate.Value;
            if (dto.HomeTeamId.HasValue) existingMatch.HomeTeamId = dto.HomeTeamId.Value;
            if (dto.AwayTeamId.HasValue) existingMatch.AwayTeamId = dto.AwayTeamId.Value;
            existingMatch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingMatch;
        }

              public async Task<bool> DeleteMatchAsync(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null)
                return false;

            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
