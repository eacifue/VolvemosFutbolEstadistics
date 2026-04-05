using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.Models;
using MyApi.DTOs;

namespace MyApi.Services
{
    public interface IMatchService
    {
        Task<IEnumerable<Match>> GetAllMatchesAsync();
        Task<Match> GetMatchByIdAsync(int id);
        Task<Match> CreateMatchAsync(CreateMatchDto dto);
        Task<Match> UpdateMatchAsync(int id, UpdateMatchDto dto);
        Task<bool> DeleteMatchAsync(int id);
    }
}
