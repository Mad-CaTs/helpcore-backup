package com.helpcore.gateway.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


// * Configuración de rutas del API Gateway
// * - Define rutas dinámicas para los microservicios
// * - Configura resolvers para rate limiting
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // AUTH SERVICE
                .route("auth-service", r -> r
                        .path("/auth/**")
                        .filters(f -> f
                                .addRequestHeader("X-Gateway-Debug", "true")
                                .addResponseHeader("X-Gateway-Route", "auth-service")
                        )
                        .uri("lb://auth-service"))

                // Ruta para API Docs
//                .route("docs", r -> r
//                        .path("/api/docs/**")
//                        .uri("forward:/docs"))

                // Ruta para health check
                .route("health-check", r -> r
                        .path("/health")
                        .uri("forward:/actuator/health"))

                // Ruta para fallback de auth
                .route("auth-fallback", r -> r
                        .path("/fallback/auth")
                        .uri("forward:/fallback"))

                .build();
    }

    // Key Resolver para rate limiting basado en IP del cliente
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(getClientIp(exchange));
    }

    // Extraer la IP real del cliente considerando proxies y load balancers
    private String getClientIp(ServerWebExchange exchange) {
        // PRIORIDAD 1: X-Forwarded-For header
        // Este header contiene la IP original cuando pasa por proxies
        String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Formato: "client_ip, proxy1_ip, proxy2_ip"
            // Tomamos la primera IP (ip real)
            return xForwardedFor.split(",")[0].trim();
        }

        // PRIORIDAD 2: X-Real-IP header
        String xRealIp = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        // FALLBACK: IP directa de la conexión
        return exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown";
    }

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public ApplicationRunner eurekaDebugRunner(DiscoveryClient discoveryClient) {
        return args -> {
            System.out.println("=== SERVICIOS REGISTRADOS EN EUREKA ===");
            discoveryClient.getServices().forEach(serviceId -> {
                System.out.println("Servicio ID: " + serviceId);
                discoveryClient.getInstances(serviceId).forEach(instance -> {
                    System.out.println("  URI completa: " + instance.getUri());
                    System.out.println("  Host: " + instance.getHost());
                    System.out.println("  Port: " + instance.getPort());
                    System.out.println("  Service ID: " + instance.getServiceId());
                });
            });
        };
    }
}