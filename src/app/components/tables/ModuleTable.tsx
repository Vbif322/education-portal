"use client";

import { Module } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useReducer, useState } from "react";
import s from "./style.module.css";

type Props = {
  data: Module[];
  handleChange: (arg01: Module["id"]) => void;
  handleAttach: (arg01: Module["id"]) => void;
  handleDelete: (arg01: Module["id"]) => void;
};

function reducer(
  state: {
    open: boolean;
    moduleId?: number;
  },
  action: { type: "open" | "close"; value?: number }
) {
  switch (action.type) {
    case "open":
      return {
        open: true,
        courseId: action.value,
      };
    case "close":
      return {
        open: false,
        courseId: undefined,
      };

    default:
      return state;
  }
}

const ModuleTable: FC<Props> = ({
  data,
  handleChange,
  handleAttach,
  handleDelete,
}) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    module: Module | undefined;
  }>({ open: false, module: undefined });

  const [modalDeleteState, dispatch] = useReducer(reducer, {
    open: false,
    moduleId: undefined,
  });

  const onChangeHandle = (module: Module) => {
    handleChange(module.id);
    setModalState({ open: true, module: module });
  };

  const onCloseHandle = () => {
    dispatch({ type: "close" });
  };

  //   const onDeleteHandle = () => {
  //     if (!modalDeleteState.moduleId) return;
  //     handleDelete(modalDeleteState.moduleId);
  //     dispatch({ type: "close" });
  //   };

  return (
    <>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* <LessonChangeModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, lesson: undefined })}
        lesson={modalState.lesson}
      />
      <DeleteDialog
        open={modalDeleteState.open}
        onDelete={onDeleteHandle}
        onBack={onCloseHandle}
      /> */}
    </>
  );
};

export default ModuleTable;
