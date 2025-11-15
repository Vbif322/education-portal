import { FC } from "react";
import { FileText, Download, Image, FileArchive } from "lucide-react";
import s from "./LessonMaterials.module.css";

export interface Material {
  id: number;
  name: string;
  type: "pdf" | "presentation" | "image" | "archive" | "other";
  size?: string;
  url: string;
}

interface LessonMaterialsProps {
  materials: Material[];
}

const LessonMaterials: FC<LessonMaterialsProps> = ({ materials }) => {
  const getIcon = (type: Material["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText size={20} className={s.icon} />;
      case "presentation":
        return <FileText size={20} className={s.icon} />;
      case "image":
        return <Image size={20} className={s.icon} />;
      case "archive":
        return <FileArchive size={20} className={s.icon} />;
      default:
        return <FileText size={20} className={s.icon} />;
    }
  };

  if (materials.length === 0) {
    return null;
  }

  return (
    <div className={s.container}>
      <h4 className={s.title}>Материалы к уроку</h4>
      <div className={s.grid}>
        {materials.map((material) => (
          <a
            key={material.id}
            href={material.url}
            className={s.card}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={s.iconWrapper}>{getIcon(material.type)}</div>
            <div className={s.info}>
              <p className={s.name}>{material.name}</p>
              {material.size && <span className={s.size}>{material.size}</span>}
            </div>
            <Download size={18} className={s.downloadIcon} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default LessonMaterials;
