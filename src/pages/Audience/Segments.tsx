import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../context/AuthContext";
import { listTags, createTag, deleteTag } from "../../services/tag";
import {
  listSegments,
  createSegment,
  deleteSegment,
  previewSegment,
} from "../../services/segment";
import type {
  Tag,
  Segment,
  SegmentRule,
  SegmentRuleField,
  SegmentRuleOperator,
} from "../../services/types";

// ─── shared style constants ───────────────────────────────────────────────────
const thClass =
  "px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400";

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

// ─── preset tag colors ────────────────────────────────────────────────────────
const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

// ─── rule field / operator metadata ──────────────────────────────────────────
const FIELD_OPTIONS: { value: SegmentRuleField; label: string }[] = [
  { value: "name", label: "Nama" },
  { value: "phone_number", label: "No. HP" },
  { value: "email", label: "Email" },
  { value: "tag", label: "Tag" },
];

function operatorsForField(
  field: SegmentRuleField
): { value: SegmentRuleOperator; label: string }[] {
  if (field === "tag") {
    return [{ value: "has", label: "memiliki" }];
  }
  return [
    { value: "eq", label: "sama dengan" },
    { value: "contains", label: "mengandung" },
  ];
}

function defaultOperator(field: SegmentRuleField): SegmentRuleOperator {
  return field === "tag" ? "has" : "eq";
}

// ─── empty rule factory ───────────────────────────────────────────────────────
function emptyRule(): SegmentRule {
  return { field: "name", operator: "eq", value: "" };
}

// ─── TagChip ─────────────────────────────────────────────────────────────────
function TagChip({ tag }: { tag: Tag }) {
  const bg = tag.color ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: bg }}
    >
      {tag.name}
    </span>
  );
}

