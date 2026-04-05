using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.Models;

namespace MyApi.Services
{
    public interface IEventTypeService
    {
        Task<IEnumerable<EventType>> GetAllEventTypesAsync();
        Task<EventType> GetEventTypeByIdAsync(int id);
        Task<EventType> CreateEventTypeAsync(EventType eventType);
        Task<EventType> UpdateEventTypeAsync(int id, EventType eventType);
        Task<bool> DeleteEventTypeAsync(int id);
    }
}
