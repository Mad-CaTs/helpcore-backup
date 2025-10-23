package com.helpcore.servicios;

import java.util.List;

import com.helpcore.entidades.Persona;
import com.helpcore.entidades.Rol;
import com.helpcore.repositorios.PersonaRepository;
import com.helpcore.repositorios.RolRepository;
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
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;
    private final TokenRepository tokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final RolRepository rolRepository;

    @Transactional
    public TokenResponseDTO registrar(UsuarioRegisterDTO dto) {
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }

        if (personaRepository.existsByDni(dto.getDni())) {
            throw new IllegalArgumentException("El DNI ya está registrado.");
        }

        if (dto.getCodigo() != null && personaRepository.existsByCodigoAlumno(dto.getCodigo())) {
            throw new IllegalArgumentException("El código de alumno ya está registrado.");
        }

        Persona persona = Persona.builder()
                .nombres(dto.getNombres())
                .apellidos(dto.getApellidos())
                .dni(dto.getDni())
                .telefono(dto.getTelefono())
                .codigoAlumno(dto.getCodigo())
                .idSede(dto.getIdSede())
                .activo(true)
                .build();

        Persona personaGuardada = personaRepository.save(persona);

        Rol rolUsuario = rolRepository.findByNombre("Usuario")
                .orElseThrow(() -> new IllegalStateException("Rol 'Usuario' no encontrado en el sistema"));


        Usuario usuario = Usuario.builder()
                .correo(dto.getCorreo())
                .contrasena(passwordEncoder.encode(dto.getContrasena()))
                .persona(personaGuardada)
                .activo(true)
                .roles(List.of(rolUsuario))
                .build();

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        var jwtToken = jwtService.generarToken(usuarioGuardado);
        var refreshToken = jwtService.generarRefreshToken(usuarioGuardado);

        guardarTokenUsuario(usuarioGuardado, jwtToken);
        return new TokenResponseDTO(jwtToken, refreshToken);
    }


    public TokenResponseDTO login(UsuarioLoginDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getCorreo(),
                            request.getContrasena()));
        } catch (Exception ex) {
            throw new UsernameNotFoundException("Usuario o contraseña asdasdasd");
        }
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo()).orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
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
        final String correo = jwtService.extraerUsuario(refreshToken);

        if (correo == null) {
            throw new IllegalArgumentException("Token inválido");
        }

        final Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException(correo));

        if (!jwtService.validarToken(refreshToken, usuario)) {
            throw new IllegalArgumentException("Token inválido");
        }

        final String token = jwtService.generarToken(usuario);
        removerTokensUsuario(usuario);

        guardarTokenUsuario(usuario, token);

        return new TokenResponseDTO(token, refreshToken);
    }
}
