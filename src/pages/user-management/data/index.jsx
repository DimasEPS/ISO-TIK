/**
 * Mock data for Manajemen Pengguna
 */

export const USERS = [
  {
    id: "USR-001",
    fullName: "Nadia",
    lastName: "Putri",
    username: "nadia.putri",
    email: "nadia.putri@example.com",
    role: "Admin",
    status: "Aktif",
    roles: [
      { name: "Admin", addedDate: "01/12/2024" },
      { name: "Reviewer", addedDate: "15/12/2024" },
    ],
  },
  {
    id: "USR-002",
    fullName: "Arif",
    lastName: "Rahman",
    username: "arif.rahman",
    email: "arif.rahman@example.com",
    role: "Reviewer",
    status: "Aktif",
    roles: [
      { name: "Reviewer", addedDate: "10/11/2024" },
    ],
  },
  {
    id: "USR-003",
    fullName: "Dewi",
    lastName: "Larasati",
    username: "dewilarasati",
    email: "dewi.larasati@example.com",
    role: "Approver",
    status: "Menunggu",
    roles: [
      { name: "Approver", addedDate: "20/10/2024" },
    ],
  },
  {
    id: "USR-004",
    fullName: "Robert",
    lastName: "Johnson",
    username: "r.johnson",
    email: "robert.johnson@example.com",
    role: "Direktur",
    status: "Aktif",
    roles: [
      { name: "Direktur", addedDate: "05/09/2024" },
      { name: "Manager", addedDate: "10/09/2024" },
    ],
  },
  {
    id: "USR-005",
    fullName: "Linda",
    lastName: "Pratama",
    username: "linda.pratama",
    email: "linda.pratama@example.com",
    role: "Manager",
    status: "Nonaktif",
    roles: [
      { name: "Manager", addedDate: "01/08/2024" },
    ],
  },
  {
    id: "USR-006",
    fullName: "Jane",
    lastName: "Smith",
    username: "jane.smith",
    email: "jane.smith@example.com",
    role: "Admin",
    status: "Aktif",
    roles: [
      { name: "Admin", addedDate: "12/07/2024" },
    ],
  },
  {
    id: "USR-007",
    fullName: "Yuda",
    lastName: "Saputra",
    username: "yuda.saputra",
    email: "yuda.saputra@example.com",
    role: "Reviewer",
    status: "Menunggu",
    roles: [
      { name: "Reviewer", addedDate: "18/06/2024" },
    ],
  },
];

export const USER_COLUMNS = [
  {
    key: "fullName",
    header: "Nama Lengkap",
    headerClassName: "text-left text-navy min-w-[120px] whitespace-nowrap",
    cellClassName: "text-left text-navy",
    render: (row) => {
      const fullName = row.lastName ? `${row.fullName} ${row.lastName}` : row.fullName;
      return (
        <div>
          <p className="">{fullName}</p>
        </div>
      );
    },
  },
  {
    key: "username",
    header: "Username",
    headerClassName: "text-left min-w-[220px]",
    cellClassName: "text-left max-w-[240px] text-gray-dark",
    accessor: "username",
  },
  {
    key: "email",
    header: "Email",
    headerClassName: "text-left min-w-[220px]",
    cellClassName: "text-left truncate",
    accessor: "email",
  },
  {
    key: "role",
    header: "Role",
    headerClassName: "text-left min-w-[120px]",
    cellClassName: "text-left",
    accessor: "role",
  },
  {
    key: "status",
    header: "Status",
    headerClassName: "text-center min-w-[100px]",
    cellClassName: "text-center whitespace-nowrap",
    render: () => null,
  },
  {
    key: "actions",
    header: "Aksi",
    headerClassName: "text-center min-w-[100px]",
    cellClassName: "flex justify-center gap-3 whitespace-nowrap",
    render: () => null,
  },
];
