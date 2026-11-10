package co.cesde.sgc_api.auth;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Component;

/** Guarda las contraseñas como hash (PBKDF2 con sal), nunca en texto plano. */
@Component
public class PasswordHasher {

    private static final int ITERACIONES = 600_000;
    private static final int BITS = 256;

    private final SecureRandom azar = new SecureRandom();

    /** Devuelve "iteraciones:sal:hash" listo para guardar en la base de datos. */
    public String hashear(String clave) {
        byte[] sal = new byte[16];
        azar.nextBytes(sal);
        return ITERACIONES + ":" + base64(sal) + ":" + base64(derivar(clave, sal, ITERACIONES));
    }

    /** Compara una contraseña escrita con el hash guardado. */
    public boolean coincide(String clave, String guardado) {
        try {
            String[] partes = guardado.split(":");
            int iteraciones = Integer.parseInt(partes[0]);
            byte[] sal = Base64.getDecoder().decode(partes[1]);
            byte[] esperado = Base64.getDecoder().decode(partes[2]);
            return MessageDigest.isEqual(esperado, derivar(clave, sal, iteraciones));
        } catch (RuntimeException e) {
            return false;
        }
    }

    private static byte[] derivar(String clave, byte[] sal, int iteraciones) {
        try {
            KeySpec especificacion = new PBEKeySpec(clave.toCharArray(), sal, iteraciones, BITS);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(especificacion).getEncoded();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo calcular el hash de la contraseña.", e);
        }
    }

    private static String base64(byte[] datos) {
        return Base64.getEncoder().encodeToString(datos);
    }
}