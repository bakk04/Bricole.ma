export const initialState = {
    user: null,
    loading: false,
    error: null,
    formErrors: {},
    isSuccess: false
};

export function authReducer(state, action) {
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