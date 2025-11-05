"use client";

import { Module } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC } from "react";
import s from "./style.module.css";
import { useRouter } from "next/navigation";

type Props = {
  data: Module[];
  handleDelete: (arg01: Module["id"]) => void;
};

const ModuleTable: FC<Props> = ({ data, handleDelete }) => {
  const router = useRouter();

  const onChangeHandle = (module: Module) => {
    router.push(`/dashboard/admin/module/edit/${module.id}`);
  };

  const onDeleteHandle = (module: Module) => {
    if (confirm(`Вы уверены, что хотите удалить модуль "${module.name}"?`)) {
      handleDelete(module.id);
    }
  };

  return (
    <div className={s.table__container}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Название</th>
            {/* <th>Доступность</th> */}
            <th style={{ textAlign: "center" }}>Управление</th>
          </tr>
        </thead>
        <tbody>
          {data.map((moduleItem) => {
            return (
              <tr key={moduleItem.id}>
                <td>{moduleItem.name}</td>
                {/* <td>
                    {courseItem.privacy === "private"
                      ? "Доступ закрыт"
                      : "Доступ открыт"}
                  </td> */}
                <td style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="text"
                    onClick={() => onChangeHandle(moduleItem)}
                  >
                    Изменить
                  </Button>
                  {/* <Button
                    variant="text"
                    color="error"
                    onClick={() => onDeleteHandle(moduleItem)}
                  >
                    Удалить
                  </Button> */}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ModuleTable;
