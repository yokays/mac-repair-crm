"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("TECHNICIAN");
  const [adding, setAdding] = useState(false);

  // Edit user modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        toast.error("Erreur lors du chargement des utilisateurs");
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!addFirstName.trim() || !addLastName.trim() || !addEmail.trim() || !addPassword) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: addFirstName.trim(),
          lastName: addLastName.trim(),
          email: addEmail.trim(),
          password: addPassword,
          role: addRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la creation");
        return;
      }

      toast.success("Utilisateur cree avec succes");
      setShowAddModal(false);
      resetAddForm();
      fetchUsers();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setAdding(false);
    }
  };

  const resetAddForm = () => {
    setAddFirstName("");
    setAddLastName("");
    setAddEmail("");
    setAddPassword("");
    setAddRole("TECHNICIAN");
  };

  const handleOpenEditModal = (user: User) => {
    setEditUser(user);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;

    setEditSaving(true);
    try {
      const body: Record<string, string> = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        role: editRole,
      };

      if (editPassword) {
        body.password = editPassword;
      }

      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la modification");
        return;
      }

      toast.success("Utilisateur mis a jour");
      setShowEditModal(false);
      fetchUsers();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Voulez-vous vraiment desactiver ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur");
        return;
      }

      toast.success("Utilisateur desactive");
      fetchUsers();
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handleReactivate = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });

      if (!res.ok) {
        toast.error("Erreur lors de la reactivation");
        return;
      }

      toast.success("Utilisateur reactive");
      fetchUsers();
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const roleOptions = [
    { value: "TECHNICIAN", label: "Technicien" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ];

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Utilisateurs
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un utilisateur
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucun utilisateur"
            description="Ajoutez votre premier utilisateur pour commencer."
            action={
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                Ajouter un utilisateur
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    user.active ? "bg-[#0071e3]" : "bg-gray-400"
                  }`}>
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-[#86868b]">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant={user.role === "SUPER_ADMIN" ? "purple" : "info"}>
                  {user.role === "SUPER_ADMIN" ? "Super Admin" : "Technicien"}
                </Badge>
                <Badge variant={user.active ? "success" : "danger"}>
                  {user.active ? "Actif" : "Inactif"}
                </Badge>
              </div>

              <p className="text-xs text-[#86868b] mb-4">
                Cree le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal(user)}
                >
                  Modifier
                </Button>
                {user.active ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeactivate(user)}
                  >
                    Desactiver
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleReactivate(user)}
                  >
                    Reactiver
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add user modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un utilisateur">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prenom"
              value={addFirstName}
              onChange={(e) => setAddFirstName(e.target.value)}
              required
            />
            <Input
              label="Nom"
              value={addLastName}
              onChange={(e) => setAddLastName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            helperText="Minimum 6 caracteres"
            required
          />
          <Select
            label="Role"
            options={roleOptions}
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); resetAddForm(); }}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" loading={adding} onClick={handleAddUser}>
              Creer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier l'utilisateur">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prenom"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
            />
            <Input
              label="Nom"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            helperText="Minimum 6 caracteres (laisser vide pour ne pas changer)"
          />
          <Select
            label="Role"
            options={roleOptions}
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" loading={editSaving} onClick={handleSaveEdit}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
