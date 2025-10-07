package com.helpcore.servicios;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.helpcore.entidades.Token;
import com.helpcore.entidades.Usuario;
import com.helpcore.entidades.dto.login.TokenResponseDTO;
import com.helpcore.entidades.dto.login.UsuarioLoginDTO;
import com.helpcore.entidades.dto.login.UsuarioRegisterDTO;
import com.helpcore.repositorios.TokenRepository;
import com.helpcore.repositorios.UsuarioRepository;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final TokenRepository tokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public TokenResponseDTO registrar(UsuarioRegisterDTO dto) {
        Usuario usuario = Usuario.builder()
                .nombreUsuario(dto.getNombreUsuario())
                .contrasena(passwordEncoder.encode(dto.getContrasena()))
                .activo(true)
                .build();

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        var jwtToken = jwtService.generarToken(usuario);
        var refreshToken = jwtService.generarRefreshToken(usuario);

        guardarTokenUsuario(usuarioGuardado, jwtToken);
        return new TokenResponseDTO(jwtToken, refreshToken);
    }

    public TokenResponseDTO login(UsuarioLoginDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getNombreUsuario(),
                            request.getContrasena()));
        } catch (Exception ex) {
            throw new UsernameNotFoundException("Usuario o contraseña asdasdasd");
        }
        Usuario usuario = usuarioRepository.findByNombreUsuario(request.getNombreUsuario()).orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        var jwtToken = jwtService.generarToken(usuario);
        var refreshToken = jwtService.generarRefreshToken(usuario);

        removerTokensUsuario(usuario);
        guardarTokenUsuario(usuario, jwtToken);

        return new TokenResponseDTO(jwtToken, refreshToken);

    }

    private void removerTokensUsuario(final Usuario usuario) {
        final List<Token> tokensUsuarioValido = tokenRepository.findAllValidTokensByUserId(usuario.getId());

        if (!tokensUsuarioValido.isEmpty()) {
            for (final Token token : tokensUsuarioValido) {
                token.setExpirado(true);
                token.setRemovido(true);
            }
            tokenRepository.saveAll(tokensUsuarioValido);
        }
    }

    private void guardarTokenUsuario(Usuario user, String jwtToken) {
        var token = Token.builder()
                .usuario(user)
                .token(jwtToken)
                .tipoToken(Token.TipoToken.BEARER)
                .expirado(false)
                .removido(false)
                .build();

        tokenRepository.save(token);
    }

    public TokenResponseDTO refreshToken(final String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer")) {
            throw new IllegalArgumentException("Token inválido");
        }

        final String refreshToken = authHeader.substring(7);
        final String nombreUsuario = jwtService.extraerUsuario(refreshToken);

        if (nombreUsuario == null) {
            throw new IllegalArgumentException("Token inválido");
        }

        final Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsernameNotFoundException(nombreUsuario));

        if (!jwtService.validarToken(refreshToken, usuario)) {
            throw new IllegalArgumentException("Token inválido");
        }

        final String token = jwtService.generarToken(usuario);
        removerTokensUsuario(usuario);

        guardarTokenUsuario(usuario, token);

        return new TokenResponseDTO(token, refreshToken);
    }
}
