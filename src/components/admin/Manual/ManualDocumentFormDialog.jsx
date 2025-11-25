import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { resolveUserDisplayName } from "@/lib/user-display";
import { toast } from "sonner";
import { useUsers } from "@/hooks/useUserManagement";

const DEFAULT_FORM = {
  judul: "",
  namaPerusahaan: "",
  lokasi: "",
  ruangLingkup: "",
  status: "Draft",
};

const ROLES = [
  { label: "Lead Auditor", value: "Lead Auditor" },
  { label: "Member Auditor", value: "Member Auditor" },
  { label: "Reviewer", value: "Reviewer" },
];

const STATUS_OPTIONS = ["Draft", "In Progress", "Reviewed", "Approved"];

const extractUserId = (user) => {
  const source = user?.user ?? user
  const profile = source?.profile ?? user?.profile ?? source?.user_profile ?? user?.user_profile

  const candidates = [
    user?.user_id,
    user?.userId,
    user?.user_uuid,
    user?.userUUID,
    user?.id,
    user?.uuid,
    user?.id_users,
    user?.idUsers,
    user?.uid,
    source?.id,
    source?.uuid,
    source?.user_id,
    source?.userId,
    source?.user_uuid,
    source?.userUUID,
    source?.id_users,
    source?.idUsers,
    profile?.id,
    profile?.uuid,
    profile?.user_id,
    profile?.userId,
    profile?.id_users,
  ]

  const value = candidates.find((candidate) => {
    if (typeof candidate === "string") {
      return candidate.trim().length > 0
    }
    if (typeof candidate === "number") {
      return !Number.isNaN(candidate)
    }
    return false
  })

  if (value === undefined || value === null) {
    return null
  }

  return String(value).trim()
}

const resolveOptionUserId = (option) => {
  if (!option) return null;

  const candidates = [
    option.userId,
    option.id,
    option.raw?.id,
    option.raw?.user_id,
    option.raw?.userId,
    option.raw?.uuid,
    option.raw?.id_users,
    option.raw?.user?.id,
    option.raw?.user?.uuid,
    option.raw?.user?.user_id,
    option.raw?.user?.userId,
  ];

  const value = candidates.find((candidate) => {
    if (typeof candidate === "string") {
      return candidate.trim().length > 0;
    }
    if (typeof candidate === "number") {
      return !Number.isNaN(candidate);
    }
    return false;
  });

  if (value === undefined || value === null) {
    return null;
  }

  return String(value).trim();
};

