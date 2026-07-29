import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, LogOut, Package, ClipboardList, X, Upload, ChevronLeft, BarChart3, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import api from "../../lib/api";
import { formatPrice } from "../../lib/format";

const emptyForm = { code: "", name: "", description: "", price: "", stock: "", images: [] };

export default function AdminDashboard() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // product object or null
  const [showForm, setShowForm] = useState(false);
  const nav = useNavigate();
  const token = localStorage.getItem("ey_admin_token");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.listProducts().catch(() => []),
      api.listOrders().catch((e) => {
        if (e?.response?.status === 401) {
          localStorage.removeItem("ey_admin_token");
          nav("/tienda/admin/login");
        }
        return [];
      }),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return <Navigate to="/tienda/admin/login" replace />;

  const logout = () => {
    localStorage.removeItem("ey_admin_token");
    nav("/tienda/admin/login");
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setShowForm(true); };

  const remove = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return;
    try {
      await api.deleteProduct(p.id);
      toast.success("Producto eliminado");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Error al eliminar");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10" data-testid="admin-dashboard">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <Link to="/tienda" className="text-xs font-semibold text-[hsl(var(--ey-coral-strong))] inline-flex items-center gap-1 mb-1"><ChevronLeft className="w-3 h-3" />Volver a la tienda</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Panel de administración</h1>
        </div>
        <button onClick={logout} className="btn-ghost-coral inline-flex items-center gap-2" data-testid="admin-logout-btn">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>

      <div className="flex gap-2 border-b border-[hsl(var(--border))] mb-6 overflow-x-auto no-scrollbar">
        <TabBtn active={tab === "products"} onClick={() => setTab("products")} icon={<Package className="w-4 h-4" />} label={`Productos (${products.length})`} testId="tab-products" />
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={<ClipboardList className="w-4 h-4" />} label={`Pedidos (${orders.length})`} testId="tab-orders" />
        <TabBtn active={tab === "reports"} onClick={() => setTab("reports")} icon={<BarChart3 className="w-4 h-4" />} label="Reportes" testId="tab-reports" />
      </div>

      {tab === "products" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openCreate} className="btn-coral" data-testid="new-product-btn">
              <Plus className="w-4 h-4" /> Nuevo producto
            </button>
          </div>
          {loading ? (
            <div className="text-center py-16 text-neutral-400">Cargando...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[hsl(var(--border))]">
              <Package className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
              <p className="text-[hsl(var(--ey-ink-soft))]">Aún no hay productos. Creá el primero.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[hsl(var(--ey-cream))] text-xs uppercase tracking-wider text-[hsl(var(--ey-ink-soft))]">
                  <tr>
                    <th className="text-left p-3">Imagen</th>
                    <th className="text-left p-3">Código</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-right p-3">Precio</th>
                    <th className="text-right p-3">Stock</th>
                    <th className="text-right p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-[hsl(var(--border))] hover:bg-neutral-50" data-testid={`admin-product-row-${p.code}`}>
                      <td className="p-3">
                        <div className="w-12 h-12 bg-[hsl(var(--ey-cream))] rounded-lg overflow-hidden flex items-center justify-center">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-contain" /> : <Package className="w-4 h-4 text-neutral-300" />}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{p.code}</td>
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-right font-semibold">{formatPrice(p.price)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-neutral-100 rounded-lg" data-testid={`edit-product-${p.code}`}><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => remove(p)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" data-testid={`delete-product-${p.code}`}><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div>
          {loading ? (
            <div className="text-center py-16 text-neutral-400">Cargando...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border">Aún no hay pedidos.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <details key={o.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4" data-testid={`admin-order-${o.id.slice(0,8)}`}>
                  <summary className="cursor-pointer flex flex-wrap items-center gap-4 justify-between">
                    <div>
                      <div className="font-mono text-xs text-neutral-400">#{o.id.slice(0, 8).toUpperCase()}</div>
                      <div className="font-semibold">{o.first_name} {o.last_name}</div>
                      <div className="text-xs text-[hsl(var(--ey-ink-soft))]">{new Date(o.created_at).toLocaleString("es-AR")}</div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-lg font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }}>{formatPrice(o.total)}</div>
                        <div className="text-xs">{o.email_sent ? "📧 Enviado" : "⚠️ Sin envío"}</div>
                      </div>
                      <button
                        onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if(window.confirm(`¿Eliminar pedido #${o.id.slice(0,8).toUpperCase()}?`)){ try { await api.deleteOrder(o.id); toast.success("Pedido eliminado"); load(); } catch(err){ toast.error(err?.response?.data?.detail || "Error"); } } }}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                        data-testid={`delete-order-${o.id.slice(0,8)}`}
                        title="Eliminar pedido"
                      ><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </summary>
                  <div className="mt-4 pt-4 border-t text-sm space-y-2">
                    <div className="text-[hsl(var(--ey-ink-soft))]"><b>Email:</b> {o.email} · <b>Tel:</b> {o.phone}</div>
                    {o.items.map((it) => (
                      <div key={it.code} className="flex justify-between">
                        <span>{it.code} — {it.name} × {it.quantity}</span>
                        <span className="font-semibold">{formatPrice(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reports" && <ReportsTab orders={orders} loading={loading} />}

      {showForm && <ProductForm initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ReportsTab({ orders, loading }) {
  const totalSales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const mailCount = orders.filter((o) => (o.channel || "mail") === "mail").length;
  const waCount = orders.filter((o) => o.channel === "whatsapp").length;

  const exportExcel = () => {
    if (!orders.length) {
      toast.error("No hay pedidos para exportar");
      return;
    }
    // One row per item, replicating order-level info for easy pivoting in Excel.
    const rows = [];
    for (const o of orders) {
      const items = o.items || [];
      if (items.length === 0) {
        rows.push({
          "ID Pedido": o.id,
          "Fecha": new Date(o.created_at).toLocaleString("es-AR"),
          "Canal": o.channel || "mail",
          "Nombre": o.first_name,
          "Apellido": o.last_name,
          "Teléfono": o.phone,
          "Email": o.email,
          "Código Producto": "",
          "Producto": "",
          "Cantidad": "",
          "Precio Unitario": "",
          "Subtotal": "",
          "Total Pedido": Number(o.total || 0),
          "Mail al admin": o.email_sent ? "Sí" : "No",
          "Mail al cliente": o.customer_email_sent ? "Sí" : "No",
        });
      } else {
        for (const it of items) {
          rows.push({
            "ID Pedido": o.id,
            "Fecha": new Date(o.created_at).toLocaleString("es-AR"),
            "Canal": o.channel || "mail",
            "Nombre": o.first_name,
            "Apellido": o.last_name,
            "Teléfono": o.phone,
            "Email": o.email,
            "Código Producto": it.code,
            "Producto": it.name,
            "Cantidad": it.quantity,
            "Precio Unitario": it.unit_price,
            "Subtotal": it.subtotal,
            "Total Pedido": Number(o.total || 0),
            "Mail al admin": o.email_sent ? "Sí" : "No",
            "Mail al cliente": o.customer_email_sent ? "Sí" : "No",
          });
        }
      }
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    // Set column widths
    ws["!cols"] = [
      { wch: 36 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
      { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 32 }, { wch: 8 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `electroyes-ventas-${stamp}.xlsx`);
    toast.success("Excel generado");
  };

  if (loading) return <div className="text-center py-16 text-neutral-400">Cargando...</div>;

  return (
    <div data-testid="reports-tab">
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pedidos totales" value={orders.length} testId="stat-total-orders" />
        <StatCard label="Facturación" value={formatPrice(totalSales)} testId="stat-total-sales" />
        <StatCard label="Por Mail" value={mailCount} testId="stat-mail-orders" />
        <StatCard label="Por WhatsApp" value={waCount} testId="stat-wa-orders" />
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={exportExcel} className="btn-coral inline-flex items-center gap-2" data-testid="export-excel-btn">
          <Download className="w-4 h-4" /> Exportar a Excel
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">Aún no hay pedidos para reportar.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-[hsl(var(--border))]">
          <table className="w-full text-sm" data-testid="reports-table">
            <thead className="bg-[hsl(var(--ey-cream))] text-xs uppercase text-[hsl(var(--ey-ink-soft))]">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Canal</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Contacto</th>
                <th className="text-left px-4 py-3">Productos</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Mail</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[hsl(var(--border))]" data-testid={`report-row-${o.id.slice(0,8)}`}>
                  <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(o.created_at).toLocaleString("es-AR")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      o.channel === "whatsapp" ? "bg-[#25D366]/10 text-[#128C7E]" : "bg-[hsl(var(--ey-coral-soft))] text-[hsl(var(--ey-coral-strong))]"
                    }`}>
                      {o.channel === "whatsapp" ? "WhatsApp" : "Mail"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{o.first_name} {o.last_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{o.email}</div>
                    <div className="text-xs text-neutral-400">{o.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {(o.items || []).map((i) => (
                        <div key={i.code} className="text-xs">
                          <span className="font-semibold">{i.quantity}×</span> {i.name} <span className="text-neutral-400">({i.code})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: "hsl(var(--ey-coral-strong))" }}>{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-center text-xs">{o.email_sent ? "✅" : (o.channel === "whatsapp" ? "—" : "⚠️")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, testId }) {
  return (
    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5" data-testid={testId}>
      <div className="text-xs uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] font-bold">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active
          ? "border-[hsl(var(--ey-coral))] text-[hsl(var(--ey-coral-strong))]"
          : "border-transparent text-[hsl(var(--ey-ink-soft))] hover:text-[hsl(var(--ey-ink))]"
      }`}
    >
      {icon}{label}
    </button>
  );
}

function ProductForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    initial
      ? { code: initial.code, name: initial.name, description: initial.description || "", price: initial.price, stock: initial.stock, images: initial.images || [] }
      : { ...emptyForm }
  );
  const [saving, setSaving] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [uploading, setUploading] = useState(false);
  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (form.images.length + files.length > 4) {
      toast.error("Máximo 4 imágenes por producto");
      return;
    }
    for (const f of files) {
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`"${f.name}" supera 2MB`);
        e.target.value = "";
        return;
      }
    }
    setUploading(true);
    try {
      const urls = [];
      for (const f of files) {
        const { url } = await api.uploadImage(f);
        urls.push(url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImg = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.images.length < 1) { toast.error("Cargá al menos 1 imagen"); return; }
    setSaving(true);
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      images: form.images,
    };
    try {
      if (initial) await api.updateProduct(initial.id, payload);
      else await api.createProduct(payload);
      toast.success(initial ? "Producto actualizado" : "Producto creado");
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()} data-testid="product-form-modal">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-xl font-extrabold">{initial ? "Editar producto" : "Nuevo producto"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Código interno" value={form.code} onChange={update("code")} required testId="pf-code" />
            <Input label="Precio (ARS)" type="number" step="0.01" value={form.price} onChange={update("price")} required testId="pf-price" />
          </div>
          <Input label="Nombre" value={form.name} onChange={update("name")} required testId="pf-name" />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--ey-coral))]"
              data-testid="pf-description"
            />
          </div>
          <Input label="Stock" type="number" value={form.stock} onChange={update("stock")} required testId="pf-stock" />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-1.5">Imágenes (1 a 4, máx 2MB cada una)</label>
            <div className="grid grid-cols-4 gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-[hsl(var(--ey-cream))] rounded-lg overflow-hidden border">
                  <img src={img} alt="" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => removeImg(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/95 border shadow flex items-center justify-center" data-testid={`pf-remove-img-${i}`}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.images.length < 4 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center cursor-pointer hover:border-[hsl(var(--ey-coral))] transition-colors">
                  {uploading ? <span className="text-xs text-neutral-500">Subiendo...</span> : <Upload className="w-5 h-5 text-neutral-400" />}
                  <input type="file" accept="image/*" multiple onChange={onFiles} disabled={uploading} className="hidden" data-testid="pf-upload-input" />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full font-semibold text-[hsl(var(--ey-ink-soft))] hover:bg-neutral-100">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-coral" data-testid="pf-save-btn">
              {saving ? "Guardando..." : initial ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, testId, ...props }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--ey-coral))]"
        data-testid={testId}
      />
    </label>
  );
}
