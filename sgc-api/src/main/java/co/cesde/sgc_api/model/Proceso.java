package co.cesde.sgc_api.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "proceso")
public class Proceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    private String tipo;
    private Integer orden;

    @OneToMany
    @JoinColumn(name = "proceso_id")
    @OrderBy("orden ASC")
    private List<Area> areas = new ArrayList<>();

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getTipo() { return tipo; }
    public Integer getOrden() { return orden; }
    public List<Area> getAreas() { return areas; }
}
