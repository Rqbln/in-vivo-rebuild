import React from 'react';

interface BlogPostProps {
  title: string;
  date: string;
  author: string;
  content: string;
  featuredImage?: string;
  category?: string;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  title,
  date,
  author,
  content,
  featuredImage,
  category
}) => {
  return (
    <article className="blog-post">
      {featuredImage && (
        <img 
          src={featuredImage} 
          alt={title}
          className="featured-image"
        />
      )}
      <header>
        <h1>{title}</h1>
        <div className="meta">
          <time dateTime={date}>{new Date(date).toLocaleDateString('fr-FR')}</time>
          <span className="author">Par {author}</span>
          {category && <span className="category">{category}</span>}
        </div>
      </header>
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
};
