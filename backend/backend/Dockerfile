# Stage 1: Build the JAR using Maven
FROM eclipse-temurin:17-jdk AS build



# Copy project files (adjust path if your pom.xml is inside backend/)
COPY backend/pom.xml .
COPY backend/src ./src

# Install Maven inside container
RUN apt-get update && apt-get install -y maven

# Build the JAR
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
