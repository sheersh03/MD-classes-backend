# --- build stage ---
FROM gradle:8.10-jdk17 AS build
WORKDIR /workspace
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY gradlew ./
COPY src src
RUN gradle clean bootWar --no-daemon

# --- runtime stage ---
FROM eclipse-temurin:17-jre
RUN groupadd --system app && useradd --system --gid app app
WORKDIR /app
COPY --from=build /workspace/build/libs/*.war /app/app.war
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q -O- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.war"]
