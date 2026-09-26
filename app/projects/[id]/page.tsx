"use client";

import { useParams, useRouter } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <ProjectDetail
      projectId={params.id}
      onDeleted={() => router.push("/projects")}
    />
  );
}
