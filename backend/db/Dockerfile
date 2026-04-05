# Database Dockerfile for MySQL with initialization
# Builds a MySQL image that automatically runs the supplied script

FROM mysql:8.0

# root password and database name can be overridden via environment
ENV MYSQL_ROOT_PASSWORD=YourStrong!Passw0rd
ENV MYSQL_DATABASE=VolvemosFutbol

# copy initialization script into directory processed by the official entrypoint
COPY ../DbInit.sql /docker-entrypoint-initdb.d/

# expose standard MySQL port
EXPOSE 3306
