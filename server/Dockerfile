FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY target/datavault-server-*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
