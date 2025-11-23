import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronRight, SearchIcon, FilePen, Trash2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PaginateControls } from "@/components/admin/table/PaginateControls";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import {
  ItemAuditDialog,
  DeleteItemAuditDialog,
} from "@/components/admin/audit/ItemAuditDialog";
import { itemAuditData } from "@/mocks/tableData";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function ItemAuditCard({ item, onEdit, onDelete }) {
  return (
    <div className="border-l-4 border-navy bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-navy text-base leading-relaxed">
            {item.itemAudit}
          </p>
          <p className="text-sm text-gray-600">
            Aspek: <span className="font-medium">{item.aspekName}</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="hover:bg-blue-50 p-2 rounded transition-colors"
            title="Edit item"
          >
            <FilePen className="text-[#2B7FFF] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="hover:bg-red-50 p-2 rounded transition-colors"
            title="Hapus item"
          >
            <Trash2 className="text-[#FB2C36] w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 body text-gray-dark">
      <Link
        to="/admin/audit/checklist-excel"
        className="text-[#2B7FFF] hover:underline"
      >
        Checklist Excel
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-dark" />
      <span className="text-[#2B7FFF] font-medium">Item Audit</span>
    </nav>
  );
}

export default function ItemAudit() {
  usePageTemplate({
    title: "Detail Checklist Audit",
    subtitle: "Kelola dokumen, checklist, aspek, pertanyaan audit",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const location = useLocation();
  const { id: checklistExcelId } = useParams();

  const { checklistAuditName, checklistExcelName } = location.state || {
    checklistAuditName: "Pencapaian Target Uptime 99,995%",
    checklistExcelName: "Fully Redundant Critical Systems",
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [itemList, setItemList] = useState([]);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load item data based on checklistExcelId
  useEffect(() => {
    const filtered = itemAuditData.filter(
      (item) => item.checklistExcelId === parseInt(checklistExcelId)
    );
    setItemList(filtered);
  }, [checklistExcelId]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return itemList;
    return itemList.filter((item) =>
      item.itemAudit.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [itemList, searchQuery]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  const handleAddItem = (formData) => {
    const newItem = {
      id: Math.max(...itemList.map((i) => i.id), 0) + 1,
      checklistExcelId: parseInt(checklistExcelId),
      aspekId: formData.aspekId,
      aspekName: formData.aspekName,
      itemAudit: formData.itemAudit,
    };
    setItemList([...itemList, newItem]);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditItem = (formData) => {
    setItemList(
      itemList.map((i) =>
        i.id === selectedItem.id
          ? {
              ...i,
              aspekId: formData.aspekId,
              aspekName: formData.aspekName,
              itemAudit: formData.itemAudit,
            }
          : i
      )
    );
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setItemList(itemList.filter((i) => i.id !== selectedItem.id));
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      <Breadcrumb />

      <div>
        <h2 className="text-2xl font-bold text-navy mb-3">Item Audit</h2>
        <div className="flex items-start gap-12">
          <div>
            <p className="text-sm text-gray-600 mb-1">Checklist Audit:</p>
            <p className="text-[#2B7FFF] font-medium">{checklistAuditName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Checklist Excel:</p>
            <p className="text-[#2B7FFF] font-medium">{checklistExcelName}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <InputGroup className="h-14 max-w-[1080px] flex-1">
          <InputGroupInput
            placeholder="Cari item audit"
            className="bg-state text-navy placeholder:text-gray-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <ItemAuditDialog mode="add" onSave={handleAddItem} />
      </div>

      <div className="space-y-3">
        {pagedData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Tidak ada item audit ditemukan</p>
          </div>
        ) : (
          pagedData.map((item) => (
            <ItemAuditCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {totalData > 0 && (
        <PaginateControls
          perPage={perPage}
          onPaginateChange={handlePaginateChange}
          paginateValue={PAGINATE_OPTIONS}
          setActivePage={setActivePage}
          activePage={currentPage}
          onPageChange={setActivePage}
          totalPages={totalPages}
          totalData={totalData}
        />
      )}

      {/* Edit Dialog */}
      {selectedItem && (
        <ItemAuditDialog
          key={`edit-${selectedItem.id}`}
          mode="edit"
          item={selectedItem}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditItem}
        />
      )}

      {/* Delete Dialog */}
      <DeleteItemAuditDialog
        item={selectedItem}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
