using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;

namespace MyApi.Services
{
    public class PositionService : IPositionService
    {
        private readonly ApplicationDbContext _context;

        public PositionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Position>> GetAllPositionsAsync()
        {
            return await _context.Positions.ToListAsync();
        }

        public async Task<Position> GetPositionByIdAsync(int id)
        {
            return await _context.Positions.FindAsync(id);
        }

        public async Task<Position> CreatePositionAsync(Position position)
        {
            if (position == null)
                throw new ArgumentNullException(nameof(position));

            _context.Positions.Add(position);
            await _context.SaveChangesAsync();
            return position;
        }

        public async Task<Position> UpdatePositionAsync(int id, Position position)
        {
            var existing = await _context.Positions.FindAsync(id);
            if (existing == null)
                return null;

            existing.Name = position.Name;
            _context.Positions.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeletePositionAsync(int id)
        {
            var existing = await _context.Positions.FindAsync(id);
            if (existing == null)
                return false;

            _context.Positions.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
