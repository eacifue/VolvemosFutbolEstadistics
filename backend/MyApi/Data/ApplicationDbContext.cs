using Microsoft.EntityFrameworkCore;
using MyApi.Models;

namespace MyApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<EventType> EventTypes { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<MatchEvent> MatchEvents { get; set; }
        public DbSet<MatchPlayer> MatchPlayers { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Position relationships
            modelBuilder.Entity<Position>()
                .HasMany(p => p.Players)
                .WithOne(p => p.Position)
                .HasForeignKey(p => p.PositionId)
                .OnDelete(DeleteBehavior.SetNull);

            // EventType relationships
            modelBuilder.Entity<EventType>()
                .HasMany(e => e.MatchEvents)
                .WithOne(me => me.EventType)
                .HasForeignKey(me => me.EventTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Match relationships
            modelBuilder.Entity<Match>()
                .HasOne(m => m.HomeTeam)
                .WithMany()
                .HasForeignKey(m => m.HomeTeamId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.AwayTeam)
                .WithMany()
                .HasForeignKey(m => m.AwayTeamId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Match>()
                .HasMany(m => m.MatchPlayers)
                .WithOne(mp => mp.Match)
                .HasForeignKey(mp => mp.MatchId);

            modelBuilder.Entity<Match>()
                .HasMany(m => m.Events)
                .WithOne(e => e.Match)
                .HasForeignKey(e => e.MatchId);

            // Player relationships
            modelBuilder.Entity<Player>()
                .HasMany(p => p.MatchEvents)
                .WithOne(e => e.Player)
                .HasForeignKey(e => e.PlayerId);

            // MatchPlayer relationships
            modelBuilder.Entity<MatchPlayer>()
                .HasOne(mp => mp.Player)
                .WithMany()
                .HasForeignKey(mp => mp.PlayerId);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .IsRequired();
        }
    }
}