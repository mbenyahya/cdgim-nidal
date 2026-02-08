package com.cgdim.entity;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "tjm_entries", uniqueConstraints = @UniqueConstraint(columnNames = { "grid_type", "ref_id" }))
@IdClass(TjmEntry.TjmEntryId.class)
public class TjmEntry {

    @Id
    @Column(name = "grid_type", nullable = false)
    private String gridType;

    @Id
    @Column(name = "ref_id", nullable = false)
    private String refId;

    @Column(nullable = false)
    private Double value;

    private String date;

    public String getGridType() { return gridType; }
    public void setGridType(String gridType) { this.gridType = gridType; }
    public String getRefId() { return refId; }
    public void setRefId(String refId) { this.refId = refId; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public static class TjmEntryId implements Serializable {
        private String gridType;
        private String refId;
        public TjmEntryId() {}
        public TjmEntryId(String gridType, String refId) { this.gridType = gridType; this.refId = refId; }
        public String getGridType() { return gridType; }
        public void setGridType(String gridType) { this.gridType = gridType; }
        public String getRefId() { return refId; }
        public void setRefId(String refId) { this.refId = refId; }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TjmEntryId that = (TjmEntryId) o;
            return java.util.Objects.equals(gridType, that.gridType) && java.util.Objects.equals(refId, that.refId);
        }
        @Override
        public int hashCode() { return java.util.Objects.hash(gridType, refId); }
    }
}
