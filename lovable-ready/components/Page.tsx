import React from 'react';

interface PageProps {
  title: string;
  content: string;
  description?: string;
}

export const Page: React.FC<PageProps> = ({
  title,
  content,
  description
}) => {
  return (
    <div className="page">
      <header>
        <h1>{title}</h1>
        {description && <p className="description">{description}</p>}
      </header>
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
