using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Models;

namespace MyApi.Data
{
    public static class SchemaMigrator
    {
        public static async Task EnsureOwnGoalEventTypeAsync(ApplicationDbContext context)
        {
            if (context.Database.IsInMemory())
            {
                if (!await context.EventTypes.AnyAsync(e => e.Id == (int)EventTypeKind.OwnGoal))
                {
                    context.EventTypes.Add(new EventType
                    {
                        Id = (int)EventTypeKind.OwnGoal,
                        Name = "OwnGoal"
                    });
                    await context.SaveChangesAsync();
                }

                return;
            }

            var provider = context.Database.ProviderName ?? string.Empty;

            if (provider.Contains("Npgsql"))
            {
                await context.Database.ExecuteSqlRawAsync(@"
INSERT INTO ""Events"" (""Id"", ""Name"")
VALUES (3, 'OwnGoal')
ON CONFLICT (""Id"") DO UPDATE SET ""Name"" = EXCLUDED.""Name"";");
                return;
            }

            await context.Database.ExecuteSqlRawAsync(@"
INSERT INTO Events (Id, Name)
SELECT 3, 'OwnGoal'
WHERE NOT EXISTS (SELECT 1 FROM Events WHERE Id = 3);");
        }
    }
    }
