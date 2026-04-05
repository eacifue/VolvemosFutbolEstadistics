using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.Models;

namespace MyApi.Services
{
    public interface IPositionService
    {
        Task<IEnumerable<Position>> GetAllPositionsAsync();
        Task<Position> GetPositionByIdAsync(int id);
        Task<Position> CreatePositionAsync(Position position);
        Task<Position> UpdatePositionAsync(int id, Position position);
        Task<bool> DeletePositionAsync(int id);
    }
}
