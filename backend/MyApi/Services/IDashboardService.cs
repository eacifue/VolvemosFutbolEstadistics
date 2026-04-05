using System.Threading.Tasks;
using MyApi.DTOs.Dashboard;

namespace MyApi.Services
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardAsync();
    }
}