import ModuleForm from "@/app/components/forms/module-form";
import { getAllLessons } from "@/app/lib/dal/lesson.dal";
import { createModule } from "@/app/actions/modules";

export default async function NewModulePage() {
  const lessons = await getAllLessons();

  return (
    <ModuleForm
      lessons={lessons}
      title="Создание нового модуля"
      submitButtonText="Создать модуль"
      onSubmit={createModule}
    />
  );
}
