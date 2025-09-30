import type { Column, tColumnMetadata } from "./Column";
export type Section = {
  title: string;
  columns: Column[];
};

export type tSectionMetadata = {
  id: string;
  title: string;
  columns: tColumnMetadata[];
  // disable_toggle?: boolean;
  hidden: boolean;
};
