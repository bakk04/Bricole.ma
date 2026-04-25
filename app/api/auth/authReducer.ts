import { User } from "@/types";

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    formErrors: Record<string, string>;
    isSuccess: boolean;
}

export type AuthAction =
    | { type: "LOGIN_START" | "REGISTER_START" }
    | { type: "LOGIN_SUCCESS" | "REGISTER_SUCCESS"; payload: User }
    | { type: "LOGIN_FAILURE" | "REGISTER_FAILURE"; payload: string }
    | { type: "SET_FORM_ERRORS"; payload: Record<string, string> }
    | { type: "CLEAR_ERRORS" }
    | { type: "LOGOUT" };

export const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    formErrors: {},
    isSuccess: false
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN_START":
        case "REGISTER_START":
            return {
                ...state,
                loading: true,
                error: null,
                formErrors: {},
                isSuccess: false
            };

        case "LOGIN_SUCCESS":
        case "REGISTER_SUCCESS":
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: null,
                formErrors: {},
                isSuccess: true
            };

        case "LOGIN_FAILURE":
        case "REGISTER_FAILURE":
            return {
                ...state,
                user: null,
                loading: false,
                error: action.payload,
                isSuccess: false
            };

        case "SET_FORM_ERRORS":
            return {
                ...state,
                formErrors: action.payload,
                loading: false
            };

        case "CLEAR_ERRORS":
            return {
                ...state,
                error: null,
                formErrors: {}
            };

        case "LOGOUT":
            return initialState;

        default:
            return state;
    }
}
