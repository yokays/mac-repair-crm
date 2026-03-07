"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loader";

interface Stats {
  totalActive: number;
  postalActive: number;
  localActive: number;
  completedThisMonth: number;
  revenueThisMonth: number;
  avgRepairDays: number;
  stockAlerts: {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    alertThreshold: number;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Impossible de charger les statistiques.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-[#86868b] mt-1">
          Vue d&apos;ensemble de votre atelier
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Reparations en cours</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">{stats.totalActive}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Postal actifs</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">{stats.postalActive}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Atelier actifs</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">{stats.localActive}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Terminees ce mois</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">{stats.completedThisMonth}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue + Average repair time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Chiffre d&apos;affaires ce mois</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {stats.revenueThisMonth.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#86868b] font-medium">Duree moyenne de reparation</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {stats.avgRepairDays} <span className="text-lg text-[#86868b]">jours</span>
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock alerts + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Alertes stock</CardTitle>
              <Badge variant={stats.stockAlerts.length > 0 ? "danger" : "success"}>
                {stats.stockAlerts.length} alerte{stats.stockAlerts.length !== 1 ? "s" : ""}
              </Badge>
            </CardHeader>

            {stats.stockAlerts.length === 0 ? (
              <p className="text-sm text-[#86868b] py-4 text-center">
                Aucune alerte de stock. Tout est en ordre.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.stockAlerts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{part.name}</p>
                      <p className="text-xs text-[#86868b]">
                        {part.sku} &middot; {part.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-700">
                        {part.quantity} restant{part.quantity !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-[#86868b]">
                        Seuil : {part.alertThreshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <Link href="/admin/repairs/new" className="block">
              <Button variant="primary" size="lg" className="w-full justify-start">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle reparation
              </Button>
            </Link>
            <Link href="/admin/stock" className="block">
              <Button variant="secondary" size="lg" className="w-full justify-start">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Voir le stock
              </Button>
            </Link>
            <Link href="/admin/repairs" className="block">
              <Button variant="ghost" size="lg" className="w-full justify-start">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Toutes les reparations
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
