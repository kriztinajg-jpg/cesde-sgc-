package co.cesde.sgc_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documento")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer areaId;
    private Integer categoriaId;
    private String titulo;
    private String descripcion;
    private String archivoNombre;
    private String archivoUrl;
    private String tipoArchivo;
    private String version;
    private String estado;
    private LocalDateTime fechaActualizacion;

    public Integer getId() { return id; }
    public Integer getAreaId() { return areaId; }
    public Integer getCategoriaId() { return categoriaId; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public String getArchivoNombre() { return archivoNombre; }
    public String getArchivoUrl() { return archivoUrl; }
    public String getTipoArchivo() { return tipoArchivo; }
    public String getVersion() { return version; }
    public String getEstado() { return estado; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
}
