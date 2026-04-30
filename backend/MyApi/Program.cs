using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using MyApi.Data;
using MyApi.Services;
using Pomelo.EntityFrameworkCore.MySql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// add controllers
builder.Services.AddControllers();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "VolvemosFutbol-SuperSecretKey-ChangeInProduction-2026";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MyApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MyApiClient";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var mysqlUrl = Environment.GetEnvironmentVariable("MYSQL_URL");
var localConnection = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrEmpty(mysqlUrl))
{
    // Railway MySQL — parsea la URL
    var uri = new Uri(mysqlUrl);
    var userInfo = uri.UserInfo.Split(':');
    var connectionString = $"Server={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};User={userInfo[0]};Password={userInfo[1]};SslMode=Required;AllowPublicKeyRetrieval=true;";

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 33))));
}
else if (!string.IsNullOrEmpty(localConnection))
{
    // Local MySQL desde appsettings.json
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(localConnection, new MySqlServerVersion(new Version(8, 0, 33))));
}
else
{
    // Fallback en memoria si no hay nada configurado
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("VolvemosFutbol"));
}


// register application services
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IMatchEventService, MatchEventService>();
builder.Services.AddScoped<IMatchPlayerService, MatchPlayerService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IEventTypeService, EventTypeService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

var allowedOrigins = Environment.GetEnvironmentVariable("FRONTEND_URL");
var configuredOrigins = (allowedOrigins ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(NormalizeOrigin)
    .Where(static origin => !string.IsNullOrWhiteSpace(origin))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToHashSet(StringComparer.OrdinalIgnoreCase);

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            if (configuredOrigins.Count > 0)
            {
                policy
                    .SetIsOriginAllowed(origin => configuredOrigins.Contains(NormalizeOrigin(origin)))
                    .WithExposedHeaders("Authorization")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
            else
            {
                // Fallback controlado para despliegues Railway cuando FRONTEND_URL no esta configurado.
                policy
                    .SetIsOriginAllowed(origin =>
                    {
                        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                        {
                            return false;
                        }

                        return uri.Host.EndsWith(".up.railway.app", StringComparison.OrdinalIgnoreCase);
                    })
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        }
    });
});
var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// map controller endpoints
app.MapControllers();

// using (var scope = app.Services.CreateScope())
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("AuthBootstrap");

    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await AuthSeeder.EnsureAdminUserAsync(context);
        logger.LogInformation("Auth seeder executed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error while executing auth seeder.");
    }
}
app.Run();

static string NormalizeOrigin(string origin)
{
    if (string.IsNullOrWhiteSpace(origin))
    {
        return string.Empty;
    }

    var trimmed = origin.Trim();

    if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
    {
        return trimmed.TrimEnd('/');
    }

    var builder = new UriBuilder(uri)
    {
        Path = string.Empty,
        Query = string.Empty,
        Fragment = string.Empty
    };

    return builder.Uri.ToString().TrimEnd('/');
}
