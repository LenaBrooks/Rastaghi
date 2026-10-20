import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { getProjects } from "@/lib/posts";

export const metadata: Metadata = {
  title: "آثار",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <SiteShell>
      <h1>❖ &nbsp; آثار</h1>
      <ol className="list-meta">
        {projects.map((project) => (
          <li key={project.slug} className="post-list-item project-card">
            <div>
              <h2>
                <Link href={`/projects/${project.slug}`}>{project.title}</Link>
              </h2>
              <p className="project-meta">{project.description}</p>
              {project.language ? (
                <p className="project-meta">زبان: {project.language}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </SiteShell>
  );
}
