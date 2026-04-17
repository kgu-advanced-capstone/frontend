"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Pencil, Trash2, Calendar, BookOpen, GraduationCap as DegreeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  educationsQueryKey,
  useCreateEducation,
  useDeleteEducation,
  useEducations,
  useUpdateEducation,
  type EducationRequest,
  type EducationResponse,
} from "@/api/educations";

interface EducationFormState {
  schoolName: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

const emptyEducationForm: EducationFormState = {
  schoolName: "",
  major: "",
  degree: "",
  startDate: "",
  endDate: "",
};

function educationToForm(education: EducationResponse): EducationFormState {
  return {
    schoolName: education.schoolName ?? "",
    major: education.major ?? "",
    degree: education.degree ?? "",
    startDate: education.startDate ?? "",
    endDate: education.endDate ?? "",
  };
}

function toEducationPayload(form: EducationFormState): EducationRequest {
  return {
    schoolName: form.schoolName.trim(),
    major: form.major.trim() || undefined,
    degree: form.degree.trim() || undefined,
    startDate: form.startDate,
    endDate: form.endDate || null,
  };
}

export function EducationSection() {
  const qc = useQueryClient();
  const { data: educations = [], isLoading } = useEducations();
  const createMutation = useCreateEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EducationFormState>(emptyEducationForm);

  const resetForm = () => {
    setForm(emptyEducationForm);
    setEditingId(null);
    setIsOpen(false);
  };

  const handleOpenAdd = () => {
    setForm(emptyEducationForm);
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (edu: EducationResponse) => {
    setForm(educationToForm(edu));
    setEditingId(edu.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName.trim() || !form.startDate) return;

    const payload = toEducationPayload(form);
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: educationsQueryKey });
      resetForm();
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말로 이 학력 정보를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: educationsQueryKey });
        },
      });
    }
  };

  return (
    <Card id="education-section" className="scroll-mt-24 border-primary/10 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <GraduationCap size={20} />
          </div>
          <CardTitle className="text-xl font-bold">학력</CardTitle>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button size="sm" onClick={handleOpenAdd} className="gap-1" />}>
            <Plus size={16} />
            추가
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "학력 수정" : "학력 추가"}</DialogTitle>
                <DialogDescription>
                  재학 또는 졸업하신 학교 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">학교명</Label>
                  <Input
                    id="schoolName"
                    value={form.schoolName}
                    onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="major">전공</Label>
                    <Input
                      id="major"
                      value={form.major}
                      onChange={(e) => setForm((prev) => ({ ...prev, major: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">학위</Label>
                    <Input
                      id="degree"
                      value={form.degree}
                      onChange={(e) => setForm((prev) => ({ ...prev, degree: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">입학일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">졸업일 (또는 예정일)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
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
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        ) : educations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <GraduationCap className="mb-2 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">등록된 학력 정보가 없습니다.</p>
            <Button variant="link" size="sm" onClick={handleOpenAdd} className="mt-1">
              지금 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {educations.map((edu, idx) => (
              <div key={edu.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="group relative flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      <GraduationCap size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold leading-none">{edu.schoolName}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {edu.major && (
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {edu.major}
                          </span>
                        )}
                        {edu.degree && (
                          <span className="flex items-center gap-1">
                            <DegreeIcon size={14} />
                            {edu.degree}
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {edu.startDate} ~ {edu.endDate || "재학 중"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(edu)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(edu.id)} disabled={deleteMutation.isPending}>
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
