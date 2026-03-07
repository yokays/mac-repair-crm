"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { PART_CATEGORIES } from "@/lib/constants";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  compatibility: string;
  quantity: number;
  alertThreshold: number;
  purchasePrice: number;
  sellPrice: number;
  createdAt: string;
  updatedAt: string;
  movements: Movement[];
}

const categoryOptions = PART_CATEGORIES.map((c) => ({ value: c, label: c }));

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const partId = params.id as string;

  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);

  // Movement modal
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState("IN");
  const [movementQuantity, setMovementQuantity] = useState("1");
  const [movementReason, setMovementReason] = useState("");
  const [addingMovement, setAddingMovement] = useState(false);

  const fetchPart = useCallback(async () => {
    try {
      const res = await fetch(`/api/stock/${partId}`);
      if (!res.ok) {
        toast.error("Piece introuvable");
        router.push("/admin/stock");
        return;
      }
      const data = await res.json();
      setPart(data);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId]);

  useEffect(() => {
    fetchPart();
  }, [fetchPart]);

  const handleStartEdit = () => {
    if (!part) return;
    setEditData({
      name: part.name,
      sku: part.sku,
      category: part.category,
      compatibility: part.compatibility,
      alertThreshold: part.alertThreshold,
      purchasePrice: part.purchasePrice,
      sellPrice: part.sellPrice,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/stock/${partId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success("Piece mise a jour");
      setEditing(false);
      fetchPart();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovement = async () => {
    if (!movementQuantity || parseInt(movementQuantity) < 1) return;

    setAddingMovement(true);
    try {
      const res = await fetch(`/api/stock/${partId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: movementType,
          quantity: parseInt(movementQuantity),
          reason: movementReason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur");
        return;
      }

      toast.success("Mouvement enregistre");
      setShowMovementModal(false);
      setMovementType("IN");
      setMovementQuantity("1");
      setMovementReason("");
      fetchPart();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setAddingMovement(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!part) return null;

  const isLow = part.quantity <= part.alertThreshold;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/stock"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              {part.name}
            </h1>
            <p className="text-sm text-[#86868b] mt-1">
              SKU : {part.sku} &middot; {part.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setShowMovementModal(true)}>
            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Mouvement
          </Button>
          {!editing && (
            <Button variant="secondary" size="sm" onClick={handleStartEdit}>
              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Current quantity prominently */}
      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Quantite en stock</p>
              <p className={`text-4xl font-bold mt-1 ${isLow ? "text-red-600" : "text-[#1d1d1f]"}`}>
                {part.quantity}
              </p>
              {isLow && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Stock bas (seuil : {part.alertThreshold})
                </p>
              )}
            </div>
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
              isLow ? "bg-red-50" : "bg-green-50"
            }`}>
              <svg className={`h-8 w-8 ${isLow ? "text-red-600" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Part info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            {editing && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={handleSaveEdit}>Enregistrer</Button>
              </div>
            )}
          </CardHeader>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom"
                value={String(editData.name || "")}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
              <Input
                label="SKU"
                value={String(editData.sku || "")}
                onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
              />
              <Select
                label="Categorie"
                options={categoryOptions}
                value={String(editData.category || "")}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              />
              <Input
                label="Compatibilite"
                value={String(editData.compatibility || "")}
                onChange={(e) => setEditData({ ...editData, compatibility: e.target.value })}
              />
              <Input
                label="Seuil d'alerte"
                type="number"
                min="0"
                value={String(editData.alertThreshold || "")}
                onChange={(e) => setEditData({ ...editData, alertThreshold: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Prix d'achat"
                type="number"
                step="0.01"
                value={String(editData.purchasePrice || "")}
                onChange={(e) => setEditData({ ...editData, purchasePrice: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Prix de vente"
                type="number"
                step="0.01"
                value={String(editData.sellPrice || "")}
                onChange={(e) => setEditData({ ...editData, sellPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#86868b]">Nom</span>
                <span className="text-[#1d1d1f] font-medium">{part.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">SKU</span>
                <span className="text-[#1d1d1f] font-mono">{part.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Categorie</span>
                <Badge variant="neutral">{part.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Compatibilite</span>
                <span className="text-[#1d1d1f]">{part.compatibility || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Seuil d&apos;alerte</span>
                <span className="text-[#1d1d1f]">{part.alertThreshold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Prix d&apos;achat</span>
                <span className="text-[#1d1d1f]">
                  {part.purchasePrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Prix de vente</span>
                <span className="text-[#1d1d1f] font-medium">
                  {part.sellPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Cree le</span>
                <span className="text-[#1d1d1f]">{new Date(part.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Stock movements */}
        <Card>
          <CardHeader>
            <CardTitle>Mouvements de stock ({part.movements.length})</CardTitle>
          </CardHeader>

          {part.movements.length === 0 ? (
            <p className="text-sm text-[#86868b] text-center py-4">
              Aucun mouvement enregistre.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {part.movements.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                    m.type === "IN" ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={m.type === "IN" ? "success" : "danger"}>
                      {m.type === "IN" ? "Entree" : "Sortie"}
                    </Badge>
                    <div>
                      <p className="font-medium text-[#1d1d1f]">
                        {m.type === "IN" ? "+" : "-"}{m.quantity} unite{m.quantity > 1 ? "s" : ""}
                      </p>
                      {m.reason && (
                        <p className="text-xs text-[#86868b]">{m.reason}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#86868b]">
                    {new Date(m.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Movement modal */}
      <Modal
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        title="Ajouter un mouvement de stock"
      >
        <div className="space-y-4">
          <Select
            label="Type"
            options={[
              { value: "IN", label: "Entree (IN)" },
              { value: "OUT", label: "Sortie (OUT)" },
            ]}
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
          />
          <Input
            label="Quantite"
            type="number"
            min="1"
            value={movementQuantity}
            onChange={(e) => setMovementQuantity(e.target.value)}
          />
          <Input
            label="Raison"
            value={movementReason}
            onChange={(e) => setMovementReason(e.target.value)}
            placeholder="Ex: Reapprovisionnement fournisseur"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowMovementModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" loading={addingMovement} onClick={handleAddMovement}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
