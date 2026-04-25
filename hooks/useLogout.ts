import { signOut, useSession } from "next-auth/react";
import { useAuth } from "@/app/api/context/AuthContext";

export const useLogout = () => {
    const { data: session } = useSession();
    const { dispatch: authDispatch } = useAuth();

    const logout = async () => {
        try {
            // 1. Déconnecter NextAuth si une session existe
            if (session) {
                await signOut({ redirect: false });
            }
            
            // 2. Appeler notre API de déconnexion personnalisée pour supprimer les cookies et la session Redis
            await fetch("/api/auth/logout", { 
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            
            // 3. Vider l'état du contexte d'authentification local
            authDispatch({ type: "LOGOUT" });
            
            // 4. Rediriger vers la page d'accueil et forcer un rechargement complet pour nettoyer tout état résiduel
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/";
        }
    };

    return { logout };
};
