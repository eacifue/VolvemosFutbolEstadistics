using System.Collections.Generic;
using MyApi.DTOs.Dashboard;

namespace MyApi.Mappers
{
    public static class DashboardMapper
    {
        public static DashboardDto ToDto(
            IEnumerable<RecentMatchDto> recentMatches,
            IEnumerable<TopPlayerDto> topScorers,
            IEnumerable<TopPlayerDto> topAssists,
            IEnumerable<TeamStatsDto> teamComparison)
        {
            return new DashboardDto
            {
                RecentMatches = recentMatches,
                TopScorers = topScorers,
                TopAssists = topAssists,
                TeamComparison = teamComparison
            };
        }
    }
}