# Backend Dockerfile - builds and publishes .NET 10 API

# 1. Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore
COPY MyApi/*.csproj ./MyApi/
RUN dotnet restore MyApi/MyApi.csproj

# copy everything and build
COPY MyApi/. ./MyApi/
WORKDIR /src/MyApi
RUN dotnet publish -c Release -o /app/publish

# 2. Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

# expose default port
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "MyApi.dll"]
