"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Award, Plus, Pencil, Trash2, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  certificationsQueryKey,
  useCertifications,
  useCreateCertification,
  useUpdateCertification,
  useDeleteCertification,
  type CertificationRequest,
  type CertificationResponse,
} from "@/api/certifications";

interface CertificationFormState {
  name: string;
  issuingOrganization: string;
  issuedDate: string;
}

const emptyCertificationForm: CertificationFormState = {
  name: "",
  issuingOrganization: "",
  issuedDate: "",
};

function certificationToForm(cert: CertificationResponse): CertificationFormState {
  return {
    name: cert.name ?? "",
    issuingOrganization: cert.issuingOrganization ?? "",
    issuedDate: cert.issuedDate ?? "",
  };
}

function toCertificationPayload(form: CertificationFormState): CertificationRequest {
  return {
    name: form.name.trim(),
    issuingOrganization: form.issuingOrganization.trim() || undefined,
    issuedDate: form.issuedDate,
  };
}

function CertificationListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="자격증 불러오는 중">
      {[0, 1].map((item) => (
        <div key={item} className="flex items-start gap-4">
          <Skeleton className="mt-1 h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CertificationSection() {
  const qc = useQueryClient();
  const { data: certifications = [], isLoading } = useCertifications();
  const createMutation = useCreateCertification();
  const updateMutation = useUpdateCertification();
  const deleteMutation = useDeleteCertification();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CertificationFormState>(emptyCertificationForm);

  const resetForm = () => {
    setForm(emptyCertificationForm);
    setEditingId(null);
    setIsOpen(false);
  };

  const handleOpenAdd = () => {
    setForm(emptyCertificationForm);
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cert: CertificationResponse) => {
    setForm(certificationToForm(cert));
    setEditingId(cert.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.issuedDate) return;

    const payload = toCertificationPayload(form);
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: certificationsQueryKey });
      resetForm();
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말로 이 자격증 정보를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: certificationsQueryKey });
        },
      });
    }
  };

  return (
    <Card id="certification-section" className="scroll-mt-24 border-primary/10 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-orange-100 p-2 text-orange-600">
            <Award size={20} />
          </div>
          <CardTitle className="text-xl font-bold">자격증</CardTitle>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button size="sm" onClick={handleOpenAdd} className="gap-1" />}>
            <Plus size={16} />
            추가
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "자격증 수정" : "자격증 추가"}</DialogTitle>
                <DialogDescription>
                  취득하신 자격증 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="certName">자격증명</Label>
                  <Input
                    id="certName"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 정보처리기사"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuingOrganization">발급기관</Label>
                  <Input
                    id="issuingOrganization"
                    value={form.issuingOrganization}
                    onChange={(e) => setForm((prev) => ({ ...prev, issuingOrganization: e.target.value }))}
                    placeholder="예: 한국산업인력공단"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuedDate">취득일</Label>
                  <Input
                    id="issuedDate"
                    type="date"
                    value={form.issuedDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, issuedDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  취소
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "수정 완료" : "추가하기"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <CertificationListSkeleton />
        ) : certifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <Award className="mb-2 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">등록된 자격증 정보가 없습니다.</p>
            <Button variant="link" size="sm" onClick={handleOpenAdd} className="mt-1">
              지금 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {certifications.map((cert, idx) => (
              <div key={cert.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="group relative flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
                      <Award size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold leading-none">{cert.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 size={14} />
                        {cert.issuingOrganization || "정보 없음"}
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        취득일: {cert.issuedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(cert)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(cert.id)} disabled={deleteMutation.isPending}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
