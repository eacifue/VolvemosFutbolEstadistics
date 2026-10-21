using System.Threading.Tasks;
using System.Data.Common;
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

        // Rediseño fase 1 y 2: cancha del partido, apodo del jugador y posiciones compartidas en la cancha.
        // EnsureCreated no altera una base existente, así que cada columna se agrega solo si falta.
        // Reversa: backend/sql/2026-10-rediseno-fase1-2-down.sql
        private static readonly (string Table, string Column, string MySql, string Postgres)[] RedesignColumns =
        {
            ("Matches", "Venue", "varchar(120) NULL", "varchar(120) NULL"),
            ("Players", "Nickname", "varchar(40) NULL", "varchar(40) NULL"),
            ("MatchPlayers", "PitchX", "decimal(5,2) NULL", "numeric(5,2) NULL"),
            ("MatchPlayers", "PitchY", "decimal(5,2) NULL", "numeric(5,2) NULL"),
        };

        public static async Task EnsureRedesignColumnsAsync(ApplicationDbContext context)
        {
            if (context.Database.IsInMemory())
                return;

            var provider = context.Database.ProviderName ?? string.Empty;

            if (provider.Contains("Npgsql"))
            {
                foreach (var (table, column, _, postgres) in RedesignColumns)
                    await context.Database.ExecuteSqlRawAsync($@"ALTER TABLE ""{table}"" ADD COLUMN IF NOT EXISTS ""{column}"" {postgres};");
                return;
            }

            var connection = context.Database.GetDbConnection();
            var opened = connection.State != System.Data.ConnectionState.Open;
            if (opened)
                await connection.OpenAsync();

            try
            {
                foreach (var (table, column, mySql, _) in RedesignColumns)
                {
                    if (await ColumnExistsAsync(connection, table, column))
                        continue;

                    await using var alter = connection.CreateCommand();
                    alter.CommandText = $"ALTER TABLE `{table}` ADD COLUMN `{column}` {mySql};";
                    await alter.ExecuteNonQueryAsync();
                }
            }
            finally
            {
                if (opened)
                    await connection.CloseAsync();
            }
        }

        private static async Task<bool> ColumnExistsAsync(DbConnection connection, string table, string column)
        {
            await using var command = connection.CreateCommand();
            command.CommandText = @"SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @table AND COLUMN_NAME = @column;";

            var tableParam = command.CreateParameter();
            tableParam.ParameterName = "@table";
            tableParam.Value = table;
            command.Parameters.Add(tableParam);

            var columnParam = command.CreateParameter();
            columnParam.ParameterName = "@column";
            columnParam.Value = column;
            command.Parameters.Add(columnParam);

            var count = System.Convert.ToInt64(await command.ExecuteScalarAsync());
            return count > 0;
        }
    }
    }
