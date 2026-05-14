using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;

namespace MyApi.Services
{
    public class MatchEventService : IMatchEventService
    {
        private readonly ApplicationDbContext _context;

        public MatchEventService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MatchEvent>> GetEventsByMatchIdAsync(int matchId)
        {
            return await _context.MatchEvents
                .Where(e => e.MatchId == matchId)
                .Include(e => e.Player)
                .Include(e => e.EventType)
                .ToListAsync();
        }

        public async Task<MatchEvent> CreateEventAsync(MatchEvent matchEvent)
        {
            if (matchEvent == null)
                throw new ArgumentNullException(nameof(matchEvent));

            var eventTypeExists = await _context.EventTypes.AnyAsync(e => e.Id == matchEvent.EventTypeId);
            if (!eventTypeExists)
                throw new InvalidOperationException("Event type is invalid");

            // Validate that the player is assigned to the match
            var matchPlayer = await _context.MatchPlayers
                .FirstOrDefaultAsync(mp => mp.MatchId == matchEvent.MatchId && mp.PlayerId == matchEvent.PlayerId);
            if (matchPlayer == null)
                throw new InvalidOperationException("Player is not assigned to this match");

            matchEvent.TeamId = matchPlayer.TeamId;

            _context.MatchEvents.Add(matchEvent);
            await _context.SaveChangesAsync();
            return matchEvent;
        }

        public async Task<MatchEvent> UpdateEventAsync(int id, MatchEvent matchEvent)
        {
            var existingEvent = await _context.MatchEvents.FindAsync(id);
            if (existingEvent == null)
                return null;

            var eventTypeExists = await _context.EventTypes.AnyAsync(e => e.Id == matchEvent.EventTypeId);
            if (!eventTypeExists)
                throw new InvalidOperationException("Event type is invalid");

            // Validate that the player is assigned to the match
            var matchPlayer = await _context.MatchPlayers
                .FirstOrDefaultAsync(mp => mp.MatchId == matchEvent.MatchId && mp.PlayerId == matchEvent.PlayerId);
            if (matchPlayer == null)
                throw new InvalidOperationException("Player is not assigned to this match");

            existingEvent.PlayerId = matchEvent.PlayerId;
            existingEvent.EventTypeId = matchEvent.EventTypeId;
            existingEvent.TeamId = matchPlayer.TeamId;

            _context.MatchEvents.Update(existingEvent);
            await _context.SaveChangesAsync();
            return existingEvent;
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            var matchEvent = await _context.MatchEvents.FindAsync(id);
            if (matchEvent == null)
                return false;

            _context.MatchEvents.Remove(matchEvent);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteEventsByMatchIdAsync(int matchId)
        {
            var events = await _context.MatchEvents
                .Where(e => e.MatchId == matchId)
                .ToListAsync();

            if (events.Count == 0)
                return false;

            _context.MatchEvents.RemoveRange(events);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
