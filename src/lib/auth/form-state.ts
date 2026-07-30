export interface AuthFormState {
  status: "idle" | "error" | "success";
  message: string | null;
}

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: null
};
