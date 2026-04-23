FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# copy only server folder (your Spring Boot app)
COPY server /app

# build jar
RUN mvn clean package -DskipTests

# ---- runtime ----
FROM eclipse-temurin:17-jdk
WORKDIR /app

# copy built jar
COPY --from=build /app/target/*.jar app.jar

# run app
CMD ["java", "-jar", "app.jar"]