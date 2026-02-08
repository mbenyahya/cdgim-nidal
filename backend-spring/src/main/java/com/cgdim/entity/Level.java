package com.cgdim.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "levels")
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer number;

    private String label;

    @Column(name = "avg_salary")
    private Double avgSalary;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumber() { return number; }
    public void setNumber(Integer number) { this.number = number; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public Double getAvgSalary() { return avgSalary; }
    public void setAvgSalary(Double avgSalary) { this.avgSalary = avgSalary; }
}
