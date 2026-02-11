import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getMyProjects,
  getAllProjects,
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  searchProjects as searchProjectsService,
  checkProjectLimit,
} from "../lib/supabase/projects";

export const useProjects = (mode = "my") => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    if (!user && mode === "my") return;
    setLoading(true);
    setError("");
    try {
      const data =
        mode === "my" ? await getMyProjects(user.id) : await getAllProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, mode]);

  const createProject = async (projectData) => {
    if (!user) return;
    try {
      const result = await createProjectService({
        owner_id: user.id,
        ...projectData,
      });
      await fetchProjects();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      await deleteProjectService(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const search = async (query, category) => {
    setLoading(true);
    try {
      const data = await searchProjectsService(query, category);
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = async () => {
    if (!user) return false;
    return await checkProjectLimit(user.id);
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    removeProject,
    search,
    checkLimit,
  };
};
