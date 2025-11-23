import { ConfirmationInput } from "@/pages/ncr/components/common";

/**
 * Modal konfirmasi hapus user
 */
export function DeleteUserModal({ isOpen, onClose, user, onConfirm }) {
  if (!user) return null;

  return (
    <ConfirmationInput
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Pengguna"
      description={
        <>
          Apakah Anda yakin ingin menghapus pengguna <strong>{user.fullName}</strong> ({user.username})?
          <br />
          <br />
          Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pengguna ini.
        </>
      }
      confirmationText={user.username}
      confirmationLabel="Ketik username untuk konfirmasi"
      onConfirm={() => onConfirm(user.id)}
      confirmButtonText="Hapus Pengguna"
      confirmButtonClassName="bg-red-600 hover:bg-red-700"
    />
  );
}