export function ManualDocumentFormDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSubmit,
  submitting = false,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(DEFAULT_FORM);
  const [team, setTeam] = useState([]);
  const [memberRole, setMemberRole] = useState(ROLES[0].value);
  const [selectedUserValue, setSelectedUserValue] = useState("");

  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useUsers({
    per_page: 100,
    page: 1,
    status: "active",
  });

  const userOptions = useMemo(() => {
    const list = usersResponse?.data ?? [];

    return list
      .map((user, index) => {
        const rawId = typeof user?.id === "string" ? user.id.trim() : null;
        const rawUuid = typeof user?.uuid === "string" ? user.uuid.trim() : null;
        const userId = rawUuid || rawId || extractUserId(user);
        const fallbackIdentifier =
          user?.username ?? user?.email ?? user?.user?.username ?? user?.user?.email ?? null;

        const fullNameRaw = typeof user?.full_name === "string" ? user.full_name.trim() : "";
        const fullName = fullNameRaw.length
          ? fullNameRaw
          : resolveUserDisplayName(user, fallbackIdentifier ?? "Pengguna tanpa nama");

        const roles = Array.isArray(user?.roles) ? user.roles.filter(Boolean) : [];
        const statusRaw = typeof user?.status === "string" ? user.status.toLowerCase() : null;
        const isActive = statusRaw ? statusRaw === "active" : true;

        const optionValue = userId
          ? userId
          : fallbackIdentifier
            ? `virtual:${fallbackIdentifier}`
            : `virtual:${index}`;

        const username = user?.username ?? user?.user?.username ?? null;
        const email = user?.email ?? user?.user?.email ?? null;

        const metaParts = [];
        if (username) metaParts.push(username);
        if (email) metaParts.push(email);
        if (roles.length > 0) metaParts.push(roles.join(", "));
        if (!isActive) metaParts.push("Tidak aktif");

        return {
          value: String(optionValue),
          userId: userId ? String(userId) : null,
          label: fullName,
          fullName,
          username,
          email,
          roles,
          status: statusRaw,
          isActive,
          hasServerIdentifier: Boolean(userId),
          meta: metaParts,
          raw: user,
        };
      })
      .filter((option) => typeof option.label === "string" && option.label.trim().length > 0);
  }, [usersResponse]);

  const selectedUser = useMemo(
    () => userOptions.find((option) => option.value === selectedUserValue) ?? null,
    [selectedUserValue, userOptions],
  );

  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULT_FORM, ...(initialData ?? {}) });
      setTeam(initialData?.team ?? []);
      setSelectedUserValue("");
      setMemberRole(ROLES[0].value);
    }
  }, [open, initialData]);

  const disabledSave = useMemo(
    () =>
      !form.judul.trim() ||
      !form.namaPerusahaan.trim() ||
      !form.lokasi.trim() ||
      !form.ruangLingkup.trim(),
    [form],
  );

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleAddMember = () => {
    if (!selectedUser) {
      toast.warning("Pilih anggota terlebih dahulu.");
      return;
    }

    const resolvedUserId = resolveOptionUserId(selectedUser);

    if (!resolvedUserId) {
      toast.error(
        "Endpoint /admin/users belum menyediakan ID pengguna. Silakan hubungi administrator.",
      );
      return;
    }

    if (
      memberRole === "Reviewer" &&
      !(selectedUser.roles ?? []).some((role) => typeof role === "string" && role.toLowerCase() === "reviewer")
    ) {
      toast.warning("Pengguna tidak memiliki peran Reviewer pada data server.");
      return;
    }

    const alreadyInTeam = team.some((member) => member.userId === resolvedUserId);
    if (alreadyInTeam) {
      toast.warning("Anggota sudah ada dalam tim.");
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      userId: resolvedUserId,
      name: selectedUser.fullName ?? selectedUser.label,
      displayName: selectedUser.fullName ?? selectedUser.label,
      username: selectedUser.username,
      email: selectedUser.email,
      role: memberRole,
      dateAdded: new Date().toLocaleDateString("id-ID"),
    };
    setTeam((prev) => [...prev, entry]);
    setSelectedUserValue("");
    setMemberRole(ROLES[0].value);
  };

  const handleRemoveMember = (id) => {
    setTeam((prev) => prev.filter((member) => member.id !== id));
  };

  const handleSave = async () => {
    if (disabledSave || submitting) return;
    try {
      await onSubmit?.({ ...form, team });
      onOpenChange?.(false);
    } catch (error) {
      console.error("Gagal menyimpan checklist manual", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-[1200px] md:max-w-[1400px] bg-white px-8 py-6 text-navy"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="heading-4-bold">
            {isEdit ? "Edit Checklist Manual" : "Tambah Checklist Manual"}
          </DialogTitle>
          <p className="text-sm text-gray-dark">
            Lengkapi form di bawah ini untuk {isEdit ? "memperbarui" : "menambah"} Checklist Manual baru
          </p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-navy">Judul</label>
            <Input
              value={form.judul}
              onChange={handleChange("judul")}
              placeholder="Masukkan Judul"
              className="h-12 bg-state text-navy border-0"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-navy">Nama Perusahaan</label>
              <Input
                value={form.namaPerusahaan}
                onChange={handleChange("namaPerusahaan")}
                placeholder="Masukkan Nama Perusahaan"
                className="h-12 bg-state text-navy border-0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-navy">Lokasi</label>
              <Input
                value={form.lokasi}
                onChange={handleChange("lokasi")}
                placeholder="Masukkan Lokasi"
                className="h-12 bg-state text-navy border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-navy">Ruang Lingkup</label>
            <Input
              value={form.ruangLingkup}
              onChange={handleChange("ruangLingkup")}
              placeholder="Masukkan Ruang Lingkup"
              className="h-12 bg-state text-navy border-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-navy">Status</label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-12 w-full bg-state border-0 justify-between text-navy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" className="bg-white">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-navy">Tetapkan Anggota Tim</div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Select
                value={selectedUserValue || undefined}
                onValueChange={setSelectedUserValue}
                disabled={isLoadingUsers || isErrorUsers}
              >
                <SelectTrigger className="h-12 w-full bg-state border-0 justify-between text-navy">
                  <SelectValue
                    placeholder={
                      isLoadingUsers
                        ? "Memuat daftar pengguna..."
                        : isErrorUsers
                          ? "Gagal memuat pengguna"
                          : "Pilih anggota"
                    }
                  />
                </SelectTrigger>
                <SelectContent align="start" className="max-h-72 bg-white">
                  {userOptions.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      Tidak ada pengguna tersedia
                    </SelectItem>
                  ) : (
                    userOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={!option.hasServerIdentifier || !option.isActive}
                        className="flex flex-col items-start gap-1 py-2"
                      >
                        <span className="text-sm font-medium text-navy">{option.label}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger className="h-12 w-full bg-state border-0 justify-between text-navy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" className="bg-white">
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedUserValue || isLoadingUsers}
                className="h-12 rounded-sm bg-navy px-6 text-white hover:bg-navy-hover disabled:opacity-50"
              >
                Tambah
              </Button>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-medium">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center bg-state px-4 py-3 text-sm font-medium text-navy">
                <span>Nama</span>
                <span className="text-center">Peran</span>
                <span className="text-center whitespace-nowrap">Tanggal Ditambahkan</span>
                <span className="text-center">Aksi</span>
              </div>
              {team.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-dark">Belum ada anggota ditambahkan.</div>
              ) : (
                team.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] items-center border-t border-gray-medium px-4 py-3 text-sm text-navy"
                  >
                    <span className="truncate">{member.displayName ?? member.name}</span>
                    <span className="flex justify-center">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                          member.role === "Lead Auditor"
                            ? "bg-navy text-white"
                            : member.role === "Reviewer"
                              ? "bg-blue-light text-blue"
                              : "bg-gray-medium text-navy",
                        )}
                      >
                        {member.role}
                      </span>
                    </span>
                    <span className="text-center text-sm text-navy">{member.dateAdded}</span>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red hover:text-red px-3"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-11 px-6 text-navy border-gray-medium">
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={disabledSave}
            className="h-11 px-6 bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
          >
            {isEdit ? "Simpan Perubahan" : "Simpan Dokumen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
