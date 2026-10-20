import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { getProjectBySlug, getProjects } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <SiteShell>
      <article className="project-card">
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        {project.language ? (
          <p className="project-meta">زبان: {project.language}</p>
        ) : null}
        <p className="project-meta">
          {project.website ? (
            <>
              <a href={project.website}>وبسایت</a>
              {" · "}
            </>
          ) : null}
          {project.repo ? <a href={project.repo}>مخزن</a> : null}
        </p>
        <p>
          <Link href="/projects">← بازگشت به آثار</Link>
        </p>
      </article>
    </SiteShell>
  );
}
