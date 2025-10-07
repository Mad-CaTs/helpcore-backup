package com.helpcore.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.security.jwt.secret}")
    private String secretKey;

    @Value("${app.security.jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return getClaims(token).getExpiration();
    }

    public String extractTokenType(String token) {
        try {
            return getClaims(token).get("type", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public boolean isAccessToken(String token) {
        String type = extractTokenType(token);
        return "ACCESS".equals(type);
    }

    public boolean isRefreshToken(String token) {
        String type = extractTokenType(token);
        return "REFRESH".equals(type);
    }

    public void validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token);
        } catch (Exception e) {
            throw new RuntimeException("Token JWT inválido: " + e.getMessage());
        }
    }

    public boolean validateAccessToken(String token) {
        try {
            validateToken(token);
            // Si tiene el campo type, debe ser ACCESS
            String type = extractTokenType(token);
            if (type != null && !"ACCESS".equals(type)) {
                return false;
            }
            return !isExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}