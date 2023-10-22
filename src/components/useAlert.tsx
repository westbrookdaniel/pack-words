import { useState } from "react";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogContent,
} from "./ui/alert-dialog";

export type Alert = {
  title: string;
  description: string | JSX.Element;
  cancelText?: string;
  actionText?: string;
  onConfirm?: () => void;
};

export function useAlert(options?: { defaultOpen?: Alert | null }) {
  const [alert, setAlert] = useState<Alert | null>(
    options?.defaultOpen ?? null,
  );
  return {
    alert: (data: Alert) => setAlert(data),
    element: (
      <AlertDialog
        open={!!alert}
        onOpenChange={(open) => {
          setAlert(open ? alert : null);
        }}
      >
        {alert ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alert.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {alert.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {alert.cancelText ? (
                <AlertDialogCancel>{alert.cancelText}</AlertDialogCancel>
              ) : null}
              <AlertDialogAction onClick={() => alert.onConfirm?.()}>
                {alert.actionText ?? "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    ),
  };
}
