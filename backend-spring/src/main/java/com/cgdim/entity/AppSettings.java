package com.cgdim.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_settings")
public class AppSettings {

    @Id
    @Column(name = "id")
    private Long id = 1L;

    @Column(name = "tjm_model")
    private String tjmModel;

    @Column(name = "margin_cgdim")
    private Double marginCgdim;

    @Column(name = "margin_outsourcing")
    private Double marginOutsourcing;

    /** Marge % pour activité hors-groupe (marché local) - règles de gestion différentes du groupe */
    @Column(name = "margin_hors_groupe")
    private Double marginHorsGroupe;

    @Column(name = "productive_days_budget")
    private Integer productiveDaysBudget;

    @Column(name = "exchange_rate_budget")
    private Double exchangeRateBudget;

    @Column(columnDefinition = "TEXT")
    private String overheadJson;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTjmModel() { return tjmModel; }
    public void setTjmModel(String tjmModel) { this.tjmModel = tjmModel; }
    public Double getMarginCgdim() { return marginCgdim; }
    public void setMarginCgdim(Double marginCgdim) { this.marginCgdim = marginCgdim; }
    public Double getMarginOutsourcing() { return marginOutsourcing; }
    public void setMarginOutsourcing(Double marginOutsourcing) { this.marginOutsourcing = marginOutsourcing; }
    public Double getMarginHorsGroupe() { return marginHorsGroupe; }
    public void setMarginHorsGroupe(Double marginHorsGroupe) { this.marginHorsGroupe = marginHorsGroupe; }
    public Integer getProductiveDaysBudget() { return productiveDaysBudget; }
    public void setProductiveDaysBudget(Integer productiveDaysBudget) { this.productiveDaysBudget = productiveDaysBudget; }
    public Double getExchangeRateBudget() { return exchangeRateBudget; }
    public void setExchangeRateBudget(Double exchangeRateBudget) { this.exchangeRateBudget = exchangeRateBudget; }
    public String getOverheadJson() { return overheadJson; }
    public void setOverheadJson(String overheadJson) { this.overheadJson = overheadJson; }
}
