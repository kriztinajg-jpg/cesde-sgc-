package co.cesde.sgc_api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria_documento")
public class CategoriaDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    private String icono;
    private Integer orden;

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getIcono() { return icono; }
    public Integer getOrden() { return orden; }
}
