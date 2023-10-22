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

type Alert = {
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onConfirm?: () => void;
};

export function useAlert() {
  const [alert, setAlert] = useState<Alert | null>(null);
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
