// design-sync shim for `next/script` — no-op in preview cards (analytics/scripts
// have no place in a static design-system render).
import React from "react";

export default function Script(_props: any): React.ReactElement | null {
  return null;
}
