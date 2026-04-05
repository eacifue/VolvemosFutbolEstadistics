using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;

namespace MyApi.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly ApplicationDbContext _context;

        public StatisticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Player>> GetTopScorersAsync(int limit = 10)
        {
            return await _context.Players
                .OrderByDescending(p => p.Goals)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Player>> GetTopAssistsAsync(int limit = 10)
        {
            return await _context.Players
                .OrderByDescending(p => p.Assists)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<Player> GetPlayerStatisticsAsync(int playerId)
        {
            return await _context.Players
                .Include(p => p.MatchEvents)
                .ThenInclude(e => e.Match)
                .FirstOrDefaultAsync(p => p.Id == playerId);
        }

        public async Task<Team> GetTeamStatisticsAsync(int teamId)
        {
            return await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == teamId);
        }
    }
}
