using System;
using System.Threading.Tasks;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace MyApi.Data
{
    public static class AuthSeeder
    {
        public static async Task EnsureAdminUserAsync(ApplicationDbContext context)
        {
            if (!context.Database.IsInMemory())
            {
                await context.Database.ExecuteSqlRawAsync(@"
CREATE TABLE IF NOT EXISTS Users (
    Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);");
            }

            var existing = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (existing != null)
            {
                // Verify the stored hash is valid; if not, re-hash and update
                bool hashIsValid = false;
                try
                {
                    BCrypt.Net.BCrypt.Verify("probe", existing.PasswordHash);
                    hashIsValid = true;
                }
                catch (BCrypt.Net.SaltParseException)
                {
                    hashIsValid = false;
                }

                if (!hashIsValid)
                {
                    existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                    await context.SaveChangesAsync();
                }
                return;
            }

            context.Users.Add(new Models.User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
        }
    }
}
