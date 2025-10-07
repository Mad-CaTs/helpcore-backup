package com.helpcore.seguridad;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            System.out.println("=== AUTHENTICATION FILTER DEBUG ===");
            System.out.println("Path: " + request.getPath());
            System.out.println("Method: " + request.getMethod());

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                System.out.println("ERROR: No authorization header");
                return onError(exchange, "Token de autorización no encontrado", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            System.out.println("Auth Header recibido: " + authHeader.substring(0, Math.min(30, authHeader.length())) + "...");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            } else {
                System.out.println("ERROR: Invalid authorization header format");
                return onError(exchange, "Formato de token inválido. Use: Bearer <token>", HttpStatus.UNAUTHORIZED);
            }

            try {
                System.out.println("Validando token...");
                jwtUtil.validateToken(authHeader);

                if (!jwtUtil.isAccessToken(authHeader)) {
                    if (jwtUtil.isRefreshToken(authHeader)) {
                        System.out.println("ERROR: Refresh token usado en lugar de access token");
                        return onError(exchange, "No puede usar un refresh token. Use un access token", HttpStatus.UNAUTHORIZED);
                    }
                }

                if (jwtUtil.isExpired(authHeader)) {
                    System.out.println("ERROR: Token expirado");
                    return onError(exchange, "El token ha expirado", HttpStatus.UNAUTHORIZED);
                }

                System.out.println("✓ Token válido!");

                String username = jwtUtil.extractUsername(authHeader);
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Name", username)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                System.out.println("ERROR: " + e.getMessage());
                e.printStackTrace();
                return onError(exchange, "Token inválido: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");

        String errorResponse = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                java.time.LocalDateTime.now(),
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                err,
                exchange.getRequest().getURI().getPath()
        );

        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(errorResponse.getBytes()))
        );
    }

    public static class Config {
    }
}