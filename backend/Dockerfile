# Multi-stage build for StudentNest Backend

# Stage 1: Build the Maven application
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Cache maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create directory for static uploads
RUN mkdir -p /app/uploads

# Copy the built jar from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose default port
EXPOSE 8080

# Environment variables with sensible defaults
ENV PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Launch the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar --server.port=${PORT:-8080}"]
