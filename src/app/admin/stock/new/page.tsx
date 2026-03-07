"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { PART_CATEGORIES, MAC_MODELS } from "@/lib/constants";

const categoryOptions = PART_CATEGORIES.map((c) => ({ value: c, label: c }));

export default function NewPartPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [alertThreshold, setAlertThreshold] = useState("5");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Le nom est requis";
    if (!sku.trim()) errs.sku = "Le SKU est requis";
    if (!category) errs.category = "La categorie est requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sku: sku.trim(),
          category,
          compatibility: compatibility.trim(),
          quantity: parseInt(quantity) || 0,
          alertThreshold: parseInt(alertThreshold) || 5,
          purchasePrice: parseFloat(purchasePrice) || 0,
          sellPrice: parseFloat(sellPrice) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la creation");
        return;
      }

      toast.success("Piece creee avec succes");
      router.push(`/admin/stock/${data.id}`);
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
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
            Nouvelle piece
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            Ajouter une piece au stock
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la piece</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom de la piece"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Ex: Ecran MacBook Pro 14"
              required
            />
            <Input
              label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              error={errors.sku}
              placeholder="Ex: SCR-MBP14-01"
              required
            />
            <Select
              label="Categorie"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Selectionnez une categorie"
              error={errors.category}
              required
            />
            <div>
              <Textarea
                label="Compatibilite"
                value={compatibility}
                onChange={(e) => setCompatibility(e.target.value)}
                rows={2}
                placeholder="Ex: MacBook Pro 14&quot;, MacBook Pro 16&quot;"
                helperText="Modeles Mac compatibles, separes par des virgules"
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock et prix</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantite initiale"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              label="Seuil d'alerte"
              type="number"
              min="0"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              helperText="Alerte quand le stock descend sous ce seuil"
            />
            <Input
              label="Prix d'achat (EUR)"
              type="number"
              step="0.01"
              min="0"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Prix de vente (EUR)"
              type="number"
              step="0.01"
              min="0"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </Card>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" loading={loading}>
            Creer la piece
          </Button>
          <Link href="/admin/stock">
            <Button type="button" variant="ghost" size="lg">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
