// Named-export barrel for design-sync (synth-entry mode).
// The education-portal components are all `export default`; the converter and the
// claude.ai/design bundle need NAMED PascalCase exports, so we re-export each here.
// Imports use the `@/*` alias (resolved via .design-sync/tsconfig.sync.json).

// --- UI kit ---
export { default as Button } from "@/app/ui/Button/Button";
export { default as Chip } from "@/app/ui/Chip/Chip";
export { default as Dialog } from "@/app/ui/Dialog/Dialog";
export { default as Divider } from "@/app/ui/Divider/Divider";
export { default as IconButton } from "@/app/ui/IconButton/IconButton";
export { default as Paper } from "@/app/ui/Paper/Paper";
export { default as Progress } from "@/app/ui/Progress/Progress";

// --- Presentational (PURE) ---
export { default as FeatureCard } from "@/app/components/feature-card/FeatureCard";
export { default as TestimonialCard } from "@/app/components/testimonial-card/TestimonialCard";
export { default as LessonMaterials } from "@/app/components/lesson-materials/LessonMaterials";
export { default as LessonNavigation } from "@/app/components/lesson-navigation/LessonNavigation";
export { default as LessonItem } from "@/app/components/lesson-item/LessonItem";
export { default as ContactDialog } from "@/app/components/dialogs/contact-dialog";
export { default as DeleteDialog } from "@/app/components/dialogs/delete-dialog";
export { default as AddSkillModal } from "@/app/components/modals/AddSkillModal";
export { default as VideoModal } from "@/app/components/video-modal/VideoModal";
export { default as LessonForm } from "@/app/components/forms/lesson-form";

// --- Coupled-light (Next.js primitives shimmed via tsconfig.sync.json) ---
export { default as Breadcrumbs } from "@/app/components/breadcrumbs/Breadcrumbs";
export { default as SettingBlock } from "@/app/components/setting-block/setting-block";
export { default as Aside } from "@/app/components/aside/Aside";
export { default as CourseCard } from "@/app/components/course-card/CourseCard";
export { default as LessonCard } from "@/app/components/lesson-card/LessonCard";
export { default as Navbar } from "@/app/components/navbar/Navbar";
export { default as CourseTable } from "@/app/components/tables/CourseTable";
export { default as ModuleTable } from "@/app/components/tables/ModuleTable";
export { default as UsersTable } from "@/app/components/tables/users-table";
export { default as LessonTable } from "@/app/components/tables/LessonTable";
export { default as ModuleForm } from "@/app/components/forms/module-form";
