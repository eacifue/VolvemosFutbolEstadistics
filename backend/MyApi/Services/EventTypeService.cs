using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;

namespace MyApi.Services
{
    public class EventTypeService : IEventTypeService
    {
        private readonly ApplicationDbContext _context;

        public EventTypeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EventType>> GetAllEventTypesAsync()
        {
            return await _context.EventTypes.ToListAsync();
        }

        public async Task<EventType> GetEventTypeByIdAsync(int id)
        {
            return await _context.EventTypes.FindAsync(id);
        }

        public async Task<EventType> CreateEventTypeAsync(EventType eventType)
        {
            if (eventType == null)
                throw new ArgumentNullException(nameof(eventType));

            _context.EventTypes.Add(eventType);
            await _context.SaveChangesAsync();
            return eventType;
        }

        public async Task<EventType> UpdateEventTypeAsync(int id, EventType eventType)
        {
            var existing = await _context.EventTypes.FindAsync(id);
            if (existing == null) return null;

            existing.Name = eventType.Name;
            _context.EventTypes.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteEventTypeAsync(int id)
        {
            var existing = await _context.EventTypes.FindAsync(id);
            if (existing == null) return false;

            _context.EventTypes.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
