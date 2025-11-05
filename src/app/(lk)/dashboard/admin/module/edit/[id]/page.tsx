import ModuleForm from "@/app/components/forms/module-form";
import { getAllLessons } from "@/app/lib/dal/lesson.dal";
import { getModuleById } from "@/app/lib/dal/module.dal";
import { updateModule } from "@/app/actions/modules";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditModulePage({ params }: Props) {
  const { id } = await params;
  const moduleId = parseInt(id, 10);

  if (isNaN(moduleId)) {
    notFound();
  }

  const [lessons, module] = await Promise.all([
    getAllLessons(),
    getModuleById(moduleId),
  ]);

  if (!module) {
    notFound();
  }

  const handleUpdate = async (data: {
    name: string;
    description?: string;
    lessons: { lessonId: number; order: number }[];
  }) => {
    "use server";
    return updateModule(moduleId, data);
  };

  return (
    <ModuleForm
      lessons={lessons}
      module={module}
      title="Редактирование модуля"
      submitButtonText="Сохранить изменения"
      onSubmit={handleUpdate}
    />
  );
}
