import React from "react";
import Layout from "./Layout";
import PageHeader from "./PageHeader";

const LegalPage = ({ eyebrow, title, description, updated, sections }) => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          crumbs={[{ label: "Home", href: "/" }, { label: title }]}
        />

        <div className="card p-6 sm:p-8">
          <p className="label">Last updated {updated}</p>

          <div className="mt-6 flex flex-col gap-7">
            {sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="font-display text-lg leading-snug text-ink">
                  {index + 1}. {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-2 text-sm leading-relaxed text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalPage;