// ─── ColorSwatch picker ───────────────────────────────────────────────────────
function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {TAG_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-full transition ring-offset-2 ${
            value === c ? "ring-2 ring-brand-500" : "ring-0"
          }`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
      {/* fallback: native color input */}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border border-gray-300 dark:border-gray-700"
        title="Warna kustom"
      />
    </div>
  );
}

// ─── RulesBuilder ─────────────────────────────────────────────────────────────
function RulesBuilder({
  rules,
  tags,
  onChange,
}: {
  rules: SegmentRule[];
  tags: Tag[];
  onChange: (rules: SegmentRule[]) => void;
}) {
  const setRule = (idx: number, patch: Partial<SegmentRule>) => {
    const next = rules.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  };

  const addRule = () => onChange([...rules, emptyRule()]);

  const removeRule = (idx: number) =>
    onChange(rules.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-3">
      {rules.map((rule, idx) => {
        const operators = operatorsForField(rule.field);
        return (
          <div
            key={idx}
            className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            {/* field */}
            <select
              className={`${selectClass} w-auto flex-1 min-w-[110px]`}
              value={rule.field}
              onChange={(e) => {
                const field = e.target.value as SegmentRuleField;
                setRule(idx, {
                  field,
                  operator: defaultOperator(field),
                  value: "",
                });
              }}
            >
              {FIELD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* operator */}
            <select
              className={`${selectClass} w-auto flex-1 min-w-[120px]`}
              value={rule.operator}
              onChange={(e) =>
                setRule(idx, { operator: e.target.value as SegmentRuleOperator })
              }
            >
              {operators.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* value */}
            {rule.field === "tag" ? (
              <select
                className={`${selectClass} w-auto flex-1 min-w-[120px]`}
                value={rule.value}
                onChange={(e) => setRule(idx, { value: e.target.value })}
              >
                <option value="" disabled>
                  Pilih tag
                </option>
                {tags.map((t) => (
                  <option key={t.tag_id} value={t.tag_id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className={`${selectClass} flex-1 min-w-[120px]`}
                placeholder="nilai..."
                value={rule.value}
                onChange={(e) => setRule(idx, { value: e.target.value })}
              />
            )}

            {/* remove button */}
            <button
              type="button"
              onClick={() => removeRule(idx)}
              className="px-2 py-1 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition"
            >
              Hapus
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRule}
        className="self-start px-4 py-2 text-xs font-medium text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50 dark:text-brand-400 dark:border-brand-600 dark:hover:bg-brand-500/10 transition"
      >
        + Tambah Kondisi
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Segments() {
  const { user } = useAuth();

  // ── tags state ──────────────────────────────────────────────────────────────
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // tag create modal
  const tagModal = useModal();
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[4]);
  const [tagFormError, setTagFormError] = useState<string | null>(null);
  const [tagSubmitting, setTagSubmitting] = useState(false);

  // ── segments state ──────────────────────────────────────────────────────────
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentsError, setSegmentsError] = useState<string | null>(null);

  // segment create modal
  const segModal = useModal();
  const [segName, setSegName] = useState("");
  const [segDesc, setSegDesc] = useState("");
  const [segMatch, setSegMatch] = useState<"all" | "any">("all");
  const [segRules, setSegRules] = useState<SegmentRule[]>([emptyRule()]);
  const [segFormError, setSegFormError] = useState<string | null>(null);
  const [segSubmitting, setSegSubmitting] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // debounce ref for preview
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── data fetching ────────────────────────────────────────────────────────────
  const fetchTags = async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const res = await listTags(user?.id);
      setTags(res);
    } catch (err) {
      setTagsError(
        err instanceof Error ? err.message : "Gagal mengambil daftar tag."
      );
    } finally {
      setTagsLoading(false);
    }
  };

  const fetchSegments = async () => {
    setSegmentsLoading(true);
    setSegmentsError(null);
    try {
      const res = await listSegments(user?.id);
      setSegments(res);
    } catch (err) {
      setSegmentsError(
        err instanceof Error ? err.message : "Gagal mengambil daftar segmen."
      );
    } finally {
      setSegmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchSegments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── preview debounce ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!segModal.isOpen || !user) return;

    // Clear previous timer
    if (previewTimer.current) clearTimeout(previewTimer.current);

    // Guard: skip if no complete rules
    const hasCompleteRules = segRules.some((r) => r.value.trim() !== "");
    if (!hasCompleteRules) {
      setPreviewCount(null);
      return;
    }

    previewTimer.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const result = await previewSegment({
          user_id: user.id,
          conditions: { match: segMatch, rules: segRules },
        });
        setPreviewCount(result.count);
      } catch {
        // silently ignore preview errors
        setPreviewCount(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segRules, segMatch, segModal.isOpen]);

  // ── tag handlers ─────────────────────────────────────────────────────────────
  const handleOpenCreateTag = () => {
    setTagName("");
    setTagColor(TAG_COLORS[4]);
    setTagFormError(null);
    tagModal.openModal();
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagFormError(null);

    if (!tagName.trim()) {
      setTagFormError("Nama tag wajib diisi.");
      return;
    }
    if (!user) {
      setTagFormError("Anda harus login terlebih dahulu.");
      return;
    }

    setTagSubmitting(true);
    try {
      await createTag({
        user_id: user.id,
        name: tagName.trim(),
        color: tagColor,
      });
      tagModal.closeModal();
      await fetchTags();
    } catch (err) {
      setTagFormError(
        err instanceof Error ? err.message : "Gagal membuat tag."
      );
    } finally {
      setTagSubmitting(false);
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    const confirmed = window.confirm(
      `Hapus tag "${tag.name}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    try {
      await deleteTag(tag.tag_id);
      await fetchTags();
    } catch (err) {
      setTagsError(
        err instanceof Error ? err.message : "Gagal menghapus tag."
      );
    }
  };

  // ── segment handlers ─────────────────────────────────────────────────────────
  const handleOpenCreateSegment = () => {
    setSegName("");
    setSegDesc("");
    setSegMatch("all");
    setSegRules([emptyRule()]);
    setSegFormError(null);
    setPreviewCount(null);
    segModal.openModal();
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSegFormError(null);

    if (!segName.trim()) {
      setSegFormError("Nama segmen wajib diisi.");
      return;
    }
    if (!user) {
      setSegFormError("Anda harus login terlebih dahulu.");
      return;
    }
    if (segRules.length === 0) {
      setSegFormError("Tambahkan minimal satu kondisi.");
      return;
    }
    const incomplete = segRules.some((r) => r.value.trim() === "");
    if (incomplete) {
      setSegFormError("Semua kondisi harus memiliki nilai.");
      return;
    }

    setSegSubmitting(true);
    try {
      await createSegment({
        user_id: user.id,
        name: segName.trim(),
        description: segDesc.trim() || undefined,
        conditions: { match: segMatch, rules: segRules },
      });
      segModal.closeModal();
      await fetchSegments();
    } catch (err) {
      setSegFormError(
        err instanceof Error ? err.message : "Gagal membuat segmen."
      );
    } finally {
      setSegSubmitting(false);
    }
  };

  const handleDeleteSegment = async (seg: Segment) => {
    const confirmed = window.confirm(
      `Hapus segmen "${seg.name}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    try {
      await deleteSegment(seg.segment_id);
      await fetchSegments();
    } catch (err) {
      setSegmentsError(
        err instanceof Error ? err.message : "Gagal menghapus segmen."
      );
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageMeta
        title="Segments & Tags | Zaplio"
        description="Kelola segmen dan tag kontak"
      />
      <PageBreadcrumb pageTitle="Segments & Tags" />

      <div className="space-y-6">
        {/* ── Tags section ───────────────────────────────────────────────────── */}
        <ComponentCard
          title="Tags"
          desc="Beri label pada kontak untuk pengelompokan dan filter yang lebih mudah."
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tags.length} tag terdaftar
            </span>
            <button
              onClick={handleOpenCreateTag}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              + Tambah Tag
            </button>
          </div>

          {tagsError && (
            <p className="mb-4 text-sm text-error-600 dark:text-error-400">
              {tagsError}
            </p>
          )}

          {tagsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Memuat...
            </p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada tag. Klik "Tambah Tag" untuk memulai.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div key={tag.tag_id} className="flex items-center gap-1.5">
                  <TagChip tag={tag} />
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="text-xs text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-400 transition"
                    title={`Hapus tag ${tag.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>

        {/* ── Segments section ────────────────────────────────────────────────── */}
        <ComponentCard
          title="Segmen"
          desc="Kelompokkan kontak berdasarkan kondisi untuk penargetan campaign yang tepat."
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {segments.length} segmen terdaftar
            </span>
            <button
              onClick={handleOpenCreateSegment}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              + Tambah Segmen
            </button>
          </div>

          {segmentsError && (
            <p className="mb-4 text-sm text-error-600 dark:text-error-400">
              {segmentsError}
            </p>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={thClass}>
                    Nama
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Deskripsi
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Jumlah Kontak
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {segmentsLoading ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      Memuat...
                    </TableCell>
                  </TableRow>
                ) : segments.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      Belum ada segmen. Klik "Tambah Segmen" untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  segments.map((seg) => (
                    <TableRow key={seg.segment_id}>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {seg.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {seg.description ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                          {seg.member_count.toLocaleString("id-ID")} kontak
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteSegment(seg)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition"
                        >
                          Hapus
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>

      {/* ── Modal: Tambah Tag ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={tagModal.isOpen}
        onClose={tagModal.closeModal}
        className="max-w-sm p-8 mx-4"
      >
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
          Tambah Tag
        </h3>
        <form onSubmit={handleCreateTag} className="flex flex-col gap-4">
          <div>
            <Label>
              Nama Tag <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="contoh: VIP"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              disabled={tagSubmitting}
            />
          </div>
          <div>
            <Label>Warna</Label>
            <ColorPicker value={tagColor} onChange={setTagColor} />
            {tagColor && (
              <div className="mt-2">
                <TagChip tag={{ tag_id: "preview", user_id: "", name: tagName || "Preview", color: tagColor, created_at: "" }} />
              </div>
            )}
          </div>

          {tagFormError && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {tagFormError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={tagModal.closeModal}
              disabled={tagSubmitting}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 transition bg-white border rounded-lg ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={tagSubmitting}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tagSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Tambah Segmen ──────────────────────────────────────────────── */}
      <Modal
        isOpen={segModal.isOpen}
        onClose={segModal.closeModal}
        className="max-w-2xl p-8 mx-4"
      >
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
          Tambah Segmen
        </h3>
        <form onSubmit={handleCreateSegment} className="flex flex-col gap-5">
          {/* name */}
          <div>
            <Label>
              Nama Segmen <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="contoh: Pelanggan Jakarta"
              value={segName}
              onChange={(e) => setSegName(e.target.value)}
              disabled={segSubmitting}
            />
          </div>

          {/* description */}
          <div>
            <Label>Deskripsi (opsional)</Label>
            <Input
              placeholder="contoh: Semua pelanggan yang berdomisili di Jakarta"
              value={segDesc}
              onChange={(e) => setSegDesc(e.target.value)}
              disabled={segSubmitting}
            />
          </div>

          {/* match selector */}
          <div>
            <Label>Cocokkan</Label>
            <select
              className={selectClass}
              value={segMatch}
              onChange={(e) => setSegMatch(e.target.value as "all" | "any")}
              disabled={segSubmitting}
            >
              <option value="all">Semua kondisi (AND)</option>
              <option value="any">Salah satu kondisi (OR)</option>
            </select>
          </div>

          {/* rules builder */}
          <div>
            <Label>Kondisi</Label>
            <RulesBuilder
              rules={segRules}
              tags={tags}
              onChange={setSegRules}
            />
          </div>

          {/* live preview count */}
          <div className="text-sm text-gray-500 dark:text-gray-400 min-h-[1.5rem]">
            {previewLoading ? (
              <span>Menghitung kontak cocok...</span>
            ) : previewCount !== null ? (
              <span className="font-medium text-brand-600 dark:text-brand-400">
                ≈ {previewCount.toLocaleString("id-ID")} kontak cocok
              </span>
            ) : null}
          </div>

          {segFormError && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {segFormError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={segModal.closeModal}
              disabled={segSubmitting}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 transition bg-white border rounded-lg ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={segSubmitting}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {segSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
