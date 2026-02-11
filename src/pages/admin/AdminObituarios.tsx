import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Obituary = Tables<"obituaries">;
type ObituaryStatus = "rascunho" | "publicado" | "arquivado";

const statusMap: Record<ObituaryStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  publicado: { label: "Publicado", variant: "default" },
  arquivado: { label: "Arquivado", variant: "outline" },
};

function generateSlug(name: string, date: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const year = new Date(date).getFullYear();
  return `${slug}-${year}`;
}

const emptyForm = {
  full_name: "",
  death_date: "",
  birth_date: "",
  biography: "",
  funeral_location: "",
  funeral_datetime: "",
  video_stream_url: "",
  video_password: "",
  photo_url: "",
  status: "rascunho" as ObituaryStatus,
};

export default function AdminObituarios() {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Obituary | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchObituaries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("obituaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar obituários", description: error.message, variant: "destructive" });
    } else {
      setObituaries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchObituaries();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (obit: Obituary) => {
    setEditing(obit);
    setForm({
      full_name: obit.full_name,
      death_date: obit.death_date,
      birth_date: obit.birth_date || "",
      biography: obit.biography || "",
      funeral_location: obit.funeral_location || "",
      funeral_datetime: obit.funeral_datetime ? obit.funeral_datetime.slice(0, 16) : "",
      video_stream_url: obit.video_stream_url || "",
      video_password: obit.video_password || "",
      photo_url: obit.photo_url || "",
      status: obit.status as ObituaryStatus,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.death_date) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e data de falecimento.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const slug = generateSlug(form.full_name, form.death_date);
    const payload = {
      full_name: form.full_name.trim(),
      death_date: form.death_date,
      birth_date: form.birth_date || null,
      biography: form.biography.trim() || null,
      funeral_location: form.funeral_location.trim() || null,
      funeral_datetime: form.funeral_datetime || null,
      video_stream_url: form.video_stream_url.trim() || null,
      video_password: form.video_password.trim() || null,
      photo_url: form.photo_url || null,
      status: form.status,
      slug,
      published_at: form.status === "publicado" ? new Date().toISOString() : null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("obituaries").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("obituaries").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editing ? "Obituário atualizado" : "Obituário criado" });
    setDialogOpen(false);
    fetchObituaries();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("obituaries").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Obituário excluído" });
    fetchObituaries();
  };

  const filtered = obituaries.filter((o) =>
    o.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Obituários</h1>
          <p className="text-sm text-muted-foreground">Gerir registros de obituários</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Obituário
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Nenhum obituário encontrado.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((obit) => (
            <div
              key={obit.id}
              className="card-elegant flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {obit.photo_url ? (
                  <img
                    src={obit.photo_url}
                    alt={obit.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-medium text-muted-foreground">
                    {obit.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{obit.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Faleceu em {new Date(obit.death_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusMap[obit.status as ObituaryStatus]?.variant || "secondary"}>
                  {statusMap[obit.status as ObituaryStatus]?.label || obit.status}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => openEdit(obit)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir obituário?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O obituário de "{obit.full_name}" será removido permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(obit.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar Obituário" : "Novo Obituário"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <ImageUpload
              bucket="obituary-photos"
              currentUrl={form.photo_url || null}
              onUpload={(url) => setForm((f) => ({ ...f, photo_url: url }))}
              onRemove={() => setForm((f) => ({ ...f, photo_url: "" }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as ObituaryStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="death_date">Data de Falecimento *</Label>
                <Input
                  id="death_date"
                  type="date"
                  value={form.death_date}
                  onChange={(e) => setForm((f) => ({ ...f, death_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="biography">Biografia</Label>
              <Textarea
                id="biography"
                value={form.biography}
                onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))}
                placeholder="Uma breve biografia..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="funeral_location">Local do Velório</Label>
                <Input
                  id="funeral_location"
                  value={form.funeral_location}
                  onChange={(e) => setForm((f) => ({ ...f, funeral_location: e.target.value }))}
                  placeholder="Nome e endereço"
                />
              </div>
              <div>
                <Label htmlFor="funeral_datetime">Data/Hora do Velório</Label>
                <Input
                  id="funeral_datetime"
                  type="datetime-local"
                  value={form.funeral_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, funeral_datetime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="video_stream_url">Link do Velório Online</Label>
                <Input
                  id="video_stream_url"
                  type="url"
                  value={form.video_stream_url}
                  onChange={(e) => setForm((f) => ({ ...f, video_stream_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="video_password">Senha do Velório Online</Label>
                <Input
                  id="video_password"
                  value={form.video_password}
                  onChange={(e) => setForm((f) => ({ ...f, video_password: e.target.value }))}
                  placeholder="Senha de acesso"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : editing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
