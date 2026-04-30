import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { formatCurrency, cn } from "../../lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ImageOff,
  Zap,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Variant {
  type: string;
  options: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews_count: number;
  sold_count: number;
  description: string;
  variants: Variant[];
  is_flash_sale: boolean;
  stock: number;
  active: boolean;
}

// ── Draft uses strings for numeric fields so the input can be cleared freely ──
type ProductDraft = {
  name: string;
  price: number | string;
  original_price: number | string | null;
  image: string;
  images: string[];
  category: string;
  description: string;
  variants: Variant[];
  is_flash_sale: boolean;
  stock: number | string;
  active: boolean;
};

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Health & Beauty",
  "Sports",
  "Grocery",
  "Books",
  "Toys",
];

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  price: "",
  original_price: "",
  image: "",
  images: [],
  category: "Electronics",
  description: "",
  variants: [],
  is_flash_sale: false,
  stock: "",
  active: true,
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Variants builder state
  const [variantType, setVariantType] = useState("");
  const [variantOptions, setVariantOptions] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!draft.name.trim()) {
      setFormError("Product name is required.");
      return false;
    }
    const parsedPrice = Number(draft.price);
    if (!draft.price && draft.price !== 0 || isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Price must be greater than 0.");
      return false;
    }
    if (!draft.image.trim()) {
      setFormError("Main image URL is required.");
      return false;
    }
    if (!draft.description.trim()) {
      setFormError("Description is required.");
      return false;
    }
    const parsedStock = Number(draft.stock);
    if (draft.stock !== "" && (isNaN(parsedStock) || parsedStock < 0)) {
      setFormError("Stock cannot be negative.");
      return false;
    }
    setFormError("");
    return true;
  };

  // ── Open modals ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setDraft(EMPTY_DRAFT);
    setVariantType("");
    setVariantOptions("");
    setFormError("");
    setModal("add");
  };

  const openEdit = (p: Product) => {
    setDraft({
      name: p.name,
      // Store as string so the input field can be fully cleared/edited
      price: p.price,
      original_price: p.original_price ?? "",
      image: p.image,
      images: p.images,
      category: p.category,
      description: p.description,
      variants: p.variants,
      is_flash_sale: p.is_flash_sale,
      stock: p.stock,
      active: p.active,
    });
    setEditId(p.id);
    setVariantType("");
    setVariantOptions("");
    setFormError("");
    setModal("edit");
  };

  const openDelete = (p: Product) => {
    setDeleteTarget(p);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setDeleteTarget(null);
  };

  // ── Variant helpers ────────────────────────────────────────────────────────
  const addVariant = () => {
    if (!variantType.trim() || !variantOptions.trim()) return;
    const options = variantOptions
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    if (!options.length) return;
    setDraft((d) => ({
      ...d,
      variants: [...d.variants, { type: variantType.trim(), options }],
    }));
    setVariantType("");
    setVariantOptions("");
  };

  const removeVariant = (i: number) =>
    setDraft((d) => ({
      ...d,
      variants: d.variants.filter((_, idx) => idx !== i),
    }));

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      ...draft,
      price: Number(draft.price),
      original_price:
        draft.original_price !== "" && draft.original_price !== null
          ? Number(draft.original_price)
          : null,
      stock: draft.stock !== "" ? Number(draft.stock) : 0,
      images: [
        draft.image,
        ...draft.images.filter((u) => u && u !== draft.image),
      ].filter(Boolean),
    };

    const { error } =
      modal === "edit" && editId
        ? await supabase.from("products").update(payload).eq("id", editId)
        : await supabase.from("products").insert([payload]);

    if (error) {
      setFormError(error.message);
    } else {
      await fetchProducts();
      closeModal();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    await supabase.from("products").delete().eq("id", deleteTarget.id);
    await fetchProducts();
    setSaving(false);
    closeModal();
  };

  const toggleActive = async (p: Product) => {
    await supabase
      .from("products")
      .update({ active: !p.active })
      .eq("id", p.id);
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)),
    );
  };

  // ── Input helpers ──────────────────────────────────────────────────────────
  const field = (label: string, node: React.ReactNode, className?: string) => (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      {node}
    </div>
  );

  // ── FIX: number inputs store the raw string so the user can fully clear them
  const textInput = (
    key: keyof ProductDraft,
    type = "text",
    placeholder = "",
  ) => (
    <input
      type={type}
      value={draft[key] as string | number}
      onChange={(e) =>
        setDraft((d) => ({
          ...d,
          // For number fields: keep the raw string so the field can be emptied.
          // Conversion to Number happens only in handleSave / validate.
          [key]: type === "number" ? e.target.value : e.target.value,
        }))
      }
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 transition"
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 transition"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm animate-pulse">
          Loading products…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={cn(
                "bg-white rounded-2xl border overflow-hidden transition",
                product.active
                  ? "border-gray-100"
                  : "border-gray-100 opacity-60",
              )}
            >
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ImageOff className="w-12 h-12 text-gray-200" />
                )}
                {product.is_flash_sale && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    Flash
                  </span>
                )}
                {!product.active && (
                  <span className="absolute top-2 right-2 bg-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    Hidden
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="font-bold text-gray-900 text-sm line-clamp-2">
                  {product.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-600">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs text-gray-400">
                    Stock: {product.stock}
                  </span>
                </div>
                <span className="inline-block text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase">
                  {product.category}
                </span>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggleActive(product)}
                    title={product.active ? "Hide product" : "Show product"}
                    className={cn(
                      "flex-1 h-8 rounded-lg text-xs font-bold transition",
                      product.active
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-50 text-green-700 hover:bg-green-100",
                    )}
                  >
                    {product.active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    aria-label="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDelete(product)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                {modal === "add" ? "Add New Product" : "Edit Product"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {field(
                "Product Name *",
                textInput("name", "text", "e.g. Wireless Headphones Pro"),
              )}

              <div className="grid grid-cols-2 gap-4">
                {field("Price *", textInput("price", "number", "0.00"))}
                {field(
                  "Original Price",
                  textInput("original_price", "number", "0.00"),
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {field(
                  "Category *",
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, category: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>,
                )}
                {field("Stock", textInput("stock", "number", "0"))}
              </div>

              {field(
                "Main Image URL *",
                textInput("image", "text", "https://..."),
              )}

              {draft.image && (
                <img
                  src={draft.image}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                />
              )}

              {field(
                "Description *",
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 pt-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 resize-none"
                />,
              )}

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.is_flash_sale}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        is_flash_sale: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-red-500" /> Flash Sale
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, active: e.target.checked }))
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Visible in store
                  </span>
                </label>
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Variants
                </p>
                {draft.variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm"
                  >
                    <span>
                      <strong>{v.type}:</strong> {v.options.join(", ")}
                    </span>
                    <button
                      onClick={() => removeVariant(i)}
                      className="text-red-400 hover:text-red-600 ml-2"
                      aria-label="Remove variant"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type (e.g. Color)"
                    value={variantType}
                    onChange={(e) => setVariantType(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Options (comma-separated)"
                    value={variantOptions}
                    onChange={(e) => setVariantOptions(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="h-9 px-3 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {formError}
                </p>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : modal === "add"
                    ? "Add Product"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      {modal === "delete" && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Delete product?</h2>
              <p className="text-sm text-gray-500 mt-1">
                "<strong>{deleteTarget.name}</strong>" will be permanently
                removed. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 h-11 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
