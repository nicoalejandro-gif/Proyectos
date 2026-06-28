import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Role } from "../data/appData";

export interface AppUser {
  id: string;
  username: string;
  role: Role;
  nombre: string;
  email: string;
}

type ProfileRow = {
  username: string;
  full_name: string;
  email: string | null;
  active: boolean;
  roles: { code: string } | { code: string }[] | null;
};

function normalizeRole(profile: ProfileRow): Role | null {
  const roleData = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
  return roleData?.code === "admin" || roleData?.code === "supervisor" ? roleData.code : null;
}

export async function fetchProfile(session: Session): Promise<AppUser> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, email, active, roles(code)")
    .eq("id", session.user.id)
    .single<ProfileRow>();

  if (error || !data) {
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  if (!data.active) {
    throw new Error("La cuenta existe, pero todavia no fue activada por un administrador.");
  }

  const role = normalizeRole(data);
  if (!role) {
    throw new Error("El perfil no tiene un rol interno valido.");
  }

  return {
    id: session.user.id,
    username: data.username,
    role,
    nombre: data.full_name,
    email: data.email ?? session.user.email ?? "",
  };
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error("Email o contrasena incorrectos.");
  }

  try {
    return await fetchProfile(data.session);
  } catch (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }
}

